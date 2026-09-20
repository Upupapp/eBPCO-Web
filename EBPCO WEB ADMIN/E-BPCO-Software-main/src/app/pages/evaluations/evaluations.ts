import { Component, OnInit, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { Topbar } from '../../shared/topbar/topbar';
import { QueueLoadNotice } from '../../shared/queue-load-notice/queue-load-notice';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ToastService } from '../../shared/toast/toast.service';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { EVALUATION_STAGE_ORDER, EvaluationStage } from '../../core/domain/status.model';
import { ALL_PERMIT_TYPES } from '../../core/domain/permit.model';
import { ApplicationRecord } from '../../core/domain/application.model';
import { Applicant } from '../../core/domain/applicant.model';
import { DocumentStatus } from '../../core/domain/document.model';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { Capabilities } from '../../core/session/capabilities';
import { ViewOnlyNotice } from '../../shared/view-only-notice/view-only-notice';
import { StaffEvaluationsApi, EvaluationQueueRow } from '../../core/api/staff-evaluations.api';
import { StaffApplicationsApi, ApplicationDocumentRow, ApplicationTimelineEvent } from '../../core/api/staff-applications.api';
import {
  buildEvalTypeCards,
  buildEvalRows,
  buildEvalRingStats,
  STAGE_TABS,
  EvalTypeCard,
  EvalTypeKey,
  EvalRow,
  Stage,
  EVAL_KEY_TO_APP_STAGE,
} from './evaluations-data';

/**
 * One row of the record view's real Documents Checklist — read-only here (Accept/Reject stays an
 * Applications-Documents-tab-only action). A required requirement with no uploaded row yet shows
 * up as a synthetic "Missing" row rather than silently not appearing.
 *
 * `doc` is deliberately a narrow shape (not `ApplicationDocument`, the seed-only store's own
 * record type) — real documents come from `StaffApplicationsApi.detail()`'s `documents[]`
 * (migration 035's `requirementCode`), not from `ApplicationStore.getDocuments()`, which
 * `replaceApplications()` always wipes to `[]` on a real queue load (seed-only, matching
 * `_businesses`/`_applicants`/`_auditEvents`). `status` here is always the STAFF verdict
 * (`reviewStatus`, migration 038) once one exists, else 'Uploaded' — never the malware scanner's
 * own `status` field on the same real row, which this screen does not render. See
 * `recordDocumentRows` below, which mirrors `applications.ts`'s own `documentRows` real/seed split.
 */
interface RecordDocumentRow {
  requirementId: string;
  label: string;
  required: boolean;
  departmentName: string;
  doc: { fileName: string; status: DocumentStatus; uploadedAt: string } | null;
}

/** One step of the record view's real 5-stage evaluation stepper — `result`/`evaluatorLabel` are null until that stage has actually been evaluated at least once. */
interface RecordEvalStep {
  stage: EvaluationStage;
  result: 'Pending' | 'Passed' | 'Revision Required' | 'Rejected' | null;
  /** When that stage was decided, formatted — the server names no evaluator on this row (`EvaluationDecision` carries no evaluator field), so there is no name to show here. */
  evaluatorLabel: string | null;
  isCurrent: boolean;
  isDone: boolean;
}

// The server sends raw ISO timestamps. Mirrors applications.ts's own
// formatDateTime (no shared util between pages yet in this codebase).
function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return iso;
  return `${when.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · `
    + when.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

type View = 'list' | 'detail' | 'record';

// The type filter compares against `row.type` (the permitType projection
// — see application.model.ts's withProjectedFields), so its options must
// come from the SAME centralized permit-type list every other filter
// reads, not an independently invented set. 'Residential'/'Commercial'/
// 'Renovation' here previously never matched any real permit type at
// all — this filter had silently never worked.
const TYPE_OPTIONS = ALL_PERMIT_TYPES;

// Matches the shared KpiCard's own TONE_ACCENT exactly — the step
// illustration's SVG needs a literal hex value (not a CSS custom
// property), same constraint that component's own illustration has.
const STEP_TONE_ACCENT: Record<KpiTone, string> = {
  brand: '#c81e2c',
  neutral: '#565c6b',
  info: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  violet: '#7c3aed',
};

@Component({
  selector: 'app-evaluations',
  imports: [ViewOnlyNotice, Topbar,
    QueueLoadNotice, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel, OverlayModule],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.scss',
})
export class Evaluations implements OnInit {
  /**
   * Whether this officer may decide anything here.
   *
   * From `Capabilities`, never a local boolean: a permission answered per
   * screen is one that is wrong on at least one screen, and the wrong one is
   * always the one nobody opened.
   */
  protected readonly capabilities = inject(Capabilities);
  protected readonly formatDateTime = formatDateTime;

  private readonly store = inject(ApplicationStore);
  private readonly evaluationsApi = inject(StaffEvaluationsApi);
  private readonly applicationsApi = inject(StaffApplicationsApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // Bound to the `?stage=` query param (see withComponentInputBinding in
  // app.config.ts) so a link like `/evaluations?stage=zoning` lands
  // directly on that stage's detail view, e.g. from a dashboard stage row.
  readonly stage = input<string>();

  // Bound to the `?applicationId=` query param — lets Applications' own
  // "Evaluate" button link straight to one application's real evaluation
  // record here, instead of hosting a second, duplicate review screen
  // itself (see applyApplicationIdParam below).
  readonly applicationId = input<string>();

  // Card counts, rows, and ring totals all read from the same real queue —
  // GET /staff/evaluations — so a card's count always equals the number of
  // rows you actually see under it. See StaffEvaluationsApi's own doc
  // comment: the stage order and every legality check on a decision are the
  // SERVER's, not re-derived here.
  protected readonly queueRows = signal<EvaluationQueueRow[]>([]);
  protected readonly queueLoading = signal(false);
  protected readonly queueUnavailable = signal(false);
  protected readonly queueError = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadQueue();
  }

  protected async loadQueue(): Promise<void> {
    this.queueLoading.set(true);
    this.queueUnavailable.set(false);
    this.queueError.set(null);
    try {
      const result = await this.evaluationsApi.queue();
      if (result.kind === 'ok') {
        this.queueRows.set([...result.rows]);
        return;
      }
      this.queueRows.set([]);
      if (result.kind === 'unavailable') this.queueUnavailable.set(true);
      else this.queueError.set(result.message);
    } finally {
      this.queueLoading.set(false);
    }
  }

  protected readonly cards = computed(() => buildEvalTypeCards(this.queueRows()));
  protected readonly stageTabs = STAGE_TABS;
  protected readonly typeOptions = TYPE_OPTIONS;

  protected readonly view = signal<View>('list');
  protected readonly selectedCard = signal<EvalTypeCard | null>(null);

  // Scoped to whichever evaluation type is open, so "Total Applications"
  // here always matches that type's own count on the list page, instead
  // of the whole application pool.
  protected readonly ringStats = computed(() => {
    const card = this.selectedCard();
    return card ? buildEvalRingStats(this.queueRows(), card.key, card.title) : [];
  });
  protected readonly activeStage = signal<Stage>('under-review');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<'All' | (typeof TYPE_OPTIONS)[number]>('All');

  protected readonly activeFilterCount = computed(() => (this.typeFilter() === 'All' ? 0 : 1));

  protected clearFilters(): void {
    this.typeFilter.set('All');
  }

  protected readonly cardRows = computed(() => {
    const card = this.selectedCard();
    return card ? buildEvalRows(this.queueRows(), card.key) : [];
  });

  protected readonly stageRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    return this.cardRows().filter((r) => {
      if (r.stage !== this.activeStage()) return false;
      if (type !== 'All' && r.type !== type) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        (r.type?.toLowerCase().includes(term) ?? false)
      );
    });
  });

  protected readonly pagedRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.stageRows().slice(start, start + this.pageSize);
  });

  protected readonly selectedRow = signal<EvalRow | null>(null);

  protected readonly stageLabel = computed(() => {
    const row = this.selectedRow();
    if (!row) return '';
    return this.stageTabs.find((t) => t.key === row.stage)?.label ?? row.stage;
  });

  protected evalToneAccent(tone: KpiTone): string {
    return STEP_TONE_ACCENT[tone];
  }

  // ---- Record view: real data (documents, stepper, timeline) -----------
  // Replaces the old Applications-page "Evaluate" flow's mock
  // EVAL_CARDS/EVAL_DETAILS content — every field below reads straight off
  // ApplicationStore instead of a hardcoded placeholder record.

  protected readonly recordApplication = computed<ApplicationRecord | null>(() => {
    const row = this.selectedRow();
    return row ? (this.store.getById(row.id) ?? null) : null;
  });

  protected readonly recordApplicant = computed<Applicant | null>(() => {
    const app = this.recordApplication();
    return app ? (this.store.getApplicant(app.applicantId) ?? null) : null;
  });

  /**
   * The record view's real per-application documents (`GET
   * /staff/applications/:id`'s own `documents[]`), fetched fresh for whichever
   * application `openRecord`/the `?applicationId=` deep link put on screen.
   *
   * Mirrors `applications.ts`'s own `realDetail` fetch (see that file's
   * Documents-tab doc comment) rather than reading
   * `ApplicationStore.getDocuments()`, which `replaceApplications()` always
   * wipes to `[]` on a real queue load — a real application's genuinely
   * uploaded, scan-cleared documents were previously never read at all here,
   * so every one of them showed as "Missing" regardless of what the citizen
   * had actually uploaded (discovered live walking one through Document
   * Verification -> Evaluations end to end).
   *
   * `null` while unfetched/loading, or permanently for a seed/local-demo
   * application the real backend has never heard of (a 404/501 there
   * resolves to 'unavailable' and this simply never gets set) — callers fall
   * back to the seed-only `ApplicationStore` in that case, same as before.
   */
  protected readonly recordRealDocuments = signal<readonly ApplicationDocumentRow[] | null>(null);
  // Same real fetch as `recordRealDocuments`, its `timeline[]` instead of
  // `documents[]` — see `recordAuditTrail` below for why this exists at
  // all: the Timeline tab used to read `ApplicationStore.getAuditTrail()`
  // unconditionally, a seed-only collection `replaceApplications()` always
  // wipes to `[]` on a real queue load, so on a real application this tab
  // silently showed "No activity recorded yet." no matter how much real
  // history the application actually had.
  protected readonly recordRealTimeline = signal<readonly ApplicationTimelineEvent[] | null>(null);

  private lastRecordDocAppId: string | null = null;
  private readonly loadRecordDocuments = effect(() => {
    const app = this.recordApplication();
    const id = app?.id ?? null;
    untracked(() => {
      if (id === this.lastRecordDocAppId) return;
      this.lastRecordDocAppId = id;
      this.recordRealDocuments.set(null);
      this.recordRealTimeline.set(null);
      if (!id) return;
      void this.applicationsApi.detail(id).then((result) => {
        if (this.lastRecordDocAppId !== id) return; // moved to a different record before this resolved
        if (result.kind === 'ok') {
          this.recordRealDocuments.set([...result.detail.documents]);
          this.recordRealTimeline.set([...result.detail.timeline]);
        }
      });
    });
  });

  protected readonly recordDocumentRows = computed<RecordDocumentRow[]>(() => {
    const app = this.recordApplication();
    if (!app) return [];
    const requirements = requirementsFor(app.permitType).documents;
    const real = this.recordRealDocuments();
    if (real) {
      // Joined primarily by `label`, not `requirementCode` — a genuine
      // citizen upload (the Citizen Portal's `application-wizard.page.ts`
      // `uploadReal()`) sends `requirementCode: null` ON PURPOSE (see that
      // method's own comment): this portal's requirements-catalog ids and
      // the Admin Portal's own published-checklist codes are two different,
      // incompatible id schemes, and sending a mismatched code turns every
      // real submission into a hard server refusal the moment any office
      // publishes a checklist. So matching on `requirementCode` alone left
      // every real citizen-uploaded document unmatched — `requirementCode`
      // was `null` on every one of them — and every row still rendered as
      // "Missing", confirmed live even after the fetch itself started
      // working. `label` is what both sides actually share: the wizard
      // sends the requirements-catalog's own `d.label` verbatim, the same
      // string this portal's own `requirementsFor(...).documents[].label`
      // holds, confirmed byte-identical live across every requirement
      // checked. `requirementCode` is still tried FIRST and preferred when
      // present — a staff-attached document (`StaffApplicationsApi.
      // attachDocument`, which takes a real `requirementCode` param) does
      // send a genuine matching one.
      const byRequirementCode = new Map(
        real
          .filter((d): d is ApplicationDocumentRow & { requirementCode: string } => d.requirementCode !== null)
          .map((d) => [d.requirementCode, d]),
      );
      const byLabel = new Map(real.map((d) => [d.label, d]));
      return requirements.map((req) => {
        const found = byRequirementCode.get(req.id) ?? byLabel.get(req.label);
        return {
          requirementId: req.id,
          label: req.label,
          required: req.required,
          departmentName: departmentName(req.reviewingDepartmentId),
          doc: found
            ? { fileName: found.fileName, status: found.reviewStatus ?? 'Uploaded', uploadedAt: found.uploadedAt }
            : null,
        };
      });
    }
    const stored = this.store.getDocuments(app.id);
    const byRequirement = new Map(stored.map((d) => [d.requirementId, d]));
    return requirements.map((req) => ({
      requirementId: req.id,
      label: req.label,
      required: req.required,
      departmentName: departmentName(req.reviewingDepartmentId),
      doc: byRequirement.get(req.id) ?? null,
    }));
  });

  protected readonly recordMissingRequiredCount = computed(
    () => this.recordDocumentRows().filter((r) => r.required && !r.doc).length,
  );

  /**
   * Read straight off `selectedRow().row` — the real `GET /staff/evaluations`
   * row, already carrying every decision ever recorded for this application
   * (`evaluations[]`) and the server's own next-stage pointer (`nextStage`).
   *
   * Previously read `ApplicationStore.getEvaluations(app.id)`: a seed-only
   * demo collection that `replaceApplications()` always wipes to `[]` on a
   * real queue load (same family of bug as `recordDocumentRows`'s own fix,
   * see that computed's doc comment). So for every real application this
   * always returned no records at all — no stage ever showed "— Passed", no
   * stage was ever highlighted current, and the stepper looked frozen no
   * matter what "Advance Stage"/"Return for Revision" actually did against
   * the real backend. Confirmed live: the −6 Missing Documents count reported
   * alongside this was a second, unrelated bug (the document-requirements
   * catalog itself was never seeded — see migration 043) but this stepper
   * would have stayed static even after that fix, since it was never reading
   * the real evaluations at all.
   */
  protected readonly recordEvaluationSteps = computed<RecordEvalStep[]>(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const decisions = row.row.evaluations;
    return EVALUATION_STAGE_ORDER.map((stage) => {
      const stageDecisions = decisions.filter((d) => d.stage === stage);
      const latest =
        stageDecisions.length > 0
          ? stageDecisions.reduce((a, b) => ((b.evaluatedAt ?? '') > (a.evaluatedAt ?? '') ? b : a))
          : null;
      return {
        stage,
        result: (latest?.result ?? null) as RecordEvalStep['result'],
        evaluatorLabel: latest?.evaluatedAt ? formatDateTime(latest.evaluatedAt) : null,
        isCurrent: stage === row.row.nextStage,
        isDone: latest?.result === 'Passed',
      };
    });
  });

  /**
   * Real once fetched (see `recordRealTimeline` above); falls back to the
   * seed-only `ApplicationStore.getAuditTrail()` only while unfetched or
   * for a seed/local-demo application the real backend never heard of —
   * mirrors `applications.ts`'s own `realTimeline` (same real/seed split,
   * same field mapping), kept in this file's own pre-existing
   * `{id, action, timestamp, actor, role, remarks}` shape rather than
   * that file's `TimelineItem` so the template here needed no rewrite.
   */
  protected readonly recordAuditTrail = computed(() => {
    const row = this.selectedRow();
    if (!row) return [];
    const real = this.recordRealTimeline();
    if (real) {
      return [...real]
        .map((e, i) => {
          const occurred = new Date(e.occurredAt);
          const validDate = !Number.isNaN(occurred.getTime());
          return {
            id: `${row.id}-${i}`,
            action: e.toStatus,
            timestamp: validDate
              ? `${occurred.toLocaleDateString()}, ${occurred.toLocaleTimeString()}`
              : e.occurredAt,
            actor: e.actorName ?? e.office ?? (e.fromStatus ? `From ${e.fromStatus}` : 'Application filed'),
            role: '',
            remarks: e.remarks,
          };
        })
        .reverse();
    }
    return this.store.getAuditTrail(row.id);
  });

  // ---- Record view: document preview modal ------------------------------
  // Mirrors applications.ts's own `previewItem`/`closeDocPreview`/
  // `downloadPreviewDoc` (its real Documents-tab preview) — kept local
  // here rather than extracted into a shared component, matching that
  // existing precedent.

  protected readonly previewItem = signal<{
    label: string;
    filename: string;
    status: string;
  } | null>(null);

  protected openDocPreview(r: RecordDocumentRow): void {
    if (!r.doc) return;
    this.previewItem.set({ label: r.label, filename: r.doc.fileName, status: r.doc.status });
  }

  protected closeDocPreview(): void {
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

  openCard(card: EvalTypeCard): void {
    this.selectedCard.set(card);
    this.activeStage.set('under-review');
    this.searchTerm.set('');
    this.page.set(1);
    this.view.set('detail');
  }

  private appliedStageParam = false;
  private readonly applyStageParam = effect(() => {
    const key = this.stage();
    if (!key || this.appliedStageParam) return;
    const card = this.cards().find((c) => c.key === key);
    if (card) {
      this.appliedStageParam = true;
      this.openCard(card);
    }
  });

  /**
   * Locates which card (stage bucket) an application currently belongs under
   * and its own fresh `EvalRow` snapshot, straight off the live
   * `queueRows()` — the single lookup both `applyApplicationIdParam` (landing
   * on the record view via the `?applicationId=` deep link) and
   * `refreshRecordViewAfter` (re-landing on it after a real mutation) share,
   * so the two can never disagree about where an application "is".
   *
   * Mirrors evaluations-data.ts's own bucketing: no next stage and no
   * decisions yet means unrecorded; no next stage but a history of
   * decisions means every stage has been passed, which the 'final' card's
   * own Passed tab is where that application permanently lives.
   */
  private findRecordCardAndRow(id: string): { card: EvalTypeCard; row: EvalRow } | null {
    const queueRow = this.queueRows().find((r) => r.applicationId === id);
    if (!queueRow) return null;
    const cardKey =
      queueRow.nextStage === null
        ? queueRow.evaluations.length === 0
          ? 'unrecorded'
          : 'final'
        : (Object.entries(EVAL_KEY_TO_APP_STAGE) as [EvalTypeKey, string | null][]).find(
            ([, stage]) => stage === queueRow.nextStage,
          )?.[0];
    const card = cardKey && this.cards().find((c) => c.key === cardKey);
    if (!card) return null;
    const row = buildEvalRows(this.queueRows(), card.key).find((r) => r.id === id);
    return row ? { card, row } : null;
  }

  /**
   * Re-syncs `selectedRow`/`selectedCard` to the application's REAL current
   * stage after a successful `advanceStage`/`returnForRevision` — both
   * derive which stage they submit from `selectedCard()`, and before this,
   * neither ever refreshed it after their own `loadQueue()` reload. So the
   * record view stayed pinned to whichever card the officer had originally
   * opened: a first "Advance Stage" click correctly passed e.g. 'Initial',
   * but `selectedCard`/`selectedRow` never moved on to 'Zoning', so a SECOND
   * click resubmitted 'Initial' again — which a real backend correctly
   * refuses with a 409 ("The Initial stage has already been decided"),
   * discovered live clicking "Advance Stage" twice in a row on the same
   * application. No-ops when the record view has since been navigated away
   * from, or to a different application, in the meantime.
   */
  private refreshRecordViewAfter(applicationId: string): void {
    if (this.view() !== 'record' || this.selectedRow()?.id !== applicationId) return;
    const found = this.findRecordCardAndRow(applicationId);
    if (!found) return;
    this.selectedCard.set(found.card);
    this.selectedRow.set(found.row);
  }

  private appliedApplicationIdParam = false;
  private readonly applyApplicationIdParam = effect(() => {
    const id = this.applicationId();
    if (!id || this.appliedApplicationIdParam) return;
    const found = this.findRecordCardAndRow(id);
    if (!found) return;
    this.appliedApplicationIdParam = true;
    this.selectedCard.set(found.card);
    this.openRecord(found.row);
  });

  selectStage(stage: Stage): void {
    this.activeStage.set(stage);
    this.page.set(1);
  }

  onSearchChange(): void {
    this.page.set(1);
  }

  openRecord(row: EvalRow): void {
    this.selectedRow.set(row);
    this.view.set('record');
  }

  backToStage(): void {
    this.view.set('detail');
    this.selectedRow.set(null);
  }

  backToList(): void {
    this.view.set('list');
    this.selectedCard.set(null);
    this.selectedRow.set(null);
  }

  openApplicationRecord(row: EvalRow): void {
    this.router.navigateByUrl(`/applications/${row.id}`);
  }

  // ---- Row "more actions" popover ---------------------------------------

  protected readonly openMenuFor = signal<string | null>(null);
  protected readonly revisionRemarks = signal('');

  // The per-row "more actions" menu is rendered via CDK Overlay, in its
  // own signal, rather than sharing `openMenuFor` with the header menu —
  // this row lives inside `.table-wrap` (overflow-x: auto), which was
  // clipping the old absolutely-positioned `.menu-panel` and forcing a
  // scroll to see it. The overlay renders into its own top-level
  // container instead, so it always floats above everything. Mirrors
  // payments.ts's `openMenuTxnId`/`txnMenuPositions` pattern. The header
  // menu (toggleHeaderMenu) isn't inside any scrollable ancestor and
  // keeps using the original in-flow `.menu-panel` via `openMenuFor`.
  protected readonly openRowMenuId = signal<string | null>(null);

  protected readonly rowMenuPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
  ];

  protected toggleRowMenu(row: EvalRow): void {
    this.openRowMenuId.update((current) => {
      const next = current === row.id ? null : row.id;
      // Reset the shared remarks field on every open, not just when the
      // row id differs from the previously-open one — the same
      // application can reappear under a different evaluation stage
      // (e.g. after Back navigation), where row.id alone doesn't change
      // even though the remarks apply to a different record. Nothing
      // else clears this field except a successful submit, so without
      // an unconditional reset here, leftover text can silently get
      // attached to the wrong stage's "Return for Revision".
      if (next !== null) this.revisionRemarks.set('');
      return next;
    });
  }

  protected toggleHeaderMenu(): void {
    this.openMenuFor.update((current) => (current === 'header' ? null : 'header'));
  }

  protected closeMenu(): void {
    this.openMenuFor.set(null);
    this.openRowMenuId.set(null);
  }

  /** cdkConnectedOverlay only emits keydown events while the overlay is open — Escape is the one key it doesn't already close on by itself. */
  protected onRowMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeMenu();
  }

  // Real mutations now go through StaffEvaluationsApi's validated `record`
  // call — `POST /staff/applications/:id/evaluations` — which enforces stage
  // order, self-review, and remarks-required-for-refusal server-side. The
  // queue is reloaded after a successful decision rather than patched
  // locally, so the row's stage/tab always reflects what the server actually
  // recorded, not what this page assumed would happen.
  /** Surfaces a `record` refusal — e.g. Advance Stage on a row that's genuinely Rejected/Revision Required (every row in the "Returned" tab is), which the server refuses rather than silently force-passing. */
  protected readonly actionError = signal<string | null>(null);

  protected async advanceStage(row: EvalRow): Promise<void> {
    const card = this.selectedCard();
    if (!card) return;
    // Defense in depth — the row menu already hides this action once
    // `!row.isCurrentStage` (the application has genuinely moved past
    // this stage), but never trust the UI filter alone: acting anyway
    // would record a decision for THIS stage while the application is
    // actually being evaluated at a later one.
    if (!row.isCurrentStage) return;
    // No stage means nothing to advance PAST. Recording against a guessed stage
    // is what put every server row in the wrong queue to begin with.
    const stage = EVAL_KEY_TO_APP_STAGE[card.key];
    if (stage === null) return;
    this.actionError.set(null);
    const result = await this.evaluationsApi.record(row.id, { stage, result: 'Passed' });
    if (result.kind === 'done') {
      // The fifth pass does NOT move the lifecycle — nothing legal follows
      // Under Evaluation until an Order of Payment exists (`Under Evaluation
      // -> Assessed` needs `evaluations-complete` AND `order-of-payment-
      // issued`, lifecycle.ts). Issuing that Order is the next act and is
      // what moves it, so say so here rather than let the officer look for
      // a status change that is not owed yet.
      this.toast.success(
        result.evaluationsComplete
          ? `All five stages passed for ${row.applicant}'s application. Next: assess the fee — it moves to Assessed once the Order of Payment is issued.`
          : `${row.applicant}'s application advanced past ${card.title}.`,
      );
      await this.loadQueue();
      // Re-sync selectedCard/selectedRow to the application's real new
      // stage — see refreshRecordViewAfter's own doc comment for why this
      // is required before the NEXT click, not merely a nice-to-have.
      this.refreshRecordViewAfter(row.id);
    } else {
      this.actionError.set(result.message);
      this.toast.error(result.message);
    }
    this.closeMenu();
  }

  protected async returnForRevision(row: EvalRow): Promise<void> {
    const card = this.selectedCard();
    if (!card) return;
    if (!row.isCurrentStage) return;
    const stage = EVAL_KEY_TO_APP_STAGE[card.key];
    if (stage === null) return;
    const remarks = this.revisionRemarks().trim();
    if (!remarks) return;
    this.actionError.set(null);
    const result = await this.evaluationsApi.record(row.id, {
      stage,
      result: 'Revision Required',
      remarks,
    });
    if (result.kind === 'done') {
      this.revisionRemarks.set('');
      this.toast.success(`${row.applicant}'s application returned for revision.`);
      await this.loadQueue();
      this.refreshRecordViewAfter(row.id);
    } else {
      this.actionError.set(result.message);
      this.toast.error(result.message);
    }
    this.closeMenu();
  }

  // ---- Export -------------------------------------------------------------

  private evalCsvRow(row: EvalRow) {
    return {
      'Application ID': row.id,
      Applicant: row.applicant,
      'Business ID': row.businessId,
      'Business / Project': row.businessName,
      // '—' not '' — a blank cell in a spreadsheet reads as zero.
      'Missing Documents': row.missingDocuments ?? '—',
      Type: row.type,
      'Reviewing Department': row.department,
      'Date Submitted': row.dateSubmitted,
      Officer: row.officer,
      Status: row.status,
      Stage: this.stageTabs.find((t) => t.key === row.stage)?.label ?? row.stage,
    };
  }

  protected exportVisible(): void {
    const rows = this.stageRows();
    // `downloadCsv` writes nothing for an empty set, so "Exported 0 rows."
    // announced a file that was never created.
    if (rows.length === 0) {
      this.toast.info('Nothing to export — no rows match the current stage.');
      return;
    }
    downloadCsv(
      'evaluations',
      rows.map((row) => this.evalCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  protected exportAll(): void {
    const rows = this.cardRows();
    if (rows.length === 0) {
      this.toast.info('Nothing to export — there are no evaluations yet.');
      this.closeMenu();
      return;
    }
    downloadCsv(
      'all-evaluations',
      rows.map((row) => this.evalCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
    this.closeMenu();
  }

  protected exportDetail(): void {
    const row = this.selectedRow();
    if (!row) return;
    downloadCsv(`evaluation-${row.id}`, [this.evalCsvRow(row)]);
    this.toast.success('Exported.');
  }
}
