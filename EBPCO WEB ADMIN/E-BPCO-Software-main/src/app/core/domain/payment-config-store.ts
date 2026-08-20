import { Injectable, computed, signal } from '@angular/core';
import { DEFAULT_PAYMENT_METHODS, PaymentMethodConfig } from './payment-config.model';
import { FEE_RULES, FeeRule, feeMatrixFor, feeRulesForPermitType } from './fee-rule.model';
import { PermitType } from './permit.model';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Super Admin Configuration — the single place fee rules and payment
 * methods live, read by Assessments, the Permit Fee Matrix, the payment
 * recording form, and Reports instead of each one hardcoding its own
 * copy. Editing a fee rule's amount/applicability/calculation always
 * creates a NEW VERSION rather than mutating the existing row in place —
 * the old version is marked inactive/superseded and kept for the version
 * history the Configuration tab shows, and an already-issued Assessment's
 * line-item snapshot (captured at issue time — see assessment.model.ts)
 * never changes retroactively just because the catalog moved on.
 */
@Injectable({ providedIn: 'root' })
export class PaymentConfigStore {
  private readonly _feeRules = signal<FeeRule[]>(FEE_RULES);
  private readonly _methods = signal<PaymentMethodConfig[]>(DEFAULT_PAYMENT_METHODS);
  private nextRuleSeq = 1000;

  readonly feeRules = this._feeRules.asReadonly();
  readonly methods = this._methods.asReadonly();

  readonly activeFeeRules = computed(() => this._feeRules().filter((r) => r.active));
  readonly activeMethods = computed(() => this._methods().filter((m) => m.active));

  feeRuleById(id: string): FeeRule | undefined {
    return this._feeRules().find((r) => r.id === id && r.active);
  }

  /** Every version ever recorded for a given rule family (matched by the family's first id, e.g. 'filing-fee') — newest first. */
  feeRuleHistory(baseId: string): FeeRule[] {
    const chainRootId = this.rootIdFor(baseId);
    return this._feeRules()
      .filter((r) => this.rootIdFor(r.id) === chainRootId)
      .sort((a, b) => b.version - a.version);
  }

  private rootIdFor(id: string): string {
    let current = this._feeRules().find((r) => r.id === id);
    const seen = new Set<string>();
    while (current?.supersedesId && !seen.has(current.id)) {
      seen.add(current.id);
      const prev = this._feeRules().find((r) => r.id === current!.supersedesId);
      if (!prev) break;
      current = prev;
    }
    return current?.id ?? id;
  }

  feeRulesForPermitType(permitType: PermitType) {
    return feeRulesForPermitType(permitType, this._feeRules());
  }

  feeMatrixFor(permitType: PermitType) {
    return feeMatrixFor(permitType, this._feeRules());
  }

  /**
   * Creates a new version of `id` with `patch` applied, marks the
   * existing row inactive/superseded, and returns the new row's id.
   * Applicability edits ("settings cannot edit permit applicability
   * despite claiming that they can") go through this same path as amount
   * edits — both are just fields on the same versioned FeeRule.
   */
  updateFeeRule(
    id: string,
    patch: Partial<Omit<FeeRule, 'id' | 'version' | 'supersedesId' | 'active'>>,
    actor: string,
  ): string | null {
    const current = this._feeRules().find((r) => r.id === id && r.active);
    if (!current) return null;
    const today = formatDate(new Date());
    const newId = `${this.rootIdFor(id)}-v${current.version + 1}-${this.nextRuleSeq++}`;
    const next: FeeRule = {
      ...current,
      ...patch,
      id: newId,
      version: current.version + 1,
      supersedesId: current.id,
      active: true,
      effectiveDate: patch.effectiveDate ?? today,
      supersededDate: null,
    };
    this._feeRules.update((rows) => [
      ...rows.map((r) =>
        r.id === current.id ? { ...r, active: false, supersededDate: today } : r,
      ),
      next,
    ]);
    return newId;
  }

  setFeeRuleActive(id: string, active: boolean): void {
    this._feeRules.update((rows) => rows.map((r) => (r.id === id ? { ...r, active } : r)));
  }

  updateMethod(id: string, patch: Partial<Omit<PaymentMethodConfig, 'id'>>): void {
    this._methods.update((rows) => rows.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  setMethodActive(id: string, active: boolean): void {
    this.updateMethod(id, { active });
  }
}
