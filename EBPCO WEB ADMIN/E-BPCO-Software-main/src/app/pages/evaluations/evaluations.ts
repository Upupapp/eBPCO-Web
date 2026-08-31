import { Component, computed, effect, inject, input, signal } from '@angular/core';
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
import { SessionService } from '../../core/session/session.service';
import { EVALUATION_STAGE_ORDER, EvaluationStage } from '../../core/domain/status.model';
import { ALL_PERMIT_TYPES } from '../../core/domain/permit.model';
import { ApplicationRecord } from '../../core/domain/application.model';
import { Applicant } from '../../core/domain/applicant.model';
import { ApplicationDocument } from '../../core/domain/document.model';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { Capabilities } from '../../core/session/capabilities';
import { ViewOnlyNotice } from '../../shared/view-only-notice/view-only-notice';
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

/** One row of the record view's real Documents Checklist — read-only here (Accept/Reject stays an Applications-Documents-tab-only action). A required requirement with no uploaded row yet shows up as a synthetic "Missing" row rather than silently not appearing. */
interface RecordDocumentRow {
  requirementId: string;
  label: string;
  required: boolean;
  departmentName: string;
  doc: ApplicationDocument | null;
}

/** One step of the record view's real 5-stage evaluation stepper — `result`/`evaluatorLabel` are null until that stage has actually been evaluated at least once. */
interface RecordEvalStep {
  stage: EvaluationStage;
  result: 'Pending' | 'Passed' | 'Revision Required' | 'Rejected' | null;
  /** "{evaluator}, {evaluatedAt}" (or just the evaluator name if no date) — precomputed here so the template never nests an `@if` inside an interpolation. */
  evaluatorLabel: string | null;
  isCurrent: boolean;
  isDone: boolean;
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
export class Evaluations {
  /**
   * Whether this officer may decide anything here.
   *
   * From `Capabilities`, never a local boolean: a permission answered per
   * screen is one that is wrong on at least one screen, and the wrong one is
   * always the one nobody opened.
   */
  protected readonly capabilities = inject(Capabilities);

  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
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

  // Card counts, rows, and ring totals all read from the same
  // store-backed application pool every other page uses — a card's count
  // always equals the number of rows you actually see under it.
  private readonly applications = computed(() => this.store.applications());
  /** Real per-application-per-stage evaluation history — what makes the "Passed" tab a permanent record instead of a guess (see evaluations-data.ts's stageBucket/hasPassedStage). */
  private readonly allEvaluations = computed(() => this.store.evaluations());
  protected readonly cards = computed(() => buildEvalTypeCards(this.applications()));
  protected readonly stageTabs = STAGE_TABS;
  protected readonly typeOptions = TYPE_OPTIONS;

  protected readonly view = signal<View>('list');
  protected readonly selectedCard = signal<EvalTypeCard | null>(null);

  // Scoped to whichever evaluation type is open, so "Total Applications"
  // here always matches that type's own count on the list page, instead
  // of the whole application pool.
  protected readonly ringStats = computed(() => {
    const card = this.selectedCard();
    return card ? buildEvalRingStats(this.applications(), card.key, this.allEvaluations()) : [];
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
    return card ? buildEvalRows(this.applications(), card.key, this.allEvaluations(), (id) => this.store.missingRequiredDocuments(id)) : [];
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

  protected readonly recordDocumentRows = computed<RecordDocumentRow[]>(() => {
    const app = this.recordApplication();
    if (!app) return [];
    const requirements = requirementsFor(app.permitType).documents;
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

  protected readonly recordEvaluationSteps = computed<RecordEvalStep[]>(() => {
    const app = this.recordApplication();
    if (!app) return [];
    const records = this.store.getEvaluations(app.id);
    // -1 when the stage is unknown, so no step is marked current rather than
    // 'Initial' being marked current on no evidence.
    const currentIdx =
      app.evaluationStage === null ? -1 : EVALUATION_STAGE_ORDER.indexOf(app.evaluationStage);
    return EVALUATION_STAGE_ORDER.map((stage, idx) => {
      const stageRecords = records.filter((r) => r.stage === stage);
      const latest =
        stageRecords.length > 0
          ? stageRecords.reduce((a, b) =>
              (b.evaluatedAtValue?.getTime() ?? 0) > (a.evaluatedAtValue?.getTime() ?? 0) ? b : a,
            )
          : null;
      const evaluatorLabel = latest
        ? latest.evaluatedAt
          ? `${latest.evaluator}, ${latest.evaluatedAt}`
          : latest.evaluator
        : null;
      return {
        stage,
        result: latest?.result ?? null,
        evaluatorLabel,
        isCurrent: idx === currentIdx,
        isDone: idx < currentIdx,
      };
    });
  });

  protected readonly recordAuditTrail = computed(() => {
    const row = this.selectedRow();
    return row ? this.store.getAuditTrail(row.id) : [];
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

  private appliedApplicationIdParam = false;
  private readonly applyApplicationIdParam = effect(() => {
    const id = this.applicationId();
    if (!id || this.appliedApplicationIdParam) return;
    const app = this.store.getById(id);
    if (!app) return;
    const cardKey = (
      Object.entries(EVAL_KEY_TO_APP_STAGE) as [EvalTypeKey, EvaluationStage | null][]
    ).find(([, stage]) => stage === app.evaluationStage)?.[0];
    const card = cardKey && this.cards().find((c) => c.key === cardKey);
    if (!card) return;
    const row = buildEvalRows(this.applications(), card.key, this.allEvaluations(), (id) => this.store.missingRequiredDocuments(id)).find(
      (r) => r.id === id,
    );
    if (!row) return;
    this.appliedApplicationIdParam = true;
    this.selectedCard.set(card);
    this.openRecord(row);
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
      // Reset the shared remarks field whenever a *different* row's menu
      // opens — this field used to carry over whatever text was left in
      // it from the previously-opened row (nothing cleared it except a
      // successful submit), so leftover remarks from one application
      // could silently get attached to a completely different one's
      // "Return for Revision" if a staffer didn't notice the box was
      // already pre-filled.
      if (next !== null && next !== current) this.revisionRemarks.set('');
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

  // Real mutations now go through the store's validated
  // `recordEvaluation`, which advances the application's actual
  // lifecycle status — the row disappears from this stage/tab because the
  // underlying application really moved, not because a local-only field
  // changed.
  /** Surfaces a `recordEvaluation` refusal — e.g. Advance Stage on a row that's genuinely Rejected/Revision Required (every row in the "Returned" tab is), which the store now refuses rather than silently force-passing. */
  protected readonly actionError = signal<string | null>(null);

  protected advanceStage(row: EvalRow): void {
    const card = this.selectedCard();
    if (!card) return;
    // Defense in depth — the row menu already hides this action once
    // `!row.isCurrentStage` (the application has genuinely moved past
    // this stage), but never trust the UI filter alone: acting anyway
    // would call recordEvaluation for THIS stage while the application is
    // actually being evaluated at a later one.
    if (!row.isCurrentStage) return;
    // No stage means nothing to advance PAST. Recording against a guessed stage
    // is what put every server row in the wrong queue to begin with.
    const stage = EVAL_KEY_TO_APP_STAGE[card.key];
    if (stage === null) return;
    this.actionError.set(null);
    const actor = this.session.name() || 'Staff';
    const ok = this.store.recordEvaluation(row.id, stage, 'Passed', actor);
    if (!ok) {
      const message = `Can't advance ${row.applicant}'s application — it's currently Rejected or Revision Required, not actively Under Evaluation. Open it in Applications to see its real status.`;
      this.actionError.set(message);
      this.toast.error(message);
    } else {
      this.toast.success(`${row.applicant}'s application advanced past ${card.title}.`);
    }
    this.closeMenu();
  }

  protected returnForRevision(row: EvalRow): void {
    const card = this.selectedCard();
    if (!card) return;
    if (!row.isCurrentStage) return;
    const stage = EVAL_KEY_TO_APP_STAGE[card.key];
    if (stage === null) return;
    const remarks = this.revisionRemarks().trim();
    if (!remarks) return;
    this.actionError.set(null);
    const actor = this.session.name() || 'Staff';
    const ok = this.store.recordEvaluation(row.id, stage, 'Revision Required', actor, remarks);
    if (ok) {
      this.revisionRemarks.set('');
      this.toast.success(`${row.applicant}'s application returned for revision.`);
    } else {
      const message = `Can't return ${row.applicant}'s application for revision from its current status.`;
      this.actionError.set(message);
      this.toast.error(message);
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
    downloadCsv(
      'evaluations',
      rows.map((row) => this.evalCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  protected exportAll(): void {
    const rows = this.cardRows();
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
