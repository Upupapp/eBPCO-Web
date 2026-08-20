import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiIllustration, KpiTone, KpiTrend } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { downloadCsv } from '../../shared/utils/export-csv';
import { buildBusinessDetail } from './business-detail-data';
import { ApplicationStore } from '../../core/domain/application-store';
import { Business } from '../../core/domain/business.model';
import { applicantFullName } from '../../core/domain/applicant.model';

type SubTab = 'analytics' | 'modules' | 'recent-activity';
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

// Mirrors E-BPCO Mobile's BusinessCategory enum exactly (business_model.dart).
type BusinessCategory =
  'Retail' | 'Food Service' | 'Services' | 'Manufacturing' | 'Wholesale' | 'Other';

interface BusinessRow {
  id: string;
  code: string;
  category: BusinessCategory;
  city: string;
  contactName: string;
  contactPhone: string;
  subdomain: string;
  dateCreated: string;
  userCount: number;
  status: 'Active' | 'Inactive';
}

interface ModuleUsage {
  name: string;
  businessCount: number;
  pct: number;
  color: string;
}

interface ActivityItem {
  name: string;
  text: string;
  dateLabel: string;
  agoLabel: string;
  color: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function hashOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

interface GrowthPoint {
  label: string;
  value: number;
}

const GROWTH_POINTS: GrowthPoint[] = [
  { label: 'Jan', value: 8 },
  { label: 'Feb', value: 38 },
  { label: 'Mar', value: 52 },
  { label: 'Apr', value: 28 },
  { label: 'May', value: 40 },
  { label: 'Jun', value: 22 },
  { label: 'Jul', value: 46 },
  { label: 'Aug', value: 34 },
  { label: 'Sep', value: 58 },
  { label: 'Oct', value: 54 },
  { label: 'Nov', value: 64 },
  { label: 'Dec', value: 90 },
];

@Component({
  selector: 'app-businesses',
  imports: [Topbar, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel, ConfirmDialog],
  templateUrl: './businesses.html',
  styleUrl: './businesses.scss',
})
export class Businesses {
  private readonly store = inject(ApplicationStore);

  constructor(private readonly router: Router) {}

  protected readonly view = signal<ViewMode>('list');
  protected readonly activeSubTab = signal<SubTab>('analytics');

  // Total Users is the reference figure everything else is a share of, so
  // its ring reads as a full circle (100%) and the other three fill in
  // proportion to it instead of using unrelated, hand-picked percentages.
  private static readonly TOTAL_USERS = 1524;

  protected readonly ringStats: RingStat[] = [
    {
      label: 'Total Users',
      value: '1,524',
      icon: 'users',
      tone: 'info',
      illustration: 'users',
      pct: 100,
      isTotal: true,
      support: 'Across all registered businesses',
    },
    {
      label: 'Active Businesses',
      value: '849',
      icon: 'check-circle',
      tone: 'success',
      illustration: 'success',
      pct: Math.round((849 / Businesses.TOTAL_USERS) * 100),
      isTotal: false,
      support: `${Math.round((849 / Businesses.TOTAL_USERS) * 100)}% of total users`,
    },
    {
      label: 'Inactive Businesses',
      value: '376',
      icon: 'building',
      tone: 'danger',
      illustration: 'critical',
      pct: Math.round((376 / Businesses.TOTAL_USERS) * 100),
      isTotal: false,
      support: `${Math.round((376 / Businesses.TOTAL_USERS) * 100)}% of total users`,
    },
    {
      label: 'Total Businesses',
      value: '1,225',
      icon: 'building',
      tone: 'violet',
      illustration: 'businesses',
      pct: Math.round((1225 / Businesses.TOTAL_USERS) * 100),
      isTotal: false,
      support: `${Math.round((1225 / Businesses.TOTAL_USERS) * 100)}% of total users`,
    },
  ];

  // A real Business's registration/contact fields — never a fabricated
  // dataset — with the owner's contact info joined through the real
  // `Applicant` (never guessed from the business name). Fields with no
  // real backing data in the domain model (subdomain, userCount) stay as
  // deterministic-per-id sample placeholders, matching the "SAMPLE DATA"
  // precedent used elsewhere in this app, and are cosmetic only — they
  // carry no permit-ownership meaning.
  private toBusinessRow(b: Business): BusinessRow {
    const owner = this.store.getApplicant(b.ownerApplicantId);
    const seed = hashOf(b.id);
    return {
      id: b.id,
      code: b.name,
      category: b.category,
      city: `Barangay ${b.barangay}`,
      contactName: owner ? applicantFullName(owner) : 'Not provided',
      contactPhone: owner?.mobileNumber ?? 'Not provided',
      subdomain: `${slugify(b.name)}.castillasorsogon.gov.ph`,
      dateCreated: b.dateRegistered,
      userCount: 8 + (seed % 16),
      status: b.status,
    };
  }

  /** Businesses created through this page's own "+ Business" wizard — kept separate from the real ApplicationStore-backed rows below since they aren't real linkable Business records (see createBusiness's documented limitation). */
  private readonly locallyCreatedRows = signal<BusinessRow[]>([]);
  /** Ids removed via confirmDelete — hides a store-backed row from this view rather than mutating shared store data no method exists to delete. */
  private readonly hiddenIds = signal<ReadonlySet<string>>(new Set());

  protected readonly businessRows = computed<BusinessRow[]>(() => {
    const hidden = this.hiddenIds();
    return [
      ...this.locallyCreatedRows(),
      ...this.store.businesses().map((b) => this.toBusinessRow(b)),
    ].filter((r) => !hidden.has(r.id));
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');

  protected readonly categoryFilter = signal<BusinessCategory | 'All'>('All');
  protected readonly statusFilter = signal<'All' | 'Active' | 'Inactive'>('All');
  protected readonly categoryOptions: BusinessCategory[] = [
    'Retail',
    'Food Service',
    'Services',
    'Manufacturing',
    'Wholesale',
    'Other',
  ];

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
        r.subdomain.toLowerCase().includes(term)
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

  protected readonly businessDetail = computed(() => {
    const row = this.selectedBusiness();
    if (!row) return null;
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

  protected readonly deleteDialogMessage = computed(() => {
    const target = this.deleteTarget();
    if (target === 'bulk') {
      const n = this.selectedIds().size;
      return `This will remove ${n} selected business${n === 1 ? '' : 's'} from the platform.`;
    }
    if (target) return `This will remove ${target.code} (${target.id}) from the platform.`;
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
      Subdomain: row.subdomain,
      'Date Registered': row.dateCreated,
      Users: row.userCount,
      Status: row.status,
    };
  }

  protected exportVisible(): void {
    downloadCsv(
      'businesses',
      this.filteredBusinessRows().map((row) => this.businessCsvRow(row)),
    );
  }

  protected exportDetail(): void {
    const row = this.selectedBusiness();
    if (!row) return;
    downloadCsv(`business-${row.id}`, [this.businessCsvRow(row)]);
  }

  protected readonly moduleUsage: ModuleUsage[] = [
    { name: 'Initial Evaluation', businessCount: 122, pct: 30, color: '#7c3aed' },
    { name: 'Zoning Evaluation', businessCount: 122, pct: 50, color: '#f59e0b' },
    { name: 'Fire Safety Evaluation', businessCount: 75, pct: 60, color: '#2563eb' },
    { name: 'OBO Evaluation', businessCount: 32, pct: 80, color: '#16a34a' },
    { name: 'Final Evaluation', businessCount: 22, pct: 30, color: '#991b1b' },
  ];

  protected readonly recentActivity: ActivityItem[] = [
    {
      name: 'Villanueva Hardware & Construction Supply',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      dateLabel: 'May 20, 2028 - 10:30 AM',
      agoLabel: '3 hours ago',
      color: '#a78bfa',
    },
    {
      name: 'Simbulan Sari-Sari Store',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      dateLabel: 'May 20, 2028 - 8:30 AM',
      agoLabel: '5 hours ago',
      color: '#a78bfa',
    },
    {
      name: 'Rodrigo Bakeshop',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      dateLabel: 'May 20, 2028 - 8:30 AM',
      agoLabel: '5 hours ago',
      color: '#a78bfa',
    },
    {
      name: 'Zaballero Auto Repair Shop',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      dateLabel: 'May 20, 2028 - 7:30 AM',
      agoLabel: '3 hours ago',
      color: '#a78bfa',
    },
  ];

  protected readonly announcementText = signal('');
  protected readonly announcementAudience = signal('All Businesses (150)');
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

  protected readonly growthPoints = GROWTH_POINTS;

  protected readonly growthPath = computed(() => {
    const pts = this.growthPoints;
    const maxVal = 100;
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
    const pts = this.growthPoints;
    const maxVal = 100;
    const w = 1000;
    const h = 260;
    const stepX = w / (pts.length - 1);
    return pts.map((p, i) => ({
      x: i * stepX,
      y: h - (p.value / maxVal) * h,
      label: p.label,
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
    return { ...marker, tooltipY, value: this.growthPoints[i].value };
  });

  protected onGrowthPointerMove(event: MouseEvent): void {
    const el = this.growthChartWrap()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const n = this.growthPoints.length;
    const idx = Math.round(ratio * (n - 1));
    this.hoveredGrowthIndex.set(Math.min(Math.max(idx, 0), n - 1));
  }

  protected onGrowthPointerLeave(): void {
    this.hoveredGrowthIndex.set(null);
  }

  protected readonly metricTiles: {
    label: string;
    value: string;
    unit?: string;
    icon: string;
    tone: KpiTone;
    illustration: KpiIllustration;
    trend: KpiTrend;
  }[] = [
    {
      label: 'Applications Processed',
      value: '2,032',
      icon: 'logs',
      tone: 'info',
      illustration: 'applications',
      trend: {
        label: '12.5%',
        direction: 'up',
        sentiment: 'positive',
        comparison: 'Vs Previous 30 days',
      },
    },
    {
      label: 'Avg. Processing Time',
      value: '3.6',
      unit: 'days',
      icon: 'clock',
      tone: 'neutral',
      illustration: 'pending',
      trend: {
        label: '8.3%',
        direction: 'down',
        sentiment: 'positive',
        comparison: 'Vs Previous 30 days',
      },
    },
    {
      label: 'Active Users',
      value: '1,524',
      icon: 'users',
      tone: 'info',
      illustration: 'users',
      trend: {
        label: '9.7%',
        direction: 'up',
        sentiment: 'positive',
        comparison: 'Vs Previous 30 days',
      },
    },
    {
      label: 'Storage Used',
      value: '245',
      unit: 'GB',
      icon: 'cloud',
      tone: 'neutral',
      illustration: 'totals',
      trend: {
        label: '15.2%',
        direction: 'up',
        sentiment: 'negative',
        comparison: 'Vs Previous 30 days',
      },
    },
  ];

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
    slug: '',
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

  // ---- Modules catalog (Modules sub-tab) -------------------------------

  protected readonly showCatalog = signal(false);
  protected readonly enabledModules = signal<ReadonlySet<string>>(
    new Set(this.moduleUsage.map((m) => m.name)),
  );

  protected isModuleEnabled(name: string): boolean {
    return this.enabledModules().has(name);
  }

  protected toggleModule(name: string): void {
    this.enabledModules.update((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  protected openCatalog(): void {
    this.showCatalog.set(true);
  }

  protected closeCatalog(): void {
    this.showCatalog.set(false);
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
    const name = this.newBusiness.businessName.trim() || 'New Business';
    const code = name.toUpperCase().replace(/\s+/g, '');
    const nextIdNum =
      Math.max(...this.businessRows().map((r) => parseInt(r.id.replace('REG-2026-', ''), 10))) + 1;
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
        contactPhone: this.newBusiness.contactPhone.trim() || 'N/A',
        subdomain: `${this.newBusiness.slug.trim() || code.toLowerCase()}.castillasorsogon.gov.ph`,
        dateCreated: 'Just now',
        userCount: 1,
        status: 'Active',
      },
      ...rows,
    ]);

    this.view.set('list');
    this.page.set(1);
  }
}
