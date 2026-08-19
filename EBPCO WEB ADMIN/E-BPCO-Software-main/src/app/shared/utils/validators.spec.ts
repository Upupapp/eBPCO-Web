import {
  LANDLINE_FORMAT_EXAMPLE,
  MOBILE_FORMAT_EXAMPLE,
  validateEmail,
  validateLandlineNumber,
  validateMobileNumber,
} from './validators';

describe('validateEmail', () => {
  it('trims surrounding whitespace before validating and normalizing', () => {
    const r = validateEmail('  juan.delacruz@gmail.com  ');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('juan.delacruz@gmail.com');
  });

  it('normalizes case (lowercases) a structurally valid address', () => {
    const r = validateEmail('Juan.DelaCruz@Gmail.COM');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('juan.delacruz@gmail.com');
  });

  it('rejects an empty value with a specific required-field message', () => {
    const r = validateEmail('');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/required/i);
  });

  it('rejects a value with no "@"', () => {
    const r = validateEmail('not-an-email');
    expect(r.valid).toBe(false);
    expect(r.error).toBeTruthy();
  });

  it('rejects a value with no domain suffix', () => {
    expect(validateEmail('user@localhost').valid).toBe(false);
  });

  it('rejects an address containing spaces', () => {
    const r = validateEmail('user name@gmail.com');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/space/i);
  });

  it('rejects a doubled/consecutive-dot local part', () => {
    expect(validateEmail('user..name@gmail.com').valid).toBe(false);
  });

  it('preserves the original (trimmed) value on the `normalized` field even when invalid, so entered input is never silently discarded', () => {
    const r = validateEmail('  not-an-email  ');
    expect(r.valid).toBe(false);
    expect(r.normalized).toContain('not-an-email');
  });

  it('accepts a realistic address with a subdomain and plus-tag', () => {
    expect(validateEmail('juan+applications@mail.castilla.gov.ph').valid).toBe(true);
  });
});

describe('validateMobileNumber — Philippine formats', () => {
  it('accepts the local 09XXXXXXXXX format', () => {
    const r = validateMobileNumber('09171234567');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('+63 917 123 4567');
  });

  it('accepts the international +63 9XXXXXXXXX format with spaces', () => {
    const r = validateMobileNumber('+63 917 123 4567');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('+63 917 123 4567');
  });

  it('accepts 63-prefixed (no plus) with hyphens', () => {
    const r = validateMobileNumber('63-917-123-4567');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('+63 917 123 4567');
  });

  it('normalizes parentheses and mixed separators to the same canonical form', () => {
    const r = validateMobileNumber('(0917) 123-4567');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('+63 917 123 4567');
  });

  it('rejects a number containing letters', () => {
    const r = validateMobileNumber('0917ABC4567');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/letters|invalid/i);
  });

  it('rejects a value that is too short', () => {
    expect(validateMobileNumber('09171234').valid).toBe(false);
  });

  it('rejects a value that is too long', () => {
    expect(validateMobileNumber('091712345678901').valid).toBe(false);
  });

  it('rejects an empty value when required, but allows it when not required', () => {
    expect(validateMobileNumber('').valid).toBe(false);
    expect(validateMobileNumber('', false).valid).toBe(true);
  });

  it('shows a usable example format in the error message and the exported constant', () => {
    // A numeric-but-wrong-length value hits the "enter a valid 11-digit
    // number, e.g. <example>" branch specifically (the letters-rejection
    // branch has its own, differently-worded message — see the previous
    // test).
    expect(validateMobileNumber('12345').error).toContain(MOBILE_FORMAT_EXAMPLE);
    expect(MOBILE_FORMAT_EXAMPLE).toMatch(/^09/);
  });
});

describe('validateLandlineNumber — Philippine formats, separate from mobile', () => {
  it('is optional by default — an empty value is valid', () => {
    const r = validateLandlineNumber('');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('');
  });

  it('can be made required', () => {
    expect(validateLandlineNumber('', true).valid).toBe(false);
  });

  it('accepts an area-code + local-number format', () => {
    const r = validateLandlineNumber('(056) 123 4567');
    expect(r.valid).toBe(true);
    expect(r.normalized).toContain('123 4567');
  });

  it('accepts a bare 7-digit local number with no area code', () => {
    const r = validateLandlineNumber('123-4567');
    expect(r.valid).toBe(true);
    expect(r.normalized.replace(/\s/g, '')).toBe('1234567');
  });

  it('rejects letters', () => {
    expect(validateLandlineNumber('056-ABC-4567').valid).toBe(false);
  });

  it('rejects an unreasonably short or long value', () => {
    expect(validateLandlineNumber('123').valid).toBe(false);
    expect(validateLandlineNumber('123456789012').valid).toBe(false);
  });

  it('exposes a usable example format distinct from the mobile example', () => {
    expect(LANDLINE_FORMAT_EXAMPLE).not.toBe(MOBILE_FORMAT_EXAMPLE);
  });
});
