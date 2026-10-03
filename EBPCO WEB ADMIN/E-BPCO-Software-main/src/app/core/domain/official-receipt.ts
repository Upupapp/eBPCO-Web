/**
 * The same check the server applies to an Official Receipt number
 * (ebpco-api `payments/domain/official-receipt.ts`), run as the cashier types
 * so "abc" is refused before it is sent (QA TC-03, 2026-10-03), and an empty
 * field is asked for the number rather than for "a reason" (TC-08). Null when
 * the number is acceptable; the server still has the last word, including
 * whether the number is already on another payment.
 */
export function officialReceiptProblem(value: string): string | null {
  const number = value.trim();
  if (number.length === 0) return 'Enter the Official Receipt number, exactly as printed on the receipt.';
  if (!/^[A-Za-z0-9][A-Za-z0-9 ./-]*$/.test(number)) {
    return 'An Official Receipt number has only letters, numbers, spaces, hyphens, slashes and periods.';
  }
  if ((number.match(/\d/g) ?? []).length < 4) {
    return 'An Official Receipt number has at least 4 digits. Copy it exactly as printed on the receipt.';
  }
  if (number.length > 40) return 'An Official Receipt number is at most 40 characters long.';
  return null;
}
