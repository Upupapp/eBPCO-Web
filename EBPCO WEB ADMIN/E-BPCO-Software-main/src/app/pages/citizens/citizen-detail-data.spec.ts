import { activityLabel, formatTimestamp, statusPillClass, verifiedLabel } from './citizen-detail-data';

describe('statusPillClass', () => {
  it('maps the API\'s "active"/"disabled" onto the pill\'s own "active"/"inactive" vocabulary', () => {
    expect(statusPillClass('active')).toBe('active');
    expect(statusPillClass('disabled')).toBe('inactive');
  });
});

describe('activityLabel', () => {
  it('reads a known action as a sentence an officer can scan', () => {
    expect(activityLabel({ action: 'citizen.disabled' })).toBe('Account disabled');
    expect(activityLabel({ action: 'account.erased' })).toBe('Account erased');
  });

  it('falls back to the raw action name for one this map has not caught up with', () => {
    expect(activityLabel({ action: 'some.future.action' })).toBe('some.future.action');
  });
});

describe('formatTimestamp', () => {
  it('formats a real ISO timestamp', () => {
    const formatted = formatTimestamp('2026-09-20T04:12:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/Sep/);
  });

  it('returns the raw string rather than "Invalid Date" for something unparsable', () => {
    expect(formatTimestamp('not-a-date')).toBe('not-a-date');
  });
});

describe('verifiedLabel', () => {
  it('states verification as an explicit fact either way', () => {
    expect(verifiedLabel(true)).toBe('Verified');
    expect(verifiedLabel(false)).toBe('Not verified');
  });
});
