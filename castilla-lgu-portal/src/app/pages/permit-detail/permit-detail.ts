import { Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PERMIT_OFFICE_GROUPS, PUBLIC_PERMIT_TYPES } from '../../core/data/permits.data';
import { PlaceholderTag } from '../../shared/placeholder-tag/placeholder-tag';

@Component({
  selector: 'app-permit-detail',
  imports: [RouterLink, PlaceholderTag],
  templateUrl: './permit-detail.html',
  styleUrl: './permit-detail.scss',
})
export class PermitDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly permit = computed(() => PUBLIC_PERMIT_TYPES.find((p) => p.slug === this.slug()));

  groupLabel(groupId: string): string {
    return PERMIT_OFFICE_GROUPS.find((g) => g.id === groupId)?.label ?? groupId;
  }
}
