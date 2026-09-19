# Production-readiness pass — Admin Portal handoff

Ongoing. Work happened directly on `main` (a `prod-readiness` branch was created,
then abandoned at the owner's direction partway through — everything below is on
`main`, and `origin/prod-readiness` is a stale, unused ref left behind by that).

## What changed

**B0 — repo hygiene.** 2163 files under `.playwright-mcp/` (console logs, page
snapshots, screenshots from live manual verification sessions) had been getting
committed to the repo root by accident, run after run — nothing ignored the
directory. Untracked and added to a new root `.gitignore`. This does **not**
rewrite history; those files remain in past commits on this public repo — a
deliberate history rewrite to purge them is a human call (see "What remains"
below), not one made silently here.

**CSV/formula injection**, every CSV export (Applications, Businesses, Payments,
staff directory, evaluations, permit release, system logs). `toCsvCell()` only
escaped CSV's own structural characters. A cell beginning with `=`, `+`, `-` or
`@` is read as a FORMULA by Excel/Sheets/LibreOffice when the file is opened —
and several of these exports carry fields an applicant supplies themselves
(business name, address, remarks), so this was reachable by registering a
business with a crafted name, not just by an officer typing into the app. Fixed
with the standard leading-apostrophe escape. Proved against the unguarded
version first.

**Security headers.** Netlify shipped none of CSP/HSTS/X-Content-Type-Options/
X-Frame-Options/Referrer-Policy/Permissions-Policy for this staff-facing portal.
Added to `netlify.toml`, with a new `scripts/check-security-headers.mjs` gate
wired into `npm run verify` so a future edit can't silently weaken or remove one.

**Topbar notification-bell fix, and the tests it left behind.** `topbar.ts`'s
constructor now fetches the officer's real `GET /staff/notifications` (it used
to read a store collection that a real queue load always wipes to `[]`, so the
bell showed permanently empty regardless of real notices). This was landed
during an earlier part of this session; `access-requests.spec.ts` and
`user-roles.spec.ts` didn't flush the new request their shared `mount()` helpers
now also trigger, so `HttpTestingController.verify()` failed. Fixed both.

## How it was verified

- `npm run typecheck && npm test -- --watch=false`: clean after every change.
- Full suite: **55 test files, 525 tests — 524 passing, 1 pre-existing failure**
  (`application-intake.spec.ts`'s "attaches every provided document to the
  reopened server record" — its own `attachAllRequiredDocuments` test helper
  sets `.fileName` but never `.file`, while `submit()` requires `.file`; this
  predates this session and is unrelated to any change made here).
- `npm run check:headers`: new gate, proved to fail against a deliberately
  broken header locally before being wired into `verify`.
- `npm run gates`, `check:labels`, `check:contract`, `build:strict`,
  `check:a11y`: not re-run after every individual change this session; last
  known state is whatever the full `npm run verify` reports next.

## What remains for a human

1. **This repo is public** (`github.com/Upupapp/eBPCOBackend`'s sibling —
   confirmed via the GitHub API during this session). The 2163 untracked
   `.playwright-mcp` files, and an earlier commit bundling real code changes
   with ~67 more of the same, are still in this repo's history. Whether to
   `git filter-repo` them out is a real decision (rewrites history other
   clones depend on) — not made here.
2. **`origin/prod-readiness` could not be deleted.** `git push origin --delete`
   hangs indefinitely on a Git Credential Manager prompt in this environment.
   Delete via the GitHub web UI, or leave it — nothing targets it going forward.
3. **Repo layout has a space in the path** (`EBPCO WEB ADMIN/E-BPCO-Software-main`),
   which `netlify.toml`'s own comments document as having caused a real,
   multi-day outage once (Netlify's change-detection silently split the
   unquoted path into three dead pathspecs). Quoting the path in `netlify.toml`
   already works around it; renaming the directory is a bigger change to a
   repo other agents also work in and was not done here.

## Not yet done

The Admin Portal's ALREADY-EXISTING `_dataSource`/`isSeedData` mechanism
(`application-store.ts`, `queue-loader.ts`, `queue-load-notice.ts`) was checked
and found to correctly and comprehensively prevent seed data from being shown
as real once a server load happens — no fix needed there. Beyond B0 and the
items above, Part B was not worked through item-by-item against the original
spec's B1–B9 (that text was not available to reconstruct faithfully — see the
backend repo's own handoff for why).
