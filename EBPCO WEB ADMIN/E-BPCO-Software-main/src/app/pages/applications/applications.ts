import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { ApplicationLifecycleStatus, EvaluationStage } from '../../core/domain/status.model';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ApplicationIntake } from '../../shared/application-intake/application-intake';
import {
  DocumentPreview,
  SampleDocumentKind,
} from '../../shared/document-preview/document-preview';
import { ApplicationDocument, DocumentStatus } from '../../core/domain/document.model';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import {
  AppRow,
  AppStatus,
  AppDetail,
  buildDetailFor,
  COMMENTS,
  CommentItem,
  TIMELINE,
  TimelineItem,
  SHARED_TIMELINE,
  EVAL_CARDS,
  EvalCard,
  EVAL_DETAILS,
  EvalKey,
  ChecklistItem,
} from './applications-data';

/** One row of the real per-application Documents tab — a required-but-not-yet-uploaded requirement has `doc: null` and renders as "Missing". */
interface DocumentRow {
  requirementId: string;
  label: string;
  required: boolean;
  departmentName: string;
  doc: ApplicationDocument | null;
}

function buildQrCells(): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const size = 15;
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) % 1;
  };
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const inFinder =
        (row < 4 && col < 4) || (row < 4 && col > size - 5) || (row > size - 5 && col < 4);
      if (inFinder) {
        continue;
      }
      if (rand() > 0.55) {
        cells.push({ x: col * 6 + 4, y: row * 6 + 4 });
      }
    }
  }
  for (const [ox, oy] of [
    [0, 0],
    [size - 4, 0],
    [0, size - 4],
  ]) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (r === 0 || r === 3 || c === 0 || c === 3) {
          cells.push({ x: (ox + c) * 6 + 4, y: (oy + r) * 6 + 4 });
        }
      }
    }
  }
  return cells;
}

type View = 'list' | 'detail' | 'info' | 'evaluations' | 'evaluation-detail' | 'not-found';
type DetailTab = 'timeline' | 'documents' | 'permit' | 'comments';
type InfoSection = 'meta' | 'project' | 'type' | 'govid' | 'professional' | 'ownership';

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

interface PreviewDoc {
  label: string;
  filename: string;
  status: string;
}

const EVAL_ORDER: EvalKey[] = ['initial', 'zoning', 'fire', 'obo', 'final'];
const STATUS_OPTIONS: AppStatus[] = ['Approved', 'Under Review', 'Rejected'];

const EVAL_KEY_TO_STAGE: Record<EvalKey, EvaluationStage> = {
  initial: 'Initial',
  zoning: 'Zoning',
  fire: 'Fire Safety',
  obo: 'OBO',
  final: 'Final Approval',
};

@Component({
  selector: 'app-applications',
  imports: [
    Topbar,
    Icon,
    Avatar,
    DilgSeal,
    KpiCard,
    Pagination,
    FormsModule,
    FilterPanel,
    ConfirmDialog,
    ApplicationIntake,
    DocumentPreview,
  ],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications {
  private readonly store = inject(ApplicationStore);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly session = inject(SessionService);
  protected readonly canCreate = computed(() => {
    const role = this.session.role();
    return role ? ACTION_PERMISSIONS.createApplication(role) : false;
  });
  protected readonly canVerifyContact = computed(() => {
    const role = this.session.role();
    return role ? ACTION_PERMISSIONS.verifyContact(role) : false;
  });

  // Bound to the optional :id route segment (see app.routes.ts) via
  // withComponentInputBinding — this is the single source of truth for
  // which application is open. Every entry surface (this page's own
  // table, Dashboard, Tenant Dashboard, the Business Stages board)
  // navigates to /applications/:id rather than toggling local component
  // state, so the detail workspace has a real, stable, refreshable,
  // linkable URL.
  readonly id = input<string>();

  // Bound to the optional `?status=` query param — lets another surface
  // (the Business Stages board's "View all") land on this table
  // pre-filtered to one status instead of dumping the user on an
  // unfiltered list they'd have to re-filter by hand.
  readonly status = input<string>();

  constructor() {
    effect(() => {
      const status = this.status();
      untracked(() => {
        if (status === 'Under Review' || status === 'Approved' || status === 'Rejected') {
          this.statusFilter.set(status);
        }
      });
    });

    effect(() => {
      const id = this.id();
      // untracked: only re-run this when the route id itself changes, not
      // on every unrelated store mutation elsewhere in the app (which
      // would otherwise snap the user back out of Info/Evaluations
      // sub-views any time another page edited some other row).
      untracked(() => {
        if (!id) {
          this.view.set('list');
          this.selectedRow.set(null);
          this.titleService.setTitle('Applications — E-BPCO Admin');
          return;
        }
        const row = this.store.getById(id);
        if (!row) {
          this.selectedRow.set(null);
          this.view.set('not-found');
          this.titleService.setTitle('Application not found — E-BPCO Admin');
          return;
        }
        this.selectedRow.set(row);
        this.detailTab.set('timeline');
        this.view.set('detail');
        this.titleService.setTitle(`${row.applicant} (${row.id}) — E-BPCO Admin`);
      });
    });
  }

  // Full shared pool (Dashboard, Tenant Dashboard, and the Business
  // Stages board read/write the same records) rather than an
  // independently hardcoded 10-row array.
  protected readonly rows = computed(() => this.store.applications());
  protected readonly comments = signal<CommentItem[]>(COMMENTS);
  protected readonly timeline = TIMELINE;
  protected readonly sharedTimeline = SHARED_TIMELINE;
  protected readonly evalCards = signal<EvalCard[]>(EVAL_CARDS);
  protected readonly evalDetails = signal(EVAL_DETAILS);
  protected readonly statusOptions = STATUS_OPTIONS;

  // Every value/percentage here is derived from the same store the table
  // below reads — the ring totals always equal the visible row breakdown
  // instead of an independently hand-picked figure. Total Applications
  // reads as a full ring (the reference figure); the other three fill in
  // proportion to it.
  protected readonly ringStats = computed<RingStat[]>(() => {
    const rows = this.rows();
    const total = rows.length || 1;
    const under = rows.filter((r) => r.status === 'Under Review').length;
    const approved = rows.filter((r) => r.status === 'Approved').length;
    const rejected = rows.filter((r) => r.status === 'Rejected').length;
    return [
      {
        label: 'Under Review',
        value: String(under),
        icon: 'clock',
        tone: 'warning',
        illustration: 'pending',
        pct: Math.round((under / total) * 100),
        isTotal: false,
        support: `${Math.round((under / total) * 100)}% of all applications`,
      },
      {
        label: 'Approved',
        value: String(approved),
        icon: 'check-circle',
        tone: 'success',
        illustration: 'success',
        pct: Math.round((approved / total) * 100),
        isTotal: false,
        support: `${Math.round((approved / total) * 100)}% of all applications`,
      },
      {
        label: 'Rejected',
        value: String(rejected),
        icon: 'x-circle',
        tone: 'danger',
        illustration: 'critical',
        pct: Math.round((rejected / total) * 100),
        isTotal: false,
        support: `${Math.round((rejected / total) * 100)}% of all applications`,
      },
      {
        label: 'Total Applications',
        value: String(rows.length),
        icon: 'logs',
        tone: 'info',
        illustration: 'applications',
        pct: 100,
        isTotal: true,
        support: 'Under Review · Approved · Rejected',
        bars: [under, approved, rejected],
      },
    ];
  });

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<'All' | AppStatus>('All');
  /** Stores a real Business.id — canonical, never matched by applicant name. */
  protected readonly businessFilter = signal<'All' | string>('All');

  protected readonly businessOptions = computed(() =>
    [...this.store.businesses()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  protected readonly activeFilterCount = computed(
    () => (this.statusFilter() === 'All' ? 0 : 1) + (this.businessFilter() === 'All' ? 0 : 1),
  );

  protected clearFilters(): void {
    this.statusFilter.set('All');
    this.businessFilter.set('All');
  }

  protected readonly filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const businessId = this.businessFilter();
    return this.rows().filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (businessId !== 'All' && r.businessId !== businessId) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term) ||
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

  protected readonly view = signal<View>('list');
  protected readonly detailTab = signal<DetailTab>('timeline');
  protected readonly openSection = signal<InfoSection | null>('meta');
  protected readonly selectedRow = signal<AppRow | null>(null);
  protected readonly selectedEval = signal<EvalKey | null>(null);
  protected readonly newMessage = signal('');
  protected readonly previewItem = signal<PreviewDoc | null>(null);

  protected readonly qrCells = buildQrCells();

  protected readonly selectedDetail = computed<AppDetail | null>(() => {
    const row = this.selectedRow();
    if (!row) return null;
    return buildDetailFor(
      row,
      this.store.getApplicant(row.applicantId),
      this.store.getBusiness(row.businessId),
    );
  });

  // ---- Permit Result tab -------------------------------------------------
  // Every value here is read straight from the store's own permit/release
  // records — never a placeholder string — so this tab shows the ACTUAL
  // result of the process (or an honest "not yet generated" state) rather
  // than sample/lorem-ipsum content once a real result exists.

  protected readonly permitResult = computed(() => {
    const row = this.selectedRow();
    return row ? (this.store.getPermit(row.id) ?? null) : null;
  });

  protected readonly releaseResult = computed(() => {
    const row = this.selectedRow();
    return row ? (this.store.getRelease(row.id) ?? null) : null;
  });

  protected readonly finalDocumentName = computed(() => {
    const row = this.selectedRow();
    return row ? requirementsFor(row.permitType).finalDocument : '';
  });

  protected readonly canAssessFee = computed(() => {
    const row = this.selectedRow();
    const role = this.session.role();
    return (
      !!row &&
      !!role &&
      ACTION_PERMISSIONS.assessFee(role) &&
      row.lifecycleStatus === 'Under Evaluation' &&
      row.assessedAmountCentavos === null
    );
  });

  protected readonly canGeneratePermit = computed(() => {
    const row = this.selectedRow();
    const role = this.session.role();
    return (
      !!row &&
      !!role &&
      ACTION_PERMISSIONS.generatePermit(role) &&
      row.lifecycleStatus === 'Approved' &&
      row.paymentStatus === 'Paid' &&
      !this.permitResult()
    );
  });

  protected assessFeeAction(): void {
    const row = this.selectedRow();
    if (!row || !this.canAssessFee()) return;
    this.store.assessFee(
      row.id,
      this.session.name() || 'Staff',
      this.session.role() ?? 'Administrator',
    );
    this.selectedRow.set(this.store.getById(row.id) ?? row);
  }

  protected generatePermitAction(): void {
    const row = this.selectedRow();
    if (!row || !this.canGeneratePermit()) return;
    this.store.generatePermit(
      row.id,
      this.session.name() || 'Staff',
      this.session.role() ?? 'Administrator',
    );
    this.selectedRow.set(this.store.getById(row.id) ?? row);
  }

  // ---- Sample document preview (application form / permit / etc.) -----

  protected readonly showDocPreview = signal(false);
  protected readonly docPreviewKind = signal<SampleDocumentKind>('permit');

  // ---- Contact verification (manual administrator confirmation only) ----
  // The only verification path this frontend-only mock can honestly
  // perform — see ApplicationStore.setContactVerification's own doc
  // comment. Never displays "email sent"/"OTP sent"; this is a plain
  // administrator action with its own audit trail entry.

  protected verifyContact(
    channel: 'email' | 'mobile',
    outcome: 'Verified' | 'Verification Failed',
  ): void {
    const row = this.selectedRow();
    if (!row || !this.canVerifyContact()) return;
    this.store.setContactVerification(
      row.applicantId,
      channel,
      outcome,
      'Manual Administrator Confirmation',
      this.session.name() || 'Administrator',
    );
    // Force selectedDetail() to recompute against the freshly updated applicant record.
    this.selectedRow.set({ ...row });
  }

  protected openDocumentPreviewModal(kind: SampleDocumentKind): void {
    this.docPreviewKind.set(kind);
    this.showDocPreview.set(true);
  }

  protected closeDocumentPreviewModal(): void {
    this.showDocPreview.set(false);
  }

  protected readonly activeEvalDetail = computed(() => {
    const key = this.selectedEval();
    return key ? this.evalDetails()[key] : null;
  });

  openDetail(row: AppRow): void {
    this.router.navigateByUrl(`/applications/${row.id}`);
  }

  selectDetailTab(tab: DetailTab): void {
    this.detailTab.set(tab);
  }

  backToList(): void {
    this.router.navigateByUrl('/applications');
  }

  openInfo(): void {
    this.view.set('info');
  }

  backFromInfo(): void {
    this.view.set('detail');
  }

  toggleSection(section: InfoSection): void {
    this.openSection.update((current) => (current === section ? null : section));
  }

  openEvaluations(): void {
    this.view.set('evaluations');
  }

  backFromEvaluations(): void {
    this.view.set('detail');
  }

  openEvalDetail(key: EvalKey): void {
    this.selectedEval.set(key);
    this.view.set('evaluation-detail');
  }

  backFromEvalDetail(): void {
    this.view.set('evaluations');
  }

  openDocPreview(item: ChecklistItem): void {
    if (!item.filename) return;
    this.previewItem.set({ label: item.label, filename: item.filename, status: item.status });
  }

  closeDocPreview(): void {
    this.previewItem.set(null);
  }

  protected downloadPreviewDoc(): void {
    const doc = this.previewItem();
    if (!doc) return;
    downloadCsv(`document-${doc.label.replace(/\s+/g, '-').toLowerCase()}`, [
      { Document: doc.label, File: doc.filename, Status: doc.status },
    ]);
  }

  // ---- Row status mutation --------------------------------------------
  // Routed through the store's validated `transitionStatus` rather than
  // forcing a coarse status directly — a coarse target that isn't a legal
  // transition from the row's real lifecycle status is a no-op instead of
  // an arbitrary jump. Rejection requires a remark (the eval-message
  // field doubles as that here since this quick menu has no dedicated
  // remarks prompt of its own).
  private updateRowStatus(id: string, status: AppStatus): void {
    const actor = this.session.name() || 'Staff';
    const role = this.session.role() ?? 'Administrator';
    const remarks = this.evalMessage().trim() || undefined;
    const target: ApplicationLifecycleStatus =
      status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Under Evaluation';
    this.store.transitionStatus(id, target, actor, role, remarks);
    const current = this.selectedRow();
    if (current && current.id === id) {
      const refreshed = this.store.getById(id);
      if (refreshed) this.selectedRow.set(refreshed);
    }
  }

  // ---- Selection + delete ---------------------------------------------

  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly deleteTarget = signal<AppRow | 'bulk' | null>(null);

  protected isSelected(row: AppRow): boolean {
    return this.selectedIds().has(row.id);
  }

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.filteredRows();
    return visible.length > 0 && visible.every((row) => this.selectedIds().has(row.id));
  });

  protected toggleRowSelected(row: AppRow): void {
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

  protected requestDelete(row: AppRow): void {
    this.deleteTarget.set(row);
  }

  protected requestDeleteSelected(): void {
    this.deleteTarget.set('bulk');
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected readonly deleteDialogMessage = computed(() => {
    const target = this.deleteTarget();
    if (target === 'bulk') {
      const n = this.selectedIds().size;
      return `This will remove ${n} selected application${n === 1 ? '' : 's'}.`;
    }
    if (target) return `This will remove ${target.applicant}'s application (${target.id}).`;
    return '';
  });

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const idsToRemove = target === 'bulk' ? this.selectedIds() : new Set([target.id]);
    // No hard deletion of submitted applications — this moves them to the
    // terminal Cancelled status instead (still visible, filterable, and
    // auditable) rather than removing them from the store.
    this.store.archive(
      idsToRemove,
      this.session.name() || 'Staff',
      this.session.role() ?? 'Administrator',
    );
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const id of idsToRemove) next.delete(id);
      return next;
    });
    if (target !== 'bulk' && this.selectedRow()?.id === target.id) {
      this.backToList();
    }
    this.deleteTarget.set(null);
  }

  // ---- Export -------------------------------------------------------------

  private appCsvRow(row: AppRow) {
    return {
      'Application ID': row.id,
      Applicant: row.applicant,
      'Business ID': row.businessId,
      'Business / Project': row.businessName,
      Location: row.location,
      Type: row.type,
      'Date Submitted': row.dateSubmitted,
      Officer: row.officer,
      Status: row.status,
    };
  }

  protected exportVisible(): void {
    downloadCsv(
      'applications',
      this.filteredRows().map((row) => this.appCsvRow(row)),
    );
  }

  protected exportDetail(): void {
    const row = this.selectedRow();
    if (!row) return;
    downloadCsv(`application-${row.id}`, [this.appCsvRow(row)]);
  }

  protected exportEvalSummary(): void {
    const row = this.selectedRow();
    downloadCsv(
      `evaluations-${row?.id ?? 'summary'}`,
      this.evalCards().map((c) => ({
        Evaluation: c.title,
        Status: c.statusLabel,
        Documents: c.documents,
        Comments: c.comments,
        'Progress %': c.progressPct,
      })),
    );
  }

  protected exportChecklist(): void {
    const cfg = this.activeEvalDetail();
    if (!cfg) return;
    downloadCsv(
      `checklist-${cfg.title.replace(/\s+/g, '-').toLowerCase()}`,
      cfg.checklist.map((item) => ({
        Document: item.label,
        File: item.filename,
        Status: item.status,
      })),
    );
  }

  // ---- Add application (full walk-in intake wizard) --------------------
  // Gated by `canCreate` (see the "+ Application" button in the template)
  // — an assisted/onsite filing entry point rather than the previously
  // open-to-everyone "Create Application" action. The actual form lives
  // in shared/application-intake (ApplicationIntake) so its 5-section
  // wizard isn't crammed into this already-large template; this page only
  // owns whether it's open and what happens once a record comes back.

  protected readonly showIntake = signal(false);

  protected openCreate(): void {
    if (!this.canCreate()) return;
    this.showIntake.set(true);
  }

  protected cancelCreate(): void {
    this.showIntake.set(false);
  }

  protected onIntakeCreated(record: ApplicationRecord): void {
    this.showIntake.set(false);
    this.router.navigateByUrl(`/applications/${record.id}`);
  }

  // ---- Detail-header "Action" (status) menu ----------------------------

  protected readonly actionMenuOpen = signal(false);

  protected toggleActionMenu(): void {
    this.actionMenuOpen.update((v) => !v);
  }

  protected closeActionMenu(): void {
    this.actionMenuOpen.set(false);
  }

  protected setStatus(status: AppStatus): void {
    const row = this.selectedRow();
    if (row) this.updateRowStatus(row.id, status);
    this.closeActionMenu();
  }

  // ---- Detail/info/evaluations header "more" menu ----------------------

  protected readonly moreMenuOpen = signal(false);

  protected toggleMoreMenu(): void {
    this.moreMenuOpen.update((v) => !v);
  }

  protected closeMoreMenu(): void {
    this.moreMenuOpen.set(false);
  }

  protected deleteFromDetail(): void {
    const row = this.selectedRow();
    if (row) this.requestDelete(row);
    this.closeMoreMenu();
  }

  // ---- Info view: Send Notification + Edit Profile ---------------------

  protected readonly showNotifyModal = signal(false);
  protected readonly notifyMessage = signal('');

  protected openNotify(): void {
    this.notifyMessage.set('');
    this.showNotifyModal.set(true);
  }

  protected cancelNotify(): void {
    this.showNotifyModal.set(false);
  }

  protected sendNotify(): void {
    const text = this.notifyMessage().trim();
    if (!text) return;
    this.comments.update((list) => [
      ...list,
      { author: 'System Notification', timeAgo: 'just now', text, depth: 0 },
    ]);
    this.showNotifyModal.set(false);
  }

  protected readonly editingProfile = signal(false);
  protected profileEditCity = '';
  protected profileEditOfficer = '';

  protected startEditProfile(): void {
    const row = this.selectedRow();
    if (!row) return;
    this.profileEditCity = row.location;
    this.profileEditOfficer = row.officer;
    this.editingProfile.set(true);
  }

  protected cancelEditProfile(): void {
    this.editingProfile.set(false);
  }

  protected saveEditProfile(): void {
    const row = this.selectedRow();
    if (!row) return;
    const location = this.profileEditCity.trim() || row.location;
    const officer = this.profileEditOfficer.trim() || row.officer;
    this.store.updateFields(row.id, { location, officer });
    this.selectedRow.set({ ...row, location, officer });
    this.editingProfile.set(false);
  }

  // ---- Documents tab ----------------------------------------------------
  // Reads the REAL per-application document checklist (ApplicationStore +
  // the permit type's own requirements-catalog entry) instead of the old
  // module-shared mock DOCUMENTS array — every row here is a real
  // ApplicationDocument, its required/optional flag and reviewing
  // department come from requirements-catalog.ts, and a required
  // requirement with no uploaded row yet shows up as a synthetic "Missing"
  // row rather than silently not appearing.

  protected readonly documentRows = computed<DocumentRow[]>(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const requirements = requirementsFor(row.permitType).documents;
    const stored = this.store.getDocuments(row.id);
    const byRequirement = new Map(stored.map((d) => [d.requirementId, d]));
    return requirements.map((req): DocumentRow => {
      const doc = byRequirement.get(req.id) ?? null;
      return {
        requirementId: req.id,
        label: req.label,
        required: req.required,
        departmentName: departmentName(req.reviewingDepartmentId),
        doc,
      };
    });
  });

  protected readonly missingRequiredCount = computed(
    () => this.documentRows().filter((r) => r.required && !r.doc).length,
  );

  /** The requirements catalog's own source citations for the open application's permit type — surfaced so "reference data pending confirmation" is a visible, sourced fact in the UI, not just a code comment. */
  protected readonly requirementSources = computed(() => {
    const row = this.selectedRow();
    return row ? requirementsFor(row.permitType).sources : [];
  });

  protected readonly docSelectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly docActionMenuOpen = signal(false);

  protected isDocSelected(r: DocumentRow): boolean {
    return this.docSelectedIds().has(r.requirementId);
  }

  protected readonly allDocsSelected = computed(() => {
    const rows = this.documentRows().filter((r) => r.doc);
    return rows.length > 0 && rows.every((r) => this.docSelectedIds().has(r.requirementId));
  });

  protected toggleDocSelected(r: DocumentRow): void {
    this.docSelectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(r.requirementId)) next.delete(r.requirementId);
      else next.add(r.requirementId);
      return next;
    });
  }

  protected toggleSelectAllDocs(): void {
    const allSelected = this.allDocsSelected();
    this.docSelectedIds.update((current) => {
      const next = new Set(current);
      for (const r of this.documentRows()) {
        if (!r.doc) continue;
        if (allSelected) next.delete(r.requirementId);
        else next.add(r.requirementId);
      }
      return next;
    });
  }

  protected toggleDocActionMenu(): void {
    this.docActionMenuOpen.update((v) => !v);
  }

  protected closeDocActionMenu(): void {
    this.docActionMenuOpen.set(false);
  }

  protected exportSelectedDocs(): void {
    const ids = this.docSelectedIds();
    const all = this.documentRows();
    const selected = all.filter((r) => ids.has(r.requirementId));
    downloadCsv(
      'documents',
      (selected.length > 0 ? selected : all).map((r) => ({
        Document: r.label,
        Required: r.required ? 'Required' : 'Optional',
        'Reviewing Department': r.departmentName,
        File: r.doc?.fileName ?? '—',
        'Uploaded Date': r.doc?.uploadedAt ?? '—',
        Status: r.doc?.status ?? 'Missing',
      })),
    );
    this.closeDocActionMenu();
  }

  protected markSelectedDocsAccepted(): void {
    const row = this.selectedRow();
    const ids = this.docSelectedIds();
    if (!row || ids.size === 0) {
      this.closeDocActionMenu();
      return;
    }
    const actor = this.session.name() || 'Staff';
    for (const r of this.documentRows()) {
      if (r.doc && ids.has(r.requirementId)) {
        this.store.setDocumentStatus(row.id, r.doc.id, 'Accepted', actor);
      }
    }
    this.docSelectedIds.set(new Set());
    this.closeDocActionMenu();
  }

  protected readonly docRemarksDraft = signal('');

  protected setDocStatus(r: DocumentRow, status: DocumentStatus): void {
    const row = this.selectedRow();
    if (!row || !r.doc) return;
    const actor = this.session.name() || 'Staff';
    const needsRemarks = status === 'Rejected' || status === 'Revision Required';
    const remarks = needsRemarks
      ? this.docRemarksDraft().trim() || r.doc.remarks || undefined
      : undefined;
    if (needsRemarks && !remarks) return;
    this.store.setDocumentStatus(row.id, r.doc.id, status, actor, remarks);
    this.docRemarksDraft.set('');
  }

  /** Attaches a first file for a still-Missing required/optional document (no ApplicationDocument row exists yet). */
  protected attachDocumentFile(r: DocumentRow, event: Event): void {
    const row = this.selectedRow();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!row || !file) return;
    this.store.attachDocument(
      row.id,
      r.requirementId,
      r.label,
      file.name,
      this.session.name() || 'Staff',
    );
    input.value = '';
  }

  /** Resubmits over an existing Rejected/Revision Required/Expired document — the store appends the replaced file to `history` rather than discarding it. */
  protected resubmitDocumentFile(r: DocumentRow, event: Event): void {
    const row = this.selectedRow();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!row || !r.doc || !file) return;
    this.store.resubmitDocument(row.id, r.doc.id, file.name, this.session.name() || 'Staff');
    input.value = '';
  }

  protected previewDocumentRow(r: DocumentRow): void {
    if (!r.doc) return;
    this.previewItem.set({ label: r.label, filename: r.doc.fileName, status: r.doc.status });
  }

  // ---- Comments tab -------------------------------------------------------

  protected readonly replyTarget = signal<CommentItem | null>(null);
  protected readonly editingComment = signal<CommentItem | null>(null);
  protected readonly editingText = signal('');

  protected startReply(c: CommentItem): void {
    this.replyTarget.set(c);
  }

  protected cancelReply(): void {
    this.replyTarget.set(null);
  }

  protected startEdit(c: CommentItem): void {
    this.editingComment.set(c);
    this.editingText.set(c.text);
  }

  protected cancelEdit(): void {
    this.editingComment.set(null);
    this.editingText.set('');
  }

  protected saveEdit(): void {
    const target = this.editingComment();
    const text = this.editingText().trim();
    if (!target || !text) return;
    this.comments.update((list) => list.map((c) => (c === target ? { ...c, text } : c)));
    this.cancelEdit();
  }

  protected sendComment(): void {
    const text = this.newMessage().trim();
    if (!text) return;
    const target = this.replyTarget();
    const depth = target ? (Math.min(target.depth + 1, 2) as 0 | 1 | 2) : 0;
    this.comments.update((list) => [
      ...list,
      { author: 'Engr. Ricardo Buenaflor', timeAgo: 'just now', text, depth },
    ]);
    this.newMessage.set('');
    this.replyTarget.set(null);
  }

  // ---- Timeline tab -------------------------------------------------------

  protected exportTimelineEntry(t: TimelineItem): void {
    downloadCsv(`timeline-entry-${t.num}`, [
      { Event: t.event, Date: t.date, Time: t.time, Detail: t.detail },
    ]);
  }

  // ---- Zoning map popup ---------------------------------------------------

  protected viewPropertyDocuments(): void {
    this.detailTab.set('documents');
    this.view.set('detail');
  }

  // ---- Evaluation checklist item quick-actions -----------------------

  protected readonly checklistMenuFor = signal<string | null>(null);

  protected toggleChecklistMenu(item: ChecklistItem): void {
    this.checklistMenuFor.update((current) => (current === item.label ? null : item.label));
  }

  protected closeChecklistMenu(): void {
    this.checklistMenuFor.set(null);
  }

  protected setChecklistStatus(item: ChecklistItem, status: ChecklistItem['status']): void {
    const key = this.selectedEval();
    if (!key) return;
    this.evalDetails.update((details) => {
      const cfg = details[key];
      const checklist = cfg.checklist.map((ci) =>
        ci.label === item.label ? { ...ci, status, checked: status === 'Approved' } : ci,
      );
      return { ...details, [key]: { ...cfg, checklist } };
    });
    this.closeChecklistMenu();
  }

  // ---- Evaluation workflow action row -----------------------------------

  protected readonly evalMessage = signal('');

  protected sendMessageToApplicant(): void {
    const text = this.evalMessage().trim();
    if (!text) return;
    const key = this.selectedEval();
    const cfg = key ? this.evalDetails()[key] : null;
    this.comments.update((list) => [
      ...list,
      {
        author: cfg?.title ? `${cfg.title} Reviewer` : 'Evaluator',
        timeAgo: 'just now',
        text,
        depth: 0,
      },
    ]);
    this.evalMessage.set('');
  }

  protected forwardEval(): void {
    const key = this.selectedEval();
    if (!key) return;
    const row = this.selectedRow();
    const actor = this.session.name() || 'Staff';
    if (row) {
      this.store.recordEvaluation(row.id, EVAL_KEY_TO_STAGE[key], 'Passed', actor);
    }
    this.evalCards.update((cards) =>
      cards.map((c) =>
        c.key === key
          ? { ...c, statusLabel: 'Completed', statusTone: 'good', progressPct: 100 }
          : c,
      ),
    );
    const idx = EVAL_ORDER.indexOf(key);
    const next = EVAL_ORDER[idx + 1];
    if (next) {
      this.selectedEval.set(next);
      return;
    }
    this.selectedEval.set(null);
    this.backToList();
  }

  // Revision/rejection require a remark — `evalMessage` (the same field
  // "Send Message to Applicant" uses) is required non-empty here; if the
  // reviewer hasn't typed one, the store call fails and nothing changes.
  protected returnForRevisionEval(): void {
    const key = this.selectedEval();
    const row = this.selectedRow();
    if (!key || !row) return;
    const actor = this.session.name() || 'Staff';
    const remarks = this.evalMessage().trim();
    if (!remarks) return;
    const ok = this.store.recordEvaluation(
      row.id,
      EVAL_KEY_TO_STAGE[key],
      'Revision Required',
      actor,
      remarks,
    );
    if (!ok) return;
    this.evalCards.update((cards) =>
      cards.map((c) =>
        c.key === key ? { ...c, statusLabel: 'Revision Needed', statusTone: 'progress' } : c,
      ),
    );
    this.evalMessage.set('');
    this.selectedEval.set(null);
    this.view.set('evaluations');
  }

  protected rejectEval(): void {
    const key = this.selectedEval();
    const row = this.selectedRow();
    if (!row) return;
    const actor = this.session.name() || 'Staff';
    const remarks = this.evalMessage().trim();
    if (!remarks) return;
    const stage = key ? EVAL_KEY_TO_STAGE[key] : row.evaluationStage;
    const ok = this.store.recordEvaluation(row.id, stage, 'Rejected', actor, remarks);
    if (!ok) return;
    this.evalMessage.set('');
    this.selectedEval.set(null);
    this.backToList();
  }
}
