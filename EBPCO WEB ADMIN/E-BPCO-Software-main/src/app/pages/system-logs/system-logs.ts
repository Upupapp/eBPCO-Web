import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Topbar } from '../../shared/topbar/topbar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Icon } from '../../shared/icon/icon';
import { Pagination } from '../../shared/pagination/pagination';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { AuditEvent } from '../../core/domain/audit.model';
import { AuditApi, AuditEntry } from '../../core/api/audit.api';
import { ToastService } from '../../shared/toast/toast.service';

type LogTabKey = 'activity' | 'access' | 'error' | 'security' | 'events';

interface LogStat {
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  label: string;
  value: string;
  footnote?: string;
}

interface BaseRow {
  city: string;
  name: string;
  phone: string;
  date: string;
  ip: string;
  status: 'Active' | 'Inactive';
}

// Tenants here are business owner / applicant accounts from the mobile app
// (E-BPCO Mobile), each located in one of LGU Castilla's barangays — not
// government units. This log's "tenant" column is the affected tenant
// account, distinct from "name" (the staff member who performed the action).
const TENANTS = [
  'Villanueva Hardware & Construction Supply',
  'Simbulan Sari-Sari Store',
  'Rodrigo Bakeshop',
  'Zaballero Auto Repair Shop',
  'Martirez Rice Mill',
  'Nuñez Feeds & Agri Supply',
  'Villareal Eatery',
  'Barrera Internet Café',
  'Morales General Merchandise',
  'Bermudez Furniture Shop',
  'Salazar Water Refilling Station',
  'Fajota Trading Corp.',
];

const NAMES = [
  'Daniel Bermas',
  'Maria Santos',
  'Jose Bragais',
  'Ana Rosales',
  'Mark Olivar',
  'Grace Fajota',
  'Paolo Escueta',
  'Liza Buenaflor',
  'Ramon Estioco',
  'Carmen Salvador',
  'Victor Ariola',
  'Rosa Mendoza',
];

const MODULES = ['Applications', 'User Management', 'Billing', 'Workflow', 'Reports', 'Tenants'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildBaseRows(count: number): BaseRow[] {
  return Array.from({ length: count }, (_, i) => {
    return {
      city: TENANTS[i % TENANTS.length],
      name: NAMES[i % NAMES.length],
      phone: `63 9${(10 + (i % 89)).toString().padStart(2, '0')} ${(100 + i * 7).toString().padStart(3, '0')} ${(1000 + i * 37).toString().padStart(4, '0')}`,
      date: `${(i % 27) + 1} ${MONTHS[i % 12]} 2026`,
      ip: `192.168.${(i % 9) + 1}.${10 + i}`,
      status: i % 5 === 4 ? 'Inactive' : ('Active' as 'Active' | 'Inactive'),
    };
  });
}

function timestampFor(i: number, base: BaseRow): string {
  const hour24 = 8 + (i % 10);
  const minute = (i * 7) % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${base.date} ${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

function severityFor(i: number): 'Critical' | 'Warning' | 'Info' {
  return i % 3 === 0 ? 'Critical' : i % 3 === 1 ? 'Warning' : 'Info';
}

const ROW_COUNT = 24;
const BASE_ROWS = buildBaseRows(ROW_COUNT);

const ACCESS_EVENTS = ['Login Success', 'Login Failed', 'Password Reset', 'Session Expired'];
const DEVICES = ['Chrome / Windows', 'Safari / macOS', 'Edge / Windows', 'Chrome / Android'];

const ERROR_TYPES = [
  'NullReferenceException',
  'TimeoutError',
  'ValidationError',
  'DatabaseConnectionError',
  'UnauthorizedAccess',
];
const ERROR_MESSAGES = [
  'Unexpected null value encountered while processing request.',
  'Upstream service did not respond in time.',
  'Submitted form data failed schema validation.',
  'Could not establish a connection to the tenant database.',
  'Request blocked due to insufficient permissions.',
];

// Travels in every exported sample row, as its first column. The screen says
// this data is not real; a file has to say so too, on its own.
const SAMPLE_MARKER = 'SAMPLE - not real activity';

const SECURITY_EVENTS = [
  'Failed Login Attempt',
  'Password Changed',
  'Suspicious IP Blocked',
  '2FA Enabled',
  'Account Locked',
];

const SYSTEM_EVENTS = [
  'Config Updated',
  'Scheduled Backup',
  'Deployment',
  'Integration Sync',
  'Cache Cleared',
];

export interface ActivityRow {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  user: string;
  tenant: string;
  module: string;
  ip: string;
  status: 'Active' | 'Inactive';
  severity: 'Critical' | 'Warning' | 'Info';
}

export interface AccessRow {
  timestamp: string;
  user: string;
  tenant: string;
  event: string;
  status: 'Active' | 'Inactive';
  ip: string;
  device: string;
  location: string;
  sessionDuration: string;
}

export interface ErrorRow {
  timestamp: string;
  errorType: string;
  message: string;
  module: string;
  tenant: string;
  environment: string;
  status: 'Active' | 'Inactive';
  severity: 'Critical' | 'Warning' | 'Info';
  requestId: string;
}

export interface SecurityRow {
  timestamp: string;
  eventType: string;
  user: string;
  tenant: string;
  message: string;
  ip: string;
  environment: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Active' | 'Inactive';
}

export interface LogDetailField {
  label: string;
  value: string;
}

export interface LogDetail {
  logId: string;
  category: string;
  title: string;
  timestamp: string;
  status: 'Active' | 'Inactive';
  severity?: 'Critical' | 'Warning' | 'Info';
  tenant?: string;
  fields: LogDetailField[];
}

export interface RelatedLogEvent {
  title: string;
  timestamp: string;
  status: 'Active' | 'Inactive';
  tab: LogTabKey;
  row: ActivityRow | AccessRow | ErrorRow | SecurityRow | SystemEventRow;
}

// Every detail-field builder below ends with one outcome-shaped field —
// labeled differently per log type (Result / Authentication Outcome /
// Resolution State / System Response / Outcome) since each tab's domain
// vocabulary differs, but all five report the same underlying idea: did
// this event resolve well or not. Matched by label + known value here
// (rather than always trusting the last array entry) so the detail view
// can give it a semantic icon without the field builders needing to agree
// on one shared label.
const OUTCOME_FIELD_LABELS = new Set([
  'Result',
  'Authentication Outcome',
  'Resolution State',
  'System Response',
  'Outcome',
]);
const POSITIVE_OUTCOME_VALUES = new Set([
  'Success',
  'Successful',
  'Resolved',
  'Completed',
  'Logged for Review',
]);
const NEGATIVE_OUTCOME_VALUES = new Set(['Failed', 'Unresolved', 'Blocked & Flagged']);

// Stable, deterministic-enough ID for display/copy — this app has no
// backend to issue real sequential log IDs, so one is derived from the
// entry's own timestamp + title instead of a random value that would
// change on every reload.
function buildLogId(prefix: string, timestamp: string, title: string): string {
  let hash = 0;
  const input = timestamp + title;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return `${prefix}-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8)}`;
}

// Maps a real AuditEvent's free-text `action` (written across
// ApplicationStore/AssessmentStore — see appAudit()/audit()) to a short
// event-type label, a module, and a severity for the Activity Logs tab.
// Matched by substring against the small, known set of action strings this
// app actually writes, rather than requiring every writer to also carry a
// separate structured "type" field.
const ACTIVITY_EVENT_RULES: {
  test: (action: string) => boolean;
  eventType: string;
  module: string;
  severity: (action: string) => 'Critical' | 'Warning' | 'Info';
}[] = [
  {
    test: (a) => a.includes('Status changed to Rejected'),
    eventType: 'Application Rejected',
    module: 'Applications',
    severity: () => 'Critical',
  },
  {
    test: (a) => a.includes('Status changed to Revision Required'),
    eventType: 'Revision Requested',
    module: 'Applications',
    severity: () => 'Warning',
  },
  {
    test: (a) => a.includes('cancelled/archived'),
    eventType: 'Application Cancelled',
    module: 'Applications',
    severity: () => 'Warning',
  },
  {
    test: (a) => a.startsWith('Status changed to'),
    eventType: 'Status Changed',
    module: 'Applications',
    severity: () => 'Info',
  },
  {
    test: (a) => a.includes('filed (assisted'),
    eventType: 'Application Filed',
    module: 'Applications',
    severity: () => 'Info',
  },
  {
    test: (a) => a.startsWith('Note added'),
    eventType: 'Note Added',
    module: 'Applications',
    severity: () => 'Info',
  },
  {
    test: (a) => a.startsWith('Document attached'),
    eventType: 'Document Uploaded',
    module: 'Applications',
    severity: () => 'Info',
  },
  {
    test: (a) => a.includes('resubmitted'),
    eventType: 'Document Resubmitted',
    module: 'Applications',
    severity: () => 'Info',
  },
  {
    test: (a) => a.includes('released to'),
    eventType: 'Permit Released',
    module: 'Workflow',
    severity: () => 'Info',
  },
  {
    test: (a) => a.includes('generated'),
    eventType: 'Permit Generated',
    module: 'Workflow',
    severity: () => 'Info',
  },
  {
    test: (a) => a.startsWith('Assessment') || a.startsWith('Transaction'),
    eventType: 'Billing Update',
    module: 'Billing',
    severity: () => 'Info',
  },
  {
    test: (a) => a.includes('marked Verified') || a.includes('marked Failed'),
    eventType: 'Verification Updated',
    module: 'User Management',
    severity: (a) => (a.includes('marked Failed') ? 'Warning' : 'Info'),
  },
];

function classifyAuditEvent(action: string): {
  eventType: string;
  module: string;
  severity: 'Critical' | 'Warning' | 'Info';
} {
  const rule = ACTIVITY_EVENT_RULES.find((r) => r.test(action));
  return rule
    ? { eventType: rule.eventType, module: rule.module, severity: rule.severity(action) }
    : { eventType: 'System Action', module: 'Applications', severity: 'Info' };
}

export interface SystemEventRow {
  timestamp: string;
  eventType: string;
  event: string;
  module: string;
  tenant: string;
  environment: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-system-logs',
  imports: [Topbar, KpiCard, Icon, Pagination, FormsModule],
  templateUrl: './system-logs.html',
  styleUrl: './system-logs.scss',
})
export class SystemLogs {
  // ---- A-20 · Access decisions, from the server's own audit stream --------

  /**
   * The `security` stream, read for real.
   *
   * This is where access decisions land: a request approved or rejected, a
   * level changed, forms changed, an account disabled or enabled — alongside
   * refused sign-ins and MFA failures. An access-control system nobody can
   * review is one nobody can trust, and until now this tab was invented.
   *
   * The fabricated rows remain ONLY when the server cannot be reached, and the
   * page says which it is showing. Silently mixing real and invented rows under
   * one honest-looking heading would be worse than either alone.
   */
  private readonly audit = inject(AuditApi);
  protected readonly securityEntries = signal<readonly AuditEntry[]>([]);
  protected readonly securityLive = signal(false);
  protected readonly securityLoading = signal(false);
  protected readonly securityError = signal<string | null>(null);

  protected async loadSecurityStream(): Promise<void> {
    this.securityLoading.set(true);
    this.securityError.set(null);
    try {
      const result = await this.audit.stream('security');
      if (result.kind === 'ok') {
        this.securityEntries.set(result.entries);
        this.securityLive.set(true);
        return;
      }
      this.securityEntries.set([]);
      this.securityLive.set(false);
      if (result.kind === 'failed') this.securityError.set(result.message);
    } finally {
      this.securityLoading.set(false);
    }
  }

  private readonly store = inject(ApplicationStore);
  private readonly assessmentStore = inject(AssessmentStore);
  private readonly toast = inject(ToastService);

  protected readonly tabs: { key: LogTabKey; label: string; icon: string }[] = [
    { key: 'activity', label: 'Activity logs', icon: 'logs' },
    { key: 'access', label: 'Access logs', icon: 'key' },
    { key: 'error', label: 'Error logs', icon: 'alert-circle' },
    { key: 'security', label: 'Security Activity', icon: 'shield' },
    { key: 'events', label: 'System Events', icon: 'gear' },
  ];

  protected readonly activeTab = signal<LogTabKey>('activity');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly dateRange = '5, 2026 - May 6, 2026';

  // Every tile here is derived from the same row arrays the tables below
  // render — "Total Logs (Today)" always equals the real row count for
  // that tab instead of an unrelated hardcoded figure like the previous
  // "20,203" (which stayed fixed even though only 24 rows exist per tab).
  // The old "vs yesterday" trend chips are dropped rather than kept
  // alongside much smaller real totals, since there's no real prior-day
  // dataset to compare against.
  private readonly statsByTab = computed<Record<LogTabKey, LogStat[]>>(() => {
    const activity = this.activityRows();
    const access = this.accessRows();
    const error = this.errorRows();
    const security = this.securityRows();
    const events = this.eventRows();

    const distinctIps = (rows: { ip: string }[]) => new Set(rows.map((r) => r.ip)).size;
    const distinctTenants = (rows: { tenant: string }[]) => new Set(rows.map((r) => r.tenant)).size;

    const pct = (count: number, total: number) =>
      `${total ? Math.round((count / total) * 100) : 0}% of today's logs`;

    return {
      activity: [
        {
          icon: 'logs',
          tone: 'info',
          illustration: 'logs',
          label: 'Total Logs (Today)',
          value: String(activity.length),
          footnote: 'All activity logged today',
        },
        {
          icon: 'alert-circle',
          tone: 'danger',
          illustration: 'critical',
          label: 'Errors (Critical)',
          value: String(activity.filter((r) => r.severity === 'Critical').length),
          footnote: pct(activity.filter((r) => r.severity === 'Critical').length, activity.length),
        },
        {
          icon: 'alert-triangle',
          tone: 'warning',
          illustration: 'warning',
          label: 'Warnings (Today)',
          value: String(activity.filter((r) => r.severity === 'Warning').length),
          footnote: pct(activity.filter((r) => r.severity === 'Warning').length, activity.length),
        },
        {
          icon: 'check-circle',
          tone: 'success',
          illustration: 'success',
          label: 'Successful Actions',
          value: String(activity.filter((r) => r.status === 'Active').length),
          footnote: pct(activity.filter((r) => r.status === 'Active').length, activity.length),
        },
        {
          icon: 'user',
          tone: 'neutral',
          illustration: 'users',
          label: 'Active Sessions',
          value: String(access.filter((r) => r.status === 'Active').length),
          footnote: 'Across All Tenants',
        },
      ],
      access: [
        {
          icon: 'logs',
          tone: 'info',
          illustration: 'logs',
          label: 'Total Logs (Today)',
          value: String(access.length),
          footnote: 'All access events today',
        },
        {
          icon: 'check-circle',
          tone: 'success',
          illustration: 'success',
          label: 'Successful Logins',
          value: String(access.filter((r) => r.event === 'Login Success').length),
          footnote: pct(access.filter((r) => r.event === 'Login Success').length, access.length),
        },
        {
          icon: 'alert-triangle',
          tone: 'warning',
          illustration: 'warning',
          label: 'Failed Logins',
          value: String(access.filter((r) => r.event === 'Login Failed').length),
          footnote: pct(access.filter((r) => r.event === 'Login Failed').length, access.length),
        },
        {
          icon: 'shield',
          tone: 'danger',
          illustration: 'critical',
          label: 'Blocked IPs',
          value: String(distinctIps(access.filter((r) => r.status === 'Inactive'))),
          footnote: 'Distinct IPs, inactive sessions',
        },
        {
          icon: 'user',
          tone: 'neutral',
          illustration: 'users',
          label: 'Active Sessions',
          value: String(access.filter((r) => r.status === 'Active').length),
          footnote: 'Across All Tenants',
        },
      ],
      error: [
        {
          icon: 'alert-circle',
          tone: 'info',
          illustration: 'logs',
          label: 'Total Errors (Today)',
          value: String(error.length),
          footnote: 'All errors logged today',
        },
        {
          icon: 'alert-circle',
          tone: 'danger',
          illustration: 'critical',
          label: 'Critical Errors',
          value: String(error.filter((r) => r.severity === 'Critical').length),
          footnote: pct(error.filter((r) => r.severity === 'Critical').length, error.length),
        },
        {
          icon: 'alert-triangle',
          tone: 'warning',
          illustration: 'warning',
          label: 'Unhandled Errors',
          value: String(error.filter((r) => r.status === 'Inactive').length),
          footnote: pct(error.filter((r) => r.status === 'Inactive').length, error.length),
        },
        {
          icon: 'building',
          tone: 'neutral',
          illustration: 'businesses',
          label: 'Affected Tenants',
          value: String(distinctTenants(error)),
          footnote: 'Distinct businesses affected',
        },
        {
          icon: 'check-circle',
          tone: 'success',
          illustration: 'success',
          label: 'Resolved (today)',
          value: String(error.filter((r) => r.status === 'Active').length),
          footnote: pct(error.filter((r) => r.status === 'Active').length, error.length),
        },
      ],
      security: [
        {
          icon: 'shield',
          tone: 'info',
          illustration: 'logs',
          label: 'Security Events (Today)',
          value: String(security.length),
          footnote: 'All security events today',
        },
        {
          icon: 'lock',
          tone: 'danger',
          illustration: 'critical',
          label: 'Failed Login Attempts',
          value: String(security.filter((r) => r.eventType === 'Failed Login Attempt').length),
          footnote: pct(
            security.filter((r) => r.eventType === 'Failed Login Attempt').length,
            security.length,
          ),
        },
        {
          icon: 'alert-triangle',
          tone: 'warning',
          illustration: 'warning',
          label: 'Suspicious Activities',
          value: String(security.filter((r) => r.eventType === 'Suspicious IP Blocked').length),
          footnote: pct(
            security.filter((r) => r.eventType === 'Suspicious IP Blocked').length,
            security.length,
          ),
        },
        {
          icon: 'user',
          tone: 'neutral',
          illustration: 'roles',
          label: 'Blocked IP Addresses',
          value: String(
            distinctIps(security.filter((r) => r.eventType === 'Suspicious IP Blocked')),
          ),
          footnote: 'Distinct IPs blocked',
        },
        {
          icon: 'key',
          tone: 'success',
          illustration: 'success',
          label: 'Password Changes',
          value: String(security.filter((r) => r.eventType === 'Password Changed').length),
          footnote: pct(
            security.filter((r) => r.eventType === 'Password Changed').length,
            security.length,
          ),
        },
      ],
      events: [
        {
          icon: 'gear',
          tone: 'info',
          illustration: 'logs',
          label: 'System Events (Today)',
          value: String(events.length),
          footnote: 'All system events today',
        },
        {
          icon: 'edit',
          tone: 'danger',
          illustration: 'critical',
          label: 'Configuration Changes',
          value: String(events.filter((r) => r.eventType === 'Config Updated').length),
          footnote: pct(
            events.filter((r) => r.eventType === 'Config Updated').length,
            events.length,
          ),
        },
        {
          icon: 'calendar',
          tone: 'warning',
          illustration: 'pending',
          label: 'Scheduled Tasks',
          value: String(events.filter((r) => r.eventType === 'Scheduled Backup').length),
          footnote: pct(
            events.filter((r) => r.eventType === 'Scheduled Backup').length,
            events.length,
          ),
        },
        {
          icon: 'cloud',
          tone: 'neutral',
          illustration: 'totals',
          label: 'Deployments',
          value: String(events.filter((r) => r.eventType === 'Deployment').length),
          footnote: pct(events.filter((r) => r.eventType === 'Deployment').length, events.length),
        },
        {
          icon: 'plug',
          tone: 'success',
          illustration: 'totals',
          label: 'Integrations',
          value: String(events.filter((r) => r.eventType === 'Integration Sync').length),
          footnote: pct(
            events.filter((r) => r.eventType === 'Integration Sync').length,
            events.length,
          ),
        },
      ],
    };
  });

  // The real, append-only audit trail (ApplicationStore + AssessmentStore —
  // see audit.model.ts) merged and mapped to ActivityRow. Only genuinely
  // committed actions ever reach either store's auditEvents(), so `status`
  // is always 'Active' here; `ip` is an honest '—' placeholder since this
  // frontend-only prototype has no request/session tracking to source a
  // real IP from. This is the one System Logs tab backed by real data —
  // Access/Error/Security/Events below stay clearly-labeled sample data,
  // since nothing in this app tracks logins, exceptions, or security/
  // deployment events yet.
  protected readonly activityRows = computed<ActivityRow[]>(() => {
    const events: AuditEvent[] = [...this.store.auditEvents(), ...this.assessmentStore.auditEvents()];
    return events
      .slice()
      .sort((a, b) => b.timestampValue.getTime() - a.timestampValue.getTime())
      .map((e) => {
        const { eventType, module, severity } = classifyAuditEvent(e.action);
        const context = e.applicationId ? this.store.getApplicationContext(e.applicationId) : undefined;
        return {
          id: e.id,
          timestamp: e.timestamp,
          eventType,
          description: e.remarks ? `${e.action} — ${e.remarks}` : e.action,
          user: e.actor,
          tenant: context?.businessLabel ?? 'System',
          module,
          ip: '—',
          status: 'Active',
          severity,
        };
      });
  });

  private readonly accessRows = signal<AccessRow[]>(
    BASE_ROWS.map((r, i) => ({
      timestamp: timestampFor(i, r),
      user: r.name,
      tenant: r.city,
      event: ACCESS_EVENTS[i % ACCESS_EVENTS.length],
      status: r.status,
      ip: r.ip,
      device: DEVICES[i % DEVICES.length],
      location: r.city,
      sessionDuration: `${5 + (i % 50)}m`,
    })),
  );

  private readonly errorRows = signal<ErrorRow[]>(
    BASE_ROWS.map((r, i) => ({
      timestamp: timestampFor(i, r),
      errorType: ERROR_TYPES[i % ERROR_TYPES.length],
      message: ERROR_MESSAGES[i % ERROR_MESSAGES.length],
      module: MODULES[i % MODULES.length],
      tenant: r.city,
      environment: i % 2 === 0 ? 'Production' : 'Staging',
      status: r.status,
      severity: severityFor(i),
      requestId: `REQ-${10000 + i}`,
    })),
  );

  private readonly securityRows = signal<SecurityRow[]>(
    BASE_ROWS.map((r, i) => ({
      timestamp: timestampFor(i, r),
      eventType: SECURITY_EVENTS[i % SECURITY_EVENTS.length],
      user: r.name,
      tenant: r.city,
      message: `${SECURITY_EVENTS[i % SECURITY_EVENTS.length]} from ${r.ip}`,
      ip: r.ip,
      environment: i % 2 === 0 ? 'Production' : 'Staging',
      severity: severityFor(i),
      status: r.status,
    })),
  );

  private readonly eventRows = signal<SystemEventRow[]>(
    BASE_ROWS.map((r, i) => ({
      timestamp: timestampFor(i, r),
      eventType: SYSTEM_EVENTS[i % SYSTEM_EVENTS.length],
      event: `${SYSTEM_EVENTS[i % SYSTEM_EVENTS.length]} on ${MODULES[i % MODULES.length]}`,
      module: MODULES[i % MODULES.length],
      tenant: r.city,
      environment: i % 2 === 0 ? 'Production' : 'Staging',
      severity: severityFor(i),
      status: r.status,
    })),
  );

  // ---- Filters ----------------------------------------------------------

  protected readonly tenantOptions = TENANTS;
  protected readonly tenantFilter = signal<string>('All Tenants');
  protected readonly statusFilter = signal<'All Statuses' | 'Active' | 'Inactive'>('All Statuses');
  protected readonly severityFilter = signal<'All Severity' | 'Critical' | 'Warning' | 'Info'>(
    'All Severity',
  );
  protected readonly searchTerm = signal('');

  protected readonly activeFilterCount = computed(
    () =>
      (this.tenantFilter() === 'All Tenants' ? 0 : 1) +
      (this.statusFilter() === 'All Statuses' ? 0 : 1) +
      (this.severityFilter() === 'All Severity' ? 0 : 1),
  );

  protected clearFilters(): void {
    this.tenantFilter.set('All Tenants');
    this.statusFilter.set('All Statuses');
    this.severityFilter.set('All Severity');
    this.searchTerm.set('');
    this.page.set(1);
  }

  protected onSearchChange(): void {
    this.page.set(1);
  }

  private matchesFilters(row: { tenant: string; status: string; severity?: string }): boolean {
    if (this.tenantFilter() !== 'All Tenants' && row.tenant !== this.tenantFilter()) return false;
    if (this.statusFilter() !== 'All Statuses' && row.status !== this.statusFilter()) return false;
    if (
      this.severityFilter() !== 'All Severity' &&
      row.severity &&
      row.severity !== this.severityFilter()
    )
      return false;
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return true;
    return Object.values(row).some((v) => typeof v === 'string' && v.toLowerCase().includes(term));
  }

  protected readonly currentStats = computed(() => this.statsByTab()[this.activeTab()]);

  protected readonly filteredActivityRows = computed(() =>
    this.activityRows().filter((r) => this.matchesFilters(r)),
  );
  protected readonly filteredAccessRows = computed(() =>
    this.accessRows().filter((r) => this.matchesFilters(r)),
  );
  protected readonly filteredErrorRows = computed(() =>
    this.errorRows().filter((r) => this.matchesFilters(r)),
  );
  protected readonly filteredSecurityRows = computed(() =>
    this.securityRows().filter((r) => this.matchesFilters(r)),
  );
  protected readonly filteredEventRows = computed(() =>
    this.eventRows().filter((r) => this.matchesFilters(r)),
  );

  protected readonly totalItems = computed(() => {
    switch (this.activeTab()) {
      case 'activity':
        return this.filteredActivityRows().length;
      case 'access':
        return this.filteredAccessRows().length;
      case 'error':
        return this.filteredErrorRows().length;
      case 'security':
        return this.filteredSecurityRows().length;
      case 'events':
        return this.filteredEventRows().length;
    }
  });

  private slice<T>(rows: T[]): T[] {
    const start = (this.page() - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  protected readonly pagedActivityRows = computed(() => this.slice(this.filteredActivityRows()));
  protected readonly pagedAccessRows = computed(() => this.slice(this.filteredAccessRows()));
  protected readonly pagedErrorRows = computed(() => this.slice(this.filteredErrorRows()));
  protected readonly pagedSecurityRows = computed(() => this.slice(this.filteredSecurityRows()));
  protected readonly pagedEventRows = computed(() => this.slice(this.filteredEventRows()));

  protected readonly liveStream = signal(true);

  selectTab(tab: LogTabKey): void {
    this.activeTab.set(tab);
    this.page.set(1);
    // The security tab is the one with a real server stream behind it.
    if (tab === 'security') void this.loadSecurityStream();
  }

  toggleLiveStream(): void {
    this.liveStream.update((v) => !v);
  }

  protected readonly view = signal<'list' | 'detail'>('list');
  protected readonly selectedLog = signal<LogDetail | null>(null);

  openActivityDetail(row: ActivityRow): void {
    this.showDetail({
      logId: row.id,
      category: 'Activity Log',
      title: row.eventType,
      timestamp: row.timestamp,
      status: row.status,
      severity: row.severity,
      tenant: row.tenant,
      fields: [
        { label: 'Description', value: row.description },
        { label: 'User / Action', value: row.user },
        { label: 'Tenant', value: row.tenant },
        { label: 'Module', value: row.module },
        { label: 'IP Address', value: row.ip },
        { label: 'Result', value: row.status === 'Active' ? 'Success' : 'Failed' },
      ],
    });
  }

  openAccessDetail(row: AccessRow): void {
    this.showDetail({
      logId: buildLogId('ACC', row.timestamp, row.event),
      category: 'Access Log',
      title: row.event,
      timestamp: row.timestamp,
      status: row.status,
      tenant: row.tenant,
      fields: [
        { label: 'User', value: row.user },
        { label: 'Tenant', value: row.tenant },
        { label: 'IP Address', value: row.ip },
        { label: 'Device / Browser', value: row.device },
        { label: 'Location', value: row.location },
        { label: 'Session Duration', value: row.sessionDuration },
        {
          label: 'Authentication Outcome',
          value: row.status === 'Active' ? 'Successful' : 'Failed',
        },
      ],
    });
  }

  openErrorDetail(row: ErrorRow): void {
    this.showDetail({
      logId: buildLogId('ERR', row.timestamp, row.errorType),
      category: 'Error Log',
      title: row.errorType,
      timestamp: row.timestamp,
      status: row.status,
      severity: row.severity,
      tenant: row.tenant,
      fields: [
        { label: 'Message', value: row.message },
        { label: 'Module', value: row.module },
        { label: 'Tenant', value: row.tenant },
        { label: 'Environment', value: row.environment },
        { label: 'Request ID', value: row.requestId },
        { label: 'Resolution State', value: row.status === 'Active' ? 'Unresolved' : 'Resolved' },
      ],
    });
  }

  openSecurityDetail(row: SecurityRow): void {
    this.showDetail({
      logId: buildLogId('SEC', row.timestamp, row.eventType),
      category: 'Security Activity',
      title: row.eventType,
      timestamp: row.timestamp,
      status: row.status,
      severity: row.severity,
      tenant: row.tenant,
      fields: [
        { label: 'User', value: row.user },
        { label: 'Tenant', value: row.tenant },
        { label: 'Message', value: row.message },
        { label: 'IP Address', value: row.ip },
        { label: 'Environment', value: row.environment },
        {
          label: 'System Response',
          value: row.severity === 'Critical' ? 'Blocked & Flagged' : 'Logged for Review',
        },
      ],
    });
  }

  openEventDetail(row: SystemEventRow): void {
    this.showDetail({
      logId: buildLogId('SYS', row.timestamp, row.eventType),
      category: 'System Event',
      title: row.eventType,
      timestamp: row.timestamp,
      status: row.status,
      severity: row.severity,
      tenant: row.tenant,
      fields: [
        { label: 'Event', value: row.event },
        { label: 'Module', value: row.module },
        { label: 'Tenant', value: row.tenant },
        { label: 'Environment', value: row.environment },
        { label: 'Outcome', value: row.status === 'Active' ? 'Completed' : 'Failed' },
      ],
    });
  }

  private showDetail(detail: LogDetail): void {
    this.selectedLog.set(detail);
    this.view.set('detail');
  }

  backToList(): void {
    this.view.set('list');
    this.selectedLog.set(null);
  }

  // ---- Related events + detail actions ------------------------------------
  // Other entries from the same tab and tenant, for context around the
  // open record — a small "surrounding events" timeline rather than an
  // isolated row.

  protected readonly relatedLogEvents = computed<RelatedLogEvent[]>(() => {
    const log = this.selectedLog();
    if (!log?.tenant) return [];
    const tab = this.activeTab();
    const rowsForTab: { timestamp: string; tenant: string; status: 'Active' | 'Inactive' }[] =
      (() => {
        switch (tab) {
          case 'activity':
            return this.filteredActivityRows();
          case 'access':
            return this.filteredAccessRows();
          case 'error':
            return this.filteredErrorRows();
          case 'security':
            return this.filteredSecurityRows();
          case 'events':
            return this.filteredEventRows();
        }
      })();
    return rowsForTab
      .filter((r) => r.tenant === log.tenant && r.timestamp !== log.timestamp)
      .slice(0, 3)
      .map((r) => ({
        title: `${log.category} entry`,
        timestamp: r.timestamp,
        status: r.status,
        tab,
        row: r as RelatedLogEvent['row'],
      }));
  });

  // Related-event rows carry their own underlying record, so clicking one
  // opens that entry's own detail view instead of being purely decorative.
  protected openRelatedEvent(item: RelatedLogEvent): void {
    switch (item.tab) {
      case 'activity':
        this.openActivityDetail(item.row as ActivityRow);
        break;
      case 'access':
        this.openAccessDetail(item.row as AccessRow);
        break;
      case 'error':
        this.openErrorDetail(item.row as ErrorRow);
        break;
      case 'security':
        this.openSecurityDetail(item.row as SecurityRow);
        break;
      case 'events':
        this.openEventDetail(item.row as SystemEventRow);
        break;
    }
  }

  protected copyLogId(): void {
    const log = this.selectedLog();
    if (!log) return;
    if (!navigator.clipboard) {
      this.toast.error("Couldn't copy the log ID — clipboard access isn't available.");
      return;
    }
    navigator.clipboard.writeText(log.logId).then(
      () => this.toast.success('Log ID copied.'),
      () => this.toast.error("Couldn't copy the log ID."),
    );
  }

  protected exportLogDetail(): void {
    const log = this.selectedLog();
    if (!log) return;
    const row: Record<string, string> = {
      'Log ID': log.logId,
      Category: log.category,
      Title: log.title,
      Timestamp: log.timestamp,
      Status: log.status,
      Severity: log.severity ?? 'N/A',
    };
    for (const f of log.fields) row[f.label] = f.value;

    // Same reasoning as the bulk export: a single fabricated security entry
    // saved as `SEC-0003.csv` reads as a real incident record on its own.
    if (this.isSampleTab(this.activeTab())) {
      downloadCsv(`SAMPLE-${log.logId}`, [{ dataSource: SAMPLE_MARKER, ...row }]);
    } else {
      downloadCsv(`${log.logId}`, [row]);
    }
    this.toast.success(`Exported ${log.logId}.`);
  }

  // Purely presentational — never changes what's displayed, only whether
  // that field's existing visible text also gets a semantic icon/color.
  protected outcomeTone(field: LogDetailField): 'positive' | 'negative' | null {
    if (!OUTCOME_FIELD_LABELS.has(field.label)) return null;
    if (POSITIVE_OUTCOME_VALUES.has(field.value)) return 'positive';
    if (NEGATIVE_OUTCOME_VALUES.has(field.value)) return 'negative';
    return null;
  }

  // ---- Delete -------------------------------------------------------------
  // Deleting a sample-data row is fine — it's synthetic. Activity Logs is
  // the exception: it now reads the real, append-only audit trail (see
  // audit.model.ts — "nothing in the store ever removes or edits one once
  // written"), so it has no delete action in the template and this never
  // runs for that tab; the 'activity' case is omitted rather than made a
  // silent no-op so a future caller can't accidentally wire one back in.

  private readonly _removedDeleteTarget = signal<AccessRow | ErrorRow | SecurityRow | SystemEventRow | null>(
    null,
  );

  /**
   * Deleting a log entry used to be offered here, on all four sample tabs, with
   * "This entry will be permanently removed from the log."
   *
   * An audit trail that can be deleted from the screen that displays it is not
   * an audit trail. The entries most worth removing are the ones somebody most
   * wants removed, and the control offered exactly that. Owner ruling,
   * 2026-08-31: no delete access anywhere — archive only, and what is set aside
   * is preserved.
   *
   * Nothing replaces it. There is no honest "archive" for an audit entry: the
   * record is the point, and hiding one is the same act wearing a better word.
   */


  // ---- Export -----------------------------------------------------------

  /**
   * Whether the tab currently shown is sample data rather than a record of
   * anything. Same rule the template's disclaimer uses — `activity` is the one
   * tab backed by the real audit trail — expressed once so the two cannot
   * drift apart and leave an export unmarked.
   */
  private isSampleTab(tab: LogTabKey): boolean {
    return tab !== 'activity';
  }

  /**
   * Exports rows, carrying their provenance with them.
   *
   * The on-screen disclaimer is honest and unconditional, but it is bound to
   * the screen. Export walks the data out of the room: a file called
   * `system-logs-security.csv`, holding invented "Failed Login Attempt" and
   * "Suspicious IP Blocked" rows with IP addresses and timestamps, is
   * indistinguishable from a real security log once it is sitting in a folder,
   * attached to an email, or handed to an auditor. Nothing about the file said
   * what the page said.
   *
   * So the marking travels in the file itself, two ways. The filename is the
   * first thing anyone sees, and `dataSource` is spread first so it is the
   * leading column of every row — a header line can be cropped or scrolled
   * past, and a per-row column survives sorting and filtering in a spreadsheet.
   */
  private exportRows<T extends object>(tab: LogTabKey, rows: readonly T[]): number {
    if (rows.length === 0) return 0;

    if (!this.isSampleTab(tab)) {
      downloadCsv(`system-logs-${tab}`, [...rows]);
      return rows.length;
    }
    const marked = rows.map((row) => ({ dataSource: SAMPLE_MARKER, ...row }));
    downloadCsv(`SAMPLE-system-logs-${tab}`, marked);
    return rows.length;
  }

  protected exportCurrentTab(): void {
    const tab = this.activeTab();
    let count = 0;
    switch (tab) {
      case 'activity':
        count = this.exportRows(tab, this.filteredActivityRows());
        break;
      case 'access':
        count = this.exportRows(tab, this.filteredAccessRows());
        break;
      case 'error':
        count = this.exportRows(tab, this.filteredErrorRows());
        break;
      case 'security':
        count = this.exportRows(tab, this.filteredSecurityRows());
        break;
      case 'events':
        count = this.exportRows(tab, this.filteredEventRows());
        break;
    }
    // `downloadCsv` writes nothing for an empty set, so "Exported 0 rows."
    // announced a file that was never created.
    if (count === 0) {
      this.toast.info('Nothing to export — no rows match the current filters.');
      return;
    }
    this.toast.success(`Exported ${count} row${count === 1 ? '' : 's'}.`);
  }
}
