/**
 * The server's real `businesses.category` vocabulary (`businessShape` in
 * eBPCOBackend's `businesses.controller.ts`, migration 041) — NOT the
 * six-value list `BusinessCategory` in `business.model.ts` still carries for
 * local-demo/seed data (mirroring ebpco-mobile's own mock model, which has
 * never been wired to a real backend): that one has "Wholesale", which the
 * real route refuses with a 400, and lacks the three the route accepts.
 *
 * Was two separate identical copies of this same 8-value array — one in
 * `businesses.ts` (`REAL_CATEGORY_OPTIONS`), one in
 * `shared/application-intake/application-intake.ts` (`BUSINESS_CATEGORIES`)
 * — same drift risk barangay had before `castilla-barangays.ts` existed.
 * One shared source now.
 */
export const REAL_CATEGORY_OPTIONS: readonly string[] = [
  'Retail',
  'Food Service',
  'Services',
  'Manufacturing',
  'Construction',
  'Transport',
  'Agriculture',
  'Other',
];
