import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PermitDetail } from './permit-detail';
import { PUBLIC_PERMIT_TYPES } from '../../core/data/permits.data';

function activatedRouteStub(slug: string) {
  return {
    paramMap: of(convertToParamMap({ slug })),
  };
}

async function createComponent(slug: string) {
  await TestBed.configureTestingModule({
    imports: [PermitDetail],
    providers: [provideRouter([]), { provide: ActivatedRoute, useValue: activatedRouteStub(slug) }],
  }).compileComponents();

  const fixture = TestBed.createComponent(PermitDetail);
  fixture.detectChanges();
  return fixture;
}

describe('PermitDetail', () => {
  it('resolves the permit matching the route slug', async () => {
    const target = PUBLIC_PERMIT_TYPES[0];
    const fixture = await createComponent(target.slug);

    expect(fixture.componentInstance.permit()?.slug).toBe(target.slug);
    expect(fixture.componentInstance.permit()?.name).toBe(target.name);
  });

  it('returns undefined for an unknown slug', async () => {
    const fixture = await createComponent('does-not-exist');

    expect(fixture.componentInstance.permit()).toBeUndefined();
  });

  it('resolves a human-readable label for a known office group', async () => {
    const target = PUBLIC_PERMIT_TYPES[0];
    const fixture = await createComponent(target.slug);

    const label = fixture.componentInstance.groupLabel('bfp');
    expect(label).toBe('Bureau of Fire Protection');
  });

  it('falls back to the raw id for an unknown office group', async () => {
    const target = PUBLIC_PERMIT_TYPES[0];
    const fixture = await createComponent(target.slug);

    expect(fixture.componentInstance.groupLabel('unknown-group')).toBe('unknown-group');
  });
});
