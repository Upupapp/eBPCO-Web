import { Component, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Topbar } from '../../shared/topbar/topbar';
import { KpiCard, KpiIllustration, KpiTone, KpiTrend } from '../../shared/kpi-card/kpi-card';
import { Icon } from '../../shared/icon/icon';
import { DonutChart, DonutSegment } from '../../shared/donut-chart/donut-chart';
import { StackedBarChart } from '../../shared/stacked-bar-chart/stacked-bar-chart';
import { BarList, BarListRow } from '../../shared/bar-list/bar-list';
import { AreaChart } from '../../shared/area-chart/area-chart';
import { Avatar } from '../../shared/avatar/avatar';
import { Pagination } from '../../shared/pagination/pagination';
import { buildPermitQueueRows } from '../../shared/permit-queue/permit-queue';
import { BusinessStagesBoard } from '../../shared/business-stages-board/business-stages-board';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import {
  EVALUATION_STAGE_ORDER,
  EvaluationResult,
  EvaluationStage,
} from '../../core/domain/status.model';

interface StatCardData {
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  label: string;
  value: string;
  trend: KpiTrend | null;
  footnote?: string;
}

// A real month-over-month *count* change — the last 30 days vs. the 30
// days before that. This dataset skews heavily recent (most seeded
// applications land within the last couple of weeks), so the "previous"
// bucket is often small; a *percentage* change against a small
// denominator produces mathematically real but wildly misleading swings
// (a 2-record baseline turns a modest gain into "+900%"). An absolute
// count delta doesn't have that failure mode — it stays meaningful (and
// never divides by zero) even when the previous period is nearly empty,
// including genuinely 0. Only a true zero change is omitted, since
// "+0"/"-0" has no real direction to report. `risingIsGood` maps an
// increase to positive/negative sentiment per metric — e.g. more Approved
// is good, a growing Pending backlog is not — independent of the arrow
// direction itself.
function monthlyTrend(
  counts: { recent: number; previous: number },
  risingIsGood: boolean,
): KpiTrend | null {
  const delta = counts.recent - counts.previous;
  if (delta === 0) return null;
  const direction: 'up' | 'down' = delta > 0 ? 'up' : 'down';
  const sentiment: 'positive' | 'negative' =
    (direction === 'up') === risingIsGood ? 'positive' : 'negative';
  const sign = direction === 'up' ? '+' : '−';
  return {
    label: `${sign}${Math.abs(delta)}`,
    direction,
    sentiment,
    comparison: 'vs last month',
  };
}

interface OverdueItem {
  severity: 'Low' | 'Medium' | 'High';
  color: string;
  text: string;
  agoLabel: string;
  applicationId: string;
  /** Canonical relationship — see ApplicationStore.getApplicationContext. Never derived from the applicant's name; one applicant can own multiple businesses. */
  businessId: string;
  businessName: string;
}

interface EvaluationStageRow {
  stage: EvaluationStage;
  label: string;
  count: number;
  pct: number;
}

// Display copy — the internal stage vocabulary (Initial/Zoning/'Fire
// Safety'/OBO/'Final Approval') gets a slightly fuller label here for
// this panel specifically, without renaming the underlying domain value.
const STAGE_DISPLAY_LABEL: Record<EvaluationStage, string> = {
  Initial: 'Initial Evaluation',
  Zoning: 'Zoning Evaluation',
  'Fire Safety': 'Fire Safety Evaluation',
  OBO: 'OBO Review',
  'Final Approval': 'Final Approval',
};

// Maps to the Evaluations page's own short-form stage key (EvalTypeKey in
// evaluations-data.ts) so a stage row's "?stage=" query param lands on
// the matching card there.
const STAGE_TO_EVAL_KEY: Record<EvaluationStage, string> = {
  Initial: 'initial',
  Zoning: 'zoning',
  'Fire Safety': 'fire',
  OBO: 'obo',
  'Final Approval': 'final',
};

@Component({
  selector: 'app-dashboard',
  imports: [
    Topbar,
    KpiCard,
    Icon,
    DonutChart,
    StackedBarChart,
    BarList,
    AreaChart,
    Avatar,
    Pagination,
    BusinessStagesBoard,
    FilterPanel,
    FormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly store = inject(ApplicationStore);

  constructor(private readonly router: Router) {}

  // Every KPI here is derived from the same ApplicationStore every other
  // page reads — no independently hand-picked totals, so this always
  // agrees with what Applications/Evaluations/Payments/Permit Release
  // actually show. Trimmed to the 5 most load-bearing figures — the
  // pipeline from intake to release: total, active review, payments
  // blocking progress, approved, and ready to hand over. "Revision
  // Required" (an exception state) and registered businesses/staff-user
  // counts (secondary administrative figures) are deliberately left off
  // this primary row rather than crowding it to 6-7 cards.
  protected readonly statCards = computed<StatCardData[]>(() => [
    {
      icon: 'logs',
      tone: 'info',
      illustration: 'applications',
      label: 'Total Applications',
      value: String(this.store.totalApplications()),
      trend: monthlyTrend(this.store.totalApplicationsMonthly(), true),
      footnote: 'All Time',
    },
    {
      icon: 'clock',
      tone: 'warning',
      illustration: 'pending',
      label: 'Pending / Under Review',
      value: String(this.store.pendingUnderReview()),
      trend: monthlyTrend(this.store.pendingUnderReviewMonthly(), false),
      footnote: 'Submitted through Under Evaluation',
    },
    {
      icon: 'wallet',
      tone: 'violet',
      illustration: 'payments',
      label: 'Payments Awaiting Verification',
      value: String(this.store.paymentsAwaitingVerification()),
      trend: monthlyTrend(this.store.paymentsAwaitingVerificationMonthly(), false),
      footnote: 'Submitted, not yet verified',
    },
    {
      icon: 'check-circle',
      tone: 'success',
      illustration: 'success',
      label: 'Approved',
      value: String(this.store.approvedTotal()),
      trend: monthlyTrend(this.store.approvedMonthly(), true),
      footnote: 'Approved through Completed',
    },
    {
      icon: 'file-check',
      tone: 'success',
      illustration: 'permit',
      label: 'Ready for Release',
      value: String(this.store.readyForRelease()),
      trend: monthlyTrend(this.store.readyForReleaseMonthly(), true),
      footnote: 'Permit generated, awaiting claim',
    },
  ]);

  // One stacked bar per permit type — bar length is that permit's total
  // queue volume, and the fill is its own Pending/Approved/Rejected split.
  // Real counts from the same store every other page reads (see
  // permit-queue.ts), not a decorative formula.
  protected readonly permitQueueRows = computed(() =>
    buildPermitQueueRows(this.store.applications()),
  );

  // Colors are the validated 4-slot categorical palette (dataviz skill
  // validate_palette.js: CVD separation + lightness band + chroma floor all
  // PASS) — info blue, success green, warning amber, and a 4th violet slot
  // for "Return" so it doesn't collide with the Pending/warning meaning.
  protected readonly statusSegments: DonutSegment[] = [
    { label: 'For Evaluation', value: 30, color: '#2563eb' },
    { label: 'Approved', value: 20, color: '#16a34a' },
    { label: 'Return', value: 20, color: '#7c3aed' },
    { label: 'Pending', value: 30, color: '#f59e0b' },
  ];

  protected readonly statusTotal = this.statusSegments.reduce((sum, s) => sum + s.value, 0);

  protected statusPercent(seg: DonutSegment): number {
    return Math.round((seg.value / this.statusTotal) * 100);
  }

  // Top businesses by application volume — real counts from the store,
  // not a hand-picked list.
  protected readonly businessRows = computed<BarListRow[]>(() => {
    const counts = new Map<string, number>();
    for (const app of this.store.applications()) {
      counts.set(app.businessName, (counts.get(app.businessName) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });

  protected readonly businessPage = signal(1);
  protected readonly businessPageSize = 5;

  protected readonly pagedBusinessRows = computed(() => {
    const start = (this.businessPage() - 1) * this.businessPageSize;
    return this.businessRows().slice(start, start + this.businessPageSize);
  });

  // ---- Merged from the former Tenant Dashboard (the two widgets that
  // weren't already duplicated elsewhere on this page): pending
  // applications grouped by evaluation stage, and overdue reviews linking
  // straight into the application workspace. ----------------------------

  // Every evaluation record across every application, not just the ones
  // still literally "Pending" at their stage — the previous version only
  // counted the Pending subset, which left Fire Safety/OBO/Final Approval
  // reading as empty since few applications sit mid-evaluation at those
  // later stages at any given moment. This shows real per-stage volume,
  // with a result filter so "only what's still pending" is still one
  // click away rather than the only view available.
  protected readonly stageResultFilter = signal<'All' | EvaluationResult>('All');
  protected readonly stageResultOptions: ('All' | EvaluationResult)[] = [
    'All',
    'Pending',
    'Passed',
    'Revision Required',
    'Rejected',
  ];

  // Five fixed rows (always all 5 stages, never conditionally hidden), each
  // carrying its own count and share of the currently-filtered total —
  // percentages recompute with the filter, never a separately hardcoded
  // figure. A bespoke row here rather than reusing the generic
  // HBarChart, which has no concept of per-row count/percentage labels or
  // per-row navigation and is scoped to this dashboard panel only (see
  // EvaluationStageRow below) so the shared component stays untouched.
  protected readonly stageRows = computed<EvaluationStageRow[]>(() => {
    const filter = this.stageResultFilter();
    const records = this.store.evaluations().filter((r) => filter === 'All' || r.result === filter);
    const total = records.length;
    return EVALUATION_STAGE_ORDER.map((stage) => {
      const count = records.filter((r) => r.stage === stage).length;
      return {
        stage,
        label: STAGE_DISPLAY_LABEL[stage],
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  });

  protected readonly stageTotal = computed(() =>
    this.stageRows().reduce((sum, r) => sum + r.count, 0),
  );

  // Independent of the active filter — "how many need attention" should
  // stay a stable orientation signal rather than disappearing when the
  // filter happens to be narrowed to something else (e.g. "Passed").
  protected readonly stageAttentionCount = computed(
    () =>
      this.store
        .evaluations()
        .filter((r) => r.result === 'Revision Required' || r.result === 'Rejected').length,
  );

  protected readonly stageSummaryLabel = computed(() => {
    switch (this.stageResultFilter()) {
      case 'Pending':
        return 'applications pending evaluation';
      case 'Passed':
        return 'evaluations passed';
      case 'Revision Required':
        return 'evaluations need revision';
      case 'Rejected':
        return 'evaluations rejected';
      default:
        return 'applications currently in evaluation';
    }
  });

  protected openStage(stage: EvaluationStage): void {
    this.router.navigate(['/evaluations'], { queryParams: { stage: STAGE_TO_EVAL_KEY[stage] } });
  }

  // "Overdue" = still actively awaiting review, submitted more than 5 days
  // ago — a real, derived condition rather than a hardcoded list of 3
  // names, so it can never reference an application that doesn't exist.
  protected readonly overdueItems = computed<OverdueItem[]>(() => {
    const now = Date.now();
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    return this.store
      .applications()
      .filter((a) => a.evaluationResult === 'Pending' && now - a.dateValue.getTime() > fiveDaysMs)
      .sort((a, b) => a.dateValue.getTime() - b.dateValue.getTime())
      .slice(0, 5)
      .map((a) => {
        const ageMs = now - a.dateValue.getTime();
        const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
        const severity: OverdueItem['severity'] =
          ageMs > tenDaysMs ? 'High' : ageMs > fiveDaysMs * 1.5 ? 'Medium' : 'Low';
        const color =
          severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#f5c518';
        return {
          severity,
          color,
          text: `${a.applicant}'s application is waiting in ${a.evaluationStage} evaluation for ${days} day${days === 1 ? '' : 's'}`,
          agoLabel: a.dateSubmitted,
          applicationId: a.id,
          businessId: a.businessId,
          businessName: a.businessName,
        };
      });
  });

  protected reviewOverdue(item: OverdueItem): void {
    this.openDetail({ id: item.applicationId } as ApplicationRecord);
  }

  // "Recent Applications" is a live slice of the shared ApplicationStore
  // (the same pool every other page reads) instead of an independently
  // hardcoded array — a status change made anywhere else is reflected
  // here too.
  private static readonly RECENT_COUNT = 7;
  protected readonly recentApplications = computed(() =>
    this.store.applications().slice(0, Dashboard.RECENT_COUNT),
  );

  protected readonly view = signal<'list'>('list');

  openDetail(row: ApplicationRecord): void {
    this.router.navigateByUrl(`/applications/${row.id}`);
  }

  // ---- Filters ------------------------------------------------------

  protected readonly statusFilter = signal<'All' | 'Approved' | 'Under Review' | 'Rejected'>('All');
  protected readonly statusOptions: ('All' | 'Approved' | 'Under Review' | 'Rejected')[] = [
    'All',
    'Approved',
    'Under Review',
    'Rejected',
  ];

  protected readonly searchTerm = signal('');

  protected readonly filteredApplications = computed(() => {
    const status = this.statusFilter();
    const term = this.searchTerm().trim().toLowerCase();
    return this.recentApplications().filter((row) => {
      if (status !== 'All' && row.status !== status) return false;
      if (!term) return true;
      return (
        row.id.toLowerCase().includes(term) ||
        row.applicant.toLowerCase().includes(term) ||
        row.businessName.toLowerCase().includes(term) ||
        row.location.toLowerCase().includes(term) ||
        row.type.toLowerCase().includes(term)
      );
    });
  });

  protected readonly activeFilterCount = computed(() => (this.statusFilter() === 'All' ? 0 : 1));

  protected clearFilters(): void {
    this.statusFilter.set('All');
  }

  // ---- Export / navigation ---------------------------------------------
  // Dashboard summarizes and links to full modules rather than
  // duplicating their management interfaces — creating, editing,
  // selecting, and deleting applications all live on the Applications
  // page now, not here.

  protected exportVisible(): void {
    downloadCsv(
      'recent-applications',
      this.filteredApplications().map((row) => ({
        'Application ID': row.id,
        Applicant: row.applicant,
        'Business ID': row.businessId,
        'Business / Project': row.businessName,
        Location: row.location,
        Type: row.type,
        'Date Submitted': row.dateSubmitted,
        Officer: row.officer,
        Status: row.status,
      })),
    );
  }

  protected exportQueueReport(): void {
    downloadCsv(
      'permit-queue-report',
      this.permitQueueRows().map((row) => ({
        'Permit Type': row.label,
        Total: row.total,
        ...Object.fromEntries(row.segments.map((s) => [s.label, s.value])),
      })),
    );
  }

  protected goToAllApplications(): void {
    this.router.navigateByUrl('/applications');
  }

  protected goToEvaluations(): void {
    this.router.navigateByUrl('/evaluations');
  }
}
