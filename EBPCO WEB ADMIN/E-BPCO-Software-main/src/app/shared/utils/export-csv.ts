// Client-side CSV export. The backend is real, but it has no CSV-export
// endpoint for any of these tabular views (Applications, Businesses,
// Payments, the staff directory...) — each is already fetched as real data
// and rendered on screen, so "Export"/"Save Report"/"Download Receipt"
// build a CSV from what the page already holds, in the browser, and trigger
// a download via a Blob + temporary <a>, rather than a round trip to an
// endpoint that doesn't exist for this.

function toCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generic over `object` (not `Record<string, unknown>`) so callers can
// pass an existing typed row array directly — a plain interface without
// an index signature isn't assignable to Record<string, unknown>, only
// to `object`.
export function downloadCsv<T extends object>(filename: string, rows: T[]): void {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]) as (keyof T)[];
  const lines = [
    headers.map(toCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => toCsvCell(row[header])).join(',')),
  ];
  const csv = lines.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
