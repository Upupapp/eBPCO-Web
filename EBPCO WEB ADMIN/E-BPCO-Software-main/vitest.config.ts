import { defineConfig } from 'vitest/config';

/**
 * Test runner budgets.
 *
 * ── Why these are set explicitly ────────────────────────────────────────
 *
 * Vitest's default hook budget is 10s, and on this machine that is not enough.
 * Several suites mount a whole page — Dashboard, Businesses, User directory —
 * and under load those mounts exceed 10s and fail as:
 *
 *     Error: Hook timed out in 10000ms.
 *
 * Measured on 2026-08-31: two such failures at 16.4s and 12.0s at load average
 * 48.6, with the very next run passing 426/426 unchanged. This Mac is shared
 * with another agent, so load is not something this repo controls.
 *
 * ── Why this matters more than a slow suite ─────────────────────────────
 *
 * A red run during a deploy protocol is a FALSE NEGATIVE that looks exactly
 * like a real regression, and the natural response — re-run until green — is
 * also how a real failure gets waved through. It cost a re-run on several
 * pushes today, and each one is a moment where a genuine break could have been
 * dismissed as "just the load again".
 *
 * ── Why not simply a very large number ──────────────────────────────────
 *
 * A budget that never expires cannot distinguish a slow test from a hung one:
 * a deadlocked hook would hang the suite instead of failing it, and CI would
 * sit until an outer timeout killed it with no useful output.
 *
 * 30s is roughly twice the worst measured hook (16.4s) under a load average of
 * 48. It absorbs contention on a shared machine while still failing a genuinely
 * stuck hook in well under a minute.
 */
export default defineConfig({
  test: {
    hookTimeout: 30_000,
    // Tests themselves have not been the problem — the failures are all in
    // beforeEach/afterEach — but a mount that takes 16s in a hook can take a
    // comparable time in a body, so this is raised in step rather than left at
    // the 5s default to fail somewhere else on the same bad afternoon.
    testTimeout: 30_000,
  },
});
