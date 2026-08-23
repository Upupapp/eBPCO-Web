import { Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MUNICIPAL_OFFICES, OFFICE_CATEGORIES } from '../../core/data/offices.data';

@Component({
  selector: 'app-office-detail',
  imports: [RouterLink],
  templateUrl: './office-detail.html',
  styleUrl: './office-detail.scss',
})
export class OfficeDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly office = computed(() => MUNICIPAL_OFFICES.find((o) => o.slug === this.slug()));

  readonly relatedOffices = computed(() => {
    const office = this.office();
    if (!office) return [];
    return office.relatedOfficeSlugs
      .map((slug) => MUNICIPAL_OFFICES.find((o) => o.slug === slug))
      .filter((o): o is (typeof MUNICIPAL_OFFICES)[number] => !!o);
  });

  categoryLabel(categoryId: string): string {
    return OFFICE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
  }
}
