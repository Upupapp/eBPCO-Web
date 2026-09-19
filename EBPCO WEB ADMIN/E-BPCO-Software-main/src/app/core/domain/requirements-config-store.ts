import { Injectable, inject, signal } from '@angular/core';
import { ALL_PERMIT_TYPES, ApplicationAction, PermitType } from './permit.model';
import { RequirementDocument, documentsFor, requirementsFor } from './requirements-catalog';
import { RequirementsApi, RequirementDocumentDto } from '../api/requirements.api';

export type RequirementDocumentPatch = Partial<Omit<RequirementDocument, 'id'>>;

/**
 * `applicationAction`, since backend migration 047, folded into the cache
 * key: Building Permit's checklist now varies by New/Renewal/Amendment, and
 * the 'New' answer must not overwrite the 'Renewal' one in this store. Every
 * other permit type has always answered the same regardless of action, so
 * this key collapses to just `permitType` when `applicationAction` is
 * omitted — the exact same key every entry used before 047.
 */
function keyFor(permitType: PermitType, applicationAction?: ApplicationAction): string {
  return applicationAction === undefined ? permitType : `${permitType}::${applicationAction}`;
}

const ACTIONS: readonly ApplicationAction[] = ['New', 'Renewal', 'Amendment'];

/**
 * Seeds BOTH the bare per-type key (what a caller that never passes an
 * action reads) AND all three action-suffixed keys (what a caller that
 * always passes one, like the intake form, reads) — for every permit type,
 * not just Building Permit. A caller passing an explicit action looks up
 * `keyFor(type, action)`, never the bare key, so leaving the action-suffixed
 * keys unseeded here left THAT lookup landing on nothing until a live fetch
 * happened to land first: an intake form for a brand-new session showed a
 * genuinely empty checklist (and so attached nothing) for any type whose
 * caller passes an action, which is every type now that the intake form is
 * action-aware. For every type but Building Permit the three action buckets
 * are identical anyway (`documentsFor` falls back to the single list) — this
 * just seeds that same answer under every key a caller might ask by.
 */
function seedDocuments(): Record<string, RequirementDocument[]> {
  const entries: [string, RequirementDocument[]][] = [];
  for (const type of ALL_PERMIT_TYPES) {
    entries.push([keyFor(type), documentsFor(type, 'New').map((d) => ({ ...d }))]);
    for (const action of ACTIONS) {
      entries.push([keyFor(type, action), documentsFor(type, action).map((d) => ({ ...d }))]);
    }
  }
  return Object.fromEntries(entries);
}

/**
 * The live, editable required-document checklist per permit type (and,
 * since migration 047, per application action for Building Permit) — read by
 * the intake form's dynamic checklist and the requirements popup (Permit
 * Release > Permit Types is the one place it can be changed). Seeded from
 * requirements-catalog.ts's static baseline so nothing here starts empty,
 * but from that point on this store is the source of truth for "what
 * documents does this permit type/action require right now", independent of
 * the static catalog.
 *
 * Editing here never rewrites an application that already exists — the
 * same "never retroactively rewrite a past snapshot" rule PaymentConfigStore
 * follows for fee rules. An application's own attached documents (see
 * ApplicationStore.getDocuments) are a separate, per-application record
 * captured at submission time; only NEW applications filed after an edit
 * pick up the new checklist.
 */
@Injectable({ providedIn: 'root' })
export class RequirementsConfigStore {
  private readonly api = inject(RequirementsApi);

  private readonly _documentsByKey =
    signal<Record<string, RequirementDocument[]>>(seedDocuments());

  readonly documentsByKey = this._documentsByKey.asReadonly();

  /** Set once a key's live checklist has been fetched (successfully or not) this session, so `ensureLoaded` fetches each key at most once. */
  private readonly loadedKeys = new Set<string>();
  private readonly inFlight = new Map<string, Promise<void>>();
  private readonly _loadFailed = signal<Partial<Record<string, boolean>>>({});

  /** True when the live checklist for `permitType`/`applicationAction` could not be fetched this session — the template shows an honest "showing the office's default list" notice rather than pretending the static catalog is the live one. */
  loadFailed(permitType: PermitType, applicationAction?: ApplicationAction): boolean {
    return this._loadFailed()[keyFor(permitType, applicationAction)] === true;
  }

  /** Fetches `permitType`/`applicationAction`'s live checklist from the server at most once per session (idempotent, concurrency-safe — same idea as `QueueLoader.ensureLoaded`). Falls back to the static-catalog seed already in `_documentsByKey` on failure. */
  async ensureLoaded(permitType: PermitType, applicationAction?: ApplicationAction): Promise<void> {
    const key = keyFor(permitType, applicationAction);
    if (this.loadedKeys.has(key)) return;
    const existing = this.inFlight.get(key);
    if (existing) return existing;
    const promise = this.load(permitType, applicationAction).finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, promise);
    return promise;
  }

  private async load(permitType: PermitType, applicationAction?: ApplicationAction): Promise<void> {
    const key = keyFor(permitType, applicationAction);
    const result = await this.api.get(permitType, applicationAction);
    if (result.kind === 'ok') {
      this._documentsByKey.update((byKey) => ({
        ...byKey,
        [key]: result.documents.map((d) => fromDto(d, permitType)),
      }));
      this._loadFailed.update((byKey) => ({ ...byKey, [key]: false }));
    } else {
      this._loadFailed.update((byKey) => ({ ...byKey, [key]: true }));
    }
    this.loadedKeys.add(key);
  }

  /** Batches the current local draft for `permitType`/`applicationAction` into one `PUT` — the server replaces the whole list, there is no per-document write route. On success, the store adopts the server's own echoed-back documents as the new source of truth. */
  async saveDocuments(permitType: PermitType, applicationAction?: ApplicationAction) {
    const key = keyFor(permitType, applicationAction);
    const result = await this.api.replace(
      permitType, this.documentsFor(permitType, applicationAction).map(toDto), applicationAction,
    );
    if (result.kind === 'done') {
      this._documentsByKey.update((byKey) => ({
        ...byKey,
        [key]: result.documents.map((d) => fromDto(d, permitType)),
      }));
    }
    return result;
  }

  documentsFor(permitType: PermitType, applicationAction?: ApplicationAction): RequirementDocument[] {
    const byKey = this._documentsByKey();
    // Falls back to the bare per-type key on a miss (defensive: `seedDocuments`
    // above always seeds every key `keyFor` can produce, so this should not
    // actually be reached — but a genuinely blank checklist here means an
    // intake form silently attaches nothing, which is worse than the bare
    // key's answer being not-quite action-specific).
    return [...(byKey[keyFor(permitType, applicationAction)] ?? byKey[permitType] ?? [])];
  }

  /**
   * `id` doubles as the server's `code` field (write and read use the exact
   * same string, no transform) — so a freshly-added document's id is derived
   * from its label rather than a running counter, de-duplicated against this
   * permit type/action's other documents, and kept within the server's
   * 60-char cap.
   */
  addDocument(
    permitType: PermitType,
    doc: { label: string; required: boolean; reviewingDepartmentId: string; description?: string },
    applicationAction?: ApplicationAction,
  ): RequirementDocument {
    const id = this.deriveUniqueCode(permitType, doc.label, applicationAction);
    const created: RequirementDocument = { id, ...doc };
    const key = keyFor(permitType, applicationAction);
    this._documentsByKey.update((byKey) => ({
      ...byKey,
      [key]: [...(byKey[key] ?? []), created],
    }));
    return created;
  }

  /** Lowercase, non-alphanumeric collapsed to a hyphen, truncated to leave room for a de-duplicating suffix, appending `-2`/`-3`/… against this permit type/action's current draft. */
  deriveUniqueCode(permitType: PermitType, label: string, applicationAction?: ApplicationAction): string {
    const base =
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 55) || 'document';
    const existingIds = new Set(
      (this._documentsByKey()[keyFor(permitType, applicationAction)] ?? []).map((d) => d.id),
    );
    if (!existingIds.has(base)) return base;
    let n = 2;
    while (existingIds.has(`${base}-${n}`)) n += 1;
    return `${base}-${n}`;
  }

  updateDocument(
    permitType: PermitType, id: string, patch: RequirementDocumentPatch, applicationAction?: ApplicationAction,
  ): void {
    const key = keyFor(permitType, applicationAction);
    this._documentsByKey.update((byKey) => ({
      ...byKey,
      [key]: (byKey[key] ?? []).map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }

  removeDocument(permitType: PermitType, id: string, applicationAction?: ApplicationAction): void {
    const key = keyFor(permitType, applicationAction);
    this._documentsByKey.update((byKey) => ({
      ...byKey,
      [key]: (byKey[key] ?? []).filter((d) => d.id !== id),
    }));
  }

  /** Discards every edit for one permit type/action, restoring the static catalog's original checklist. */
  resetToDefault(permitType: PermitType, applicationAction?: ApplicationAction): void {
    const key = keyFor(permitType, applicationAction);
    const fallback = applicationAction === undefined
      ? requirementsFor(permitType).documents
      : documentsFor(permitType, applicationAction);
    this._documentsByKey.update((byKey) => ({
      ...byKey,
      [key]: fallback.map((d) => ({ ...d })),
    }));
  }
}

/** `reviewingDepartmentId` has no server counterpart at all — never read from or sent to the wire (see `fromDto`/`toDto` below). Documents that still match an original static-catalog entry for this type keep that entry's own department (it genuinely varies per document in places, e.g. a zoning attachment inside an otherwise-OBO checklist); anything else falls back to the permit type's own default department. */
function reviewingDepartmentFor(permitType: PermitType, code: string): string {
  const reference = requirementsFor(permitType);
  const catalogMatch = reference.documents.find((d) => d.id === code)
    ?? Object.values(reference.documentsByAction ?? {}).flat().find((d) => d.id === code);
  return catalogMatch?.reviewingDepartmentId ?? reference.responsibleDepartmentId;
}

function fromDto(dto: RequirementDocumentDto, permitType: PermitType): RequirementDocument {
  return {
    id: dto.code,
    label: dto.label,
    required: dto.required,
    description: dto.description,
    reviewingDepartmentId: reviewingDepartmentFor(permitType, dto.code),
  };
}

function toDto(doc: RequirementDocument): RequirementDocumentDto {
  return { code: doc.id, label: doc.label, description: doc.description ?? '', required: doc.required };
}
