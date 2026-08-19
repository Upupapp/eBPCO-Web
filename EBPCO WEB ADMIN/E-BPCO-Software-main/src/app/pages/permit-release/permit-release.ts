import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ReleaseMethod } from '../../core/domain/permit.model';

// 'Ready for Release' mirrors E-BPCO Mobile's ApplicationStatus.released
// display label exactly (application_model.dart) — from the applicant's
// side, that status IS "Ready for Release". 'Released' is the LGU-internal
// state once staff hand over the physical permit, which mobile doesn't
// track as a separate status.
type PermitStatus = 'Ready for Release' | 'Released';

interface ReleaseRow {
  id: string;
  applicant: string;
  city: string;
  type: string;
  approvalStatus: string;
  paymentStatus: string;
  permitStatus: PermitStatus;
  permitNumber: string;
}

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

@Component({
  selector: 'app-permit-release',
  imports: [Topbar, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel],
  templateUrl: './permit-release.html',
  styleUrl: './permit-release.scss',
})
export class PermitRelease {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly canRelease = computed(() => {
    const role = this.session.role();
    return role ? ACTION_PERMISSIONS.releasePermit(role) : false;
  });

  // Every row is an application whose permit has actually been generated —
  // read from the same store Applications/Payments/Dashboard read, with
  // its real permit number, instead of a locally-invented 10-row table.
  protected readonly rows = computed<ReleaseRow[]>(() => {
    return this.store
      .applications()
      .filter((app) => app.permitReleaseStatus !== 'Not Ready')
      .map((app): ReleaseRow => ({
        id: app.id,
        applicant: app.applicant,
        city: app.location,
        type: app.permitType,
        approvalStatus: 'Approved',
        paymentStatus: app.paymentStatus,
        permitStatus: app.permitReleaseStatus as PermitStatus,
        permitNumber: this.store.getPermit(app.id)?.permitNumber ?? '—',
      }));
  });

  // Ring totals are derived from the same rows() the table shows, so
  // "Total Release" always equals Ready-for-Release + Released.
  protected readonly ringStats = computed<RingStat[]>(() => {
    const rows = this.rows();
    const total = rows.length || 1;
    const ready = rows.filter((r) => r.permitStatus === 'Ready for Release').length;
    const released = rows.filter((r) => r.permitStatus === 'Released').length;
    return [
      {
        label: 'Ready for Release',
        value: String(ready),
        icon: 'clock',
        tone: 'warning',
        illustration: 'pending',
        pct: Math.round((ready / total) * 100),
        isTotal: false,
        support: `${Math.round((ready / total) * 100)}% of total release`,
      },
      {
        label: 'Released',
        value: String(released),
        icon: 'check-circle',
        tone: 'success',
        illustration: 'success',
        pct: Math.round((released / total) * 100),
        isTotal: false,
        support: `${Math.round((released / total) * 100)}% of total release`,
      },
      {
        label: 'Total Release',
        value: String(rows.length),
        icon: 'file-check',
        tone: 'info',
        illustration: 'permit',
        pct: 100,
        isTotal: true,
        support: 'Ready for Release · Released',
        bars: [ready, released],
      },
    ];
  });

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<'All' | PermitStatus>('All');
  protected readonly statusOptions: PermitStatus[] = ['Ready for Release', 'Released'];

  protected readonly activeFilterCount = computed(() => (this.statusFilter() === 'All' ? 0 : 1));

  protected clearFilters(): void {
    this.statusFilter.set('All');
  }

  protected readonly filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.rows().filter((r) => {
      if (status !== 'All' && r.permitStatus !== status) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.type.toLowerCase().includes(term)
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

  openApplicationRecord(row: ReleaseRow): void {
    this.router.navigateByUrl(`/applications/${row.id}`);
  }

  // ---- Selection + bulk export ------------------------------------------

  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected isSelected(row: ReleaseRow): boolean {
    return this.selectedIds().has(row.id);
  }

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.filteredRows();
    return visible.length > 0 && visible.every((row) => this.selectedIds().has(row.id));
  });

  protected toggleRowSelected(row: ReleaseRow): void {
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

  // ---- Export -------------------------------------------------------------

  private releaseCsvRow(row: ReleaseRow) {
    return {
      'Application ID': row.id,
      Applicant: row.applicant,
      Location: row.city,
      Type: row.type,
      'Approval Status': row.approvalStatus,
      'Payment Status': row.paymentStatus,
      'Permit Status': row.permitStatus,
      'Permit Number': row.permitNumber,
    };
  }

  protected exportVisible(): void {
    downloadCsv(
      'permit-releases',
      this.filteredRows().map((row) => this.releaseCsvRow(row)),
    );
  }

  protected exportSelected(): void {
    const ids = this.selectedIds();
    downloadCsv(
      'permit-releases-selected',
      this.rows()
        .filter((row) => ids.has(row.id))
        .map((row) => this.releaseCsvRow(row)),
    );
  }

  // ---- Generate / print ---------------------------------------------------

  protected readonly showGenerateModal = signal(false);
  protected readonly generateTarget = signal<ReleaseRow | null>(null);

  generate(row?: ReleaseRow): void {
    this.generateTarget.set(row ?? null);
    this.showGenerateModal.set(true);
  }

  protected readonly printRows = computed(() => {
    const target = this.generateTarget();
    if (target) return [target];
    return this.rows().filter((r) => r.permitStatus === 'Ready for Release');
  });

  printPdf(): void {
    window.print();
  }

  closeModal(): void {
    this.showGenerateModal.set(false);
    this.generateTarget.set(null);
  }

  // ---- Release (claim) ----------------------------------------------------
  // Requires an approved application, verified payment, and generated
  // permit — all enforced by the store, which also refuses a second
  // release for the same application and marks the application Completed
  // once released.

  protected readonly releaseTarget = signal<ReleaseRow | null>(null);
  protected readonly releaseError = signal('');
  protected claimantName = '';
  protected releaseMethod: ReleaseMethod = 'Physical Claim';

  protected requestRelease(row: ReleaseRow): void {
    if (!this.canRelease() || row.permitStatus !== 'Ready for Release') return;
    this.claimantName = row.applicant;
    this.releaseMethod = 'Physical Claim';
    this.releaseError.set('');
    this.releaseTarget.set(row);
  }

  protected cancelRelease(): void {
    this.releaseTarget.set(null);
  }

  protected confirmRelease(): void {
    const row = this.releaseTarget();
    if (!row) return;
    const claimant = this.claimantName.trim();
    if (!claimant) {
      this.releaseError.set('Claimant name is required.');
      return;
    }
    const ok = this.store.releasePermit(
      row.id,
      this.session.name() || 'Releasing Officer',
      claimant,
      this.releaseMethod,
    );
    if (!ok) {
      this.releaseError.set(
        'This application is not eligible for release yet (needs an approved status, verified payment, and generated permit), or has already been released.',
      );
      return;
    }
    this.releaseTarget.set(null);
  }

  protected readonly view = signal<'list' | 'detail'>('list');
  protected readonly selectedRow = signal<ReleaseRow | null>(null);

  openDetail(row: ReleaseRow): void {
    this.selectedRow.set(row);
    this.view.set('detail');
  }

  backToList(): void {
    this.view.set('list');
  }
}
