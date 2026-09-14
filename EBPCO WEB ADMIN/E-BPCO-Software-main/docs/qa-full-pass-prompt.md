# Prompt: Exhaustive Super-Admin QA Pass — E-BPCO Admin Portal

Open the E-BPCO Admin Portal in a live, visible browser session (not headless —
the user needs to watch this happen). Sign in as a Super Admin account. If
credentials, an OTP, a CAPTCHA, or any other human-only step blocks you, stop
and ask the user for exactly what you need, then continue from where you left
off once they answer — never guess or fabricate a credential.

Test the entire application the way a thorough human tester would, module by
module (Dashboard, Applications, Evaluations, Payments, Permit Release,
Businesses, Access Requests, Users & Roles, Workflow, Archive, System Logs,
Login, Register, Reset Password — and any other page reachable from the
sidebar or a deep link). For every page:

- Click every button, tab, filter, icon-action, and menu item at least once
  and confirm it does what it claims to.
- For every form: submit it empty, submit it with each required field missing
  one at a time, try an invalid value in every field that has a format rule
  (bad email shape, a too-short password, a non-numeric field given letters, a
  date in the wrong format, a value past its max length, a value below its
  minimum), and then submit it correctly and confirm the success path.
- For every list or table: use the search box with a match and a no-match
  query, apply and clear every filter, sort every sortable column, and check
  pagination at both ends (first page, last page, and — if reachable — an
  empty result set).
- For every destructive or consequential action (delete, disable, reject,
  release, approve): open its confirmation step, cancel out of it, then do it
  for real and confirm the after-state.
- Read every visible label, placeholder, button caption, and error/success
  message on the page for spelling and grammar.
- Note every rough edge even when the feature technically "works" — confusing
  wording, a missing loading/empty state, an inconsistent label, anything a
  real officer would find awkward.

Record every individual check as its own row in a table with these exact
columns: **Test ID | Test Scenario | Status | Remarks (incl. what to
improve)**. Test ID is a short module prefix plus a running number (e.g.
`LOGIN-001`, `APPS-014`, `PAY-022`). Status is one of `Pass`, `Fail`, or `Needs
Improvement` (works, but should be better). Remarks states what actually
happened when the check was run, and — for anything short of a clean Pass — a
concrete suggestion for what to change.

Do not summarize or batch multiple checks into one row. Do not report a row as
tested unless it was actually performed in this session. Deliver the finished
table as a published, shareable page, not just as chat text.
