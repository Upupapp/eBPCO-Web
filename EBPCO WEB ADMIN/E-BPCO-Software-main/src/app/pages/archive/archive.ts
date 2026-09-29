import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ToastService } from '../../shared/toast/toast.service';
import { ArchiveKind, ArchivedItem, TeamsApi } from '../../core/api/teams.api';

/**
 * Everything that was set aside, and the way back (owner request, 2026-09-29:
 * "all accounts, even the super admin, can only archive things ... redesign
 * the archive screen so that it can cater to all things that will be
 * archived").
 *
 * Nothing in eBPCO is deleted. Applications, staff and citizen accounts,
 * businesses, checklist documents and permit types are archived instead, and
 * this page is where every one of them can be found again — who set it aside,
 * when and why — and restored by the officers allowed to (the server says
 * which, per item, and is the judge of every restore).
 *
 * Before this the page listed Cancelled, Rejected and Expired applications
 * from the working queue: not what was archived, and nothing else at all.
 */

interface KindTab {
  readonly kind: ArchiveKind | 'all';
  readonly label: string;
  readonly icon: string;
}

const TABS: readonly KindTab[] = [
  { kind: 'all', label: 'Everything', icon: 'archive' },
  { kind: 'application', label: 'Applications', icon: 'file-check' },
  { kind: 'staff', label: 'Staff accounts', icon: 'shield' },
  { kind: 'citizen', label: 'Citizen accounts', icon: 'user' },
  { kind: 'business', label: 'Businesses', icon: 'building' },
  { kind: 'requirement', label: 'Checklist documents', icon: 'copy' },
  { kind: 'permit-type', label: 'Permit types', icon: 'workflow' },
];

const KIND_LABEL: Readonly<Record<ArchiveKind, string>> = {
  application: 'Application',
  staff: 'Staff account',
  citizen: 'Citizen account',
  business: 'Business',
  requirement: 'Checklist document',
  'permit-type': 'Permit type',
};

function formatWhen(value: string | null): string {
  if (value === null) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-PH', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

@Component({
  selector: 'app-archive',
  imports: [Topbar, Icon, ConfirmDialog, FormsModule],
  templateUrl: './archive.html',
  styleUrl: './archive.scss',
})
export class Archive {
  private readonly teams = inject(TeamsApi);
  private readonly toast = inject(ToastService);

  protected readonly tabs = TABS;
  protected readonly kindLabel = KIND_LABEL;
  protected readonly formatWhen = formatWhen;

  protected readonly items = signal<readonly ArchivedItem[]>([]);
  protected readonly state = signal<'loading' | 'ready' | 'failed' | 'unavailable'>('loading');
  protected readonly failure = signal('');
  protected readonly activeKind = signal<ArchiveKind | 'all'>('all');
  protected readonly search = signal('');

  /** The item a Restore is being confirmed for. */
  protected readonly restoreTarget = signal<ArchivedItem | null>(null);
  protected readonly restoringId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  protected readonly heading = computed(() => TABS.find((tab) => tab.kind === this.activeKind())?.label ?? 'Everything');

  protected countOf(kind: ArchiveKind | 'all'): number {
    return kind === 'all' ? this.items().length : this.items().filter((item) => item.kind === kind).length;
  }

  protected readonly visible = computed(() => {
    const kind = this.activeKind();
    const words = this.search().trim().toLowerCase().split(/\s+/).filter(Boolean);
    return this.items()
      .filter((item) => kind === 'all' || item.kind === kind)
      .filter((item) => {
        if (words.length === 0) return true;
        const haystack = [item.title, item.subtitle, item.reason ?? '', item.archivedBy ?? '', KIND_LABEL[item.kind]]
          .join(' ').toLowerCase();
        return words.every((word) => haystack.includes(word));
      });
  });

  protected async load(): Promise<void> {
    this.state.set('loading');
    const result = await this.teams.archived();
    if (result.kind === 'ok') {
      this.items.set(result.value);
      this.state.set('ready');
    } else if (result.kind === 'unavailable') {
      this.state.set('unavailable');
    } else {
      this.failure.set(result.message);
      this.state.set('failed');
    }
  }

  protected requestRestore(item: ArchivedItem): void {
    this.restoreTarget.set(item);
  }

  protected restoreMessage(item: ArchivedItem): string {
    switch (item.kind) {
      case 'application': return `${item.title} goes back to the working list, at the status it was archived at.`;
      case 'staff': return `${item.title} is enabled again and can sign in, with the position and access they had.`;
      case 'citizen': return `${item.title} can sign in again and is back in the Citizens list.`;
      case 'business': return `${item.title} is back in the Businesses list.`;
      case 'requirement': return `“${item.title}” is added back to the end of its checklist, for new applications.`;
      case 'permit-type': return `Citizens can file a ${item.title} again.`;
    }
  }

  protected async confirmRestore(): Promise<void> {
    const item = this.restoreTarget();
    if (item === null) return;
    this.restoreTarget.set(null);
    this.restoringId.set(item.id);
    try {
      const result = await this.teams.restore(item.kind, item.id);
      if (result.kind === 'done') {
        this.toast.success(result.detail);
        this.items.update((all) => all.filter((other) => !(other.kind === item.kind && other.id === item.id)));
      } else {
        this.toast.error(result.kind === 'unavailable' ? 'This server cannot restore archived items yet.' : result.message);
      }
    } finally {
      this.restoringId.set(null);
    }
  }
}
