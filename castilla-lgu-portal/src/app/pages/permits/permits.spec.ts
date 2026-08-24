import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Permits } from './permits';
import { PUBLIC_PERMIT_TYPES } from '../../core/data/permits.data';

describe('Permits', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Permits],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Permits);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('groups all 19 permit types across the three issuing-office groups by default', () => {
    const fixture = TestBed.createComponent(Permits);
    const component = fixture.componentInstance;

    const total = component.groupedPermits().reduce((sum, entry) => sum + entry.permits.length, 0);
    expect(total).toBe(PUBLIC_PERMIT_TYPES.length);
    expect(component.resultCount()).toBe(PUBLIC_PERMIT_TYPES.length);
  });

  it('filters by search term across name and description', () => {
    const fixture = TestBed.createComponent(Permits);
    const component = fixture.componentInstance;

    component.onSearchInput('zoning');

    const total = component.groupedPermits().reduce((sum, entry) => sum + entry.permits.length, 0);
    expect(total).toBe(component.resultCount());
    expect(total).toBeGreaterThan(0);
    for (const entry of component.groupedPermits()) {
      for (const permit of entry.permits) {
        expect(permit.name.toLowerCase() + permit.description.toLowerCase()).toContain('zoning');
      }
    }
  });

  it('filters by issuing office group', () => {
    const fixture = TestBed.createComponent(Permits);
    const component = fixture.componentInstance;

    component.setGroup('bfp');

    const groups = component.groupedPermits();
    expect(groups.length).toBe(1);
    expect(groups[0].group.id).toBe('bfp');
    expect(groups[0].permits.length).toBe(2);
  });

  it('shows no results for a nonsense search term', () => {
    const fixture = TestBed.createComponent(Permits);
    const component = fixture.componentInstance;

    component.onSearchInput('zzzznonexistentzzzz');

    expect(component.resultCount()).toBe(0);
    expect(component.groupedPermits().length).toBe(0);
  });
});
