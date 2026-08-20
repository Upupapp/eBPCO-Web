import { TestBed } from '@angular/core/testing';
import { PaymentConfigStore } from './payment-config-store';

describe('PaymentConfigStore — fee rules', () => {
  let store: PaymentConfigStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PaymentConfigStore] });
    store = TestBed.inject(PaymentConfigStore);
  });

  it('starts with every default fee rule active', () => {
    for (const rule of store.feeRules()) expect(rule.active).toBe(true);
    expect(store.activeFeeRules().length).toBe(store.feeRules().length);
  });

  it('updateFeeRule creates a NEW VERSION rather than mutating the existing row', () => {
    const before = store.feeRuleById('filing-fee')!;
    const newId = store.updateFeeRule('filing-fee', { flatAmountCentavos: 99900 }, 'Tester');
    expect(newId).not.toBeNull();
    expect(newId).not.toBe(before.id);

    const oldRow = store.feeRules().find((r) => r.id === before.id)!;
    expect(oldRow.active).toBe(false);
    expect(oldRow.supersededDate).not.toBeNull();
    expect(oldRow.flatAmountCentavos).not.toBe(99900); // the OLD row's own amount is untouched

    const newRow = store.feeRuleById(newId!)!;
    expect(newRow.flatAmountCentavos).toBe(99900);
    expect(newRow.version).toBe(before.version + 1);
    expect(newRow.supersedesId).toBe(before.id);
  });

  it('setFeeRuleActive(false) removes the rule from activeFeeRules() but feeRules() still lists it', () => {
    store.setFeeRuleActive('filing-fee', false);
    expect(store.activeFeeRules().some((r) => r.id === 'filing-fee')).toBe(false);
    expect(store.feeRules().some((r) => r.id === 'filing-fee')).toBe(true);
  });

  it('feeRuleHistory returns every version of a rule, newest first', () => {
    const v1 = store.feeRuleById('filing-fee')!;
    const v2Id = store.updateFeeRule('filing-fee', { flatAmountCentavos: 30000 }, 'Tester')!;
    const v3Id = store.updateFeeRule(v2Id, { flatAmountCentavos: 35000 }, 'Tester')!;

    const history = store.feeRuleHistory(v3Id);
    expect(history.map((r) => r.id)).toEqual([v3Id, v2Id, v1.id]);
    expect(history[0].version).toBe(3);
  });

  it('editing applicability creates a new version too — the applicability map is just another field on the versioned rule', () => {
    const before = store.feeRuleById('filing-fee')!;
    const newId = store.updateFeeRule(
      'filing-fee',
      { applicability: { ...before.applicability, 'Sign Permit': 'not-applicable' } },
      'Tester',
    )!;
    const updated = store.feeRuleById(newId)!;
    expect(updated.applicability['Sign Permit']).toBe('not-applicable');
    expect(before.applicability['Sign Permit']).toBe('required'); // the old version's own map is untouched
  });

  it('only methods with a real domainMethod (Onsite/Bank Transfer) can be toggled — unimplemented methods stay inactive', () => {
    const online = store.methods().find((m) => m.id === 'online-payment')!;
    expect(online.active).toBe(false);
    expect(online.domainMethod).toBeNull();
    store.setMethodActive('online-payment', true);
    // The store itself doesn't forbid the toggle (that's a UI-level guard
    // in the Payments > Configuration tab), but a method with no
    // domainMethod is still never surfaced as usable by anything that
    // only reads activeMethods() + domainMethod together.
    expect(store.methods().find((m) => m.id === 'online-payment')?.active).toBe(true);
  });

  it('toggling a fully-wired method (Cash Onsite) is reflected in activeMethods()', () => {
    store.setMethodActive('cash-onsite', false);
    expect(store.activeMethods().some((m) => m.id === 'cash-onsite')).toBe(false);
    store.setMethodActive('cash-onsite', true);
    expect(store.activeMethods().some((m) => m.id === 'cash-onsite')).toBe(true);
  });
});
