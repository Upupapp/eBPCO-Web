// Client-side mirror of the server's own password policy
// (eBPCOBackend: src/modules/identity/domain/password-policy.ts). Ported by
// hand rather than shared as a package -- the two repos have no shared
// package between them -- so a checked item here is a real guarantee about
// what the server will accept, not an invented rule, and it must be kept in
// sync with that file by hand whenever it changes.
//
// One thing is deliberately NOT here: the breach screen. It needs a real
// lookup against known-breached passwords and can't be replicated in a
// browser; a password that passes every check below can still be rejected
// by the server for that reason, and the caller's own submit-time error
// handling is what surfaces it.

export const MIN_PASSWORD_LENGTH = 12;

const SERVICE_WORDS = ['ebpco', 'permit', 'building', 'occupancy', 'quezon', 'philippines'];

// Unicode property classes, not [A-Z]/[a-z]/[0-9] -- an ASCII-only check
// would reject a perfectly good accented or non-Latin letter the server
// itself accepts (it counts length in Unicode code points, not ASCII).
const UPPERCASE = /\p{Lu}/u;
const LOWERCASE = /\p{Ll}/u;
const DIGIT = /\p{Nd}/u;
// Any character that is not a letter, number, or whitespace -- broader than
// \p{P} alone, so it also covers symbols like $ + = ~ a user would call
// punctuation just the same.
const PUNCTUATION = /[^\p{L}\p{N}\s]/u;

export interface PasswordContext {
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

function isRepetitive(password: string): boolean {
  const characters = [...password];
  const first = characters[0];
  return first !== undefined && characters.every((character) => character === first);
}

function isSequential(password: string): boolean {
  const lower = password.toLowerCase();
  let ascending = true;
  let descending = true;
  for (let i = 1; i < lower.length; i += 1) {
    const previous = lower.codePointAt(i - 1);
    const current = lower.codePointAt(i);
    if (previous === undefined || current === undefined) return false;
    if (current !== previous + 1) ascending = false;
    if (current !== previous - 1) descending = false;
    if (!ascending && !descending) return false;
  }
  return ascending || descending;
}

function containsContextWords(password: string, context: PasswordContext): boolean {
  const lower = password.toLowerCase();
  const candidates = [
    ...SERVICE_WORDS,
    context.firstName?.toLowerCase(),
    context.lastName?.toLowerCase(),
    context.email?.toLowerCase().split('@')[0],
  ].filter((word): word is string => typeof word === 'string' && word.length >= 4);
  return candidates.some((word) => lower.includes(word));
}

export interface PasswordCheck {
  readonly label: string;
  readonly passed: boolean;
}

/** For a live checklist: every client-checkable rule, independent of the others. */
export function passwordChecks(password: string, context: PasswordContext = {}): PasswordCheck[] {
  return [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters long`, passed: [...password].length >= MIN_PASSWORD_LENGTH },
    { label: 'Contains an uppercase letter', passed: UPPERCASE.test(password) },
    { label: 'Contains a lowercase letter', passed: LOWERCASE.test(password) },
    { label: 'Contains a number', passed: DIGIT.test(password) },
    { label: 'Contains punctuation', passed: PUNCTUATION.test(password) },
    { label: 'Not a single character repeated (e.g. "aaaaaaaaaaaa")', passed: password.length > 0 && !isRepetitive(password) },
    { label: 'Not a simple sequence (e.g. "abcdefghijkl", "123456789012")', passed: password.length > 0 && !isSequential(password) },
    { label: 'Doesn’t contain your name, email, or the service name', passed: password.length > 0 && !containsContextWords(password, context) },
  ];
}

/** Same order and wording as the server's own `PasswordPolicy.evaluate()` (a length
 *  failure short-circuits the rest there too), so a rejection caught here reads
 *  identically to one the server would have returned for the same password. Returns
 *  `null` once every client-checkable rule passes -- the breach screen can still
 *  reject it server-side after that. */
export function firstPasswordRejectionMessage(password: string, context: PasswordContext = {}): string | null {
  if ([...password].length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters. A longer phrase is easier to remember and harder to guess than a short one with symbols in it.`;
  }
  if (!UPPERCASE.test(password)) return 'Include at least one uppercase letter.';
  if (!LOWERCASE.test(password)) return 'Include at least one lowercase letter.';
  if (!DIGIT.test(password)) return 'Include at least one number.';
  if (!PUNCTUATION.test(password)) return 'Include at least one punctuation character (e.g. ! ? . , -).';
  if (isRepetitive(password)) return 'This is a single character repeated. Choose something with more variety.';
  if (isSequential(password)) return 'This is a simple sequence. Choose something less predictable.';
  if (containsContextWords(password, context)) {
    return 'This contains your own details or the name of this service, both of which are easy to guess.';
  }
  return null;
}
