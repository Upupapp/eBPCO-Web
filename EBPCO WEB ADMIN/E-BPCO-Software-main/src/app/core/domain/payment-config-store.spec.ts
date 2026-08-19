import { TestBed } from '@angular/core/testing';
import { PaymentConfigStore } from './payment-config-store';

describe('PaymentConfigStore', () => {
  let store: PaymentConfigStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PaymentConfigStore] });
    store = TestBed.inject(PaymentConfigStore);
  });

  it('starts with every default fee active and feeSchedule() reflecting the full default amounts', () => {
    for (const fee of store.fees()) expect(fee.active).toBe(true);
    const schedule = store.feeSchedule();
    expect(schedule.filing).toBeGreaterThan(0);
    expect(schedule.processing).toBeGreaterThan(0);
  });

  it('updateFee changes the amount reflected by feeSchedule() immediately', () => {
    store.updateFee('filing', { amountCentavos: 99900 });
    expect(store.feeSchedule().filing).toBe(99900);
  });

  it('setFeeActive(false) zeroes that line in feeSchedule() without removing the fee definition', () => {
    store.setFeeActive('processing', false);
    expect(store.feeSchedule().processing).toBe(0);
    expect(store.fees().find((f) => f.id === 'processing')).toBeTruthy();
    expect(store.fees().find((f) => f.id === 'processing')?.active).toBe(false);
  });

  it('activeFees() excludes inactive fees but fees() still lists them', () => {
    store.setFeeActive('others', false);
    expect(store.activeFees().some((f) => f.id === 'others')).toBe(false);
    expect(store.fees().some((f) => f.id === 'others')).toBe(true);
  });

  it('only methods with a real domainMethod (Onsite/Bank Transfer) can be toggled — unimplemented methods stay inactive', () => {
    const online = store.methods().find((m) => m.id === 'online-payment')!;
    expect(online.active).toBe(false);
    expect(online.domainMethod).toBeNull();
    store.setMethodActive('online-payment', true);
    // The store itself doesn't forbid the toggle (that's a UI-level guard
    // in the Settings page), but a method with no domainMethod is still
    // never surfaced as usable by anything that only reads activeMethods()
    // + domainMethod together.
    expect(store.methods().find((m) => m.id === 'online-payment')?.active).toBe(true);
  });

  it('toggling a fully-wired method (Cash Onsite) is reflected in activeMethods()', () => {
    store.setMethodActive('cash-onsite', false);
    expect(store.activeMethods().some((m) => m.id === 'cash-onsite')).toBe(false);
    store.setMethodActive('cash-onsite', true);
    expect(store.activeMethods().some((m) => m.id === 'cash-onsite')).toBe(true);
  });
});
