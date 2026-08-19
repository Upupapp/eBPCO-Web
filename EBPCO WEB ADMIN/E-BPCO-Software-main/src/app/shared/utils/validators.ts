// Email/phone validation + normalization shared by every form that
// collects contact details (the manual application intake form today;
// any future applicant-editing surface reuses the same rules instead of
// re-implementing its own regex).

export interface FieldValidation {
  valid: boolean;
  /** Null when valid — a specific, human-readable message when not. */
  error: string | null;
  /** Trimmed/normalized value to store, even when invalid (so the raw input is never silently discarded — see "preserve entered information when validation fails"). */
  normalized: string;
}

// Deliberately not a full RFC 5322 implementation (mailbox-only local
// parts, quoted strings, comments, etc. are vanishingly rare in real
// applicant-entered addresses) — this rejects the actual failure modes a
// walk-in encoder produces: missing '@', missing domain suffix, spaces,
// doubled/trailing dots, empty local or domain part.
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(raw: string): FieldValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: 'Email address is required.', normalized: '' };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'Email address cannot contain spaces.', normalized: trimmed };
  }
  // Normalized to lowercase — mailbox providers treat address case
  // insensitively in practice, and the rest of this app already seeds/
  // compares emails lowercase (see application-seed.ts).
  const normalized = trimmed.toLowerCase();
  if (trimmed.includes('..') || !EMAIL_RE.test(normalized)) {
    return {
      valid: false,
      error: 'Enter a complete, valid email address (e.g. juan.delacruz@gmail.com).',
      normalized,
    };
  }
  return { valid: true, error: null, normalized };
}

export const MOBILE_FORMAT_EXAMPLE = '0917 123 4567 (or +63 917 123 4567)';
export const LANDLINE_FORMAT_EXAMPLE = '(056) 123 4567';

function stripPhoneFormatting(raw: string): string {
  return raw.replace(/[\s\-().]/g, '');
}

/** Philippine mobile number — accepts 09XXXXXXXXX, +639XXXXXXXXX, or 639XXXXXXXXX (with spaces/hyphens/parens anywhere), normalizes to "+63 9XX XXX XXXX". `required` false allows an empty value through as valid (for optional mobile-adjacent fields, if any are ever added). */
export function validateMobileNumber(raw: string, required = true): FieldValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return required
      ? { valid: false, error: 'Mobile number is required.', normalized: '' }
      : { valid: true, error: null, normalized: '' };
  }
  const stripped = stripPhoneFormatting(trimmed);
  if (/[^\d+]/.test(stripped)) {
    return {
      valid: false,
      error: 'Mobile number cannot contain letters or invalid characters.',
      normalized: trimmed,
    };
  }
  let digits = stripped.replace(/^\+?63/, '0');
  if (!digits.startsWith('0')) digits = `0${digits}`;
  if (!/^09\d{9}$/.test(digits)) {
    return {
      valid: false,
      error: `Enter a valid 11-digit Philippine mobile number, e.g. ${MOBILE_FORMAT_EXAMPLE}.`,
      normalized: trimmed,
    };
  }
  const core = digits.slice(1); // 9XXXXXXXXX
  return {
    valid: true,
    error: null,
    normalized: `+63 ${core.slice(0, 3)} ${core.slice(3, 6)} ${core.slice(6)}`,
  };
}

/**
 * Philippine landline — area code + local number, with or without the
 * leading trunk '0' or a '+63'/'63' country code. Deliberately permissive
 * on total digit count (7–9 digits after stripping the trunk/country
 * prefix): exact area-code-specific lengths vary by region and Castilla's
 * own local exchange format isn't something this form should hardcode
 * without LGU confirmation — see requirements-catalog.ts's verification
 * notice for the same "don't invent LGU-specific specifics" rule applied
 * here. `required` false (the normal case — landline is optional per the
 * intake form) allows an empty value through as valid.
 */
export function validateLandlineNumber(raw: string, required = false): FieldValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return required
      ? { valid: false, error: 'Landline number is required.', normalized: '' }
      : { valid: true, error: null, normalized: '' };
  }
  const stripped = stripPhoneFormatting(trimmed);
  if (/[^\d+]/.test(stripped)) {
    return {
      valid: false,
      error: 'Landline number cannot contain letters or invalid characters.',
      normalized: trimmed,
    };
  }
  let digits = stripped.replace(/^\+?63/, '0');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length < 7 || digits.length > 9) {
    return {
      valid: false,
      error: `Enter a valid landline number including area code, e.g. ${LANDLINE_FORMAT_EXAMPLE}.`,
      normalized: trimmed,
    };
  }
  const areaLen = digits.length - 7;
  const area = digits.slice(0, areaLen);
  const local = digits.slice(areaLen);
  return {
    valid: true,
    error: null,
    normalized: area ? `(0${area}) ${local.slice(0, 3)} ${local.slice(3)}` : local,
  };
}
