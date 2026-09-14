import { Injectable, inject, signal } from '@angular/core';
import { ALL_PERMIT_TYPES, PermitType } from './permit.model';
import { RequirementDocument, requirementsFor } from './requirements-catalog';
import { RequirementsApi, RequirementDocumentDto } from '../api/requirements.api';

export type RequirementDocumentPatch = Partial<Omit<RequirementDocument, 'id'>>;

function seedDocuments(): Record<PermitType, RequirementDocument[]> {
  const entries = ALL_PERMIT_TYPES.map((type): [PermitType, RequirementDocument[]] => [
    type,
    requirementsFor(type).documents.map((d) => ({ ...d })),
  ]);
  return Object.fromEntries(entries) as Record<PermitType, RequirementDocument[]>;
}

/**
 * The live, editable required-document checklist per permit type — read by
 * the intake form's dynamic checklist (Permit Release > Permit Types is the
 * one place it can be changed). Seeded from requirements-catalog.ts's
 * static baseline so nothing here starts empty, but from that point on this
 * store is the source of truth for "what documents does this permit type
 * require right now", independent of the static catalog.
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

  private readonly _documentsByType =
    signal<Record<PermitType, RequirementDocument[]>>(seedDocuments());

  readonly documentsByType = this._documentsByType.asReadonly();

  /** Set once a type's live checklist has been fetched (successfully or not) this session, so `ensureLoaded` fetches each type at most once. */
  private readonly loadedTypes = new Set<PermitType>();
  private readonly inFlight = new Map<PermitType, Promise<void>>();
  private readonly _loadFailed = signal<Partial<Record<PermitType, boolean>>>({});

  /** True when the live checklist for `permitType` could not be fetched this session — the template shows an honest "showing the office's default list" notice rather than pretending the static catalog is the live one. */
  loadFailed(permitType: PermitType): boolean {
    return this._loadFailed()[permitType] === true;
  }

  /** Fetches `permitType`'s live checklist from the server at most once per session (idempotent, concurrency-safe — same idea as `QueueLoader.ensureLoaded`). Falls back to the static-catalog seed already in `_documentsByType` on failure. */
  async ensureLoaded(permitType: PermitType): Promise<void> {
    if (this.loadedTypes.has(permitType)) return;
    const existing = this.inFlight.get(permitType);
    if (existing) return existing;
    const promise = this.load(permitType).finally(() => this.inFlight.delete(permitType));
    this.inFlight.set(permitType, promise);
    return promise;
  }

  private async load(permitType: PermitType): Promise<void> {
    const result = await this.api.get(permitType);
    if (result.kind === 'ok') {
      this._documentsByType.update((byType) => ({
        ...byType,
        [permitType]: result.documents.map((d) => fromDto(d, permitType)),
      }));
      this._loadFailed.update((byType) => ({ ...byType, [permitType]: false }));
    } else {
      this._loadFailed.update((byType) => ({ ...byType, [permitType]: true }));
    }
    this.loadedTypes.add(permitType);
  }

  /** Batches the current local draft for `permitType` into one `PUT` — the server replaces the whole list, there is no per-document write route. On success, the store adopts the server's own echoed-back documents as the new source of truth. */
  async saveDocuments(permitType: PermitType) {
    const result = await this.api.replace(permitType, this.documentsFor(permitType).map(toDto));
    if (result.kind === 'done') {
      this._documentsByType.update((byType) => ({
        ...byType,
        [permitType]: result.documents.map((d) => fromDto(d, permitType)),
      }));
    }
    return result;
  }

  documentsFor(permitType: PermitType): RequirementDocument[] {
    return [...this._documentsByType()[permitType]];
  }

  /**
   * `id` doubles as the server's `code` field (write and read use the exact
   * same string, no transform) — so a freshly-added document's id is derived
   * from its label rather than a running counter, de-duplicated against this
   * permit type's other documents, and kept within the server's 60-char cap.
   */
  addDocument(
    permitType: PermitType,
    doc: { label: string; required: boolean; reviewingDepartmentId: string; description?: string },
  ): RequirementDocument {
    const id = this.deriveUniqueCode(permitType, doc.label);
    const created: RequirementDocument = { id, ...doc };
    this._documentsByType.update((byType) => ({
      ...byType,
      [permitType]: [...byType[permitType], created],
    }));
    return created;
  }

  /** Lowercase, non-alphanumeric collapsed to a hyphen, truncated to leave room for a de-duplicating suffix, appending `-2`/`-3`/… against this permit type's current draft. */
  deriveUniqueCode(permitType: PermitType, label: string): string {
    const base =
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 55) || 'document';
    const existingIds = new Set(this._documentsByType()[permitType].map((d) => d.id));
    if (!existingIds.has(base)) return base;
    let n = 2;
    while (existingIds.has(`${base}-${n}`)) n += 1;
    return `${base}-${n}`;
  }

  updateDocument(permitType: PermitType, id: string, patch: RequirementDocumentPatch): void {
    this._documentsByType.update((byType) => ({
      ...byType,
      [permitType]: byType[permitType].map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }

  removeDocument(permitType: PermitType, id: string): void {
    this._documentsByType.update((byType) => ({
      ...byType,
      [permitType]: byType[permitType].filter((d) => d.id !== id),
    }));
  }

  /** Discards every edit for one permit type, restoring the static catalog's original checklist. */
  resetToDefault(permitType: PermitType): void {
    this._documentsByType.update((byType) => ({
      ...byType,
      [permitType]: requirementsFor(permitType).documents.map((d) => ({ ...d })),
    }));
  }
}

/** `reviewingDepartmentId` has no server counterpart at all — never read from or sent to the wire (see `fromDto`/`toDto` below). Documents that still match an original static-catalog entry for this type keep that entry's own department (it genuinely varies per document in places, e.g. a zoning attachment inside an otherwise-OBO checklist); anything else falls back to the permit type's own default department. */
function reviewingDepartmentFor(permitType: PermitType, code: string): string {
  const reference = requirementsFor(permitType);
  const catalogMatch = reference.documents.find((d) => d.id === code);
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
