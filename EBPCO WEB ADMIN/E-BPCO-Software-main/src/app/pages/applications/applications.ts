import { Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
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
import { toBase64 } from '../../shared/utils/to-base64';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import {
  ApplicationLifecycleStatus,
  EVALUATION_STAGE_ORDER,
  LIFECYCLE_SEQUENCE,
  canTransition,
  isTerminalStatus,
} from '../../core/domain/status.model';
import { AuditEvent } from '../../core/domain/audit.model';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ApplicationIntake } from '../../shared/application-intake/application-intake';
import {
  DocumentPreview,
  SampleDocumentKind,
} from '../../shared/document-preview/document-preview';
import { GeneratedPermitDocumentModal } from '../../shared/generated-document/generated-permit-document-modal';
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
  CommentItem,
  TIMELINE,
  TimelineItem,
} from './applications-data';
import { ApplicationDetail as RealApplicationDetail, StaffApplicationsApi } from '../../core/api/staff-applications.api';
import { QueueLoader } from '../../core/domain/queue-loader';
import { AssignedFormsNotice } from '../../shared/assigned-forms-notice/assigned-forms-notice';
import { PermitReleaseApi } from '../../core/api/permit-release.api';
import { PermitReleaseSessionCache } from '../../core/domain/permit-release-session-cache';

/** One row of the real per-application Documents tab — a required-but-not-yet-uploaded requirement has `doc: null` and renders as "Missing". */
/**
 * What one checklist row needs to render and act on, real or local-demo
 * alike. `docId`/`isReal` tell `setDocStatus`/`markSelectedDocsAccepted`
 * which API to call: `applicationsApi.reviewDocument` (migration 038) for a
 * document that came from `realDetail()`, `store.setDocumentStatus` (local
 * only) otherwise. `status` here is always the STAFF verdict a reader would
 * mean by "document status" — for a real, not-yet-reviewed document that is
 * 'Uploaded', never the malware scanner's own `status` field, which answers
 * a different question (is this file safe to open) that this screen does
 * not render at all.
 */
interface DocumentRow {
  requirementId: string;
  label: string;
  required: boolean;
  departmentName: string;
  /** `contentType` is only ever known for a real (`isReal`) document — the local demo store never recorded one, since no local-demo document has real bytes to describe. */
  doc: { id: string; fileName: string; status: DocumentStatus; remarks: string | null; uploadedAt: string; contentType?: string } | null;
  isReal: boolean;
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
  /**
   * The citizen's actual file, once fetched from `GET
   * /documents/:id/content`'s signed URL. `null` while a real document's
   * content is still loading, and permanently `null` for a local-demo row,
   * which never had real bytes behind it — the fabricated "sheet" preview
   * remains the honest thing to show there, same reasoning as the User
   * Portal's own `seeded` flag on its preview modal.
   */
  real: { objectUrl: string; safeUrl: SafeResourceUrl; contentType: string } | null;
  /** True only while a real document's content is still being fetched. */
  loading: boolean;
}

interface LifecycleStep {
  status: ApplicationLifecycleStatus;
  isPast: boolean;
  isCurrent: boolean;
}

// The server sends raw ISO timestamps (e.g. "2026-09-17T11:24:32.301Z"). The
// Documents tab's "Uploaded" column rendered that directly, which reads like
// a debug log rather than something written for an officer to read.
function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return iso;
  return `${when.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · `
    + when.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
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
  // Since 2026-09-20 the server makes this hop itself when the Order of
  // Payment is issued (`Under Evaluation -> Assessed` needs exactly
  // `evaluations-complete` + `order-of-payment-issued`, and the Order IS the
  // assessment). Kept as a fallback for the case where that follow-on was
  // refused — `canTransition` only offers it while it is legal, so against
  // an application the server already moved it simply does not appear.
  { label: 'Send to Assessed', target: 'Assessed' },
  // Verifying a payment (`POST /staff/payments/:id/verify`, or an onsite
  // payment) now carries the application through Payment Under Verification
  // and Payment Verified to For Approval on the server. These three stay as
  // fallbacks for a refused follow-on, offered only while legal.
  { label: 'Send to Payment Verification', target: 'Payment Under Verification' },
  { label: 'Mark Payment Verified', target: 'Payment Verified' },
  { label: 'Send to Approval', target: 'For Approval' },
  { label: 'Mark Approved', target: 'Approved' },
  // The real transition table has TWO ways in (`Document Verification ->
  // Revision Required` and `Under Evaluation -> Revision Required`, both
  // `staff:evaluate`, both notifying the applicant) — `canTransition` below
  // already resolves which one applies from the row's own status, same as
  // every other entry here. Before this there was no way for staff to send
  // an application back to the citizen for a fix at all from this menu:
  // only a single DOCUMENT could be marked "Revision Required"
  // (`setDocStatus`), never the application itself, so a genuinely
  // incomplete application had no legal outcome except an outright
  // rejection.
  { label: 'Return for Revision', target: 'Revision Required' },
  { label: 'Mark Rejected', target: 'Rejected' },
];

@Component({
  selector: 'app-applications',
  imports: [AssignedFormsNotice, 
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
    GeneratedPermitDocumentModal,
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
  private readonly loader = inject(QueueLoader);
  private readonly applicationsApi = inject(StaffApplicationsApi);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly permitReleaseApi = inject(PermitReleaseApi);
  private readonly sessionCache = inject(PermitReleaseSessionCache);

  protected formatDateTime = formatDateTime;

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
  /**
   * Reloads through the shared loader.
   *
   * The fetch used to live here, and this was the ONLY page that called the
   * server — which is why every other surface showed seed data (S-1). It now
   * belongs to `QueueLoader`, called once by `AdminLayout` for the whole
   * session; this page keeps a reload for its own refresh control.
   *
   * `loadError` is read from the store rather than tracked separately, so this
   * page and the shared notice can no longer disagree about the same failure.
   */
  protected async load(): Promise<void> {
    this.loading.set(true);
    try {
      await this.loader.reload();
      this.loadError.set(this.store.loadFailure());
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
    // This page is the only one that overwrites the browser tab title with a
    // per-record one (`${applicant} (${id}) — E-BPCO Admin`). Nothing else in
    // the app ever resets it, so navigating away entirely — a different
    // module, or Log Out — left that record's title showing indefinitely on
    // routes that never set their own. Restored to the generic title the
    // moment this component itself goes away, regardless of where to.
    inject(DestroyRef).onDestroy(() => {
      this.titleService.setTitle('E-BPCO Admin');
    });

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
      // Tracked (not inside the untracked() block below): a direct link or a
      // hard reload straight onto /applications/:id constructs this page
      // before QueueLoader's fetch (kicked off by AdminLayout, and again by
      // this page's own `load()`) has resolved — the store below is still
      // holding seed rows or nothing at all. Reading `loader.loaded()` here
      // means this effect re-runs the moment the real queue lands, instead
      // of judging the id against a store that hasn't been asked yet.
      const queueReady = this.loader.loaded();
      // untracked beyond that: only re-run this when the route id itself
      // changes (or the queue finishes loading), not on every unrelated
      // store mutation elsewhere in the app (which would otherwise snap the
      // user back out of Info/Evaluations sub-views any time another page
      // edited some other row).
      untracked(() => {
        this.realDetail.set(null);
        this.comments.set([]);
        if (!id) {
          this.view.set('list');
          this.selectedRow.set(null);
          this.titleService.setTitle('Applications — E-BPCO Admin');
          return;
        }
        const row = this.store.getById(id);
        if (!row) {
          if (!queueReady) {
            // Not "not found" yet — the queue simply hasn't answered. Leave
            // the view as-is (the list branch's own loading spinner covers
            // this) and let this effect re-fire once `queueReady` flips.
            return;
          }
          this.selectedRow.set(null);
          this.view.set('not-found');
          this.titleService.setTitle('Application not found — E-BPCO Admin');
          return;
        }
        this.selectedRow.set(row);
        this.detailTab.set('timeline');
        this.view.set('detail');
        this.titleService.setTitle(`${row.applicant} (${row.id}) — E-BPCO Admin`);
        // Real applicant contact info and the record's own real transition
        // history — neither is on the queue row. Fire-and-forget: the
        // detail view already renders from the queue row and local mock
        // data immediately, this only replaces the fabricated fallbacks
        // once it lands (see `selectedDetail`/`realTimeline`).
        void this.applicationsApi.detail(id).then((result) => {
          if (this.id() !== id) return; // navigated away before this resolved
          if (result.kind === 'ok') this.realDetail.set(result.detail);
        });
        void this.loadComments(id);
        // `row` above can be stale: `this.store` is populated once by
        // `AdminLayout`'s initial `ensureLoaded()` and never refetched again
        // on its own, so a status change made anywhere else — a payment
        // verified from the Payments page, a stage advanced from
        // Evaluations — never reaches this row just by navigating back
        // here. `realDetail`'s own timeline (`realTimeline`) already shows
        // the true latest event because `applicationsApi.detail` above is a
        // fresh per-application fetch; the "Activity Summary"/"Lifecycle
        // Progress" section read `row.lifecycleStatus` instead, which is
        // this queue row, not that fetch — confirmed live: the Audit Trail
        // showed a fresh "Payment Verified" entry while "Currently At" and
        // the stepper still said "Assessed" for the same application in the
        // same render. `reload()` (not `ensureLoaded()`) forces the refetch
        // this row needs to catch up.
        void this.loader.reload().then(() => {
          if (this.id() !== id) return; // navigated away before this resolved
          const fresh = this.store.getById(id);
          if (fresh) this.selectedRow.set(fresh);
        });
      });
    });
  }

  // Full shared pool (Dashboard, Tenant Dashboard, and the Business
  // Stages board read/write the same records) rather than an
  // independently hardcoded 10-row array.
  protected readonly rows = computed(() => this.store.applications());
  /**
   * Real, from `GET /staff/applications/:id/notes` — an internal staff
   * workspace, never shown to the applicant. Used to be one signal seeded
   * once with the shared mock `COMMENTS` array (removed), so every
   * application showed the exact same canned conversation, including a
   * brand-new application seconds old with a full "thread" that could not
   * possibly be its own; then a local-only mock nothing ever sent anywhere,
   * so a note an officer left vanished the moment they reloaded and a
   * second officer on the same file never saw it at all. Reset to empty on
   * every application change (see the `id()` effect) and reloaded by
   * `loadComments()`, fired from that same effect.
   */
  protected readonly comments = signal<CommentItem[]>([]);
  protected readonly commentsError = signal<string | null>(null);

  private async loadComments(applicationId: string): Promise<void> {
    this.commentsError.set(null);
    const result = await this.applicationsApi.listNotes(applicationId);
    if (this.id() !== applicationId) return; // navigated away before this resolved
    if (result.kind === 'ok') {
      this.comments.set(result.notes.map((n) => ({
        id: n.id,
        author: n.authorEmail,
        timeAgo: formatDateTime(n.createdAt),
        text: n.body,
        depth: n.depth,
      })));
      return;
    }
    if (result.kind === 'failed') this.commentsError.set(result.message);
  }
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
  /**
   * The record's own real transition history from `GET /staff/applications/:id`
   * when it has loaded — the database's own trigger-written audit trail, not
   * a local mock. `ApplicationStore.getAuditTrail`'s local mock events are
   * only a placeholder for the moment before that real fetch resolves (or
   * for an application the API never created at all); a real application
   * whose real trail has loaded and is genuinely empty stays empty here
   * rather than falling back to seed data that was never this record's own.
   */
  protected readonly realTimeline = computed<TimelineItem[]>(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const real = this.realDetail();
    if (real) {
      return [...real.timeline]
        .map((e, i): TimelineItem => {
          const occurred = new Date(e.occurredAt);
          const validDate = !Number.isNaN(occurred.getTime());
          return {
            num: String(i + 1).padStart(2, '0'),
            event: e.toStatus,
            date: validDate ? occurred.toLocaleDateString() : e.occurredAt,
            time: validDate ? occurred.toLocaleTimeString() : '',
            detail: e.remarks
              ? `${e.remarks}${e.office ? ` — ${e.office}` : ''}`
              : (e.office ?? (e.fromStatus ? `From ${e.fromStatus}` : 'Application filed')),
          };
        })
        .reverse();
    }
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
      if (a.target === 'Assessed') {
        // Same scope as approving a fee assessment (`staff:assess`) — this
        // is the same office, just a different action on it.
        if (!role || !ACTION_PERMISSIONS.approveAssessment(role)) return false;
      }
      if (a.target === 'Payment Under Verification' || a.target === 'Payment Verified') {
        // Same scope as verifying the payment itself and as the 'For
        // Approval' hop right below — all three are `staff:verify-payment`.
        if (!role || !ACTION_PERMISSIONS.verifyPayment(role)) return false;
      }
      if (a.target === 'For Approval') {
        // Same scope as verifying the payment itself (`staff:verify-payment`
        // — cashier's real backend scope) — this hop belongs to whoever just
        // confirmed the money, not to the evaluator or the approving officer.
        if (!role || !ACTION_PERMISSIONS.verifyPayment(role)) return false;
      }
      if (a.target === 'Approved') {
        // Not `store.canApprove(row.id)` — that reads only the local
        // ApplicationStore signal, which a real application's documents
        // never populate. `approvalBlockingDocs` below is real-data-aware
        // (built from `documentRows()`) and expresses the identical rule.
        if (this.approvalBlockingDocs().length > 0) return false;
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
  /**
   * Stores a real `businessName` from the current queue, not a `Business.id`.
   *
   * The queue row carries the NAME but not the id (see this file's own note
   * on `ApplicationApiRecord.businessId` above) — every real row's
   * `businessId` is `''`, so a filter keyed on it could never match a real
   * business no matter what was selected. `store.businesses()` is a
   * separate, hand-seeded mock list unrelated to the real queue, which is
   * why it never offered "Santos Sari-Sari Store" or any other real
   * business as an option. Options are generated from the real rows
   * instead, same pattern as the Business Stages board's Barangay filter.
   */
  protected readonly businessFilter = signal<'All' | string>('All');

  protected readonly businessOptions = computed(() =>
    Array.from(new Set(this.rows().map((r) => r.businessName).filter((name) => name.trim() !== '')))
      .sort((a, b) => a.localeCompare(b)),
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
    const business = this.businessFilter();
    return this.rows().filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (business !== 'All' && r.businessName !== business) return false;
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

  /**
   * `GET /staff/applications/:id`'s real payload — the applicant's real
   * account email/mobile and the record's own real transition history live
   * only here, never in the queue row or the local mock `Applicant`/
   * `Business` lookups `selectedRow`/`selectedDetail` are otherwise built
   * from. `null` while unfetched/loading, so callers can tell "still
   * loading" apart from "loaded, no timeline events" (an empty array).
   */
  protected readonly realDetail = signal<RealApplicationDetail | null>(null);

  protected readonly selectedDetail = computed<AppDetail | null>(() => {
    const row = this.selectedRow();
    if (!row) return null;
    const real = this.realDetail();
    return buildDetailFor(
      row,
      this.store.getApplicant(row.applicantId),
      this.store.getBusiness(row.businessId),
      real ? { email: real.applicantEmail, mobile: real.applicantMobile } : undefined,
      real?.applicantAddress,
    );
  });

  // ---- Permit Result tab -------------------------------------------------
  // Every value here is read straight from the store's own permit/release
  // records — never a placeholder string — so this tab shows the ACTUAL
  // result of the process (or an honest "not yet generated" state) rather
  // than sample/lorem-ipsum content once a real result exists.

  /**
   * `PermitReleaseApi.generatePermit()` has no matching GET route anywhere —
   * `sessionCache` is the honest answer (see its own doc comment): populated
   * only by this session's own successful generate call, never wiped by a
   * queue reload. Once real data is loaded, `ApplicationStore.getPermit()`
   * (the old, fully-local mutator's own read side) is used only as the
   * seed/demo-mode fallback, never as a claim about real server state.
   *
   * `expiryDate`/`approvingOfficial`/`approvingOffice` are `undefined` — not
   * `null` — when this session's cache is the source, since the real
   * `generatePermit` response carries only `permitNumber`/`issuedDate` and
   * this portal has no route to read the rest back. The template shows that
   * honestly rather than displaying a fabricated or seed-only value.
   */
  protected readonly permitResult = computed<{
    permitNumber: string;
    issuedDate: string;
    expiryDate?: string | null;
    approvingOfficial?: string;
    approvingOffice?: string;
  } | null>(() => {
    const row = this.selectedRow();
    if (!row) return null;
    const cached = this.sessionCache.permitFor(row.id);
    if (cached) return { permitNumber: cached.permitNumber, issuedDate: cached.issuedDate };
    // The record itself: `GET /staff/applications/:id` carries the generated
    // permit, so a permit another officer generated — or one generated before
    // this page was reloaded — shows from the database rather than as "not
    // available in this session" (found live 2026-09-20: FP-2026-000001 was
    // in the database and this panel had lost it on reload).
    const real = this.realDetail()?.permit;
    if (real) return { permitNumber: real.permitNumber, issuedDate: real.issuedDate };
    if (!this.store.isSeedData()) return null;
    const seedPermit = this.store.getPermit(row.id);
    return seedPermit ? { ...seedPermit } : null;
  });

  /** True once this row's own status implies a permit exists, but neither this session's cache nor the seed data can show it — an honest gap, not a blank. */
  protected readonly permitNotVisible = computed(() => {
    const row = this.selectedRow();
    if (!row || this.permitResult()) return false;
    return row.lifecycleStatus === 'Permit Generated'
      || row.lifecycleStatus === 'Ready for Release'
      || row.lifecycleStatus === 'Released'
      || row.lifecycleStatus === 'Completed';
  });

  protected readonly releaseResult = computed(() => {
    const row = this.selectedRow();
    return row ? (this.store.getRelease(row.id) ?? null) : null;
  });

  protected readonly finalDocumentName = computed(() => {
    const row = this.selectedRow();
    return row ? requirementsFor(row.permitType).finalDocument : '';
  });

  /**
   * `evaluationsComplete` guards against the exact live bug this was found
   * from: Assess Fee showed (and could be clicked) while an application was
   * still mid-evaluation, e.g. with Zoning still pending — a real fee quoted
   * on an application that had not yet cleared what that fee was for.
   * `AssessmentService.issue()` now refuses this server-side too (see the
   * sibling ebpco-api commit); this is the same rule, shown before the
   * click rather than only after it fails.
   */
  protected readonly evaluationsComplete = computed(() => {
    const evaluations = this.realDetail()?.evaluations ?? [];
    const passed = new Set(evaluations.filter((e) => e.result === 'Passed').map((e) => e.stage));
    return EVALUATION_STAGE_ORDER.every((stage) => passed.has(stage));
  });

  /** How many of the five stages have PASSED — the same count the server's `evaluations-complete` precondition is built on. */
  protected readonly evaluationStagesPassed = computed(() => {
    const evaluations = this.realDetail()?.evaluations ?? [];
    return new Set(evaluations.filter((e) => e.result === 'Passed').map((e) => e.stage)).size;
  });
  protected readonly evaluationStageTotal = EVALUATION_STAGE_ORDER.length;

  protected readonly canAssessFee = computed(() => {
    const row = this.selectedRow();
    const role = this.session.role();
    return (
      !!row &&
      !!role &&
      ACTION_PERMISSIONS.assessFee(role) &&
      row.lifecycleStatus === 'Under Evaluation' &&
      row.assessedAmountCentavos === null &&
      this.evaluationsComplete()
    );
  });

  /**
   * Same-tick UI hint only — `row.lifecycleStatus === 'Approved'` is the real
   * gate the server enforces (via the `Approved -> Permit Generated`
   * transition's own precondition); `paymentStatus === 'Paid'` is kept
   * alongside it even though `generatePermit`'s confirmed refusal reasons
   * (not-approved/already-generated/invalid) carry no distinct "unpaid"
   * cause — payment settlement may already be a precondition of reaching
   * Approved in the first place, in which case this check is redundant but
   * harmless; live-verify with an Approved-but-unpaid application if one can
   * be constructed.
   */
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

  /**
   * Used to drive `ApplicationStore.assessFee()` — a local-only mock that
   * never called the backend, shown as a SEPARATE quick action from the one
   * below alongside a false "Fee assessment drafted" success toast. The real
   * Assess Fee flow has always lived on the standalone Payments page's
   * Assessment Workspace, already reachable from here via the real deep
   * link `openPaymentAssessment()` — this button now just opens it, instead
   * of a duplicate path an officer could not tell apart from the real one.
   */
  protected assessFeeAction(): void {
    if (!this.canAssessFee()) {
      this.toast.error("Can't assess a fee for this application in its current state.");
      return;
    }
    this.openPaymentAssessment();
  }

  // ---- Generate permit (real staff:approve call, then the real transition) --

  protected readonly showGeneratePermitModal = signal(false);
  protected generatePermitScope = '';
  protected generatePermitConditionsText = '';
  protected readonly generatePermitError = signal('');
  protected readonly generatingPermit = signal(false);

  protected openGeneratePermitModal(): void {
    if (!this.canGeneratePermit()) {
      this.toast.error("Can't generate a permit yet — the application must be Approved and fully paid.");
      return;
    }
    this.generatePermitScope = '';
    this.generatePermitConditionsText = '';
    this.generatePermitError.set('');
    this.showGeneratePermitModal.set(true);
  }

  protected cancelGeneratePermit(): void {
    this.showGeneratePermitModal.set(false);
  }

  protected async confirmGeneratePermit(): Promise<void> {
    const row = this.selectedRow();
    if (!row || !this.canGeneratePermit()) return;
    const scope = this.generatePermitScope.trim();
    if (!scope) {
      this.generatePermitError.set('Describe what this permit covers before generating it.');
      return;
    }
    const conditions = this.generatePermitConditionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    this.generatingPermit.set(true);
    try {
      const result = await this.permitReleaseApi.generatePermit(row.id, {
        scope,
        conditions: conditions.length > 0 ? conditions : undefined,
      });
      if (result.kind !== 'done') {
        const message =
          result.kind === 'unavailable'
            ? 'This deployment cannot generate permits yet.'
            : result.message;
        this.generatePermitError.set(message);
        this.toast.error(message);
        return;
      }
      this.sessionCache.recordPermit(row.id, {
        permitNumber: result.permitNumber,
        issuedDate: result.issuedDate,
      });
      // The server makes `Approved -> Permit Generated` itself now and says
      // where the application stands; the hop below is a fallback for an
      // older server (no status reported) or a refused move. No
      // `expectedVersion` on the fallback: the server's own move, if it
      // happened, already advanced the version this row remembers.
      if (result.lifecycleStatus === 'Permit Generated') {
        this.toast.success(`${this.finalDocumentName()} generated.`);
      } else {
        const transitionResult = await this.applicationsApi.transition(row.id, 'Permit Generated');
        if (transitionResult.kind !== 'done') {
          this.toast.error(
            `${this.finalDocumentName()} generated (${result.permitNumber}), but the status update failed — `
              + `${transitionResult.kind === 'unavailable' ? 'this deployment cannot update it yet.' : transitionResult.message} `
              + 'Reload and try again.',
          );
        } else {
          this.toast.success(`${this.finalDocumentName()} generated.`);
        }
      }
      this.showGeneratePermitModal.set(false);
      await this.loader.reload();
      const refreshed = this.store.getById(row.id);
      if (refreshed) this.selectedRow.set(refreshed);
    } finally {
      this.generatingPermit.set(false);
    }
  }

  // ---- Sample document preview (application form / permit / etc.) -----

  protected readonly showDocPreview = signal(false);
  protected readonly docPreviewKind = signal<SampleDocumentKind>('permit');

  // The real generated permit (with its own SAMPLE watermark), not the blank
  // reference form above — same component the Permit Release page already
  // uses for "Preview Permit", so "Preview / Download {finalDocumentName}"
  // here shows the applicant's actual document instead of an empty template.
  protected readonly showGeneratedPermitPreview = signal(false);

  protected openGeneratedPermitPreview(): void {
    this.showGeneratedPermitPreview.set(true);
  }

  protected closeGeneratedPermitPreview(): void {
    this.showGeneratedPermitPreview.set(false);
  }

  // ---- Contact verification (manual administrator confirmation only) ----
  // The only verification path this frontend-only mock can honestly
  // perform — see ApplicationStore.setContactVerification's own doc
  // comment. Never displays "email sent"/"OTP sent"; this is a plain
  // administrator action with its own audit trail entry.
  //
  // Email only. The LGU verifies email throughout the system now, never
  // mobile — the backend has a real OTP-based verification path for email
  // (contact-verification.service.ts, plus the pre-registration one used at
  // signup); there is still no SMS provider, so a mobile "Verified" state
  // was never backed by anything a citizen could actually have done, real
  // or manual-administrator alike.

  protected verifyContact(
    channel: 'email',
    outcome: 'Verified' | 'Verification Failed',
  ): void {
    const row = this.selectedRow();
    if (!row || !this.canVerifyContact()) {
      this.toast.error("You don't have permission to verify this contact.");
      return;
    }
    // On real data `row.applicantId` is always '' (the queue API sends the
    // applicant's NAME, never a joinable id — see staff-applications.api.ts's
    // own doc comment), so this local-only mutation can never find a
    // matching Applicant record to update. Before this check, the return
    // value was ignored and a "marked Verified" success toast fired
    // unconditionally — an active false positive telling the officer their
    // action landed when nothing changed, worse than the button silently
    // doing nothing. There is still no backend route for this (see the
    // gap list in the Stage 2 plan); this only makes that gap visible
    // instead of hidden behind a fake success.
    const ok = this.store.setContactVerification(
      row.applicantId,
      channel,
      outcome,
      'Manual Administrator Confirmation',
      this.session.name() || 'Administrator',
    );
    if (!ok) {
      this.toast.error(
        'This deployment cannot verify contacts for this application — no local applicant '
          + 'record is available to update, and there is no backend route for this yet.',
      );
      return;
    }
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

  /** Same pattern as openEvaluations() above — the Assessment Workspace lives on the standalone Payments page (no per-application route here), reached with `?applicationId=`. There is no bulk "assessments" list to link to instead; see payments.ts's own doc comment for why. */
  protected readonly canEditAssessment = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.editAssessment(role);
  });

  openPaymentAssessment(): void {
    const row = this.selectedRow();
    if (!row) return;
    this.router.navigateByUrl(`/payments?applicationId=${row.id}`);
  }

  closeDocPreview(): void {
    // Revoke the blob URL a real preview held — otherwise every "Preview"
    // click on a real document leaks the file's bytes for the rest of the
    // tab's life.
    const objectUrl = this.previewItem()?.real?.objectUrl;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    this.previewItem.set(null);
  }

  protected downloadPreviewDoc(): void {
    const doc = this.previewItem();
    if (!doc) return;
    if (doc.real) {
      const a = document.createElement('a');
      a.href = doc.real.objectUrl;
      a.download = doc.filename;
      a.click();
      this.toast.success('Downloaded.');
      return;
    }
    downloadCsv(`document-${doc.label.replace(/\s+/g, '-').toLowerCase()}`, [
      { Document: doc.label, File: doc.filename, Status: doc.status },
    ]);
    this.toast.success('Downloaded.');
  }

  // ---- Row status mutation --------------------------------------------
  // Routed through the real server transition (`POST
  // /staff/applications/:id/transitions`), targeting the real
  // ApplicationLifecycleStatus directly (see STATUS_ACTIONS/
  // availableStatusActions above). `availableStatusActions`'s own
  // `canTransition`/`canApprove` filtering stays in place as a same-tick
  // hint (grey out illegal menu items immediately) but the actual result —
  // and its exact reason when refused — always comes from the server, never
  // a locally-decided boolean; `expectedVersion` is the row's own `version`
  // so a decision made elsewhere in the meantime surfaces as "reload and
  // look again" rather than silently overwriting it.
  private async updateRowStatus(
    id: string,
    target: ApplicationLifecycleStatus,
    remarks?: string,
  ): Promise<void> {
    this.quickActionError.set(null);
    const row = this.store.getById(id);
    const result = await this.applicationsApi.transition(id, target, {
      expectedVersion: row?.version,
      remarks,
    });
    if (result.kind === 'done') {
      this.toast.success(`Status updated to "${target}".`);
      await this.loader.reload();
      const current = this.selectedRow();
      if (current && current.id === id) {
        const refreshed = this.store.getById(id);
        if (refreshed) this.selectedRow.set(refreshed);
        // `realTimeline` (the Audit Trail table) reads `realDetail()`, not
        // the queue row `loader.reload()` above already refreshed — without
        // this, a transition made here (Mark Received, Send to Approval,
        // Mark Rejected, ...) showed the new coarse status immediately but
        // left the Audit Trail showing its pre-transition history until the
        // next full page reload, exactly the stuck-view bug already fixed
        // for the Evaluations/Documents views.
        if (!this.store.isSeedData()) await this.refreshRealDetail(id);
      }
      return;
    }
    const message =
      result.kind === 'unavailable'
        ? "This deployment cannot change an application's status yet."
        : result.message;
    this.quickActionError.set(message);
    this.toast.error(message);
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
      return `${n} selected application${n === 1 ? '' : 's'} will be archived if already finished, `
        + 'or moved to Cancelled if still active. Nothing is deleted.';
    }
    if (target) {
      const action = isTerminalStatus(target.lifecycleStatus) ? 'archived' : 'moved to Cancelled';
      return `${target.applicant}'s application (${target.id}) will be ${action}, `
        + 'where it stays visible and auditable. Nothing is deleted.';
    }
    return '';
  });

  /**
   * "Delete" against the real backend, which splits this into two different
   * operations depending on the row's own status.
   *
   * `POST /staff/applications/archive` only accepts applications already at a
   * terminal status (Completed/Rejected/Cancelled/Expired) — it is a
   * housekeeping action, not a way to call off work in progress. An active
   * application is cancelled instead, through the same real `Cancelled`
   * transition the Action menu would use — which some statuses (Document
   * Verification, Under Evaluation, anything from Payment Submitted onward)
   * do not legally reach at all; the server's own refusal for those is
   * surfaced rather than guessed at here.
   *
   * The server requires at least three characters on `remarks` for the same
   * reason this dialog does — so a short remark is refused before a round
   * trip, not after one.
   */
  protected async confirmDelete(remarks: string): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleteTarget.set(null);
    const rows = target === 'bulk'
      ? [...this.selectedIds()].map((id) => this.store.getById(id)).filter((r): r is AppRow => r !== undefined)
      : [target];

    const toArchive = rows.filter((r) => isTerminalStatus(r.lifecycleStatus));
    const toCancel = rows.filter((r) => !isTerminalStatus(r.lifecycleStatus));

    let archivedCount = 0;
    let cancelledCount = 0;
    const succeededIds = new Set<string>();
    const failures: string[] = [];

    if (toArchive.length > 0) {
      const result = await this.applicationsApi.archive(toArchive.map((r) => r.id), remarks);
      if (result.kind === 'done') {
        archivedCount = toArchive.length;
        for (const r of toArchive) succeededIds.add(r.id);
      } else {
        failures.push(
          result.kind === 'unavailable' ? 'This deployment cannot archive applications yet.' : result.message,
        );
      }
    }

    for (const row of toCancel) {
      const result = await this.applicationsApi.transition(row.id, 'Cancelled', {
        expectedVersion: row.version,
        remarks,
      });
      if (result.kind === 'done') {
        cancelledCount += 1;
        succeededIds.add(row.id);
      } else {
        const message = result.kind === 'unavailable' ? 'this deployment cannot cancel it yet' : result.message;
        failures.push(`${row.applicant} (${row.id}): ${message}`);
      }
    }

    const succeeded = archivedCount + cancelledCount;
    if (succeeded === 1 && failures.length === 0) {
      this.toast.success(archivedCount === 1 ? 'Application archived.' : 'Application moved to Cancelled.');
    } else if (succeeded > 0) {
      const parts: string[] = [];
      if (archivedCount > 0) parts.push(`${archivedCount} archived`);
      if (cancelledCount > 0) parts.push(`${cancelledCount} moved to Cancelled`);
      this.toast.success(`${succeeded} application${succeeded === 1 ? '' : 's'} updated (${parts.join(', ')}).`);
    }
    if (failures.length > 0) {
      this.toast.error(failures.length === 1 ? failures[0] : `${failures.length} could not be updated: ${failures.join(' ')}`);
    }
    if (succeeded === 0) return;

    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const id of succeededIds) next.delete(id);
      return next;
    });
    const wasShowingUpdated = target !== 'bulk' && succeededIds.has(target.id);
    await this.loader.reload();
    if (wasShowingUpdated) this.backToList();
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
    // `downloadCsv` writes nothing for an empty set, so "Exported 0
    // applications." announced a file that was never created.
    if (rows.length === 0) {
      this.toast.info('Nothing to export — no applications match the current view.');
      return;
    }
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
   * 'Rejected' and 'Revision Required' both need a real reason — the
   * citizen reads it directly (Citizen Portal's own Status Timeline renders
   * it against the entry), so a click here must not silently attach an
   * empty or stale remark. This used to only cover 'Rejected'; the same
   * prompt now also gates 'Revision Required', reusing the identical
   * required-field flow rather than a second copy of it.
   */
  protected setStatus(target: ApplicationLifecycleStatus): void {
    const row = this.selectedRow();
    this.closeActionMenu();
    if (!row) return;
    if (target === 'Rejected' || target === 'Revision Required') {
      this.quickReasonRemarks.set('');
      this.quickReasonTarget.set({ row, target });
      return;
    }
    this.updateRowStatus(row.id, target);
  }

  protected readonly quickReasonTarget = signal<{ row: AppRow; target: 'Rejected' | 'Revision Required' } | null>(
    null,
  );
  protected readonly quickReasonRemarks = signal('');

  protected confirmQuickReason(): void {
    const current = this.quickReasonTarget();
    const remarks = this.quickReasonRemarks().trim();
    if (!current || !remarks) return;
    this.updateRowStatus(current.row.id, current.target, remarks);
    this.quickReasonTarget.set(null);
  }

  protected cancelQuickReason(): void {
    this.quickReasonTarget.set(null);
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

  // ---- Info view: Edit Profile -------------------------------------------
  //
  // "Send Notification" used to live here too — a free-text message
  // supposedly sent to the applicant, actually just appended to this same
  // application's internal STAFF notes list. Doubly wrong: never delivered
  // anywhere, and even as a local fake it was logged to the wrong audience.
  // No real endpoint exists for a staff-authored free-text message to one
  // applicant (the notification catalog is system-triggered only — see
  // `staff-catalog.ts`'s own "no invented vocabulary" discipline), so this
  // is removed rather than left fake.

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
  // Prefers the REAL per-application documents from `realDetail()` (`GET
  // /staff/applications/:id`'s own `documents[]`) the moment that call
  // resolves; falls back to the local ApplicationStore for an application
  // that has none (a local-demo row) or before the fetch lands. Before this,
  // real documents were never read at all — `realDetail` was fetched and
  // simply never consulted here, so every real application showed every
  // required document as "Missing" regardless of what the citizen had
  // actually uploaded, discovered live while walking one through Document
  // Verification end to end.
  //
  // Matched by `requirementCode` first, then by `label`. A document this
  // page's own "Attach" action creates (`attachDocumentFile` below) sends a
  // real `requirementCode` (`r.requirementId`, the catalog's own id), so
  // that stays the precise match for a staff-attached document. A real
  // CITIZEN upload never carries one, though: `application-wizard.page.ts`'s
  // `uploadReal()` (Citizen Portal) deliberately omits it — this portal's
  // own requirements-catalog ids and the Admin Portal's published-checklist
  // codes are two different, incompatible id schemes with no reconciliation,
  // and sending a mismatched code gets a real server refusal the moment any
  // office publishes a checklist, confirmed live. `label`, by contrast, is
  // the same literal string on both sides (both catalogs originate it from
  // the same source) and is what actually matches a citizen's own real
  // upload — discovered live immediately after the `requirementCode`-only
  // version shipped and still showed every citizen-uploaded document as
  // "Missing".
  //
  // A real document's displayed `status` is the STAFF verdict
  // (`reviewStatus`, migration 038) once one exists, else 'Uploaded' — never
  // the malware scanner's own `status` field on the same row, which this
  // screen does not render.

  protected readonly documentRows = computed<DocumentRow[]>(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const requirements = requirementsFor(row.permitType).documents;
    const real = this.realDetail()?.documents;
    if (real) {
      const byCode = new Map(
        real.filter((d) => d.requirementCode !== null).map((d) => [d.requirementCode, d]),
      );
      const byLabel = new Map(real.map((d) => [d.label, d]));
      return requirements.map((req): DocumentRow => {
        const found = byCode.get(req.id) ?? byLabel.get(req.label);
        return {
          requirementId: req.id,
          label: req.label,
          required: req.required,
          departmentName: departmentName(req.reviewingDepartmentId),
          isReal: true,
          doc: found
            ? {
                id: found.id,
                fileName: found.fileName,
                status: found.reviewStatus ?? 'Uploaded',
                remarks: found.reviewRemark,
                uploadedAt: found.uploadedAt,
                contentType: found.contentType,
              }
            : null,
        };
      });
    }
    const stored = this.store.getDocuments(row.id);
    const byRequirement = new Map(stored.map((d) => [d.requirementId, d]));
    return requirements.map((req): DocumentRow => {
      const doc = byRequirement.get(req.id) ?? null;
      return {
        requirementId: req.id,
        label: req.label,
        required: req.required,
        departmentName: departmentName(req.reviewingDepartmentId),
        isReal: false,
        doc: doc && { id: doc.id, fileName: doc.fileName, status: doc.status, remarks: doc.remarks, uploadedAt: doc.uploadedAt },
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

  /** Re-fetches `realDetail` after a real write, so `documentRows` picks up the new `reviewStatus` — the same reload `setDocStatus`/`markSelectedDocsAccepted` need whenever they act on a real document. */
  private async refreshRealDetail(applicationId: string): Promise<void> {
    const result = await this.applicationsApi.detail(applicationId);
    if (result.kind === 'ok') this.realDetail.set(result.detail);
  }

  protected async markSelectedDocsAccepted(): Promise<void> {
    const row = this.selectedRow();
    const ids = this.docSelectedIds();
    if (!row || ids.size === 0) {
      this.toast.error('Select at least one document first.');
      this.closeDocActionMenu();
      return;
    }
    const actor = this.session.name() || 'Staff';
    const rows = this.documentRows().filter((r) => r.doc && ids.has(r.requirementId));
    if (rows.some((r) => r.isReal) && !this.canAttachDocuments()) {
      this.toast.error('Only Records Officers and Super Admins can review a document on this application.');
      this.closeDocActionMenu();
      return;
    }
    let count = 0;
    for (const r of rows) {
      if (!r.doc) continue;
      if (r.isReal) {
        const result = await this.applicationsApi.reviewDocument(row.id, r.doc.id, 'Accepted');
        if (result.kind === 'done') count++;
        else this.toast.error(`Could not mark "${r.label}" Accepted: ${result.kind === 'refused' || result.kind === 'failed' ? result.message : 'not available'}.`);
      } else {
        this.store.setDocumentStatus(row.id, r.doc.id, 'Accepted', actor);
        count++;
      }
    }
    if (rows.some((r) => r.isReal)) await this.refreshRealDetail(row.id);
    this.toast.success(`${count} document${count === 1 ? '' : 's'} marked Accepted.`);
    this.docSelectedIds.set(new Set());
    this.closeDocActionMenu();
  }

  protected readonly docRemarksDraft = signal('');

  protected async setDocStatus(r: DocumentRow, status: DocumentStatus): Promise<void> {
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
    if (r.isReal) {
      if (status !== 'Under Review' && status !== 'Accepted' && status !== 'Rejected' && status !== 'Revision Required') {
        this.toast.error(`"${status}" is not a real staff verdict — only Under Review, Accepted, Rejected, or Revision Required can be recorded.`);
        return;
      }
      if (!this.canAttachDocuments()) {
        this.toast.error('Only Records Officers and Super Admins can review a document on this application.');
        return;
      }
      const result = await this.applicationsApi.reviewDocument(row.id, r.doc.id, status, remarks);
      if (result.kind !== 'done') {
        this.toast.error(`Could not mark "${r.label}" "${status}": ${result.kind === 'refused' || result.kind === 'failed' ? result.message : 'not available'}.`);
        return;
      }
      await this.refreshRealDetail(row.id);
    } else {
      this.store.setDocumentStatus(row.id, r.doc.id, status, actor, remarks);
    }
    this.toast.success(`"${r.label}" marked "${status}".`);
    this.docRemarksDraft.set('');
  }

  /**
   * Whether this officer holds `documents:write` — the scope both
   * `attachDocumentFile`/`resubmitDocumentFile` need server-side. Checked
   * here so the control can be honestly disabled with an explanation for a
   * role that does not hold it (evaluator, building-official,
   * receiving-officer), rather than accepting a file and only then reporting
   * a 403 the officer had no way to anticipate.
   */
  protected readonly canAttachDocuments = computed(() => {
    const current = this.session.session();
    if (!current) return false;
    if (current.scopes !== null) return current.scopes.includes('documents:write');
    // Silence, not denial (see Capabilities' own doc comment on this
    // distinction) — fall back to the one portal role known to carry it.
    return current.role === 'Super Admin' || current.role === 'Administrator';
  });

  /** Attaches a first file for a still-Missing required/optional document. Real (`POST /documents`) for a real application; local-only mock otherwise. */
  protected async attachDocumentFile(r: DocumentRow, event: Event): Promise<void> {
    const row = this.selectedRow();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!row || !file) return;

    if (r.isReal) {
      if (!this.canAttachDocuments()) {
        this.toast.error('Only Records Officers and Super Admins can attach a document on a citizen\'s behalf.');
        input.value = '';
        return;
      }
      try {
        const contentBase64 = await toBase64(file);
        const result = await this.applicationsApi.attachDocument(row.id, r.requirementId, r.label, file.name, contentBase64);
        if (result.kind === 'done') {
          this.toast.success(`"${r.label}" attached as ${file.name}.`);
          await this.refreshRealDetail(row.id);
        } else {
          this.toast.error(`Could not attach "${r.label}": ${result.kind === 'refused' || result.kind === 'failed' ? result.message : 'not available'}.`);
        }
      } catch {
        this.toast.error(`Could not attach "${r.label}". Try again.`);
      } finally {
        input.value = '';
      }
      return;
    }

    this.store.attachDocument(
      row.id,
      r.requirementId,
      r.label,
      file.name,
      this.session.name() || 'Staff',
    );
    this.toast.success(`"${r.label}" recorded as ${file.name}. The file is not stored yet.`);
    input.value = '';
  }

  /**
   * Resubmits over an existing Rejected/Revision Required/Expired document,
   * for a walk-in citizen with no portal access. Real
   * (`POST /staff/applications/:id/documents/:documentId/resubmit`) for a
   * real application, via the staff-namespaced route added alongside the
   * long-real applicant-only one; local-only mock otherwise (the store
   * appends the replaced file to `history` rather than discarding it).
   */
  protected async resubmitDocumentFile(r: DocumentRow, event: Event): Promise<void> {
    const row = this.selectedRow();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!row || !r.doc || !file) return;

    if (r.isReal) {
      if (!this.canAttachDocuments()) {
        this.toast.error('Only Records Officers and Super Admins can resubmit a document on a citizen\'s behalf.');
        input.value = '';
        return;
      }
      try {
        const contentBase64 = await toBase64(file);
        const result = await this.applicationsApi.resubmitDocument(row.id, r.doc.id, r.label, file.name, contentBase64);
        if (result.kind === 'done') {
          this.toast.success(`"${r.label}" resubmitted as ${file.name}.`);
          await this.refreshRealDetail(row.id);
        } else {
          this.toast.error(`Could not resubmit "${r.label}": ${result.kind === 'refused' || result.kind === 'failed' ? result.message : 'not available'}.`);
        }
      } catch {
        this.toast.error(`Could not resubmit "${r.label}". Try again.`);
      } finally {
        input.value = '';
      }
      return;
    }

    this.store.resubmitDocument(row.id, r.doc.id, file.name, this.session.name() || 'Staff');
    this.toast.success(`"${r.label}" resubmitted.`);
    input.value = '';
  }

  /**
   * Opens the preview modal. For a real document, fetches the actual signed
   * content (`GET /documents/:id/content`) and shows it, in place of the
   * fabricated placeholder sheet this used to show for every uploaded
   * document regardless of what it actually was (hardcoded "Apr 14, 2021",
   * a document number derived from the filename's length). A local-demo row
   * has no real bytes to fetch, so it keeps showing that same sheet.
   */
  /**
   * Guards against a slow fetch for a PREVIOUS "Preview" click landing after
   * the officer has already closed the modal or opened a different
   * document's preview — incremented on every click; a fetch only applies
   * its result if it is still the most recent one requested.
   */
  private previewToken = 0;

  protected previewDocumentRow(r: DocumentRow): void {
    if (!r.doc) return;
    const token = ++this.previewToken;
    this.previewItem.set({ label: r.label, filename: r.doc.fileName, status: r.doc.status, real: null, loading: r.isReal });
    if (!r.isReal) return;
    void this.loadRealDocPreview(token, r.doc.id, r.doc.contentType ?? 'application/octet-stream');
  }

  private async loadRealDocPreview(token: number, documentId: string, fallbackContentType: string): Promise<void> {
    const content = await this.applicationsApi.documentContent(documentId);
    if (content.kind !== 'ok') {
      this.toast.error('Could not open this document. Try again.');
      if (this.previewToken === token) this.previewItem.set(null);
      return;
    }
    try {
      const response = await fetch(content.url);
      if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const contentType = blob.type || fallbackContentType;
      if (this.previewToken !== token) {
        // Superseded while the fetch was in flight — don't leak this blob's
        // URL into a preview nothing will ever show or revoke.
        URL.revokeObjectURL(objectUrl);
        return;
      }
      this.previewItem.update((cur) => (cur
        ? { ...cur, real: { objectUrl, safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl), contentType }, loading: false }
        : cur));
    } catch {
      this.toast.error('Could not open this document. Try again.');
      if (this.previewToken === token) this.previewItem.set(null);
    }
  }

  // ---- Comments tab -------------------------------------------------------
  //
  // No edit action: `application_notes` is append-only, same "correction is a
  // new entry, never a silent rewrite" discipline every other record in this
  // system already follows (a transition, a payment adjustment...). A
  // colleague who has already read a note deserves that same guarantee.

  protected readonly replyTarget = signal<CommentItem | null>(null);
  protected readonly sendingComment = signal(false);

  protected startReply(c: CommentItem): void {
    this.replyTarget.set(c);
  }

  protected cancelReply(): void {
    this.replyTarget.set(null);
  }

  protected async sendComment(): Promise<void> {
    const text = this.newMessage().trim();
    const id = this.id();
    if (!text || !id || this.sendingComment()) return;
    const target = this.replyTarget();
    this.sendingComment.set(true);
    try {
      const result = await this.applicationsApi.addNote(id, text, target?.id ?? null);
      if (result.kind !== 'done') {
        this.toast.error(
          result.kind === 'unavailable'
            ? 'This deployment cannot save notes yet.'
            : result.message,
        );
        return;
      }
      this.comments.update((list) => [
        ...list,
        {
          id: result.note.id,
          author: this.session.name() || 'You',
          timeAgo: formatDateTime(result.note.createdAt),
          text: result.note.body,
          depth: result.note.depth,
        },
      ]);
    } finally {
      this.sendingComment.set(false);
    }
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
