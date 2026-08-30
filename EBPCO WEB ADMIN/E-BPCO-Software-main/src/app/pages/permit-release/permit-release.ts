import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
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
import { DocumentPreview } from '../../shared/document-preview/document-preview';
import { GeneratedPermitDocumentModal } from '../../shared/generated-document/generated-permit-document-modal';
import { requirementsFor, RequirementDocument } from '../../core/domain/requirements-catalog';
import { RequirementsConfigStore } from '../../core/domain/requirements-config-store';
import { PaymentConfigStore } from '../../core/domain/payment-config-store';
import { DEPARTMENTS, departmentName } from '../../core/domain/department.model';
import { FeeApplicability } from '../../core/domain/fee-rule.model';

type PermitReleaseTab = 'release' | 'permit-types';

function formatPHP(centavos: number | null): string {
  if (centavos === null) return 'Requires assessor input';
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// 'Ready for Release' mirrors E-BPCO Mobile's ApplicationStatus.released
// display label exactly (application_model.dart) — from the applicant's
// side, that status IS "Ready for Release". 'Released' is the LGU-internal
// state once staff hand over the physical permit, which mobile doesn't
// track as a separate status.
type PermitStatus = 'Ready for Release' | 'Released';

interface ReleaseRow {
  id: string;
  applicant: string;
  /** Canonical relationship — see ApplicationStore.getApplicationContext. Never derived from `applicant`; one applicant can own multiple businesses. */
  businessId: string;
  businessName: string;
  city: string;
  type: string;
  approvalStatus: string;
  paymentStatus: string;
  permitStatus: PermitStatus;
  permitNumber: string;
}

interface RingStat {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  pct: number;
  isTotal: boolean;
  support?: string;
  bars?: number[];
}

@Component({
  selector: 'app-permit-release',
  imports: [
    Topbar,
    Icon,
    Avatar,
    KpiCard,
    Pagination,
    FormsModule,
    FilterPanel,
    DocumentPreview,
    GeneratedPermitDocumentModal,
  ],
  templateUrl: './permit-release.html',
  styleUrl: './permit-release.scss',
})
export class PermitRelease {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly requirementsConfig = inject(RequirementsConfigStore);
  private readonly paymentConfig = inject(PaymentConfigStore);

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
  // per permit type. Every one of the fixed 16 permit types is shown here —
  // this office (OBO) is the responsible department for all of them (see
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

  protected selectPermitType(type: PermitType): void {
    this.selectedPermitType.set(type);
    this.cancelAddDocument();
    this.cancelEditDocument();
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

  goToFeeMatrix(type: PermitType): void {
    this.router.navigate(['/payments'], { queryParams: { tab: 'matrix', permitType: type } });
  }

  // ---- Permit Types: add/edit/remove a required document ----------------

  protected readonly addDocumentOpen = signal(false);
  protected newDocument = { label: '', required: true, reviewingDepartmentId: 'obo' };

  protected startAddDocument(): void {
    if (!this.canConfigureRequirements()) return;
    this.newDocument = { label: '', required: true, reviewingDepartmentId: 'obo' };
    this.addDocumentOpen.set(true);
  }

  protected cancelAddDocument(): void {
    this.addDocumentOpen.set(false);
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
    this.requirementsConfig.addDocument(type, {
      label,
      required: this.newDocument.required,
      reviewingDepartmentId: this.newDocument.reviewingDepartmentId,
    });
    this.toast.success(`"${label}" added to the checklist.`);
    this.addDocumentOpen.set(false);
  }

  protected readonly editingDocumentId = signal<string | null>(null);
  protected editDraft = { label: '', required: true, reviewingDepartmentId: 'obo' };

  protected startEditDocument(doc: RequirementDocument): void {
    if (!this.canConfigureRequirements()) return;
    this.editDraft = {
      label: doc.label,
      required: doc.required,
      reviewingDepartmentId: doc.reviewingDepartmentId,
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
      reviewingDepartmentId: this.editDraft.reviewingDepartmentId,
    });
    this.toast.success(`"${label}" updated.`);
    this.editingDocumentId.set(null);
  }

  protected removeDocument(doc: RequirementDocument): void {
    const type = this.selectedPermitType();
    if (!type || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    this.requirementsConfig.removeDocument(type, doc.id);
    this.toast.success(`"${doc.label}" removed from the checklist.`);
  }

  protected resetDocumentsToDefault(): void {
    const type = this.selectedPermitType();
    if (!type || !this.canConfigureRequirements()) {
      this.toast.error("You don't have permission to configure requirements.");
      return;
    }
    this.requirementsConfig.resetToDefault(type);
    this.toast.success('Checklist reset to default.');
  }

  // Every row is an application whose permit has actually been generated —
  // read from the same store Applications/Payments/Dashboard read, with
  // its real permit number, instead of a locally-invented 10-row table.
  protected readonly rows = computed<ReleaseRow[]>(() => {
    return this.store
      .applications()
      .filter((app) => app.permitReleaseStatus !== 'Not Ready')
      .map((app): ReleaseRow => ({
        id: app.id,
        applicant: app.applicant,
        businessId: app.businessId,
        businessName: app.businessName,
        city: app.location,
        type: app.permitType,
        approvalStatus: 'Approved',
        paymentStatus: app.paymentStatus,
        permitStatus: app.permitReleaseStatus as PermitStatus,
        permitNumber: this.store.getPermit(app.id)?.permitNumber ?? '—',
      }));
  });

  // Ring totals are derived from the same rows() the table shows, so
  // "Total Release" always equals Ready-for-Release + Released.
  protected readonly ringStats = computed<RingStat[]>(() => {
    const rows = this.rows();
    const total = rows.length || 1;
    const ready = rows.filter((r) => r.permitStatus === 'Ready for Release').length;
    const released = rows.filter((r) => r.permitStatus === 'Released').length;
    return [
      {
        label: 'Ready for Release',
        value: String(ready),
        icon: 'clock',
        tone: 'warning',
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
      {
        label: 'Total Release',
        value: String(rows.length),
        icon: 'file-check',
        tone: 'info',
        illustration: 'permit',
        pct: 100,
        isTotal: true,
        support: 'Ready for Release · Released',
        bars: [ready, released],
      },
    ];
  });

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<'All' | PermitStatus>('All');
  protected readonly statusOptions: PermitStatus[] = ['Ready for Release', 'Released'];

  protected readonly activeFilterCount = computed(() => (this.statusFilter() === 'All' ? 0 : 1));

  protected clearFilters(): void {
    this.statusFilter.set('All');
  }

  protected readonly filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.rows().filter((r) => {
      if (status !== 'All' && r.permitStatus !== status) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.type.toLowerCase().includes(term)
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
      'Permit Status': row.permitStatus,
      'Permit Number': row.permitNumber,
    };
  }

  protected exportVisible(): void {
    const rows = this.filteredRows();
    downloadCsv(
      'permit-releases',
      rows.map((row) => this.releaseCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  protected exportSelected(): void {
    const ids = this.selectedIds();
    const rows = this.rows().filter((row) => ids.has(row.id));
    downloadCsv(
      'permit-releases-selected',
      rows.map((row) => this.releaseCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  // ---- Generate / print ---------------------------------------------------

  protected readonly showGenerateModal = signal(false);
  protected readonly generateTarget = signal<ReleaseRow | null>(null);

  generate(row?: ReleaseRow): void {
    // Actually generate the permit record here (mirroring the Applications
    // page's own "Generate {finalDocumentName}" button) rather than only
    // opening a print preview over whatever may or may not already exist —
    // previously this modal never called ApplicationStore.generatePermit(),
    // so a staffer working exclusively from this page had no way to create
    // a permit that didn't already exist.
    if (row && !this.store.getPermit(row.id)) {
      const application = this.store.getById(row.id);
      if (application?.lifecycleStatus === 'Approved' && application.paymentStatus === 'Paid') {
        const ok = this.store.generatePermit(
          row.id,
          this.session.name() || 'Approving Officer',
          this.session.role() ?? 'Administrator',
        );
        if (ok) this.toast.success('Permit generated.');
        else this.toast.error("Couldn't generate the permit for this application.");
      } else {
        this.toast.error(
          "Can't generate a permit yet — the application must be Approved and fully paid.",
        );
        return;
      }
    }
    this.generateTarget.set(row ?? null);
    this.showGenerateModal.set(true);
  }

  protected readonly printRows = computed(() => {
    const target = this.generateTarget();
    if (target) return [target];
    return this.rows().filter((r) => r.permitStatus === 'Ready for Release');
  });

  printPdf(): void {
    window.print();
  }

  closeModal(): void {
    this.showGenerateModal.set(false);
    this.generateTarget.set(null);
  }

  // ---- Release (claim) ----------------------------------------------------
  // Requires an approved application, verified payment, and generated
  // permit — all enforced by the store, which also refuses a second
  // release for the same application and marks the application Completed
  // once released.

  protected readonly releaseTarget = signal<ReleaseRow | null>(null);
  protected readonly releaseError = signal('');
  protected claimantName = '';
  protected releaseMethod: ReleaseMethod = 'Physical Claim';

  protected requestRelease(row: ReleaseRow): void {
    if (!this.canRelease() || row.permitStatus !== 'Ready for Release') return;
    this.claimantName = row.applicant;
    this.releaseMethod = 'Physical Claim';
    this.releaseError.set('');
    this.releaseTarget.set(row);
  }

  protected cancelRelease(): void {
    this.releaseTarget.set(null);
  }

  protected confirmRelease(): void {
    const row = this.releaseTarget();
    if (!row) return;
    const claimant = this.claimantName.trim();
    if (!claimant) {
      const message = 'Claimant name is required.';
      this.releaseError.set(message);
      this.toast.error(message);
      return;
    }
    const ok = this.store.releasePermit(
      row.id,
      this.session.name() || 'Releasing Officer',
      claimant,
      this.releaseMethod,
    );
    if (!ok) {
      const message =
        'This application is not eligible for release yet (needs an approved status, verified payment, and generated permit), or has already been released.';
      this.releaseError.set(message);
      this.toast.error(message);
      return;
    }
    this.toast.success(`Permit released to ${claimant}.`);
    this.releaseTarget.set(null);
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
