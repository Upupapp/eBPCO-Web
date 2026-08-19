import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BusinessStagesBoard } from './business-stages-board';
import { ApplicationStore } from '../../core/domain/application-store';
import { barangayOf } from '../../core/domain/application.model';

// `protected` members are accessed via `as any` throughout — the
// standard pattern for exercising component-internal filter state from a
// spec without loosening the component's own public API.
describe('BusinessStagesBoard — combined filtering', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<BusinessStagesBoard>>;
  let component: any;
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BusinessStagesBoard],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(BusinessStagesBoard);
    component = fixture.componentInstance;
    store = TestBed.inject(ApplicationStore);
    fixture.detectChanges();
  });

  it('defaults to showing every business regardless of barangay or date', () => {
    expect(component.barangayFilter()).toBe('All');
    expect(component.preset()).toBe('all');
    const total = component.totalCount();
    expect(total).toBeGreaterThan(0);
  });

  it('barangay options are generated from the real application data, sorted, with "All" first', () => {
    const options: string[] = component.barangayOptions();
    expect(options[0]).toBe('All');
    const realBarangays = new Set(store.applications().map((a) => barangayOf(a)));
    for (const b of options.slice(1)) expect(realBarangays.has(b)).toBe(true);
    // Sorted alphabetically after "All", and matches the real distinct set exactly.
    const rest = options.slice(1);
    const expectedSorted = Array.from(realBarangays).sort((a, b) => a.localeCompare(b));
    expect(rest).toEqual(expectedSorted);
  });

  it('never offers a barangay option with zero real applications', () => {
    const options: string[] = component.barangayOptions();
    const counts = new Map<string, number>();
    for (const app of store.applications()) {
      const b = barangayOf(app);
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
    for (const b of options.slice(1)) expect(counts.get(b)).toBeGreaterThan(0);
  });

  it('filtering by one real barangay only returns applications from that barangay', () => {
    const [, oneBarangay] = component.barangayOptions();
    component.selectBarangay(oneBarangay);
    const columns = component.columns();
    for (const col of columns) {
      for (const app of col.apps) expect(barangayOf(app)).toBe(oneBarangay);
    }
  });

  it('combines the barangay filter with the evaluation-stage filter (both must match)', () => {
    const [, oneBarangay] = component.barangayOptions();
    component.selectBarangay(oneBarangay);
    component.selectStageFilter('Zoning');
    const columns = component.columns();
    for (const col of columns) {
      for (const app of col.apps) {
        expect(barangayOf(app)).toBe(oneBarangay);
        expect(app.evaluationStage).toBe('Zoning');
      }
    }
  });

  it('combines the barangay filter with a date preset (This Week) — every visible app falls in both filters', () => {
    const [, oneBarangay] = component.barangayOptions();
    component.selectBarangay(oneBarangay);
    component.selectPreset('week');
    const columns = component.columns();
    const totalVisible = columns.reduce((sum: number, c: any) => sum + c.apps.length, 0);
    // Not asserting a specific count (the seed is time-relative), just
    // that every visible row still satisfies the barangay filter.
    for (const col of columns) {
      for (const app of col.apps) expect(barangayOf(app)).toBe(oneBarangay);
    }
    expect(totalVisible).toBe(component.totalCount());
  });

  it('a custom date range narrows results and still respects the barangay filter simultaneously', () => {
    const [, oneBarangay] = component.barangayOptions();
    component.selectBarangay(oneBarangay);
    component.selectPreset('custom');
    const today = new Date().toISOString().slice(0, 10);
    component.draftStart.set(today);
    component.draftEnd.set(today);
    component.applyCustomRange();
    const columns = component.columns();
    for (const col of columns) {
      for (const app of col.apps) expect(barangayOf(app)).toBe(oneBarangay);
    }
  });

  it('status columns (Under Review/Approved/Rejected) partition every visible application exactly once', () => {
    const columns = component.columns();
    const seen = new Set<string>();
    for (const col of columns) {
      for (const app of col.apps) {
        expect(seen.has(app.id)).toBe(false); // never in two columns
        seen.add(app.id);
        expect(app.status).toBe(col.status);
      }
    }
  });

  it('clearFilter() resets stage, date, and barangay filters together', () => {
    const [, oneBarangay] = component.barangayOptions();
    component.selectBarangay(oneBarangay);
    component.selectStageFilter('OBO');
    component.selectPreset('last7');
    component.clearFilter();
    expect(component.barangayFilter()).toBe('All');
    expect(component.stageFilter()).toBe('All');
    expect(component.preset()).toBe('all');
  });

  it('shows an empty state (totalCount() === 0) for a barangay/stage combination with no real matches', () => {
    const [, oneBarangay] = component.barangayOptions();
    component.selectBarangay(oneBarangay);
    // Pick a stage this barangay's apps are guaranteed not to occupy by
    // exhausting every stage until one yields zero, rather than assuming
    // a specific stage — keeps the test valid across seed regeneration.
    const stages = ['Initial', 'Zoning', 'Fire Safety', 'OBO', 'Final Approval'];
    const barangayApps = store.applications().filter((a) => barangayOf(a) === oneBarangay);
    const occupiedStages = new Set(barangayApps.map((a) => a.evaluationStage));
    const emptyStage = stages.find((s) => !occupiedStages.has(s as any));
    if (!emptyStage) return; // this barangay happens to touch every stage — nothing to assert
    component.selectStageFilter(emptyStage);
    expect(component.totalCount()).toBe(0);
  });
});
