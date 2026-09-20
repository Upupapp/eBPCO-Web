# Citizens module — Admin Portal handoff (Part B)

Branch `feature/citizens`. Mirrors `pages/businesses/*`'s visual structure
throughout, deliberately without its legacy seed-data path — this module has
none, by design (see Part B4 below).

## What was built

- `src/app/core/api/staff-citizens.api.ts` — `StaffCitizensApi`, modelled
  line-for-line on `staff-businesses.api.ts`: same discriminated-union result
  shape per method (`ok/done | not-found | forbidden | unavailable | failed`,
  plus `refused` on mutations), same `ApiError`/Problem Details handling, same
  `crypto.randomUUID()` Idempotency-Key on every mutation. `forbidden` is a
  new variant here — `staff-businesses.api.ts` folds 403 into `failed`
  everywhere; added because a 403 mid-session (a role change, not a network
  fault) is worth telling apart on this screen specifically.
- `src/app/core/api/api.client.ts` — `delete<T>()` extended to accept an
  optional body + Idempotency-Key (previously took only a path). The Citizens
  module's "Sign out all sessions" is this portal's SECOND-ever `DELETE`
  (`staff-directory.api.ts`'s `revokeSession` was the first, and its own doc
  comment claiming to be "the only DELETE this portal issues" was updated).
- `src/app/pages/citizens/` — `citizens.ts`, `citizens.html`, `citizens.scss`,
  `citizens.spec.ts` (12 tests), `citizen-detail-data.ts` (+ spec) — pure
  view-model helpers (status-pill CSS class mapping, activity-label
  formatting, timestamp formatting). One component serves BOTH `/citizens`
  and `/citizens/:id` (`id` bound via `withComponentInputBinding`), the same
  shape `pages/applications/applications.ts` already uses for its own
  list/detail split — not an in-page view-toggle the way Businesses does it,
  because the module brief explicitly asked for `/citizens/:id` as its own
  route.
- `src/app/core/session/permissions.ts` — new `citizens` nav module
  (immediately after `businesses`), `Users & Roles` relabelled to
  `Staff & Roles` (key/path unchanged), six new `ACTION_PERMISSIONS` entries
  (`citizen.signOutSessions/disable/enable/sendResetLink/rectify/erase`).
- `src/app/app.routes.ts` — `citizens` and `citizens/:id`, both lazy
  `loadComponent`, under the guarded `AdminLayout` parent.
- `scripts/gates.mjs` — new check #10: `pages/citizens/` may never import a
  seed/fake data source. Zero findings on a clean run.

## Human decisions made along the way (flagged per Ground Rule 7)

**The nav gate is `['Super Admin', 'Administrator']`, not the four roles the
brief's example literally named.** `'Receiving Officer'` and
`'Records Officer'` are real BACKEND roles (both hold the server's
`citizens:read` scope) but are **not** values this portal's own `StaffRole`
type has ever had. `src/app/core/api/role-map.ts`'s existing `BY_WIRE_NAME`
table already collapses both of them into `'Administrator'` for every screen
in this portal — a reconciliation decision made before this module existed,
not something introduced here. Gating Citizens on `['Super Admin',
'Administrator']` reaches those officers exactly as asked, through the SAME
collapse every other administration-group module (Businesses, Staff & Roles)
already relies on. **Consequence**: there is currently no portal role that
gets READ access to Citizens without also getting WRITE access — the "read-only
roles see the detail view with actions hidden" requirement is implemented (the
component's own `canDisable()`/`canErase()`/etc. computed signals correctly
gate on role, tested directly against the `'Auditor'` role in
`citizens.spec.ts`) but is not reachable through this portal's real nav today,
since nothing routes a read-only role to `/citizens` at all. If the LGU wants
front-desk staff to have their OWN portal accounts as `receiving-officer`/
`records-officer` (rather than being folded into Administrator), that is a
portal-wide role-vocabulary reconciliation — bigger than this module, not
attempted here.

**Businesses' own detail view has no linkable per-record URL.** The Citizens
detail's "Businesses & Applications" tab lists a citizen's businesses as plain
text, not links — `app.routes.ts` has no `businesses/:id` route (Businesses'
own detail view is an in-page signal toggle, not a route), so there is nowhere
real to point to yet. Applications DO link (`/applications/:id` already
exists and is exactly what the applications tab in the Businesses detail view
itself links to).

**`CitizenSession.device` is always shown as `—` (the API's own honest
`null`)** — see the backend handoff's matching note. Not a portal-side
decision, just carried through: no per-session device data exists to show.

**Rectification UI is "one field at a time," implemented as a small inline
picker (field + new value) that opens `ConfirmDialog` for the reason** —
`ConfirmDialog` itself has no "new value" input, only a reason textarea, so
the field/value selection happens in a small always-visible mini-form in the
Profile tab, and the existing `ConfirmDialog` component is reused unmodified
for the required-reason confirmation step, matching every other action on
this page.

**Erasure's two-step confirm is two SEPARATE `ConfirmDialog` instances in
sequence** (step 1: reason + danger tone; step 2: no reason field, just a
final "are you sure" with a `tone="danger"` cancel-or-commit), rather than
extending `ConfirmDialog` with a second input. The request reference is
collected via a plain always-visible text field ahead of both dialogs
(required before the "Erase Account" button is even enabled), not inside
either dialog.

## B1 — nav/permissions

Done as described above. `canAccessPath('Administrator', '/citizens/<uuid>')`
resolves correctly through the EXISTING generic `path.startsWith(m.path + '/')`
check in `permissions.ts` — no change needed there; verified with a new test
in `permissions.spec.ts` rather than by inspection alone, since that generic
check is exactly what the module brief's "known pitfall" note was warning
about getting right for a new `/x/:id` module.

## B2 — API client

Done as described above. `contract/staff-citizens.json` recorded from the
backend's contract sample file — **not yet generated**, because the backend's
own `npm run emit:samples` has not been run yet (see the backend handoff's own
Status section). Once it has, copy the `staff.citizens.*` entries out of
`ebpco-api/contract/response-samples.json` into this repo's
`src/app/core/api/contract/staff-citizens.json` and extend
`scripts/check-contract.mjs` to check it, matching whatever pattern that
script already uses for the other `contract/*.json` files.

## B3 — screens

Done. Design parity confirmed by direct comparison against `businesses.html`'s
own KPI grid / table-toolbar / data-table / detail-grid / record-card /
summary-card / detail-tabs structure — same classes, same partials
(`_data-table`, `_kpi-grid`, `_detail-view`, `_menu-popover`; NOT `_tabs.scss`,
which is reserved for page-level tab strips like Users & Roles' Users/Roles
switch, not a record's own detail sub-tabs — `_detail-view.scss`'s own
`.detail-tabs`/`.detail-tab` pair is what Businesses actually uses for that,
and what this module uses too). New SCSS is ~105 lines, all either genuinely
new layout (toolbar, owner-cell, rectify/erase panels) or a straight copy of
`businesses.scss`'s own toolbar rules (neither `_data-table.scss` nor any
other partial defines the toolbar today — every page that has one currently
repeats it locally, this one included, for consistency rather than inventing
a new pattern).

`AOT build (`node scripts/build-strict.mjs`) is clean — the `citizens` chunk
compiles with no template errors.

**A real crash found and fixed while writing the spec, not in review**: the
list table's `@for (row of rows(); ...)` block would throw
("NG0900: the provided iterable is not an array") on this component's very
first render, before the constructor's `effect()` has had a chance to run —
`rows` was originally `signal<CitizenRow[] | null>(null)`. Fixed by making it
`signal<readonly CitizenRow[]>([])` — never null, so `@for` always has a real
iterable regardless of timing.

## B4 — no mock path

Verified: `pages/citizens/` imports only `StaffCitizensApi`, `SessionService`,
`ACTION_PERMISSIONS`/`canAccessPath` (role/route metadata, not data), the
shared UI components, and its own `citizen-detail-data.ts`. No
`ApplicationStore`, no `application-seed.ts`, no `*.fake.ts`, no
`core/testing/` import anywhere. `scripts/gates.mjs`'s new check #10 enforces
this going forward — a clean run confirms it today (`gates: clean`).
`grep -rn "Storage" src/app/pages/citizens` returns nothing — no
`localStorage`/`sessionStorage` write anywhere in this module.

## B5 — tests

`citizens.spec.ts`: 12 tests, all passing, using `HttpTestingController`
against the REAL `StaffCitizensApi` (no fakes) — list renders real rows,
metrics render, search debounces (verified with `vi.useFakeTimers()`) and
sends `search=` once rather than per keystroke, pagination sends `page=`,
detail loads and tabs switch, Disable posts a real Idempotency-Key header and
the given reason and reloads on success, a role with no citizen-administration
permission (`'Auditor'`, tested directly — see the human-decision note above
on why no REAL portal nav path reaches this state today) renders no action
buttons, `unavailable` (501) and `not-found` (404) states render honestly
without fabricating rows, and erasure's two-step confirm genuinely gates on
two separate confirmations before ever calling `/erasure`. `citizen-detail-data
.spec.ts`: 4 tests for the pure view-model helpers.

`permissions.spec.ts` extended: Citizens module position/roles, `canAccessPath`
resolution for `/citizens/:id` across an allowed and a disallowed role, every
`ACTION_PERMISSIONS['citizen.*']` limited to Super Admin/Administrator, and
the `Staff & Roles` relabel keeping its key/path. `app.routes.spec.ts`
extended with `citizens`/`citizens/:id` in `CANONICAL_PATHS`.
`a11y-guarded-screens.spec.ts` extended with both routes (mounting the same
`Citizens` component twice, matching the existing `applications`/
`applications/:id` precedent in that same file) — **run in progress at
handoff time**; confirm it passes before merging (each screen gets a 120s
budget in that file for exactly the load-contention reason its own comment
explains).

**A gates.mjs false positive found and fixed while adding check #10**: the
"queue-load notice must be placed" check (#5) matches `/\bApplicationStore\b/`
against the RAW SOURCE TEXT of every page file, including comments — this
page's own doc comment, explaining that it deliberately does NOT use
`ApplicationStore`, tripped that check purely by naming the class in prose.
Reworded the comment to avoid the literal identifier rather than adding an
`EXEMPT` entry (which would have been factually wrong — this page genuinely
does not inject the store, unlike every real `EXEMPT` entry that page already
lists).

## Status

`node scripts/build-strict.mjs`: green. `node scripts/gates.mjs`: clean.
`citizens.spec.ts`, `citizen-detail-data.spec.ts`, `permissions.spec.ts`,
`app.routes.spec.ts`, `sidebar.spec.ts`: all green (run together, 56 tests).
`a11y-guarded-screens.spec.ts`: run in progress at handoff time — confirm
before merging. Full `npm run verify` (gates → labels → contract → headers →
build:strict → csp → a11y → test) has **not** been run end-to-end on this
branch yet — do that before merging, and note that `check:contract` will need
the B2 contract-fixture step above done first or it may fail/warn on the new
API client having no matching fixture file yet.

Not deployed anywhere. Per Part D of the module brief: do not merge this admin
portal branch to `main` until the backend's `feature/citizens` is deployed and
verified live (`GET <api>/version` shows the new commit; a Super Admin token
gets real rows from `/staff/citizens`) — merging the frontend first would ship
a sidebar entry pointing at routes the deployed API doesn't have yet.
