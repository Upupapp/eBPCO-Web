import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { QueueLoadNotice } from '../../shared/queue-load-notice/queue-load-notice';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ToastService } from '../../shared/toast/toast.service';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ALL_PERMIT_TYPES, PermitType, ReleaseMethod } from '../../core/domain/permit.model';
import { ApplicationLifecycleStatus } from '../../core/domain/status.model';
import { DocumentPreview } from '../../shared/document-preview/document-preview';
import { GeneratedPermitDocumentModal } from '../../shared/generated-document/generated-permit-document-modal';
import { requirementsFor, RequirementDocument } from '../../core/domain/requirements-catalog';
import { RequirementsConfigStore } from '../../core/domain/requirements-config-store';
import { PaymentConfigStore } from '../../core/domain/payment-config-store';
import { DEPARTMENTS, departmentName } from '../../core/domain/department.model';
import { FeeApplicability } from '../../core/domain/fee-rule.model';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';
import { QueueLoader } from '../../core/domain/queue-loader';
import { PermitReleaseApi } from '../../core/api/permit-release.api';
import { PermitReleaseSessionCache } from '../../core/domain/permit-release-session-cache';
import { ApplicantPhotoService } from '../../shared/avatar/applicant-photo.service';
import { CapitalizeNameDirective } from '../../shared/utils/capitalize-name.directive';

type PermitReleaseTab = 'release' | 'permit-types';

function formatPHP(centavos: number | null): string {
  if (centavos === null) return 'Requires assessor input';
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * The real, staff-drivable stages from `Approved` onward
 * (`applications/domain/lifecycle.ts`): `Approved -> Permit Generated ->
 * Ready for Release -> Released -> Completed`. Every row this queue shows
 * already has a permit by construction (see `rows()` below) — Generate
 * itself lives only on the Applications page, since no role that reaches
 * this page (Super Admin, Administrator, Releasing Officer) holds
 * `staff:approve`.
 */
type PermitStage = 'Permit Generated' | 'Ready for Release' | 'Released' | 'Completed';

/** The externally-visible bucket a stage collapses to — Released and Completed read as the same outcome from the release desk's point of view, the same way the shared `PermitReleaseStatus` already does. */
type DisplayStatus = 'Awaiting Preparation' | 'Ready for Release' | 'Released';

function displayStatusFor(stage: PermitStage): DisplayStatus {
  if (stage === 'Permit Generated') return 'Awaiting Preparation';
  if (stage === 'Ready for Release') return 'Ready for Release';
  return 'Released';
}

const RELEASE_QUEUE_STAGES: ReadonlySet<ApplicationLifecycleStatus> = new Set([
  'Permit Generated',
  'Ready for Release',
  'Released',
  'Completed',
]);

interface ReleaseRow {
  id: string;
  applicant: string;
  applicantHasPhoto?: boolean;
  /** Canonical relationship — see ApplicationStore.getApplicationContext. Never derived from `applicant`; one applicant can own multiple businesses. */
  businessId: string;
  businessName: string;
  city: string;
  /** `null` when the portal could not name the permit. */
  type: string | null;
  approvalStatus: string;
  paymentStatus: string;
  permitStage: PermitStage;
  displayStatus: DisplayStatus;
  permitNumber: string;
  /** Optimistic-concurrency token threaded into every transition call in the generate/prepare/release chain. */
  version?: number;
  /** Real submission timestamp — see `ApplicationRecord.dateValue`. Used only to measure Avg. Processing Time below. */
  submittedAt: Date;
  /** Real completion timestamp, or `undefined`/`null` when the server has none yet — see `ApplicationRecord.completedAt`. */
  completedAt?: Date | null;
}

interface RingStat {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  pct: number;
  isTotal: boolean;
  support?: string;
  bars?: number[];
  /** Real per-item values, oldest first — only ever the released rows' own actual processing durations. Never a fabricated trend. */
  sparkline?: number[];
}

@Component({
  selector: 'app-permit-release',
  imports: [
    Topbar,
    QueueLoadNotice,
    Icon,
    Avatar,
    KpiCard,
    Pagination,
    FormsModule,
    FilterPanel,
    DocumentPreview,
    GeneratedPermitDocumentModal,
    CapitalizeNameDirective,
  ],
  templateUrl: './permit-release.html',
  styleUrl: './permit-release.scss',
})
export class PermitRelease implements OnInit {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly requirementsConfig = inject(RequirementsConfigStore);
  private readonly paymentConfig = inject(PaymentConfigStore);
  private readonly applicationsApi = inject(StaffApplicationsApi);
  private readonly loader = inject(QueueLoader);
  private readonly permitReleaseApi = inject(PermitReleaseApi);
  private readonly sessionCache = inject(PermitReleaseSessionCache);
  protected readonly photos = inject(ApplicantPhotoService);

  /**
   * Forces a fresh queue on every visit rather than trusting whatever
   * `AdminLayout`'s one-time `ensureLoaded()` already put in `store` — the
   * same staleness bug as `applications.ts`'s detail view (see its own
   * comment): an application moved into a release-eligible stage from the
   * Applications, Evaluations or Payments page never reached this queue by
   * navigating back here, only by a full reload or this page's own
   * mutations (which already called `loader.reload()` on success, but
   * never on simply opening the page).
   */
  ngOnInit(): void {
    void this.loader.reload().then(() => this.hydrateFromServer());
  }

  protected readonly canRelease = computed(() => {
    const role = this.session.role();
    return role ? ACTION_PERMISSIONS.releasePermit(role) : false;
  });

  // ---- Tabs -----------------------------------------------------------------

  protected readonly tabs: { key: PermitReleaseTab; label: string; icon: string }[] = [
    { key: 'release', label: 'Release Queue', icon: 'file-check' },
    { key: 'permit-types', label: 'Permit Types', icon: 'gear' },
  ];

  protected readonly activeTab = signal<PermitReleaseTab>('release');

  protected selectTab(tab: PermitReleaseTab): void {
    this.activeTab.set(tab);
  }

  // ---- Permit Types: the required-document checklist + a fee-rule summary
  // per permit type. Every one of the 19 permit types is shown here — this
  // office (OBO) is the responsible department for all of them (see
  // department.model.ts), so there is no meaningful subset to filter down
  // to; viewing is open to anyone who can reach Permit Release at all,
  // while editing the checklist is narrowed further (see canConfigureRequirements).

  protected readonly canConfigureRequirements = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.configureRequirements(role);
  });

  protected readonly permitTypes = ALL_PERMIT_TYPES;
  protected readonly departmentOptions = DEPARTMENTS;

  protected readonly selectedPermitType = signal<PermitType | null>(null);
  protected readonly checklistDirty = signal(false);
  protected readonly savingChecklist = signal(false);

  protected selectPermitType(type: PermitType): void {
    this.selectedPermitType.set(type);
    this.checklistDirty.set(false);
    this.cancelAddDocument();
    this.cancelEditDocument();
    void this.requirementsConfig.ensureLoaded(type);
  }

  protected backToPermitTypesList(): void {
    this.selectedPermitType.set(null);
  }

  protected referenceFor(type: PermitType) {
    return requirementsFor(type);
  }

  protected departmentLabel(id: string): string {
    return departmentName(id);
  }

  protected readonly selectedDocuments = computed<RequirementDocument[]>(() => {
    const type = this.selectedPermitType();
    return type ? this.requirementsConfig.documentsFor(type) : [];
  });

  protected readonly checklistLoadFailed = computed(() => {
    const type = this.selectedPermitType();
    return type ? this.requirementsConfig.loadFailed(type) : false;
  });

  /**
   * True when the live checklist genuinely loaded (not a fetch failure —
   * `checklistLoadFailed` covers that) and came back with nothing published
   * for this type yet. The list this page opened FROM shows a document
   * count sourced from the static reference catalog (`referenceFor`), which
   * this same, real, successful GET does not reflect — a real administrator
   * following that count in here otherwise finds a plain "No documents are
   * required for this permit type." with nothing explaining the mismatch
   * or what to do about it.
   */
  protected readonly checklistNothingPublishedYet = computed(() => {
    const type = this.selectedPermitType();
    if (!type) return false;
    return !this.checklistLoadFailed() && this.selectedDocuments().length === 0;
  });

  protected requirementsConfigDocCount(type: PermitType): number {
    return this.requirementsConfig.documentsFor(type).length;
  }

  protected readonly selectedFeeRules = computed(() => {
    const type = this.selectedPermitType();
    return type ? this.paymentConfig.feeRulesForPermitType(type) : [];
  });

  protected feeAmountSummary(ruleId: string): string {
    const entry = this.selectedFeeRules().find((e) => e.rule.id === ruleId);
    if (!entry) return '—';
    const rule = entry.rule;
    if (rule.requiresAssessorInput) return 'Requires assessor input';
    if (rule.flatAmountCentavos !== null) return formatPHP(rule.flatAmountCentavos);
    return 'Formula-based';
  }

  protected applicabilityLabel(a: FeeApplicability): string {
    return a === 'required' ? 'Required' : a === 'conditional' ? 'Conditional' : 'Not Applicable';
  }

  /** Fee Schedule has no per-permit-type filtering concept anymore (Stage 3 rebuilt it around published schedule *versions*, not a matrix) — this deep-links to the tab only, dropping the dead `permitType` query param. */
  goToFeeMatrix(): void {
    this.router.navigate(['/payments'], { queryParams: { tab: 'fee-schedule' } });
  }

  // ---- Permit Types: add/edit/remove a required document -----------------
  // Local-draft mutators only — the server has no per-document CRUD route,
  // just a full-list-replace PUT (see saveChecklist() below).

  protected readonly addDocumentOpen = signal(false);
  protected newDocument = { label: '', required: true, description: '' };

  protected startAddDocument(): void {
    if (!this.canConfigureRequirements()) return;
    this.newDocument = { label: '', required: true, description: '' };
    this.addDocumentOpen.set(true);
  }

  protected cancelAddDocument(): void {
    this.addDocumentOpen.set(false);
  }

  /** Preview-only — the actual code is (re)derived at add-time from whatever the label is at that moment, so this never drifts from what confirmAddDocument() will actually mint. */
  protected previewNewDocumentCode(): string {
    const type = this.selectedPermitType();
    if (!type || !this.newDocument.label.trim()) return '';
    return this.requirementsConfig.deriveUniqueCode(type, this.newDocument.label);
  }

  protected confirmAddDocument(): void {
    const type = this.selectedPermitType();
    if (!type || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    const label = this.newDocument.label.trim();
    if (!label) {
      this.toast.error('Enter a document label before adding it.');
      return;
    }
    // The auto-derived code de-duplicates against this draft (see
    // `deriveUniqueCode` — a second "Barangay Clearance" mints
    // "barangay-clearance-2"), so the server's own duplicate-CODE refusal
    // never triggers here; two documents ending up with the same LABEL and
    // merely different codes reads to an officer as the same requirement
    // listed twice, which is confusing even though it isn't a code
    // collision. Caught here instead, before it's added.
    const alreadyListed = this.requirementsConfig
      .documentsFor(type)
      .some((d) => d.label.trim().toLowerCase() === label.toLowerCase());
    if (alreadyListed) {
      this.toast.error(`"${label}" is already on this checklist.`);
      return;
    }
    this.requirementsConfig.addDocument(type, {
      label,
      required: this.newDocument.required,
      description: this.newDocument.description.trim() || undefined,
      reviewingDepartmentId: this.referenceFor(type).responsibleDepartmentId,
    });
    this.checklistDirty.set(true);
    this.toast.success(`"${label}" added to the checklist. Select "Save Checklist" to publish it.`);
    this.addDocumentOpen.set(false);
  }

  protected readonly editingDocumentId = signal<string | null>(null);
  protected editDraft = { label: '', required: true, description: '' };

  protected startEditDocument(doc: RequirementDocument): void {
    if (!this.canConfigureRequirements()) return;
    this.editDraft = {
      label: doc.label,
      required: doc.required,
      description: doc.description ?? '',
    };
    this.editingDocumentId.set(doc.id);
  }

  protected cancelEditDocument(): void {
    this.editingDocumentId.set(null);
  }

  protected confirmEditDocument(): void {
    const type = this.selectedPermitType();
    const id = this.editingDocumentId();
    if (!type || !id || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    const label = this.editDraft.label.trim();
    if (!label) {
      this.toast.error('Enter a document label before saving.');
      return;
    }
    this.requirementsConfig.updateDocument(type, id, {
      label,
      required: this.editDraft.required,
      description: this.editDraft.description.trim() || undefined,
    });
    this.checklistDirty.set(true);
    this.toast.success(`"${label}" updated. Select "Save Checklist" to publish it.`);
    this.editingDocumentId.set(null);
  }

  protected removeDocument(doc: RequirementDocument): void {
    const type = this.selectedPermitType();
    if (!type || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    this.requirementsConfig.removeDocument(type, doc.id);
    this.checklistDirty.set(true);
    this.toast.success(`"${doc.label}" removed from the draft. Select "Save Checklist" to publish it.`);
  }

  protected resetDocumentsToDefault(): void {
    const type = this.selectedPermitType();
    if (!type || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    this.requirementsConfig.resetToDefault(type);
    this.checklistDirty.set(true);
    this.toast.success('Checklist reset to default in this draft. Select "Save Checklist" to publish it.');
  }

  /** Batches the whole current draft into one `PUT` — there is no per-document write route server-side. */
  protected async saveChecklist(): Promise<void> {
    const type = this.selectedPermitType();
    if (!type || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    this.savingChecklist.set(true);
    try {
      const result = await this.requirementsConfig.saveDocuments(type);
      if (result.kind === 'done') {
        this.checklistDirty.set(false);
        this.toast.success('Checklist saved.');
      } else {
        const message =
          result.kind === 'unavailable' ? 'This deployment cannot save the checklist yet.' : result.message;
        this.toast.error(message);
      }
    } finally {
      this.savingChecklist.set(false);
    }
  }

  /**
   * Reads back, from the server, what this browser session did not do itself.
   *
   * `PermitReleaseSessionCache` was written when `GET /staff/applications/:id`
   * carried neither the permit nor the release, so a permit generated by
   * another officer — or in a session before this page was opened — could
   * only be shown as "Not available in this session". The detail route has
   * carried `permit` and `release` since; found live on 2026-09-20, when a
   * permit generated minutes earlier on the Applications page showed that
   * placeholder here after a reload, while FP-2026-000001 sat in the
   * database. The cache stays the single place the template reads from;
   * this just fills it from the record instead of only from this session's
   * own clicks. Best-effort per row: a row whose detail fails keeps showing
   * the honest placeholder rather than blocking the queue.
   */
  private async hydrateFromServer(): Promise<void> {
    const pending = this.rows().filter((row) => this.sessionCache.permitFor(row.id) === undefined);
    await Promise.all(pending.map(async (row) => {
      const result = await this.applicationsApi.detail(row.id);
      if (result.kind !== 'ok') return;
      const { permit, release } = result.detail;
      if (permit) {
        this.sessionCache.recordPermit(row.id, { permitNumber: permit.permitNumber, issuedDate: permit.issuedDate });
      }
      if (release?.claimLocation) {
        this.sessionCache.recordPreparation(row.id, {
          claimLocation: release.claimLocation,
          officeHours: release.officeHours ?? '',
          bringWithYou: release.bringWithYou ?? [],
        });
      }
      if (release?.releasedAt && release.claimantName && release.method) {
        this.sessionCache.recordRelease(row.id, {
          claimantName: release.claimantName, method: release.method, releasedAt: release.releasedAt,
        });
      }
    }));
  }

  // ---- Release Queue -------------------------------------------------------
  // Every row is an application whose permit has actually been generated —
  // read from the same store Applications/Payments/Dashboard read, filtered
  // on the real `lifecycleStatus` values a generated permit can produce.

  protected readonly rows = computed<ReleaseRow[]>(() => {
    return this.store
      .applications()
      .filter((app) => RELEASE_QUEUE_STAGES.has(app.lifecycleStatus))
      .map((app): ReleaseRow => {
        const stage = app.lifecycleStatus as PermitStage;
        const cached = this.sessionCache.permitFor(app.id);
        const seedPermit = this.store.isSeedData() ? this.store.getPermit(app.id) : undefined;
        return {
          id: app.id,
          applicant: app.applicant,
          applicantHasPhoto: app.applicantHasPhoto,
          businessId: app.businessId,
          businessName: app.businessName,
          city: app.location,
          type: app.permitType,
          approvalStatus: 'Approved',
          paymentStatus: app.paymentStatus,
          permitStage: stage,
          displayStatus: displayStatusFor(stage),
          permitNumber: cached?.permitNumber ?? seedPermit?.permitNumber ?? 'Not available in this session',
          version: app.version,
          submittedAt: app.dateValue,
          completedAt: app.completedAt,
        };
      });
  });

  // Ring totals are derived from the same rows() the table shows.
  protected readonly ringStats = computed<RingStat[]>(() => {
    const rows = this.rows();
    const total = rows.length || 1;
    const awaiting = rows.filter((r) => r.displayStatus === 'Awaiting Preparation').length;
    const ready = rows.filter((r) => r.displayStatus === 'Ready for Release').length;
    const released = rows.filter((r) => r.displayStatus === 'Released').length;
    return [
      {
        label: 'Awaiting Preparation',
        value: String(awaiting),
        icon: 'clock',
        tone: 'warning',
        illustration: 'pending',
        pct: Math.round((awaiting / total) * 100),
        isTotal: false,
        support: `${Math.round((awaiting / total) * 100)}% of total release`,
      },
      {
        label: 'Ready for Release',
        value: String(ready),
        icon: 'clock',
        tone: 'info',
        illustration: 'pending',
        pct: Math.round((ready / total) * 100),
        isTotal: false,
        support: `${Math.round((ready / total) * 100)}% of total release`,
      },
      {
        label: 'Released',
        value: String(released),
        icon: 'check-circle',
        tone: 'success',
        illustration: 'success',
        pct: Math.round((released / total) * 100),
        isTotal: false,
        support: `${Math.round((released / total) * 100)}% of total release`,
      },
      this.avgProcessingTimeStat(rows),
    ];
  });

  /**
   * Real elapsed days from submission to release, per released row —
   * `completedAt` is the server's own `application_transitions` timestamp
   * (`staff-queue.service.ts`), not a client-side guess, so this is a real
   * average and a real sparkline, not sample data standing in for one.
   *
   * A row missing `completedAt` (seed/demo data, or a real one the server
   * genuinely has no transition record for) is left out of both the average
   * and the count reported in `support` — never coerced to zero, which would
   * silently understate the real figure.
   */
  private avgProcessingTimeStat(rows: readonly ReleaseRow[]): RingStat {
    const processingDays = rows
      .filter((r): r is ReleaseRow & { completedAt: Date } =>
        r.displayStatus === 'Released' && r.completedAt instanceof Date)
      .map((r) => (r.completedAt.getTime() - r.submittedAt.getTime()) / 86_400_000)
      .filter((days) => days >= 0);

    const average = processingDays.length > 0
      ? processingDays.reduce((sum, d) => sum + d, 0) / processingDays.length
      : null;

    return {
      label: 'Avg. Processing Time',
      value: average === null ? '—' : average.toFixed(1),
      unit: average === null ? '' : 'days',
      icon: 'clock',
      tone: 'info',
      illustration: 'permit',
      pct: 0,
      isTotal: true,
      support: processingDays.length > 0
        ? `Submission to release, across ${processingDays.length} released permit${processingDays.length === 1 ? '' : 's'} with a recorded release date`
        : 'No released permit here yet has a recorded release date to measure from',
      // A sparkline needs 2+ points to read as a line rather than a single
      // dot — kpi-card itself already refuses to render one below that.
      sparkline: processingDays.length >= 2 ? processingDays : undefined,
    };
  }

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<'All' | DisplayStatus>('All');
  protected readonly statusOptions: DisplayStatus[] = [
    'Awaiting Preparation',
    'Ready for Release',
    'Released',
  ];

  protected readonly activeFilterCount = computed(() => (this.statusFilter() === 'All' ? 0 : 1));

  protected clearFilters(): void {
    this.statusFilter.set('All');
  }

  protected readonly filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.rows().filter((r) => {
      if (status !== 'All' && r.displayStatus !== status) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        (r.type?.toLowerCase().includes(term) ?? false)
      );
    });
  });

  protected readonly pagedRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredRows().slice(start, start + this.pageSize);
  });

  protected onSearchChange(): void {
    this.page.set(1);
  }

  openApplicationRecord(row: ReleaseRow): void {
    this.router.navigateByUrl(`/applications/${row.id}`);
  }

  // ---- Selection + bulk export ------------------------------------------

  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected isSelected(row: ReleaseRow): boolean {
    return this.selectedIds().has(row.id);
  }

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.filteredRows();
    return visible.length > 0 && visible.every((row) => this.selectedIds().has(row.id));
  });

  protected toggleRowSelected(row: ReleaseRow): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  }

  protected toggleSelectAll(): void {
    const visible = this.filteredRows();
    const allSelected = this.allVisibleSelected();
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const row of visible) {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      }
      return next;
    });
  }

  // ---- Export -------------------------------------------------------------

  private releaseCsvRow(row: ReleaseRow) {
    return {
      'Application ID': row.id,
      Applicant: row.applicant,
      'Business ID': row.businessId,
      'Business / Project': row.businessName,
      Location: row.city,
      Type: row.type,
      'Approval Status': row.approvalStatus,
      'Payment Status': row.paymentStatus,
      'Permit Status': row.displayStatus,
      'Permit Number': row.permitNumber,
    };
  }

  protected exportVisible(): void {
    const rows = this.filteredRows();
    // `downloadCsv` writes nothing for an empty set, so "Exported 0 rows."
    // announced a file that was never created.
    if (rows.length === 0) {
      this.toast.info('Nothing to export — no rows match the current view.');
      return;
    }
    downloadCsv(
      'permit-releases',
      rows.map((row) => this.releaseCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  protected exportSelected(): void {
    const ids = this.selectedIds();
    const rows = this.rows().filter((row) => ids.has(row.id));
    if (rows.length === 0) {
      this.toast.info('Nothing to export — select at least one row first.');
      return;
    }
    downloadCsv(
      'permit-releases-selected',
      rows.map((row) => this.releaseCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  // ---- Print (preview-only; nothing is generated here — see Applications'
  // own Generate action, the only place `staff:approve` is actually held) --

  protected readonly showPrintModal = signal(false);
  protected readonly printTarget = signal<ReleaseRow | null>(null);

  printPermit(row?: ReleaseRow): void {
    this.printTarget.set(row ?? null);
    this.showPrintModal.set(true);
  }

  protected readonly printRows = computed(() => {
    const target = this.printTarget();
    if (target) return [target];
    return this.rows().filter((r) => r.displayStatus === 'Ready for Release');
  });

  printPdf(): void {
    window.print();
  }

  closeModal(): void {
    this.showPrintModal.set(false);
    this.printTarget.set(null);
  }

  // ---- Prepare Release ------------------------------------------------------
  // The real precondition to Release below — the server refuses `release`
  // outright without a prior successful `release-preparation` call.

  protected readonly prepareReleaseTarget = signal<ReleaseRow | null>(null);
  protected readonly preparingRelease = signal(false);
  protected readonly prepareReleaseError = signal('');
  protected claimLocation = '';
  protected officeHours = '';
  protected bringWithYouText = '';

  protected requestPrepareRelease(row: ReleaseRow): void {
    if (!this.canRelease() || row.permitStage !== 'Permit Generated') return;
    this.claimLocation = '';
    this.officeHours = '';
    this.bringWithYouText = '';
    this.prepareReleaseError.set('');
    this.prepareReleaseTarget.set(row);
  }

  protected cancelPrepareRelease(): void {
    this.prepareReleaseTarget.set(null);
  }

  /** The last successful act on an application, shown inline in its Release Actions panel — see the template's own comment. */
  protected readonly actionNotice = signal<{ applicationId: string; text: string } | null>(null);

  protected async confirmPrepareRelease(): Promise<void> {
    const row = this.prepareReleaseTarget();
    if (!row) return;
    const claimLocation = this.claimLocation.trim();
    const officeHours = this.officeHours.trim();
    if (!claimLocation || !officeHours) {
      const message = 'Claim location and office hours are required.';
      this.prepareReleaseError.set(message);
      this.toast.error(message);
      return;
    }
    const bringWithYou = this.bringWithYouText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    this.preparingRelease.set(true);
    try {
      const result = await this.permitReleaseApi.prepareRelease(row.id, {
        claimLocation,
        officeHours,
        bringWithYou: bringWithYou.length > 0 ? bringWithYou : undefined,
      });
      if (result.kind !== 'done') {
        const message =
          result.kind === 'unavailable' ? 'This deployment cannot prepare releases yet.' : result.message;
        this.prepareReleaseError.set(message);
        this.toast.error(message);
        return;
      }
      this.sessionCache.recordPreparation(row.id, { claimLocation, officeHours, bringWithYou });
      // The server makes `Permit Generated -> Ready for Release` itself now
      // and reports the status; the hop is a fallback for an older server or
      // a refused move (no `expectedVersion`: the server's own move already
      // advanced the version this row remembers).
      if (result.lifecycleStatus === 'Ready for Release') {
        this.toast.success('Release prepared.');
        this.actionNotice.set({
          applicationId: row.id,
          text: `Release prepared — claim at ${claimLocation}, ${officeHours}. The applicant has been notified and the permit is now Ready for Release.`,
        });
      } else {
        const transitionResult = await this.applicationsApi.transition(row.id, 'Ready for Release');
        if (transitionResult.kind !== 'done') {
          const message =
            transitionResult.kind === 'unavailable'
              ? 'this deployment cannot update it yet.'
              : transitionResult.message;
          this.toast.error(`Release prepared, but the status update failed — ${message} Reload and try again.`);
        } else {
          this.toast.success('Release prepared.');
        }
      }
      this.prepareReleaseTarget.set(null);
      await this.loader.reload();
    } finally {
      this.preparingRelease.set(false);
    }
  }

  // ---- Release (claim) ----------------------------------------------------
  // Requires an existing prepared release — enforced by the server, not this
  // page. On success, chains both remaining real transitions
  // (`Ready for Release -> Released -> Completed`) in the one click, since
  // that already matches how a single "Release" action reads to an officer.

  protected readonly releaseTarget = signal<ReleaseRow | null>(null);
  protected readonly releaseError = signal('');
  protected readonly releasingPermit = signal(false);
  protected claimantName = '';
  protected releaseMethod: ReleaseMethod = 'Physical Claim';

  protected requestRelease(row: ReleaseRow): void {
    if (!this.canRelease() || row.permitStage !== 'Ready for Release') return;
    this.claimantName = row.applicant;
    this.releaseMethod = 'Physical Claim';
    this.releaseError.set('');
    this.releaseTarget.set(row);
  }

  protected cancelRelease(): void {
    this.releaseTarget.set(null);
  }

  protected async confirmRelease(): Promise<void> {
    const row = this.releaseTarget();
    if (!row) return;
    const claimant = this.claimantName.trim();
    if (!claimant) {
      const message = 'Claimant name is required.';
      this.releaseError.set(message);
      this.toast.error(message);
      return;
    }
    this.releasingPermit.set(true);
    try {
      const result = await this.permitReleaseApi.release(row.id, {
        claimantName: claimant,
        method: this.releaseMethod,
      });
      if (result.kind !== 'done') {
        const message =
          result.kind === 'unavailable' ? 'This deployment cannot release permits yet.' : result.message;
        this.releaseError.set(message);
        this.toast.error(message);
        return;
      }
      this.sessionCache.recordRelease(row.id, {
        claimantName: claimant,
        method: this.releaseMethod,
        releasedAt: result.releasedAt,
      });
      // The server carries the application `Ready for Release -> Released ->
      // Completed` itself now and reports where it landed. Only when it did
      // not (older server, or a refused move) does this page make the hops.
      if (result.lifecycleStatus === 'Completed') {
        this.toast.success(`Permit released to ${claimant}.`);
        this.actionNotice.set({
          applicationId: row.id,
          text: `Permit released to ${claimant} (${this.releaseMethod}). The application is now Completed and the applicant has been notified.`,
        });
      } else {
        const releasedTransition = result.lifecycleStatus === 'Released'
          ? ({ kind: 'done' } as const)
          : await this.applicationsApi.transition(row.id, 'Released');
        if (releasedTransition.kind !== 'done') {
          const message =
            releasedTransition.kind === 'unavailable'
              ? 'this deployment cannot update it yet.'
              : releasedTransition.message;
          this.toast.error(`Permit released to ${claimant}, but the status update failed — ${message} Reload and try again.`);
        } else {
          const completedTransition = await this.applicationsApi.transition(row.id, 'Completed');
          if (completedTransition.kind !== 'done') {
            const message =
              completedTransition.kind === 'unavailable'
                ? 'this deployment cannot update it yet.'
                : completedTransition.message;
            this.toast.error(
              `Permit released to ${claimant}, but marking it Completed failed — ${message} Reload and try again.`,
            );
          } else {
            this.toast.success(`Permit released to ${claimant}.`);
          }
        }
      }
      this.releaseTarget.set(null);
      await this.loader.reload();
    } finally {
      this.releasingPermit.set(false);
    }
  }

  protected readonly view = signal<'list' | 'detail'>('list');
  protected readonly selectedRow = signal<ReleaseRow | null>(null);

  protected readonly previewTarget = signal<ReleaseRow | null>(null);

  protected previewPermit(row: ReleaseRow): void {
    this.previewTarget.set(row);
  }

  protected closePermitPreview(): void {
    this.previewTarget.set(null);
  }

  // Separate from previewTarget/kind="permit" above — <app-document-preview>
  // takes one fixed `kind` per instance, so viewing the payment receipt
  // needs its own target/instance rather than a second value the same
  // signal could hold.
  protected readonly receiptPreviewTarget = signal<ReleaseRow | null>(null);

  protected previewReceipt(row: ReleaseRow): void {
    this.receiptPreviewTarget.set(row);
  }

  protected closeReceiptPreview(): void {
    this.receiptPreviewTarget.set(null);
  }

  openDetail(row: ReleaseRow): void {
    this.selectedRow.set(row);
    this.view.set('detail');
  }

  backToList(): void {
    this.view.set('list');
  }
}
