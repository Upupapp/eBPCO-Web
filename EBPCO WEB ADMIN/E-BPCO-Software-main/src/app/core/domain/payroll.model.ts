// A real staff/collecting-officer payroll roster for the Payments >
// Configuration > Payroll sub-tab. There is no staff roster anywhere else
// in this app to build on — Users & Roles (pages/user-roles) is entirely
// self-contained mock data (24 hardcoded names, deterministically
// assigned roles), not a real store, so this domain deliberately does NOT
// borrow from it (that would attach real-looking salary figures to
// fictitious mock people). This starts as an empty roster — an admin adds
// each real staff member themselves — rather than fabricating names or
// pay amounts.
//
// Scope note: this is a payroll ROSTER (who's on payroll, their position,
// their monthly salary) — not a payslip/deductions engine (SSS/PhilHealth/
// Pag-IBIG/withholding-tax computation is a separate, much larger payroll-
// software problem than "where the admin can see the office's payment
// details," which is what this sub-tab was actually asked to cover).
export interface PayrollStaffMember {
  id: string;
  name: string;
  position: string;
  /** Null until an admin sets a real figure — never a placeholder amount. */
  monthlySalaryCentavos: number | null;
  /** ISO date string (yyyy-MM-dd), or null if not recorded. */
  dateHired: string | null;
  status: 'Active' | 'Inactive';
  lastUpdated: string | null;
  lastUpdatedBy: string | null;
}
