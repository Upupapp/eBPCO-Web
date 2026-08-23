import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { MUNICIPAL_OFFICES, OFFICE_CATEGORIES } from '../../core/data/offices.data';
import { OfficeCategory } from '../../core/models/office.model';

type CategoryFilter = OfficeCategory | 'all';

@Component({
  selector: 'app-offices',
  imports: [RouterLink, SectionHeading],
  templateUrl: './offices.html',
  styleUrl: './offices.scss',
})
export class Offices {
  readonly categories = OFFICE_CATEGORIES;
  readonly searchTerm = signal('');
  readonly activeCategory = signal<CategoryFilter>('all');

  readonly filteredOffices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.activeCategory();

    return MUNICIPAL_OFFICES.filter((office) => {
      const matchesCategory = category === 'all' || office.category === category;
      const matchesSearch =
        !term ||
        office.name.toLowerCase().includes(term) ||
        office.shortDescription.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  setCategory(category: CategoryFilter): void {
    this.activeCategory.set(category);
  }

  categoryLabel(category: OfficeCategory): string {
    return this.categories.find((c) => c.id === category)?.label ?? category;
  }
}
