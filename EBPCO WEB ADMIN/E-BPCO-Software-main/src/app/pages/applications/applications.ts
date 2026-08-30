import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
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
import { ToastService } from '../../shared/toast/toast.service';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import {
  ApplicationLifecycleStatus,
  LIFECYCLE_SEQUENCE,
  canTransition,
} from '../../core/domain/status.model';
import { AuditEvent } from '../../core/domain/audit.model';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ApplicationIntake } from '../../shared/application-intake/application-intake';
import {
  DocumentPreview,
  SampleDocumentKind,
} from '../../shared/document-preview/document-preview';
import {
  ApplicationDocument,
  DocumentStatus,
  UNRESOLVED_DOCUMENT_STATUSES,
} from '../../core/domain/document.model';
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
} from './applications-data';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';

/** One row of the real per-application Documents tab — a required-but-not-yet-uploaded requirement has `doc: null` and renders as "Missing". */
interface DocumentRow {
  requirementId: string;
  label: string;
  required: boolean;
  departmentName: string;
  doc: ApplicationDocument | null;
}

type View = 'list' | 'detail' | 'info' | 'not-found';
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

interface LifecycleStep {
  status: ApplicationLifecycleStatus;
  isPast: boolean;
  isCurrent: boolean;
}

const STATUS_OPTIONS: AppStatus[] = ['Approved', 'Under Review', 'Rejected'];

/**
 * Real next-step actions for the detail page's "Action" menu, covering the
 * full VALID_TRANSITIONS chain (status.model.ts) rather than the old
 * coarse-status-driven menu, which could only ever target 'Approved',
 * 'Rejected', or a hardcoded 'Under Evaluation' — the latter silently
 * no-op'd from every status before Document Verification. Each entry is
 * only offered when canTransition(row.lifecycleStatus, target) is true
 * (see availableStatusActions) — but that alone isn't sufficient for
 * 'Approved': `transitionStatus` also enforces `canApprove()` (every
 * required document must be Accepted) and there was previously no role
 * gate on this menu at all, so "Mark Approved" could be shown (and
 * clicked, silently no-op'ing) for an application with unresolved
 * documents, by any role that could open the page. `availableStatusActions`
 * now filters 'Approved' by both `canApprove()` and
 * `ACTION_PERMISSIONS.approveApplication`, so an illegal/unauthorized
 * action is never shown rather than shown-and-then-silently-failing.
 */
const STATUS_ACTIONS: { label: string; target: ApplicationLifecycleStatus }[] = [
  { label: 'Mark Received', target: 'Received' },
  { label: 'Verify Documents', target: 'Document Verification' },
  { label: 'Send to Evaluation', target: 'Under Evaluation' },
  { label: 'Mark Approved', target: 'Approved' },
  { label: 'Mark Rejected', target: 'Rejected' },
];

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
    OverlayModule,
  ],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications {
  private readonly store = inject(ApplicationStore);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly queue = inject(StaffApplicationsApi);

  /** Null until the first fetch resolves; a message when it fails. */
  protected readonly loadError = signal<string | null>(null);
  protected readonly loading = signal(true);

  /**
   * The first screen in this portal that renders server bytes.
   *
   * The store is populated rather than the component holding its own copy,
   * because every derived count, filter and detail lookup on this page already
   * reads the store — pointing the component at a second list would leave the
   * table showing the server's rows and the counters showing the seed's.
   */
  /**
   * Owner ruling, 29 Aug 2026: a failed load CLEARS the rows.
   *
   * This used to leave the seeded rows on screen, on the reasoning that
   * blanking the table claims "the LGU has no applications". But the error it
   * was supposed to sit behind was never rendered — `loadError` was set and no
   * template read it — so the real behaviour was a queue of applications that
   * do not exist, shown with no warning at all.
   *
   * "We could not ask" and "there is nothing there" are different claims, and
   * the officer now sees the first one explicitly rather than the second one
   * silently. This is ADR 0001's rule, restated.
   */
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const page = await this.queue.page({ limit: 100 });
      this.store.replaceApplications(page.rows);
    } catch (error) {
      this.store.replaceApplications([]);
      this.loadError.set(error instanceof Error ? error.message : 'The queue could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }

  private readonly loaded = this.load();
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
  /**
   * The real position of the selected application within the "happy path"
   * LIFECYCLE_SEQUENCE — replaces the old static "Current Step"/canned
   * timeline text, which always showed the coarse Approved/Under
   * Review/Rejected status regardless of the row's real lifecycleStatus.
   * When the row is on an off-path status (Revision Required/Rejected/
   * Cancelled/Expired), no step is marked current — offSequenceStatus
   * below carries that instead.
   */
  protected readonly lifecycleStepper = computed<LifecycleStep[]>(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const idx = LIFECYCLE_SEQUENCE.indexOf(row.lifecycleStatus);
    return LIFECYCLE_SEQUENCE.map((status, i) => ({
      status,
      isPast: idx !== -1 && i < idx,
      isCurrent: status === row.lifecycleStatus,
    }));
  });
  protected readonly offSequenceStatus = computed<ApplicationLifecycleStatus | null>(() => {
    const row = this.selectedRow();
    if (!row) return null;
    return (LIFECYCLE_SEQUENCE as ApplicationLifecycleStatus[]).includes(row.lifecycleStatus)
      ? null
      : row.lifecycleStatus;
  });
  /** Real per-application audit trail (ApplicationStore.getAuditTrail), most-recent-first — replaces the shared static TIMELINE mock rows. */
  protected readonly realTimeline = computed<TimelineItem[]>(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const events = this.store.getAuditTrail(row.id);
    return events
      .map((e: AuditEvent, i: number) => {
        const [date, time] = e.timestamp.split(',').map((s) => s.trim());
        return {
          num: String(i + 1).padStart(2, '0'),
          event: e.action,
          date: date ?? e.timestamp,
          time: time ?? '',
          detail: e.remarks ? `${e.remarks} — ${e.actor} (${e.role})` : `${e.actor} (${e.role})`,
        };
      })
      .reverse();
  });
  /** Days since the row's lifecycleStatus last changed, per its own audit trail — replaces the static "2 Days" placeholder. */
  protected readonly daysInCurrentStep = computed<number>(() => {
    const row = this.selectedRow();
    if (!row) return 0;
    const events = this.store.getAuditTrail(row.id);
    const lastStatusChange = [...events]
      .reverse()
      .find((e) => e.action === `Status changed to ${row.lifecycleStatus}`);
    const since = lastStatusChange?.timestampValue ?? row.dateValue;
    return Math.max(0, Math.floor((Date.now() - since.getTime()) / 86_400_000));
  });
  /** Days since the application was first submitted — replaces the static "9 Days" placeholder. */
  protected readonly totalElapsedDays = computed<number>(() => {
    const row = this.selectedRow();
    if (!row) return 0;
    return Math.max(0, Math.floor((Date.now() - row.dateValue.getTime()) / 86_400_000));
  });
  protected readonly statusOptions = STATUS_OPTIONS;
  /** Detail page's "Action" menu — only the legal, currently-eligible, and role-authorized next steps from the selected row's real lifecycleStatus, per STATUS_ACTIONS above. */
  protected readonly availableStatusActions = computed(() => {
    const row = this.selectedRow();
    const role = this.session.role();
    if (!row) return [];
    return STATUS_ACTIONS.filter((a) => {
      if (!canTransition(row.lifecycleStatus, a.target)) return false;
      if (a.target === 'Approved') {
        if (!this.store.canApprove(row.id)) return false;
        if (!role || !ACTION_PERMISSIONS.approveApplication(role)) return false;
      }
      return true;
    });
  });

  /**
   * Mirrors `ApplicationStore.canApprove()`'s own rule (every required
   * document must be Accepted — payment/lifecycle status plays no part in
   * it) so the UI can name WHICH documents are still blocking approval,
   * instead of "Mark Approved" just silently disappearing from the Action
   * menu with no explanation. That's confusing precisely when it matters
   * most — an application can legitimately reach 'For Approval' with a
   * fully paid, verified assessment while a document requirement is still
   * unresolved (nothing earlier in the pipeline re-checks documents), so
   * "payment says Paid" and "documents aren't all Accepted yet" are two
   * genuinely independent facts admins need to see are different.
   */
  protected readonly approvalBlockingDocs = computed(() =>
    this.documentRows().filter(
      (r) => r.required && (!r.doc || UNRESOLVED_DOCUMENT_STATUSES.has(r.doc.status)),
    ),
  );

  protected readonly approvalBlockedByDocs = computed(() => {
    const row = this.selectedRow();
    if (!row) return false;
    if (!canTransition(row.lifecycleStatus, 'Approved')) return false;
    const role = this.session.role();
    if (!role || !ACTION_PERMISSIONS.approveApplication(role)) return false;
    return this.approvalBlockingDocs().length > 0;
  });

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

  protected readonly view = signal<View>('list');
  protected readonly detailTab = signal<DetailTab>('timeline');
  protected readonly openSection = signal<InfoSection | null>('meta');
  protected readonly selectedRow = signal<AppRow | null>(null);
  protected readonly newMessage = signal('');
  protected readonly previewItem = signal<PreviewDoc | null>(null);

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
    if (!row || !this.canAssessFee()) {
      this.toast.error("Can't assess a fee for this application in its current state.");
      return;
    }
    const ok = this.store.assessFee(
      row.id,
      this.session.name() || 'Staff',
      this.session.role() ?? 'Administrator',
    );
    if (ok) this.toast.success('Fee assessment drafted.');
    else this.toast.error("Couldn't draft a fee assessment for this application.");
    this.selectedRow.set(this.store.getById(row.id) ?? row);
  }

  protected generatePermitAction(): void {
    const row = this.selectedRow();
    if (!row || !this.canGeneratePermit()) {
      this.toast.error("Can't generate a permit yet — the application must be Approved and fully paid.");
      return;
    }
    const ok = this.store.generatePermit(
      row.id,
      this.session.name() || 'Staff',
      this.session.role() ?? 'Administrator',
    );
    if (ok) this.toast.success(`${this.finalDocumentName()} generated.`);
    else this.toast.error("Couldn't generate the permit for this application.");
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
    if (!row || !this.canVerifyContact()) {
      this.toast.error("You don't have permission to verify this contact.");
      return;
    }
    this.store.setContactVerification(
      row.applicantId,
      channel,
      outcome,
      'Manual Administrator Confirmation',
      this.session.name() || 'Administrator',
    );
    this.toast.success(
      `${channel === 'email' ? 'Email' : 'Mobile number'} marked "${outcome}".`,
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

  /** The rich per-application evaluation review screen now lives on the standalone Evaluations page (real documents/stepper/timeline, not this page's old mock EVAL_CARDS/EVAL_DETAILS) — this just links straight to that application's real record there. */
  openEvaluations(): void {
    const row = this.selectedRow();
    if (!row) return;
    this.router.navigateByUrl(`/evaluations?applicationId=${row.id}`);
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
    this.toast.success('Downloaded.');
  }

  // ---- Row status mutation --------------------------------------------
  // Routed through the store's validated `transitionStatus`, targeting the
  // real ApplicationLifecycleStatus directly (see STATUS_ACTIONS/
  // availableStatusActions above) rather than the old coarse-status
  // indirection that could only ever reach 'Approved'/'Rejected' or a
  // hardcoded 'Under Evaluation' — the menu now only offers legal next
  // steps in the first place, so this is normally a straight pass-through;
  // the boolean return is still checked and surfaced via `quickActionError`
  // as a defense-in-depth backstop (see its own doc comment).
  private updateRowStatus(
    id: string,
    target: ApplicationLifecycleStatus,
    remarks?: string,
  ): void {
    this.quickActionError.set(null);
    const actor = this.session.name() || 'Staff';
    const role = this.session.role() ?? 'Administrator';
    const ok = this.store.transitionStatus(id, target, actor, role, remarks);
    if (!ok) {
      const message = `Couldn't move this application to "${target}" — it no longer meets the requirements for that step (re-check its documents/role access and try again).`;
      this.quickActionError.set(message);
      this.toast.error(message);
      return;
    }
    this.toast.success(`Status updated to "${target}".`);
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
    this.toast.success(
      idsToRemove.size === 1
        ? 'Application moved to Cancelled.'
        : `${idsToRemove.size} applications moved to Cancelled.`,
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
    const rows = this.filteredRows();
    downloadCsv(
      'applications',
      rows.map((row) => this.appCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} application${rows.length === 1 ? '' : 's'}.`);
  }

  protected exportDetail(): void {
    const row = this.selectedRow();
    if (!row) return;
    downloadCsv(`application-${row.id}`, [this.appCsvRow(row)]);
    this.toast.success('Exported.');
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
  // Rendered via CDK Overlay, not the shared in-flow `.menu-panel` — the
  // plain absolutely-positioned panel could render clipped by/overlapping
  // unrelated page content depending on which ancestor happened to
  // establish the ancestor stacking/positioning context in each of the
  // views this header appears in (detail/evaluations/evaluation-detail/
  // info). The overlay renders into its own top-level container instead,
  // so it always floats above everything. Shared by both the "Action" and
  // "more" header menus below across all 4 views they appear in — mirrors
  // `checklistMenuPositions` above.

  protected readonly headerMenuPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
  ];

  protected readonly actionMenuOpen = signal(false);

  protected toggleActionMenu(): void {
    this.actionMenuOpen.update((v) => !v);
  }

  protected closeActionMenu(): void {
    this.actionMenuOpen.set(false);
  }

  /** cdkConnectedOverlay only emits keydown events while the overlay is open — Escape is the one key it doesn't already close on by itself. */
  protected onActionMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeActionMenu();
  }

  /**
   * 'Rejected' requires a remark — `transitionStatus` refuses it without
   * one. This used to silently fall back to reusing an unrelated field
   * belonging to a different feature, which was usually empty or (worse)
   * could hold a stale note left over from something else entirely — so a
   * click here would either silently no-op, or silently attach the wrong
   * remark. Now it opens a dedicated, required-field prompt instead.
   */
  protected setStatus(target: ApplicationLifecycleStatus): void {
    const row = this.selectedRow();
    this.closeActionMenu();
    if (!row) return;
    if (target === 'Rejected') {
      this.quickRejectRemarks.set('');
      this.quickRejectTarget.set(row);
      return;
    }
    this.updateRowStatus(row.id, target);
  }

  protected readonly quickRejectTarget = signal<AppRow | null>(null);
  protected readonly quickRejectRemarks = signal('');

  protected confirmQuickReject(): void {
    const row = this.quickRejectTarget();
    const remarks = this.quickRejectRemarks().trim();
    if (!row || !remarks) return;
    this.updateRowStatus(row.id, 'Rejected', remarks);
    this.quickRejectTarget.set(null);
  }

  protected cancelQuickReject(): void {
    this.quickRejectTarget.set(null);
  }

  /** Surfaces a `transitionStatus` refusal that survived past `availableStatusActions`' own filtering (e.g. a role/permission change or a document status edited in another tab between opening the menu and clicking it) — defense in depth, not the primary guard. */
  protected readonly quickActionError = signal<string | null>(null);

  // ---- Detail/info/evaluations header "more" menu ----------------------

  protected readonly moreMenuOpen = signal(false);

  protected toggleMoreMenu(): void {
    this.moreMenuOpen.update((v) => !v);
  }

  protected closeMoreMenu(): void {
    this.moreMenuOpen.set(false);
  }

  /** cdkConnectedOverlay only emits keydown events while the overlay is open — Escape is the one key it doesn't already close on by itself. */
  protected onMoreMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeMoreMenu();
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
    this.toast.success('Profile updated.');
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

  /** cdkConnectedOverlay only emits keydown events while the overlay is open — Escape is the one key it doesn't already close on by itself. */
  protected onDocActionMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeDocActionMenu();
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
    this.toast.success('Exported.');
    this.closeDocActionMenu();
  }

  protected markSelectedDocsAccepted(): void {
    const row = this.selectedRow();
    const ids = this.docSelectedIds();
    if (!row || ids.size === 0) {
      this.toast.error('Select at least one document first.');
      this.closeDocActionMenu();
      return;
    }
    const actor = this.session.name() || 'Staff';
    let count = 0;
    for (const r of this.documentRows()) {
      if (r.doc && ids.has(r.requirementId)) {
        this.store.setDocumentStatus(row.id, r.doc.id, 'Accepted', actor);
        count++;
      }
    }
    this.toast.success(`${count} document${count === 1 ? '' : 's'} marked Accepted.`);
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
    if (needsRemarks && !remarks) {
      this.toast.error(`Add remarks before marking this document "${status}".`);
      return;
    }
    this.store.setDocumentStatus(row.id, r.doc.id, status, actor, remarks);
    this.toast.success(`"${r.label}" marked "${status}".`);
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
    this.toast.success(`"${r.label}" attached.`);
    input.value = '';
  }

  /** Resubmits over an existing Rejected/Revision Required/Expired document — the store appends the replaced file to `history` rather than discarding it. */
  protected resubmitDocumentFile(r: DocumentRow, event: Event): void {
    const row = this.selectedRow();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!row || !r.doc || !file) return;
    this.store.resubmitDocument(row.id, r.doc.id, file.name, this.session.name() || 'Staff');
    this.toast.success(`"${r.label}" resubmitted.`);
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
    this.toast.success('Exported.');
  }

}
