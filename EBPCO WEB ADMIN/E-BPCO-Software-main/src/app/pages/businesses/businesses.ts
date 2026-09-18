import { Component, ElementRef, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { QueueLoadNotice } from '../../shared/queue-load-notice/queue-load-notice';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { downloadCsv } from '../../shared/utils/export-csv';
import { buildBusinessDetail, buildRealBusinessDetail } from './business-detail-data';
import { ApplicationStore } from '../../core/domain/application-store';
import { Business } from '../../core/domain/business.model';
import { applicantFullName } from '../../core/domain/applicant.model';
import { ToastService } from '../../shared/toast/toast.service';
import { validateMobileNumber } from '../../shared/utils/validators';
import { CapitalizeNameDirective } from '../../shared/utils/capitalize-name.directive';
import { StaffBusinessesApi, StaffBusinessDetail, StaffBusinessRow } from '../../core/api/staff-businesses.api';

type SubTab = 'analytics' | 'recent-activity';
type ViewMode = 'list' | 'create' | 'detail';
type DetailTab = 'overview' | 'applications' | 'documents' | 'users' | 'activity';

interface RingStat {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  pct: number;
  isTotal: boolean;
  support: string;
}

// Mirrors E-BPCO Mobile's BusinessCategory enum exactly (business_model.dart)
// — still the vocabulary this page's own local seed data and "Create
// Business" form use. A REAL business's category comes from the backend's
// own wider `businessShape.category` enum instead (see `REAL_CATEGORY_OPTIONS`
// below) — the two lists differ (real has Construction/Transport/Agriculture,
// not Wholesale), so `BusinessRow.category` below is a plain `string`
// rather than this narrower type, and the category filter's options switch
// per data source rather than assuming one list covers both.
type BusinessCategory =
  'Retail' | 'Food Service' | 'Services' | 'Manufacturing' | 'Wholesale' | 'Other';

interface BusinessRow {
  id: string;
  code: string;
  category: string;
  city: string;
  contactName: string;
  contactPhone: string;
  dateCreated: string;
  /** `null` when unknown. It was `8 + (hash(id) % 16)`, which sat beside a real "Active Users" count and contradicted it. */
  userCount: number | null;
  status: 'Active' | 'Inactive';
}

interface ActivityItem {
  name: string;
  text: string;
  dateLabel: string;
  agoLabel: string;
  color: string;
}

function formatDateTime(value: Date): string {
  return `${value.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} - `
    + value.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

function timeAgo(value: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - value.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface GrowthPoint {
  label: string;
  year: number;
  value: number;
}

@Component({
  selector: 'app-businesses',
  imports: [Topbar,
    QueueLoadNotice, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel, ConfirmDialog,
    CapitalizeNameDirective],
  templateUrl: './businesses.html',
  styleUrl: './businesses.scss',
})
export class Businesses {
  private readonly store = inject(ApplicationStore);
  private readonly businessesApi = inject(StaffBusinessesApi);

  /**
   * `GET /staff/businesses` is real and this page now calls it (P-4b) — the
   * rows below come straight from the server on real data, not the always-
   * empty `store.businesses()`. `null` until the first fetch resolves.
   */
  private readonly realRows = signal<StaffBusinessRow[] | null>(null);
  /** A message when the real fetch could not be completed — `null` on success, and while still loading. */
  protected readonly realListError = signal<string | null>(null);
  private readonly toast = inject(ToastService);

  constructor(private readonly router: Router) {
    effect(() => {
      const isSeed = this.store.isSeedData();
      if (!isSeed) {
        untracked(() => {
          void this.loadRealBusinesses();
        });
      }
    });
  }

  private async loadRealBusinesses(): Promise<void> {
    const result = await this.businessesApi.list();
    if (result.kind === 'ok') {
      this.realRows.set([...result.rows]);
      this.realListError.set(null);
    } else if (result.kind === 'unavailable') {
      this.realRows.set([]);
      this.realListError.set("This deployment's business directory endpoint isn't reachable.");
    } else {
      this.realRows.set([]);
      this.realListError.set(`Could not load the business directory: ${result.message}`);
    }
  }

  protected readonly view = signal<ViewMode>('list');
  protected readonly activeSubTab = signal<SubTab>('analytics');

  /**
   * `GET /staff/businesses` (P-4b) is the real source for these four cards
   * now — `realRows()`, not the always-empty `ApplicationStore._businesses`
   * (the queue API sends `businessName`/`applicant` as plain strings, not a
   * joinable id, and `replaceApplications` wipes `_businesses`/`_applicants`
   * to `[]` on every real load, which is why this branch used to fall back
   * to a coarser "distinct names in the queue" count with Active/Inactive
   * reading '—'). `store.businesses()`/`applicants()` are still the source
   * on seed data.
   */
  protected readonly ringStats = computed<RingStat[]>(() => {
    if (!this.store.isSeedData()) {
      const rows = this.realRows() ?? [];
      const totalUsers = new Set(rows.map((r) => r.owner.applicantId)).size;
      const active = rows.filter((r) => r.status === 'Active').length;
      const inactive = rows.filter((r) => r.status === 'Inactive').length;
      const total = rows.length;
      const pctOfTotal = (n: number) => (total ? Math.round((n / total) * 100) : 0);
      return [
        {
          label: 'Total Users',
          value: totalUsers.toLocaleString(),
          icon: 'users',
          tone: 'info',
          illustration: 'users',
          pct: 100,
          isTotal: true,
          support: 'Distinct business owners in the real business directory',
        },
        {
          label: 'Active Businesses',
          value: active.toLocaleString(),
          icon: 'check-circle',
          tone: 'success',
          illustration: 'success',
          pct: pctOfTotal(active),
          isTotal: false,
          support: `${pctOfTotal(active)}% of total businesses`,
        },
        {
          label: 'Inactive Businesses',
          value: inactive.toLocaleString(),
          icon: 'building',
          tone: 'danger',
          illustration: 'critical',
          pct: pctOfTotal(inactive),
          isTotal: false,
          support: `${pctOfTotal(inactive)}% of total businesses`,
        },
        {
          label: 'Total Businesses',
          value: total.toLocaleString(),
          icon: 'building',
          tone: 'violet',
          illustration: 'businesses',
          pct: 100,
          isTotal: false,
          support: 'Registered in the real business directory',
        },
      ];
    }
    const totalUsers = this.store.applicants().length || 1;
    const businesses = this.store.businesses();
    const active = businesses.filter((b) => b.status === 'Active').length;
    const inactive = businesses.filter((b) => b.status === 'Inactive').length;
    const total = businesses.length;
    return [
      {
        label: 'Total Users',
        value: totalUsers.toLocaleString(),
        icon: 'users',
        tone: 'info',
        illustration: 'users',
        pct: 100,
        isTotal: true,
        support: 'Across all registered businesses',
      },
      {
        label: 'Active Businesses',
        value: active.toLocaleString(),
        icon: 'check-circle',
        tone: 'success',
        illustration: 'success',
        pct: Math.round((active / totalUsers) * 100),
        isTotal: false,
        support: `${Math.round((active / totalUsers) * 100)}% of total users`,
      },
      {
        label: 'Inactive Businesses',
        value: inactive.toLocaleString(),
        icon: 'building',
        tone: 'danger',
        illustration: 'critical',
        pct: Math.round((inactive / totalUsers) * 100),
        isTotal: false,
        support: `${Math.round((inactive / totalUsers) * 100)}% of total users`,
      },
      {
        label: 'Total Businesses',
        value: total.toLocaleString(),
        icon: 'building',
        tone: 'violet',
        illustration: 'businesses',
        pct: Math.round((total / totalUsers) * 100),
        isTotal: false,
        support: `${Math.round((total / totalUsers) * 100)}% of total users`,
      },
    ];
  });

  /**
   * The real count behind the Communication Center's "All Businesses"
   * audience option — that option used to say a hardcoded "(150)" that
   * never changed and never agreed with the real "Total Businesses" ring
   * stat sitting on the very same page.
   */
  protected readonly totalBusinessesCount = computed<number>(() =>
    this.store.isSeedData() ? this.store.businesses().length : (this.realRows() ?? []).length,
  );

  // A real Business's registration/contact fields — never a fabricated
  // dataset — with the owner's contact info joined through the real
  // `Applicant` (never guessed from the business name). Fields with no
  // `userCount` used to be `8 + (hash(id) % 16)`. Once the detail panel stopped
  // inventing staff, that hash sat beside a real "Active Users 1" and openly
  // contradicted it — 21 users claimed, one known. It is `null` now and renders
  // as a dash.
  //
  // `subdomain` is GONE (P-F3). It was `slugify(name) + '.castillasorsogon.gov.ph'`
  // — a hostname invented on the LGU's REAL government domain, shown as a table
  // column, repeated in the detail panel, written into the CSV export, and
  // searchable. None of them resolve; the parent domain does, which is exactly
  // what made it plausible to anyone who read one.
  //
  // The API had already refused to serve it, in as many words: "leftovers from a
  // multi-tenant template" that "describe nothing in this domain", and inventing
  // one "would create a vocabulary the LGU never asked for and would then have to
  // keep". The add-business form even carried a "Subdomain Configuration" card
  // whose suffix still read `yourapp.gov.ph` — the template's own placeholder,
  // never edited.
  private toBusinessRow(b: Business): BusinessRow {
    const owner = this.store.getApplicant(b.ownerApplicantId);
    return {
      id: b.id,
      code: b.name,
      category: b.category,
      city: `Barangay ${b.barangay}`,
      contactName: owner ? applicantFullName(owner) : 'Not provided',
      contactPhone: owner?.mobileNumber ?? 'Not provided',
      dateCreated: b.dateRegistered,
      userCount: null,
      status: b.status,
    };
  }

  /** The real equivalent of `toBusinessRow` — from a `GET /staff/businesses` row, never fabricated. `userCount` stays `null`: the real route has no such column either. */
  private toRealBusinessRow(b: StaffBusinessRow): BusinessRow {
    return {
      id: b.id,
      code: b.name,
      category: b.category,
      city: `Barangay ${b.barangay}`,
      contactName: b.owner.name,
      contactPhone: b.owner.mobileNumber ?? 'Not provided',
      dateCreated: b.dateRegistered,
      userCount: null,
      status: b.status === 'Active' ? 'Active' : 'Inactive',
    };
  }

  /**
   * On real data, sourced from `realRows()` (P-4b's `GET /staff/businesses`
   * fetch) rather than the always-empty `store.businesses()`. Businesses
   * created through this page's own "+ Business" wizard this session
   * (`locallyCreatedRows`, kept separate since they aren't real linkable
   * Business records — see createBusiness's documented limitation) are
   * still overlaid on top either way.
   */
  private readonly locallyCreatedRows = signal<BusinessRow[]>([]);
  /** Ids removed via confirmDelete — hides a store-backed row from this view rather than mutating shared store data no method exists to delete. */
  private readonly hiddenIds = signal<ReadonlySet<string>>(new Set());

  protected readonly businessRows = computed<BusinessRow[]>(() => {
    const hidden = this.hiddenIds();
    const serverRows = this.store.isSeedData()
      ? this.store.businesses().map((b) => this.toBusinessRow(b))
      : (this.realRows() ?? []).map((b) => this.toRealBusinessRow(b));
    return [...this.locallyCreatedRows(), ...serverRows].filter((r) => !hidden.has(r.id));
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');

  protected readonly categoryFilter = signal<string>('All');
  protected readonly statusFilter = signal<'All' | 'Active' | 'Inactive'>('All');
  private readonly SEED_CATEGORY_OPTIONS: BusinessCategory[] = [
    'Retail',
    'Food Service',
    'Services',
    'Manufacturing',
    'Wholesale',
    'Other',
  ];
  // The backend's real `businessShape.category` enum (businesses.controller.ts)
  // — wider than mobile's, and without "Wholesale".
  private readonly REAL_CATEGORY_OPTIONS: readonly string[] = [
    'Retail',
    'Food Service',
    'Services',
    'Manufacturing',
    'Construction',
    'Transport',
    'Agriculture',
    'Other',
  ];
  /** The filter dropdown's options track which vocabulary the visible rows actually use, so every real category is reachable and no seed-only category is offered when it could never match. */
  protected readonly categoryOptions = computed<readonly string[]>(() =>
    this.store.isSeedData() ? this.SEED_CATEGORY_OPTIONS : this.REAL_CATEGORY_OPTIONS,
  );

  protected readonly activeFilterCount = computed(
    () => (this.categoryFilter() === 'All' ? 0 : 1) + (this.statusFilter() === 'All' ? 0 : 1),
  );

  protected clearFilters(): void {
    this.categoryFilter.set('All');
    this.statusFilter.set('All');
    this.page.set(1);
  }

  protected readonly filteredBusinessRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();
    const status = this.statusFilter();
    return this.businessRows().filter((r) => {
      if (category !== 'All' && r.category !== category) return false;
      if (status !== 'All' && r.status !== status) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.contactName.toLowerCase().includes(term) ||
        r.contactName.toLowerCase().includes(term)
      );
    });
  });

  protected readonly pagedBusinessRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredBusinessRows().slice(start, start + this.pageSize);
  });

  protected onSearchChange(): void {
    this.page.set(1);
  }

  protected readonly selectedBusiness = signal<BusinessRow | null>(null);
  protected readonly detailTab = signal<DetailTab>('overview');

  /** `GET /staff/businesses/:id`'s own `applications[]` — fetched fresh by `openDetail` on real data, since the store carries no real Business↔application link (see `businessRows`' own doc comment). `null` until fetched, or for a locally-created row that has no real record at all. */
  private readonly realDetail = signal<StaffBusinessDetail | null>(null);
  protected readonly realDetailError = signal<string | null>(null);

  private async loadRealDetail(businessId: string): Promise<void> {
    const result = await this.businessesApi.detail(businessId);
    if (result.kind === 'ok') {
      this.realDetail.set(result.detail);
      this.realDetailError.set(null);
    } else if (result.kind === 'not-found') {
      // A row created this session via "+ Business" has no real record —
      // expected, not an error; the Applications/Documents/Users/Activity
      // tabs simply stay empty for it.
      this.realDetail.set(null);
      this.realDetailError.set(null);
    } else {
      this.realDetail.set(null);
      this.realDetailError.set(
        result.kind === 'unavailable'
          ? "This deployment's business detail endpoint isn't reachable."
          : `Could not load this business's applications: ${result.message}`,
      );
    }
  }

  protected readonly businessDetail = computed(() => {
    const row = this.selectedBusiness();
    if (!row) return null;
    if (!this.store.isSeedData()) {
      const detail = this.realDetail();
      return buildRealBusinessDetail(row, detail?.applications ?? []);
    }
    // The canonical join — never the applicant's name, never fabricated.
    // A business created via this page's own wizard (not a real
    // ApplicationStore Business) simply has no linked applications yet.
    // Each application's real generated permit number (once one exists)
    // is resolved alongside it and kept distinct from the application id.
    const linked = this.store
      .applications()
      .filter((a) => a.businessId === row.id)
      .map((application) => ({
        application,
        permitNumber: this.store.getPermit(application.id)?.permitNumber ?? null,
      }));
    return buildBusinessDetail(row, linked);
  });

  openDetail(row: BusinessRow): void {
    this.selectedBusiness.set(row);
    this.detailTab.set('overview');
    this.view.set('detail');
    if (!this.store.isSeedData()) {
      this.realDetail.set(null);
      this.realDetailError.set(null);
      void this.loadRealDetail(row.id);
    }
  }

  protected selectDetailTab(tab: DetailTab): void {
    this.detailTab.set(tab);
  }

  // ---- Selection + delete ---------------------------------------------

  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly deleteTarget = signal<BusinessRow | 'bulk' | null>(null);

  protected isSelected(row: BusinessRow): boolean {
    return this.selectedIds().has(row.id);
  }

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.pagedBusinessRows();
    return visible.length > 0 && visible.every((row) => this.selectedIds().has(row.id));
  });

  protected toggleRowSelected(row: BusinessRow): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  }

  protected toggleSelectAll(): void {
    const visible = this.pagedBusinessRows();
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

  protected requestDelete(row: BusinessRow): void {
    this.deleteTarget.set(row);
  }

  protected requestDeleteSelected(): void {
    this.deleteTarget.set('bulk');
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  // Honest about the actual (session-local, non-persistent) effect —
  // "removed from the platform" previously implied a real deletion, but
  // this only hides the row from this view via a component-local signal;
  // it isn't written back to ApplicationStore (no delete method exists
  // there) and resets the moment this page is left and re-entered.
  protected readonly deleteDialogMessage = computed(() => {
    const target = this.deleteTarget();
    if (target === 'bulk') {
      const n = this.selectedIds().size;
      return `This will hide ${n} selected business${n === 1 ? '' : 's'} from this view for the rest of your visit (it isn't a permanent delete in this prototype).`;
    }
    if (target)
      return `This will hide ${target.code} (${target.id}) from this view for the rest of your visit (it isn't a permanent delete in this prototype).`;
    return '';
  });

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const idsToRemove = target === 'bulk' ? this.selectedIds() : new Set([target.id]);
    this.locallyCreatedRows.update((rows) => rows.filter((row) => !idsToRemove.has(row.id)));
    this.hiddenIds.update((current) => new Set([...current, ...idsToRemove]));
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const id of idsToRemove) next.delete(id);
      return next;
    });
    this.deleteTarget.set(null);
    this.toast.success(
      idsToRemove.size === 1
        ? 'Business hidden from this view.'
        : `${idsToRemove.size} businesses hidden from this view.`,
    );
  }

  // ---- Export -----------------------------------------------------------

  private businessCsvRow(row: BusinessRow) {
    return {
      'Registration No.': row.id,
      Business: row.code,
      Category: row.category,
      Location: row.city,
      Contact: row.contactName,
      Phone: row.contactPhone,
      'Date Registered': row.dateCreated,
      // '—' not '' — a blank spreadsheet cell reads as zero.
      Users: row.userCount ?? '—',
      Status: row.status,
    };
  }

  protected exportVisible(): void {
    const rows = this.filteredBusinessRows();
    // `downloadCsv` writes nothing for an empty set, so "Exported 0 rows."
    // announced a file that was never created (same fix as System Logs').
    if (rows.length === 0) {
      this.toast.info('Nothing to export — no businesses match the current view.');
      return;
    }
    downloadCsv(
      'businesses',
      rows.map((row) => this.businessCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  protected exportDetail(): void {
    const row = this.selectedBusiness();
    if (!row) {
      this.toast.error('No business selected to export.');
      return;
    }
    downloadCsv(`business-${row.id}`, [this.businessCsvRow(row)]);
    this.toast.success(`Exported ${row.code}.`);
  }

  /**
   * The 4 most recently-touched applications, each tied to its real
   * business — replaces a hardcoded list of 4 businesses with lorem-ipsum
   * body text and a May 2028 date (this app's data otherwise never leaves
   * 2026). `completedAt` (the server's own `application_transitions` audit
   * log, `application.model.ts`) is preferred as "when" a finished
   * application last moved; an in-progress one falls back to its real
   * filing date, since there is no bulk per-application "last touched"
   * timestamp available on this page without an N+1 fetch per row.
   */
  protected readonly recentActivity = computed<ActivityItem[]>(() => {
    const apps = this.store.applications();
    return apps
      .map((a) => ({ app: a, at: a.completedAt ?? a.dateValue }))
      .sort((x, y) => y.at.getTime() - x.at.getTime())
      .slice(0, 4)
      .map(({ app: a, at }) => ({
        name: a.businessName,
        text: a.completedAt
          ? `${a.permitType ?? 'Application'} reached ${a.lifecycleStatus}.`
          : `Filed a new ${a.permitType ?? 'permit'} application — currently ${a.lifecycleStatus}.`,
        dateLabel: formatDateTime(at),
        agoLabel: timeAgo(at),
        color: '#a78bfa',
      }));
  });

  protected readonly announcementText = signal('');
  // A stable key, not the display string itself — that string embeds
  // `totalBusinessesCount()`, which changes as real data loads, and a
  // `[(ngModel)]` bound directly to that text would silently show no
  // option selected the moment the count it was initialized with stopped
  // matching the option's current rendered text.
  protected readonly announcementAudience = signal<'all' | 'active'>('all');
  protected readonly announcementAudienceLabel = computed(() =>
    this.announcementAudience() === 'all'
      ? `All Businesses (${this.totalBusinessesCount()})`
      : 'Active Businesses Only',
  );
  protected readonly announcementError = signal('');
  protected readonly announcementSent = signal(false);

  broadcastNotice(): void {
    if (!this.announcementText().trim()) {
      this.announcementError.set('Write an announcement before broadcasting.');
      this.announcementSent.set(false);
      return;
    }
    this.announcementError.set('');
    this.announcementText.set('');
    this.announcementSent.set(true);
  }

  onAnnouncementChange(): void {
    this.announcementError.set('');
    this.announcementSent.set(false);
  }

  /**
   * Real monthly registrations, from the same `businessRows()` every other
   * widget on this page reads (real once `GET /staff/businesses` answers,
   * seed otherwise — see that computed's own doc comment) — a rolling
   * 12-month window ending this month, same shape as the Dashboard's own
   * `overviewChart`. This used to be a hardcoded illustrative array with
   * no connection to the real registrations shown everywhere else on this
   * page; a business genuinely registered this month now genuinely shows
   * up here.
   */
  protected readonly growthPoints = computed<GrowthPoint[]>(() => {
    const rows = this.businessRows();
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-US', { month: 'short' }) };
    });
    // A locally-created row not yet backed by a real record carries
    // 'Just now' rather than a parseable date (see createBusiness) — it
    // belongs in the current month's count, not silently dropped from the
    // chart entirely.
    const registeredOn = (row: BusinessRow): Date => {
      const parsed = new Date(row.dateCreated);
      return Number.isNaN(parsed.getTime()) ? now : parsed;
    };
    return months.map(({ year, month, label }) => ({
      label,
      year,
      value: rows.filter((r) => {
        const d = registeredOn(r);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length,
    }));
  });

  protected readonly growthPath = computed(() => {
    const pts = this.growthPoints();
    const maxVal = Math.max(...pts.map((p) => p.value), 1);
    const w = 1000;
    const h = 260;
    const stepX = w / (pts.length - 1);
    const coords = pts.map((p, i) => ({
      x: i * stepX,
      y: h - (p.value / maxVal) * h,
    }));
    return coords.map((c, i) => (i === 0 ? `M${c.x},${c.y}` : `L${c.x},${c.y}`)).join(' ');
  });

  protected readonly growthMarkers = computed(() => {
    const pts = this.growthPoints();
    const maxVal = Math.max(...pts.map((p) => p.value), 1);
    const w = 1000;
    const h = 260;
    const stepX = w / (pts.length - 1);
    return pts.map((p, i) => ({
      x: i * stepX,
      y: h - (p.value / maxVal) * h,
      label: p.label,
      year: p.year,
    }));
  });

  private readonly growthChartWrap = viewChild<ElementRef<HTMLDivElement>>('growthChartWrap');
  protected readonly hoveredGrowthIndex = signal<number | null>(null);

  protected readonly hoveredGrowthPoint = computed(() => {
    const i = this.hoveredGrowthIndex();
    if (i === null) return null;
    const marker = this.growthMarkers()[i];
    // Anchor the tooltip above the dot, but never let it rise past this
    // floor — otherwise a near-top point (a high growth value) floats the
    // tooltip up into the card header and behind the range filter.
    const tooltipY = Math.max(marker.y, 60);
    return { ...marker, tooltipY, value: this.growthPoints()[i].value };
  });

  protected onGrowthPointerMove(event: MouseEvent): void {
    const el = this.growthChartWrap()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const n = this.growthPoints().length;
    const idx = Math.round(ratio * (n - 1));
    this.hoveredGrowthIndex.set(Math.min(Math.max(idx, 0), n - 1));
  }

  protected onGrowthPointerLeave(): void {
    this.hoveredGrowthIndex.set(null);
  }

  protected readonly newBusiness = {
    businessName: '',
    type: '',
    contactName: '',
    contactPhone: '',
    region: 'region-5',
    province: 'sorsogon',
    cityMunicipality: 'castilla',
    barangay: '',
    userName: '',
    password: '',
    confirmPassword: '',
    modules: {
      initialEvaluation: false,
      zoningEvaluation: false,
      fireSafetyEvaluation: false,
      locationalClearance: false,
    },
  };

  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  selectSubTab(tab: SubTab): void {
    this.activeSubTab.set(tab);
  }

  // Recent Activity's own feed only ever holds these 4 seeded items —
  // System Logs already tracks this same kind of platform activity in
  // full, so "View All" goes there rather than padding this list with
  // invented rows.
  protected goToActivityLog(): void {
    this.router.navigateByUrl('/system-logs');
  }

  openCreate(): void {
    this.view.set('create');
  }

  backToList(): void {
    this.view.set('list');
  }

  /**
   * Creates a new row for this page's own list — NOT a real
   * `ApplicationStore` `Business` record, since this store is read-only
   * from this page's perspective (there's no domain-layer "register a
   * business" mutation yet, mirroring how the intake form is the one
   * real place a Business gets created). Documented limitation: an
   * application filed elsewhere would never link back to a business
   * created here, since its id was never actually added to the store.
   */
  createBusiness(): void {
    const name = this.newBusiness.businessName.trim();
    if (!name) {
      this.toast.error('Enter a business name before creating this registration.');
      return;
    }
    if (!this.newBusiness.password) {
      this.toast.error('Set a password for this business account before creating it.');
      return;
    }
    if (this.newBusiness.password !== this.newBusiness.confirmPassword) {
      this.toast.error('Password and confirm password do not match.');
      return;
    }
    // Optional (no `required` on the field, and an empty value already
    // falls back to 'N/A' below) — but a NON-empty value should be a real
    // Philippine mobile number, same rule and message the Applications
    // intake wizard's conceptually identical field already enforces.
    const phoneValidation = validateMobileNumber(this.newBusiness.contactPhone, false);
    if (!phoneValidation.valid) {
      this.toast.error(phoneValidation.error ?? 'Enter a valid contact number.');
      return;
    }
    const code = name.toUpperCase().replace(/\s+/g, '');
    // `Math.max(...[])` on an empty (or all-non-numeric) list is `-Infinity`,
    // which does not throw — it silently becomes part of the generated id
    // string instead ("REG-2026--Infinity"). Businesses created in a fresh
    // session always start from an empty `businessRows()` (no real
    // business-directory endpoint exists yet — see this page's own banner),
    // so this was not a rare edge case, it was the FIRST business created in
    // every session.
    const existingIds = this.businessRows()
      .map((r) => parseInt(r.id.replace('REG-2026-', ''), 10))
      .filter((n) => Number.isFinite(n));
    const nextIdNum = (existingIds.length === 0 ? 0 : Math.max(...existingIds)) + 1;
    const barangayLabel = this.newBusiness.barangay
      ? this.newBusiness.barangay.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'N/A';

    this.locallyCreatedRows.update((rows) => [
      {
        id: `REG-2026-${nextIdNum.toString().padStart(6, '0')}`,
        code: name,
        category: (this.newBusiness.type as BusinessCategory) || 'Other',
        city: barangayLabel === 'N/A' ? 'N/A' : `Barangay ${barangayLabel}`,
        contactName: this.newBusiness.contactName.trim() || 'N/A',
        contactPhone: phoneValidation.normalized || 'N/A',
        dateCreated: 'Just now',
        userCount: 1,
        status: 'Active',
      },
      ...rows,
    ]);

    this.view.set('list');
    this.page.set(1);
    this.toast.success(`"${name}" added to this list only — it has not been registered yet.`);
  }
}
