import { toastDuration } from './toast.service';

describe('toastDuration (a message stays long enough to read)', () => {
  it('keeps a short confirmation for 4s and a short error for 6s, as before', () => {
    expect(toastDuration('success', 'Saved.')).toBe(4_000);
    expect(toastDuration('error', 'Could not save.')).toBe(6_000);
  });

  it('keeps a long reason up long enough to read it', () => {
    const reason = 'Review the documents the Initial stage checks before passing it: Certified True Copy of OCT/TCT '
      + '(not yet reviewed); Unified Building Permit Form (not yet reviewed); Valid ID of Applicant and Owner of Lot '
      + '(not yet reviewed). Accept each one that is valid, or request a revision.';
    expect(toastDuration('error', reason)).toBeGreaterThanOrEqual(12_000);
  });

  it('never keeps one longer than 15s', () => {
    expect(toastDuration('info', 'word '.repeat(300))).toBe(15_000);
  });
});
