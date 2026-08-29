/**
 * RFC 9457 Problem Details, which is what this API answers failures with.
 *
 * Modelled rather than treated as an opaque error, because the fields carry
 * things a portal has to show: `detail` is written for the person reading the
 * screen, and `fieldErrors` says which input was wrong. An interceptor that
 * reduced all of this to "request failed" would throw away the only part the
 * officer can act on.
 */
export interface FieldError {
  /** JSON Pointer into the request body. */
  readonly pointer: string;
  readonly message: string;
}

export interface Problem {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly fieldErrors?: readonly FieldError[];
  readonly correlationId?: string;
}

/** Thrown by the client so callers can catch a shape rather than inspect a status. */
export class ApiError extends Error {
  constructor(readonly problem: Problem) {
    // `detail` where the server wrote one for a reader; `title` otherwise.
    // Never the raw status text, which tells an officer nothing.
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
  }

  get status(): number {
    return this.problem.status;
  }
}

const PROBLEM_KEYS = ['type', 'title', 'status'] as const;

/**
 * Recognises a Problem Details body without trusting it.
 *
 * A 500 from a proxy is HTML, and a gateway timeout may be plain text; both
 * arrive on the same error path as a real problem document. Anything that is
 * not recognisably one becomes a synthetic problem carrying the status, so a
 * caller never has to distinguish "the API said no" from "something between us
 * said no".
 */
export function toProblem(status: number, body: unknown): Problem {
  if (typeof body === 'object' && body !== null
    && PROBLEM_KEYS.every((key) => key in (body as Record<string, unknown>))) {
    return body as Problem;
  }
  return {
    type: 'about:blank',
    title: status === 0 ? 'The server could not be reached' : 'The request failed',
    status,
    ...(status === 0
      ? { detail: 'Check your connection, or whether the API is running.' }
      : {}),
  };
}
