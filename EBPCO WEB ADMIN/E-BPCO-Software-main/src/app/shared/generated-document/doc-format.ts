// Small formatting helpers shared by the generated-document component
// library — every one renders an honest placeholder rather than blank or
// fabricated text when a value isn't available yet.

export const PLACEHOLDER_PENDING = 'Pending';
export const PLACEHOLDER_NOT_ASSIGNED = 'Not yet assigned';
export const PLACEHOLDER_FOR_VERIFICATION = 'For verification';
export const PLACEHOLDER_NOT_ON_FILE = 'Not on file';
export const PLACEHOLDER_NOT_AVAILABLE = 'Not available';

export function formatPHP(centavos: number | null | undefined): string {
  if (centavos === null || centavos === undefined) return PLACEHOLDER_PENDING;
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function displayOrPlaceholder(
  value: string | number | null | undefined,
  placeholder: string = PLACEHOLDER_NOT_ON_FILE,
): string {
  if (value === null || value === undefined) return placeholder;
  if (typeof value === 'string' && value.trim().length === 0) return placeholder;
  return String(value);
}

export function displayNumber(
  value: number | null | undefined,
  unit?: string,
  placeholder: string = PLACEHOLDER_NOT_ON_FILE,
): string {
  if (value === null || value === undefined) return placeholder;
  const formatted = value.toLocaleString('en-PH', { maximumFractionDigits: 2 });
  return unit ? `${formatted} ${unit}` : formatted;
}

export function displayBoolean(value: boolean | null | undefined, placeholder: string = PLACEHOLDER_NOT_ON_FILE): string {
  if (value === null || value === undefined) return placeholder;
  return value ? 'Yes' : 'No';
}

/** Reads a dot-path (e.g. "common.floorAreaSqm") off any object — used by TechnicalSummarySection to resolve config-defined field ids against the technical-data record. */
export function readPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, source);
}
