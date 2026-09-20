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
import { validateEmail, validateMobileNumber } from '../../shared/utils/validators';
import { CapitalizeNameDirective } from '../../shared/utils/capitalize-name.directive';
import { CASTILLA_BARANGAYS } from '../../core/domain/castilla-barangays';
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
  protected readonly store = inject(ApplicationStore);
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

  /** Ids removed via confirmDelete — hides a store-backed row from this view rather than mutating shared store data no method exists to delete. */
  private readonly hiddenIds = signal<ReadonlySet<string>>(new Set());

  /** On real data, sourced from `realRows()` (`GET /staff/businesses`) rather than the always-empty `store.businesses()`. A business created through this page's own "+ Business" wizard is a real `POST /staff/businesses` row, so it appears here only after `loadRealBusinesses()` refetches — no local overlay needed. */
  protected readonly businessRows = computed<BusinessRow[]>(() => {
    const hidden = this.hiddenIds();
    const serverRows = this.store.isSeedData()
      ? this.store.businesses().map((b) => this.toBusinessRow(b))
      : (this.realRows() ?? []).map((b) => this.toRealBusinessRow(b));
    return serverRows.filter((r) => !hidden.has(r.id));
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
  protected readonly REAL_CATEGORY_OPTIONS: readonly string[] = [
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

  /** For the real Edit Business form's Barangay dropdown — a business filed with eBPCO is always within Castilla, same reasoning as `application-intake.ts`'s own use of this list. */
  protected readonly barangayOptions = CASTILLA_BARANGAYS;

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

  /** `GET /staff/businesses/:id`'s own `applications[]` — fetched fresh by `openDetail` on real data, since the store carries no real Business↔application link (see `businessRows`' own doc comment). `null` until fetched, or for a locally-created row that has no real record at all. Also the source for the real Edit form below — `BusinessRow` flattens barangay/city into one string and has no `street` at all, so the raw server shape is what the form actually needs. */
  protected readonly realDetail = signal<StaffBusinessDetail | null>(null);
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

  // ---- Real edit — PATCH /staff/businesses/:id ---------------------------
  // Until now nothing on either portal could correct a business already on
  // file: no PATCH route existed anywhere, staff or citizen, and this page's
  // own "Delete" was a documented, session-local fake (see confirmDelete's
  // own doc comment below). Edit is real-data only — a seed/local-demo row
  // has no server record to PATCH.

  protected readonly editingBusiness = signal(false);
  protected readonly editForm = signal<{
    name: string; category: string; street: string; barangay: string; city: string; province: string;
  } | null>(null);
  protected readonly savingEdit = signal(false);
  protected readonly editError = signal<string | null>(null);

  protected startEditBusiness(): void {
    const detail = this.realDetail();
    if (!detail) return;
    this.editForm.set({
      name: detail.name, category: detail.category, street: detail.street,
      barangay: detail.barangay, city: detail.city, province: detail.province,
    });
    this.editError.set(null);
    this.editingBusiness.set(true);
  }

  protected cancelEditBusiness(): void {
    this.editingBusiness.set(false);
    this.editForm.set(null);
    this.editError.set(null);
  }

  protected async saveEditBusiness(): Promise<void> {
    const form = this.editForm();
    const row = this.selectedBusiness();
    if (!form || !row) return;
    if (!form.name.trim() || !form.street.trim() || !form.barangay.trim() || !form.city.trim() || !form.province.trim()) {
      this.editError.set('Please complete every required field.');
      return;
    }
    this.savingEdit.set(true);
    const result = await this.businessesApi.update(row.id, form);
    this.savingEdit.set(false);
    if (result.kind !== 'done') {
      this.editError.set(result.kind === 'refused' || result.kind === 'failed' ? result.message : 'This deployment cannot accept a business edit right now.');
      return;
    }
    this.editingBusiness.set(false);
    this.editForm.set(null);
    this.toast.success('Business details updated.');
    await this.loadRealDetail(row.id);
    await this.loadRealBusinesses();
    // Keep the open detail row's own displayed fields (name/category/etc.)
    // in step with what was just saved, without requiring a re-click.
    this.selectedBusiness.set(this.toRealBusinessRow(result.row));
  }

  // ---- Real deactivate/reactivate — POST /staff/businesses/:id/(de|re)activate ----

  protected readonly changingBusinessStatus = signal(false);

  /** Reactivate is reversible and non-destructive, so it acts immediately — no confirm dialog, matching the Citizen Portal's own Deactivate/Reactivate UX (business-details.page.ts). Deactivate still goes through the existing confirm dialog below (requestDelete/confirmDelete) since it changes what an application against this business can do. */
  protected async reactivateBusiness(row: BusinessRow): Promise<void> {
    this.changingBusinessStatus.set(true);
    const result = await this.businessesApi.reactivate(row.id);
    this.changingBusinessStatus.set(false);
    if (result.kind !== 'done') {
      this.toast.error(result.kind === 'refused' || result.kind === 'failed' ? result.message : 'Could not reactivate this business.');
      return;
    }
    this.toast.success('Business reactivated.');
    await this.loadRealBusinesses();
    if (this.selectedBusiness()?.id === row.id) {
      this.selectedBusiness.set(this.toRealBusinessRow(result.row));
      await this.loadRealDetail(row.id);
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

  /**
   * Real data: `POST /staff/businesses/:id/deactivate` — a real, persistent
   * status change (never a hard delete: `applications.business_id` is `on
   * delete restrict`, so the row survives regardless). Seed/local-demo data
   * keeps the old session-local hide, honestly worded as such, since there
   * is no server record behind it to change at all.
   */
  protected readonly deleteDialogMessage = computed(() => {
    const target = this.deleteTarget();
    if (this.store.isSeedData()) {
      if (target === 'bulk') {
        const n = this.selectedIds().size;
        return `This will hide ${n} selected business${n === 1 ? '' : 's'} from this view for the rest of your visit (it isn't a permanent delete in this prototype).`;
      }
      if (target) {
        return `This will hide ${target.code} (${target.id}) from this view for the rest of your visit (it isn't a permanent delete in this prototype).`;
      }
      return '';
    }
    if (target === 'bulk') {
      const n = this.selectedIds().size;
      return `This will mark ${n} selected business${n === 1 ? '' : 'es'} Inactive. It stays on record and can be reactivated any time — this is not a delete. Refused for any business with an application still in progress.`;
    }
    if (target) {
      return `This will mark ${target.code} Inactive. It stays on record and can be reactivated any time — this is not a delete. Refused if it has an application still in progress.`;
    }
    return '';
  });

  protected async confirmDelete(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;
    const idsToRemove = target === 'bulk' ? this.selectedIds() : new Set([target.id]);

    if (this.store.isSeedData()) {
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
      return;
    }

    this.changingBusinessStatus.set(true);
    const failed: string[] = [];
    for (const id of idsToRemove) {
      const result = await this.businessesApi.deactivate(id);
      if (result.kind !== 'done') failed.push(id);
    }
    this.changingBusinessStatus.set(false);
    await this.loadRealBusinesses();
    if (this.selectedBusiness() && idsToRemove.has(this.selectedBusiness()!.id)) {
      await this.loadRealDetail(this.selectedBusiness()!.id);
      const refreshed = (this.realRows() ?? []).find((r) => r.id === this.selectedBusiness()!.id);
      if (refreshed) this.selectedBusiness.set(this.toRealBusinessRow(refreshed));
    }
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const id of idsToRemove) next.delete(id);
      return next;
    });
    this.deleteTarget.set(null);

    const succeeded = idsToRemove.size - failed.length;
    if (failed.length > 0) {
      this.toast.error(
        `${succeeded > 0 ? `${succeeded} deactivated. ` : ''}${failed.length} could not be deactivated — `
        + 'it may have an application still in progress.',
      );
    } else {
      this.toast.success(succeeded === 1 ? 'Business deactivated.' : `${succeeded} businesses deactivated.`);
    }
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
    street: '',
    registrationNumber: '',
    dateRegistered: new Date().toISOString().slice(0, 10),
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    region: 'region-5',
    province: 'sorsogon',
    cityMunicipality: 'castilla',
    barangay: '',
  };

  protected readonly creatingBusiness = signal(false);

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
    // Reset every time: an owner's email left over from a previous
    // registration this session would otherwise attach the next business to
    // that SAME owner rather than a blank one, silently.
    this.newBusiness.businessName = '';
    this.newBusiness.type = '';
    this.newBusiness.street = '';
    this.newBusiness.registrationNumber = '';
    this.newBusiness.dateRegistered = new Date().toISOString().slice(0, 10);
    this.newBusiness.contactName = '';
    this.newBusiness.contactEmail = '';
    this.newBusiness.contactPhone = '';
    this.newBusiness.barangay = '';
    this.view.set('create');
  }

  backToList(): void {
    this.view.set('list');
  }

  /**
   * `POST /staff/businesses` — a real registration, not a row pushed onto
   * this page's own list. The server resolves the owner's account (creating
   * one, with an unusable password — they claim it later through account
   * recovery, same as `StaffApplicationsApi.fileOnBehalf`) and applicant
   * record, then inserts the business under it, so a permit filed elsewhere
   * against this business links back to it correctly.
   */
  protected async createBusiness(): Promise<void> {
    const name = this.newBusiness.businessName.trim();
    if (!name) {
      this.toast.error('Enter a business name before creating this registration.');
      return;
    }
    if (!this.newBusiness.type) {
      this.toast.error('Select a business category before creating this registration.');
      return;
    }
    const street = this.newBusiness.street.trim();
    if (!street) {
      this.toast.error('Enter the business address before creating this registration.');
      return;
    }
    if (!this.newBusiness.barangay) {
      this.toast.error('Select a barangay before creating this registration.');
      return;
    }
    if (!this.newBusiness.dateRegistered) {
      this.toast.error('Enter the date this business was registered.');
      return;
    }
    const contactName = this.newBusiness.contactName.trim();
    if (!contactName) {
      this.toast.error('Enter the owner\'s full name before creating this registration.');
      return;
    }
    const emailValidation = validateEmail(this.newBusiness.contactEmail);
    if (!emailValidation.valid) {
      this.toast.error(emailValidation.error ?? 'Enter a valid email address for the owner.');
      return;
    }
    // Optional — but a NON-empty value should be a real Philippine mobile
    // number, same rule and message the Applications intake wizard's
    // conceptually identical field already enforces.
    const phoneValidation = validateMobileNumber(this.newBusiness.contactPhone, false);
    if (!phoneValidation.valid) {
      this.toast.error(phoneValidation.error ?? 'Enter a valid contact number.');
      return;
    }

    const [firstName, ...rest] = contactName.split(/\s+/);
    const lastName = rest.length ? rest.join(' ') : '';
    const barangayLabel = this.newBusiness.barangay
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    this.creatingBusiness.set(true);
    try {
      const result = await this.businessesApi.create({
        owner: {
          firstName,
          lastName,
          email: emailValidation.normalized,
          mobileNumber: phoneValidation.normalized || undefined,
        },
        business: {
          name,
          category: this.newBusiness.type,
          street,
          barangay: barangayLabel,
          city: 'Castilla',
          province: 'Sorsogon',
          registrationNumber: this.newBusiness.registrationNumber.trim() || 'PENDING',
          dateRegistered: this.newBusiness.dateRegistered,
        },
      });

      if (result.kind === 'done') {
        this.toast.success(
          result.ownerNextStep ? `"${name}" registered. ${result.ownerNextStep}` : `"${name}" registered.`,
        );
        await this.loadRealBusinesses();
        this.view.set('list');
        this.page.set(1);
      } else if (result.kind === 'unavailable') {
        this.toast.error('Business registration is not available right now.');
      } else {
        this.toast.error(result.message);
      }
    } finally {
      this.creatingBusiness.set(false);
    }
  }
}
