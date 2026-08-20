import { Injectable, signal } from '@angular/core';
import { ALL_PERMIT_TYPES, PermitType } from './permit.model';
import { RequirementDocument, requirementsFor } from './requirements-catalog';

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
  private nextSeq = 1;

  private readonly _documentsByType =
    signal<Record<PermitType, RequirementDocument[]>>(seedDocuments());

  readonly documentsByType = this._documentsByType.asReadonly();

  documentsFor(permitType: PermitType): RequirementDocument[] {
    return [...this._documentsByType()[permitType]];
  }

  addDocument(
    permitType: PermitType,
    doc: { label: string; required: boolean; reviewingDepartmentId: string; description?: string },
  ): RequirementDocument {
    const slug = permitType.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created: RequirementDocument = { id: `custom-${slug}-${this.nextSeq++}`, ...doc };
    this._documentsByType.update((byType) => ({
      ...byType,
      [permitType]: [...byType[permitType], created],
    }));
    return created;
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
