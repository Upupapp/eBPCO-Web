import { toCsvCell } from './export-csv';

/**
 * OWASP CSV/formula injection. Several of the pages that call downloadCsv()
 * export fields an applicant supplies themselves (business name, address,
 * remarks) — so a cell beginning with =, +, - or @ is reachable by anyone
 * who can register a business, not just an officer typing into the app, and
 * would run as a formula the moment an officer opens the export in Excel.
 */
describe('toCsvCell', () => {
  it('prefixes a formula-triggering leading "=" with an apostrophe', () => {
    expect(toCsvCell('=HYPERLINK("http://evil.example/steal","x")'))
      .toBe(`"'=HYPERLINK(""http://evil.example/steal"",""x"")"`);
  });

  it('prefixes a leading "+", "-" and "@" the same way', () => {
    expect(toCsvCell('+1+1')).toBe("'+1+1");
    expect(toCsvCell('-2+3')).toBe("'-2+3");
    expect(toCsvCell('@SUM(A1:A9)')).toBe("'@SUM(A1:A9)");
  });

  it('leaves an ordinary value untouched', () => {
    expect(toCsvCell('Dela Cruz Hardware')).toBe('Dela Cruz Hardware');
    expect(toCsvCell(42)).toBe('42');
  });

  it('treats null and undefined as an empty cell', () => {
    expect(toCsvCell(null)).toBe('');
    expect(toCsvCell(undefined)).toBe('');
  });

  it('still quotes a value containing a comma, quote or newline, after the formula guard', () => {
    expect(toCsvCell('Rizal St, Poblacion')).toBe('"Rizal St, Poblacion"');
    expect(toCsvCell('Say "hi"')).toBe('"Say ""hi"""');
    expect(toCsvCell('=1, "two"')).toBe(`"'=1, ""two"""`);
  });
});
