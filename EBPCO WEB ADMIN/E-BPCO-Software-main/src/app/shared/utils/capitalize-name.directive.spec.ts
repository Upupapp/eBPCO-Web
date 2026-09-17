import { capitalizeName } from './capitalize-name.directive';

describe('capitalizeName', () => {
  it('capitalizes the first letter of a single word', () => {
    expect(capitalizeName('juan')).toBe('Juan');
  });

  it('capitalizes the first letter of every word, hyphens included', () => {
    expect(capitalizeName('juan dela cruz')).toBe('Juan Dela Cruz');
    expect(capitalizeName('mary-jane santos')).toBe('Mary-Jane Santos');
  });

  it('leaves every other letter exactly as typed', () => {
    expect(capitalizeName('mcdonald')).toBe('Mcdonald');
    expect(capitalizeName('DELA CRUZ')).toBe('DELA CRUZ');
  });

  it('capitalizes accented letters, not just plain a-z', () => {
    expect(capitalizeName('ñoño')).toBe('Ñoño');
  });

  it('is a no-op on an empty string', () => {
    expect(capitalizeName('')).toBe('');
  });
});
