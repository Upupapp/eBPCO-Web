import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { SessionService } from '../../core/session/session.service';
import { EvaluationStage } from '../../core/domain/status.model';
import {
  buildEvalTypeCards,
  buildEvalRows,
  buildEvalRingStats,
  STAGE_TABS,
  EvalTypeCard,
  EvalRow,
  Stage,
} from './evaluations-data';

type View = 'list' | 'detail' | 'record';

const TYPE_OPTIONS = ['Residential', 'Commercial', 'Renovation'] as const;

const EVAL_KEY_TO_APP_STAGE: Record<EvalTypeCard['key'], EvaluationStage> = {
  initial: 'Initial',
  zoning: 'Zoning',
  fire: 'Fire Safety',
  obo: 'OBO',
  final: 'Final Approval',
};

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
  imports: [Topbar, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.scss',
})
export class Evaluations {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  // Bound to the `?stage=` query param (see withComponentInputBinding in
  // app.config.ts) so a link like `/evaluations?stage=zoning` lands
  // directly on that stage's detail view, e.g. from a dashboard stage row.
  readonly stage = input<string>();

  // Card counts, rows, and ring totals all read from the same
  // store-backed application pool every other page uses — a card's count
  // always equals the number of rows you actually see under it.
  private readonly applications = computed(() => this.store.applications());
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
    return card ? buildEvalRingStats(this.applications(), card.key) : [];
  });
  protected readonly activeStage = signal<Stage>('pending-review');
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
    return card ? buildEvalRows(this.applications(), card.key) : [];
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
        r.type.toLowerCase().includes(term)
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

  openCard(card: EvalTypeCard): void {
    this.selectedCard.set(card);
    this.activeStage.set('pending-review');
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

  protected toggleRowMenu(row: EvalRow): void {
    this.openMenuFor.update((current) => (current === row.id ? null : row.id));
  }

  protected toggleHeaderMenu(): void {
    this.openMenuFor.update((current) => (current === 'header' ? null : 'header'));
  }

  protected closeMenu(): void {
    this.openMenuFor.set(null);
  }

  // Real mutations now go through the store's validated
  // `recordEvaluation`, which advances the application's actual
  // lifecycle status — the row disappears from this stage/tab because the
  // underlying application really moved, not because a local-only field
  // changed.
  protected advanceStage(row: EvalRow): void {
    const card = this.selectedCard();
    if (!card) return;
    const actor = this.session.name() || 'Staff';
    this.store.recordEvaluation(row.id, EVAL_KEY_TO_APP_STAGE[card.key], 'Passed', actor);
    this.closeMenu();
  }

  protected returnForRevision(row: EvalRow): void {
    const card = this.selectedCard();
    if (!card) return;
    const remarks = this.revisionRemarks().trim();
    if (!remarks) return;
    const actor = this.session.name() || 'Staff';
    const ok = this.store.recordEvaluation(
      row.id,
      EVAL_KEY_TO_APP_STAGE[card.key],
      'Revision Required',
      actor,
      remarks,
    );
    if (ok) this.revisionRemarks.set('');
    this.closeMenu();
  }

  // ---- Export -------------------------------------------------------------

  private evalCsvRow(row: EvalRow) {
    return {
      'Application ID': row.id,
      Applicant: row.applicant,
      'Missing Documents': row.missingDocuments,
      Type: row.type,
      'Reviewing Department': row.department,
      'Date Submitted': row.dateSubmitted,
      Officer: row.officer,
      Status: row.status,
      Stage: this.stageTabs.find((t) => t.key === row.stage)?.label ?? row.stage,
    };
  }

  protected exportVisible(): void {
    downloadCsv(
      'evaluations',
      this.stageRows().map((row) => this.evalCsvRow(row)),
    );
  }

  protected exportAll(): void {
    downloadCsv(
      'all-evaluations',
      this.cardRows().map((row) => this.evalCsvRow(row)),
    );
    this.closeMenu();
  }

  protected exportDetail(): void {
    const row = this.selectedRow();
    if (!row) return;
    downloadCsv(`evaluation-${row.id}`, [this.evalCsvRow(row)]);
  }
}
