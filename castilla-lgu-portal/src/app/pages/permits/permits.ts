import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { PlaceholderTag } from '../../shared/placeholder-tag/placeholder-tag';
import { PERMIT_OFFICE_GROUPS, PUBLIC_PERMIT_TYPES } from '../../core/data/permits.data';
import { PermitOfficeGroup } from '../../core/models/permit.model';

type GroupFilter = PermitOfficeGroup | 'all';

@Component({
  selector: 'app-permits',
  imports: [RouterLink, SectionHeading, PlaceholderTag],
  templateUrl: './permits.html',
  styleUrl: './permits.scss',
})
export class Permits {
  readonly groups = PERMIT_OFFICE_GROUPS;
  readonly searchTerm = signal('');
  readonly activeGroup = signal<GroupFilter>('all');

  private readonly filteredPermits = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const group = this.activeGroup();

    return PUBLIC_PERMIT_TYPES.filter((permit) => {
      const matchesGroup = group === 'all' || permit.officeGroup === group;
      const matchesSearch =
        !term ||
        permit.name.toLowerCase().includes(term) ||
        permit.description.toLowerCase().includes(term);
      return matchesGroup && matchesSearch;
    });
  });

  // Grouped by issuing office so a citizen can scan straight to the office
  // they actually need, rather than a flat 19-row list — same reasoning as
  // this being called out explicitly for the portal in the source plan.
  readonly groupedPermits = computed(() => {
    const filtered = this.filteredPermits();
    return this.groups
      .map((group) => ({
        group,
        permits: filtered.filter((permit) => permit.officeGroup === group.id),
      }))
      .filter((entry) => entry.permits.length > 0);
  });

  readonly resultCount = computed(() => this.filteredPermits().length);

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  setGroup(group: GroupFilter): void {
    this.activeGroup.set(group);
  }
}
