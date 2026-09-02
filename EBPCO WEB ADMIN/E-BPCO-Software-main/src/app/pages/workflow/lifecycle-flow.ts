import {
  ApplicationLifecycleStatus,
  LIFECYCLE_SEQUENCE,
  VALID_TRANSITIONS,
} from '../../core/domain/status.model';
import { FlowEdge, FlowNode } from '../../shared/flow-chart/flow-chart';
import { FlowBuilder } from './flow-builder';

/**
 * The lifecycle, drawn FROM the rules the system enforces.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 *
 * The eight hand-built flows on this page are departmental procedures — who
 * does what, in which office, in what order. They are legitimate and this does
 * not replace them.
 *
 * What was missing is different: `workflow-flows.ts` imports a chart type and a
 * builder and nothing else. **No diagram on the page had any link to
 * `VALID_TRANSITIONS`**, the table the lifecycle engine actually enforces. A
 * transition could be added, removed or re-pointed and every picture would
 * carry on showing the old process, with nothing to notice (P-F2).
 *
 * This flow is generated, so it cannot drift: the spine is `LIFECYCLE_SEQUENCE`
 * and every branch off it is read from `VALID_TRANSITIONS`. Change the table and
 * the drawing changes with it.
 *
 * ── Why a spine and branches rather than a graph ────────────────────────
 *
 * Nineteen statuses and forty-odd edges laid out automatically would be a
 * thicket, and a diagram nobody can read documents nothing. The lifecycle has a
 * real spine — the fifteen-step happy path — and everything else leaves it
 * sideways: a rejection, a cancellation, an expiry, a loop back for revision.
 * Drawing it that way matches how an officer thinks about a file: it is
 * progressing, or it has gone somewhere else.
 *
 * ── How it is held to the table ─────────────────────────────────────────
 *
 * The build returns `drawn`: the (from, to) pairs it ACTUALLY connected. The
 * spec asserts that set equals `VALID_TRANSITIONS` exactly.
 *
 * That indirection is the whole point, and the first attempt got it wrong. It
 * asserted `spineSteps + branches === lifecycleEdgeCount()` — but both sides
 * are computed from the same table, so adding a transition raised both equally
 * and the test could never fail. Proven by adding `Completed -> Draft` and
 * watching 439 tests stay green. A gate that cannot fail is not a gate, and it
 * is more dangerous than none because it is believed.
 *
 * `drawn` is recorded where the edges are created, so a branch skipped by the
 * `continue` below is missing from it and the spec fails.
 */

/** A branch off the happy path: where it goes, and from which status. */
export interface LifecycleBranch {
  readonly from: ApplicationLifecycleStatus;
  readonly to: ApplicationLifecycleStatus;
}

/** Every transition in the table that is NOT a step along the happy path. */
export function lifecycleBranches(): LifecycleBranch[] {
  const branches: LifecycleBranch[] = [];
  for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
    const status = from as ApplicationLifecycleStatus;
    const next = LIFECYCLE_SEQUENCE[LIFECYCLE_SEQUENCE.indexOf(status) + 1];
    for (const to of targets) {
      if (to !== next) branches.push({ from: status, to });
    }
  }
  return branches;
}

/** Every (from, to) pair the transition table permits. */
export function lifecycleTablePairs(): LifecycleBranch[] {
  const pairs: LifecycleBranch[] = [];
  for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
    for (const to of targets) {
      pairs.push({ from: from as ApplicationLifecycleStatus, to });
    }
  }
  return pairs;
}

/**
 * Builds the diagram.
 *
 * Terminal statuses are drawn once each and reused as branch targets, rather
 * than once per arrival — four separate "Rejected" boxes would suggest four
 * different rejections.
 */
export function buildLifecycleFlow(
  cx: number,
): { nodes: FlowNode[]; edges: FlowEdge[]; drawn: LifecycleBranch[] } {
  const b = new FlowBuilder(cx);
  const spine = new Map<ApplicationLifecycleStatus, FlowNode>();
  /** What was actually connected. The spec holds this against the table. */
  const drawn: LifecycleBranch[] = [];

  b.start('FILED');
  let previous: FlowNode | null = null;
  let previousStatus: ApplicationLifecycleStatus = LIFECYCLE_SEQUENCE[0];
  for (const status of LIFECYCLE_SEQUENCE) {
    const node = b.process(status);
    spine.set(status, node);
    if (previous !== null) {
      b.linkDown(previous, node);
      drawn.push({ from: previousStatus, to: status });
    }
    previous = node;
    previousStatus = status;
  }

  // Everything the table knows that is not on the spine, drawn once each.
  //
  // Two kinds, and they must not look alike. `Revision Required` is OFF the
  // happy path but not the end of anything — it loops back into evaluation, and
  // drawing it as a terminal would say an application dies there. Rejected,
  // Cancelled and Expired genuinely are ends.
  //
  // Deciding by whether the status has outgoing transitions, rather than by a
  // list, means a new status added to the table is drawn correctly without
  // anyone remembering to classify it here.
  const offSpine = new Map<ApplicationLifecycleStatus, FlowNode>();
  const others = (Object.keys(VALID_TRANSITIONS) as ApplicationLifecycleStatus[]).filter(
    (status) => !spine.has(status),
  );
  for (const status of others) {
    const isEnd = VALID_TRANSITIONS[status].length === 0;
    offSpine.set(status, isEnd ? b.end(status) : b.process(status));
  }

  // One lookup for both sides. Reading `from` out of the spine alone dropped
  // every transition leaving `Revision Required` — three of them — because it
  // is not on the happy path. The spec caught it; nothing else would have.
  const nodeFor = (status: ApplicationLifecycleStatus): FlowNode | undefined =>
    spine.get(status) ?? offSpine.get(status);

  for (const branch of lifecycleBranches()) {
    const from = nodeFor(branch.from);
    const to = nodeFor(branch.to);
    // A branch whose endpoint was never drawn is dropped HERE. It is absent
    // from `drawn`, so the spec fails rather than the diagram quietly omitting
    // a transition the engine will still permit.
    if (from === undefined || to === undefined) continue;
    drawn.push(branch);
    // Red for a way out of the process, gray for a loop back into it. Routed
    // round the right for exits and the left for loops, so the two kinds of
    // departure never share a lane and cross each other.
    // A loop is anything landing back on the spine; a way out is anything else.
    const isLoop = spine.has(branch.to);
    b.linkAround(from, to, isLoop ? 'gray' : 'red', undefined, {
      fromSide: isLoop ? 'left' : 'right',
      toSide: isLoop ? 'left' : 'top',
      viaX: isLoop ? from.x - 60 : from.x + from.w + 60,
    });
  }

  return { nodes: b.nodes, edges: b.edges, drawn };
}
