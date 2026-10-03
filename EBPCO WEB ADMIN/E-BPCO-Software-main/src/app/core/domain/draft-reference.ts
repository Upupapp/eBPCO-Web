/**
 * A draft's number since server migration 064 (QA TC-37, 2026-10-03) is a
 * `DRAFT-` placeholder: the official E-BPCO number is assigned when the
 * application is filed, so an abandoned draft leaves no gap in the numbering.
 * A walk-in draft started at the counter shows here; its placeholder is not a
 * number to quote to the applicant.
 */
export const DRAFT_REFERENCE_PREFIX = 'DRAFT-';

export function displayReference(reference: string): string {
  return reference.startsWith(DRAFT_REFERENCE_PREFIX) ? 'Draft (no number yet)' : reference;
}
