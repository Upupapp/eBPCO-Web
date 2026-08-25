import { Injectable, computed, signal } from '@angular/core';
import { PayrollStaffMember } from './payroll.model';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * The office's own staff payroll roster — Payments > Configuration >
 * Payroll is the single place this is edited. Starts empty; nothing here
 * is seeded/fabricated, matching PaymentConfigStore's OfficeBankInfo
 * pattern (blank until a real admin fills it in).
 */
@Injectable({ providedIn: 'root' })
export class PayrollStore {
  private readonly _staff = signal<PayrollStaffMember[]>([]);
  private nextSeq = 1;

  readonly staff = this._staff.asReadonly();
  readonly activeStaff = computed(() => this._staff().filter((s) => s.status === 'Active'));

  addStaff(
    input: { name: string; position: string; monthlySalaryCentavos: number | null; dateHired: string | null },
    actor: string,
  ): string {
    const id = `STAFF-${String(this.nextSeq++).padStart(3, '0')}`;
    const today = formatDate(new Date());
    this._staff.update((rows) => [
      ...rows,
      { ...input, id, status: 'Active', lastUpdated: today, lastUpdatedBy: actor },
    ]);
    return id;
  }

  updateStaff(
    id: string,
    patch: Partial<Omit<PayrollStaffMember, 'id' | 'lastUpdated' | 'lastUpdatedBy'>>,
    actor: string,
  ): void {
    const today = formatDate(new Date());
    this._staff.update((rows) =>
      rows.map((s) =>
        s.id === id ? { ...s, ...patch, lastUpdated: today, lastUpdatedBy: actor } : s,
      ),
    );
  }

  setStaffStatus(id: string, status: PayrollStaffMember['status'], actor: string): void {
    this.updateStaff(id, { status }, actor);
  }
}
