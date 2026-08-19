import { Injectable, computed, signal } from '@angular/core';
import {
  DEFAULT_FEE_CONFIGS,
  DEFAULT_PAYMENT_METHODS,
  FeeConfig,
  PaymentMethodConfig,
  feeScheduleCentavos,
} from './payment-config.model';

/**
 * Super Admin Settings' payment configuration — the single place fee
 * amounts and supported payment methods live, read by Payments, the
 * intake form's assessment preview, receipts, and reports instead of each
 * one hardcoding its own copy. Existing PaymentTransaction rows are never
 * recomputed from a settings change (they already store their own
 * `amountCentavos` snapshot from when they were recorded), so editing a
 * fee here only affects assessments made afterward — historical payment
 * records are preserved as-is.
 */
@Injectable({ providedIn: 'root' })
export class PaymentConfigStore {
  private readonly _fees = signal<FeeConfig[]>(DEFAULT_FEE_CONFIGS);
  private readonly _methods = signal<PaymentMethodConfig[]>(DEFAULT_PAYMENT_METHODS);

  readonly fees = this._fees.asReadonly();
  readonly methods = this._methods.asReadonly();

  readonly activeFees = computed(() => this._fees().filter((f) => f.active));
  readonly activeMethods = computed(() => this._methods().filter((m) => m.active));

  readonly feeSchedule = computed(() => feeScheduleCentavos(this._fees()));

  updateFee(id: FeeConfig['id'], patch: Partial<Omit<FeeConfig, 'id'>>): void {
    this._fees.update((rows) => rows.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  setFeeActive(id: FeeConfig['id'], active: boolean): void {
    this.updateFee(id, { active });
  }

  updateMethod(id: string, patch: Partial<Omit<PaymentMethodConfig, 'id'>>): void {
    this._methods.update((rows) => rows.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  setMethodActive(id: string, active: boolean): void {
    this.updateMethod(id, { active });
  }
}
