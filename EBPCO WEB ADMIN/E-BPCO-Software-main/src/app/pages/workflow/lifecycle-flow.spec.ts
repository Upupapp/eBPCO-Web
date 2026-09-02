import {
  buildLifecycleFlow,
  lifecycleTablePairs,
} from './lifecycle-flow';
import { VALID_TRANSITIONS } from '../../core/domain/status.model';

/**
 * The one flow on this page that is derived rather than drawn.
 *
 * The other eight are departmental procedures and legitimately hand-built.
 * What none of them had was any link to `VALID_TRANSITIONS` — so a transition
 * could be added, removed or re-pointed and every picture would carry on
 * showing the old process, with nothing to notice (P-F2).
 *
 * ── The first version of this file was a tautology ──────────────────────
 *
 * It asserted `spineSteps + branches === lifecycleEdgeCount()`. Both sides were
 * computed from the same table, so adding a transition raised both equally.
 * Proven worthless by adding `Completed -> Draft` and watching all 439 tests
 * stay green.
 *
 * These assert the DRAWING against the table instead: `buildLifecycleFlow`
 * reports the pairs it actually connected, and that set must equal the table.
 */
const key = (p: { from: string; to: string }): string => `${p.from} -> ${p.to}`;

describe('Lifecycle flow', () => {
  it('draws every transition the table permits, and no others', () => {
    const drawn = new Set(buildLifecycleFlow(455).drawn.map(key));
    const table = new Set(lifecycleTablePairs().map(key));

    const missing = [...table].filter((t) => !drawn.has(t));
    const invented = [...drawn].filter((d) => !table.has(d));

    // Named rather than counted: a failure should say WHICH transition the
    // diagram stopped showing, not that a number moved.
    expect(missing).toEqual([]);
    expect(invented).toEqual([]);
  });

  it('draws a node for every status the table knows', () => {
    const labels = new Set(buildLifecycleFlow(455).nodes.map((n) => n.label));

    for (const status of Object.keys(VALID_TRANSITIONS)) {
      expect(labels.has(status)).toBe(true);
    }
  });

  it('draws each terminal status once, not once per arrival', () => {
    const rejected = buildLifecycleFlow(455).nodes.filter((n) => n.label === 'Rejected');

    // Three statuses can reach Rejected. Three boxes would suggest three
    // different rejections.
    expect(rejected.length).toBe(1);
  });

  it('separates a loop back into the process from a way out of it', () => {
    const { edges } = buildLifecycleFlow(455);

    // Rejected/Cancelled/Expired leave the process; Revision Required loops
    // back into it. An officer must be able to tell which kind of departure
    // they are looking at without reading the labels.
    expect(edges.some((e) => e.color === 'red')).toBe(true);
    expect(edges.some((e) => e.color === 'gray')).toBe(true);
  });
});
