import { Component, computed, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Icon } from '../icon/icon';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord, AppStatus, barangayOf } from '../../core/domain/application.model';
import { permitShortLabel } from '../../core/domain/permit.model';
import {
  ApplicationLifecycleStatus,
  EvaluationStage,
  EVALUATION_STAGE_ORDER,
} from '../../core/domain/status.model';

type StageFilterKey = 'All' | EvaluationStage;

interface StageFilterOption {
  value: StageFilterKey;
  label: string;
}

type PresetKey = 'all' | 'week' | 'month' | 'last7' | 'last30' | 'custom';

interface PresetOption {
  value: PresetKey;
  label: string;
}

interface StageColumn {
  status: AppStatus;
  label: string;
  dotClass: string;
  icon: string;
  footerIcon: string;
  emptyLabel: string;
  apps: ApplicationRecord[];
}

// Strictly these three — this board is a status-bucket overview, not the
// full application workflow (see the richer status set already used
// elsewhere, e.g. tenant-permit-release's "Ready for Release"/"Released").
const STAGE_ORDER: Omit<StageColumn, 'apps'>[] = [
  {
    status: 'Under Review',
    label: 'Under Review',
    dotClass: 'under-review',
    icon: 'clock',
    footerIcon: 'logs',
    emptyLabel: 'No applications under review for this period.',
  },
  {
    status: 'Approved',
    label: 'Approved',
    dotClass: 'approved',
    icon: 'check-circle',
    footerIcon: 'check-circle',
    emptyLabel: 'No approved applications for this period.',
  },
  {
    status: 'Rejected',
    label: 'Rejected',
    dotClass: 'rejected',
    icon: 'x-circle',
    footerIcon: 'alert-triangle',
    emptyLabel: 'No rejected applications for this period.',
  },
];

// A tidy two-per-row, three-row grid — enough for a real snapshot of each
// queue without the column growing unbounded. "View all" always hands off
// to the real Applications table instead of growing this card in place.
const PREVIEW_COUNT = 6;

@Component({
  selector: 'app-business-stages-board',
  imports: [Icon, DragDropModule, FormsModule],
  templateUrl: './business-stages-board.html',
  styleUrl: './business-stages-board.scss',
})
export class BusinessStagesBoard {
  private readonly store = inject(ApplicationStore);
  private readonly router = inject(Router);

  readonly selectApplication = output<ApplicationRecord>();

  protected readonly previewCount = PREVIEW_COUNT;

  protected readonly presetOptions: PresetOption[] = [
    { value: 'all', label: 'All Businesses' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Filters by which permit-evaluation stage a business currently belongs
  // to (Initial/Zoning/Fire Safety/OBO/Final Approval) — the same stage
  // set the Evaluations page's pipeline cards use — so a stage column can
  // be narrowed down to, say, only the businesses currently at OBO.
  protected readonly stageFilterOptions: StageFilterOption[] = [
    { value: 'All', label: 'All Permit Stages' },
    ...EVALUATION_STAGE_ORDER.map((stage) => ({ value: stage, label: stage })),
  ];

  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly filterOpen = signal(false);
  // Defaults to showing every business regardless of when it was
  // submitted — a date-range filter (This Week, etc.) is opt-in rather
  // than silently hiding most of the pool behind "This Week" by default.
  protected readonly preset = signal<PresetKey>('all');

  protected readonly stageFilterOpen = signal(false);
  protected readonly stageFilter = signal<StageFilterKey>('All');

  private readonly today = new Date();
  protected readonly customStart = signal<string>(this.toInputDate(this.addDays(this.today, -6)));
  protected readonly customEnd = signal<string>(this.toInputDate(this.today));
  protected readonly draftStart = signal<string>(this.customStart());
  protected readonly draftEnd = signal<string>(this.customEnd());

  // Data now comes from the shared ApplicationStore (single source of
  // truth across Dashboard/Tenant Dashboard/Tenant Applications/this
  // board) rather than a locally-generated copy. The loading/error
  // states are kept, simulating the async round-trip this pane is meant
  // to sit in front of once a real endpoint exists.
  private readonly allApplications = computed(() => this.store.applications());

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    queueMicrotask(() => {
      this.loading.set(false);
    });
  }

  protected retry(): void {
    this.load();
  }

  protected toggleFilterMenu(): void {
    this.filterOpen.update((open) => !open);
  }

  protected closeFilterMenu(): void {
    this.filterOpen.set(false);
  }

  protected selectPreset(value: PresetKey): void {
    this.preset.set(value);
    if (value !== 'custom') {
      this.filterOpen.set(false);
    } else {
      this.draftStart.set(this.customStart());
      this.draftEnd.set(this.customEnd());
    }
  }

  protected applyCustomRange(): void {
    this.customStart.set(this.draftStart());
    this.customEnd.set(this.draftEnd());
    this.filterOpen.set(false);
  }

  protected clearFilter(): void {
    this.preset.set('all');
    this.stageFilter.set('All');
    this.barangayFilter.set('All');
    this.filterOpen.set(false);
    this.stageFilterOpen.set(false);
    this.barangayOpen.set(false);
  }

  protected readonly selectedPresetLabel = computed(() => {
    if (this.preset() === 'custom') {
      return `${this.formatShort(this.customStart())} – ${this.formatShort(this.customEnd())}`;
    }
    return (
      this.presetOptions.find((option) => option.value === this.preset())?.label ?? 'All Businesses'
    );
  });

  protected toggleStageFilterMenu(): void {
    this.stageFilterOpen.update((open) => !open);
  }

  protected closeStageFilterMenu(): void {
    this.stageFilterOpen.set(false);
  }

  protected selectStageFilter(value: StageFilterKey): void {
    this.stageFilter.set(value);
    this.stageFilterOpen.set(false);
  }

  protected readonly selectedStageFilterLabel = computed(
    () =>
      this.stageFilterOptions.find((option) => option.value === this.stageFilter())?.label ??
      'All Permit Stages',
  );

  // ---- Barangay filter ----------------------------------------------------
  // Options are generated FROM the available application data (never a
  // hand-maintained list) — a barangay that has no applications right now
  // simply doesn't appear as a filter option, so this can never offer a
  // choice that would always show "no applications match".
  protected readonly barangayFilter = signal<'All' | string>('All');
  protected readonly barangayOpen = signal(false);

  protected readonly barangayOptions = computed<string[]>(() => {
    const set = new Set(this.allApplications().map((app) => barangayOf(app)));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  });

  protected toggleBarangayMenu(): void {
    this.barangayOpen.update((open) => !open);
  }

  protected closeBarangayMenu(): void {
    this.barangayOpen.set(false);
  }

  protected selectBarangay(value: string): void {
    this.barangayFilter.set(value);
    this.barangayOpen.set(false);
  }

  protected readonly selectedBarangayLabel = computed(() =>
    this.barangayFilter() === 'All' ? 'All Barangays' : `Barangay ${this.barangayFilter()}`,
  );

  protected permitShortLabel(app: ApplicationRecord): string {
    return permitShortLabel(app.permitType);
  }

  protected noteAriaLabel(app: ApplicationRecord): string {
    return `View application ${app.id} for ${app.applicant}, ${app.businessName}, ${app.permitType}, draggable to another stage`;
  }

  // 'all' is handled directly in `columns()` (skips date filtering
  // entirely) rather than here, since there's no finite Date range that
  // means "every business regardless of submission date."
  private readonly range = computed<{ start: Date; end: Date }>(() => {
    const now = this.today;
    switch (this.preset()) {
      case 'month': {
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: this.endOfDay(now) };
      }
      case 'last7':
        return { start: this.startOfDay(this.addDays(now, -6)), end: this.endOfDay(now) };
      case 'last30':
        return { start: this.startOfDay(this.addDays(now, -29)), end: this.endOfDay(now) };
      case 'custom': {
        const start = this.customStart()
          ? this.startOfDay(new Date(this.customStart()))
          : this.startOfDay(now);
        const end = this.customEnd()
          ? this.endOfDay(new Date(this.customEnd()))
          : this.endOfDay(now);
        return { start, end };
      }
      case 'week':
      default: {
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        return {
          start: this.startOfDay(this.addDays(now, -diffToMonday)),
          end: this.endOfDay(now),
        };
      }
    }
  });

  protected readonly columns = computed<StageColumn[]>(() => {
    const apps = this.allApplications();
    const inRange =
      this.preset() === 'all'
        ? apps
        : (() => {
            const { start, end } = this.range();
            return apps.filter((app) => app.dateValue >= start && app.dateValue <= end);
          })();
    const stage = this.stageFilter();
    const inStage =
      stage === 'All' ? inRange : inRange.filter((app) => app.evaluationStage === stage);
    const barangay = this.barangayFilter();
    const inBarangay =
      barangay === 'All' ? inStage : inStage.filter((app) => barangayOf(app) === barangay);
    return STAGE_ORDER.map((column) => ({
      ...column,
      apps: inBarangay.filter((app) => app.status === column.status),
    }));
  });

  protected readonly totalCount = computed(() =>
    this.columns().reduce((sum, column) => sum + column.apps.length, 0),
  );

  // Each stage previews a fixed handful of notes — the board is meant to
  // be a quick visual overview, not a second copy of the Overall
  // Applications Queue's full record list below it. "View all" always
  // hands off to that real table instead of growing this card in place.
  protected visibleApps(column: StageColumn): ApplicationRecord[] {
    return column.apps.slice(0, PREVIEW_COUNT);
  }

  protected select(app: ApplicationRecord): void {
    this.selectApplication.emit(app);
  }

  // Applications' own table (reachable from the sidebar) is the real,
  // paginated, filterable/searchable record list — "View all" here lands
  // there pre-filtered to this exact stage rather than duplicating that
  // list inline.
  protected viewAll(status: AppStatus): void {
    this.router.navigate(['/applications'], { queryParams: { status } });
  }

  // ---- Dragging notes between (and within) stages -----------------------
  // Every column connects to every other column (a self-connection is a
  // harmless no-op), so a note can be dragged from any stage into any
  // other one, or reordered within its own.
  protected readonly dropListIds = STAGE_ORDER.map((stage) => stage.dotClass);

  // This board is a quick, informal overview, not the real per-stage
  // workflow (see Applications/Evaluations/Payments/Permit Release for
  // that) — so a drag here is meant to move a card freely between all
  // three buckets, no restrictions. Each column resolves to one canonical
  // lifecycle status and is written directly via `updateFields` (which
  // skips ApplicationStore's stricter `transitionStatus` validation on
  // purpose) so every drop always succeeds.
  private static readonly COLUMN_TARGET: Record<AppStatus, ApplicationLifecycleStatus> = {
    'Under Review': 'Under Evaluation',
    Approved: 'Approved',
    Rejected: 'Rejected',
  };

  // A drop into Rejected pauses on a small "why?" prompt — rejecting is the
  // one move on this board worth a moment's explanation — but the prompt is
  // informational only: typing nothing and clicking OK still completes the
  // move. Every other column moves immediately, no prompt.
  protected readonly pendingReject = signal<{
    app: ApplicationRecord;
    targetStatus: AppStatus;
  } | null>(null);
  protected readonly rejectRemarks = signal('');

  protected onDrop(event: CdkDragDrop<ApplicationRecord[]>, targetStatus: AppStatus): void {
    const app = event.item.data as ApplicationRecord;
    if (targetStatus === 'Rejected' && app.status !== 'Rejected') {
      this.rejectRemarks.set('');
      this.pendingReject.set({ app, targetStatus });
      return;
    }
    this.moveApp(app.id, targetStatus);
  }

  protected confirmReject(): void {
    const pending = this.pendingReject();
    if (!pending) return;
    this.moveApp(pending.app.id, pending.targetStatus);
    this.pendingReject.set(null);
  }

  protected cancelReject(): void {
    this.pendingReject.set(null);
  }

  // Moves the dragged app to the front of the shared store (not just a
  // status swap in place) so it lands at the top of its new column and
  // the drag visibly does something, even for a same-column drop.
  private moveApp(id: string, targetStatus: AppStatus): void {
    this.store.updateFields(id, {
      lifecycleStatus: BusinessStagesBoard.COLUMN_TARGET[targetStatus],
    });
    this.store.bringToFront(id);
  }

  // Only one date field exists on a business record today (no separate
  // status-history timestamps), but it already represents "when this
  // record entered its current status" for range-filtering purposes — so
  // the label just needs to read that way per stage, without inventing
  // any new data.
  protected stageDateLabel(app: ApplicationRecord): string {
    switch (app.status) {
      case 'Under Review':
        return `Under Review since ${app.dateSubmitted}`;
      case 'Approved':
        return `Approved ${app.dateSubmitted}`;
      case 'Rejected':
        return `Rejected ${app.dateSubmitted}`;
    }
  }

  // A deterministic per-card tilt (based on the app's own id, not
  // Math.random(), so the board doesn't reshuffle on every re-render or
  // filter change) — kept nearly imperceptible so the grid still reads as
  // orderly rather than scattered.
  protected noteRotation(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    const normalized = (Math.abs(hash) % 100) / 100; // 0..1
    const degrees = (normalized - 0.5) * 0.6; // -0.3deg..0.3deg
    return `${degrees.toFixed(2)}deg`;
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private endOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatShort(iso: string): string {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
