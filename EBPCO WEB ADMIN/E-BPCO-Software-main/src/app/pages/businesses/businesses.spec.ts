import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Businesses } from './businesses';
import { ApplicationStore } from '../../core/domain/application-store';

// `protected` members are accessed via `as any` throughout — the standard
// pattern in this codebase for exercising component-internal state from a
// spec without loosening the component's own public API (see
// business-stages-board.spec.ts).
describe('Businesses — business rows and linked permits are genuinely store-sourced', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Businesses>>;
  let component: any;
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Businesses],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(Businesses);
    component = fixture.componentInstance;
    store = TestBed.inject(ApplicationStore);
    fixture.detectChanges();
  });

  it('shows no invented hostname for a business', () => {

    const el: HTMLElement = fixture.nativeElement;

    const text = el.textContent ?? '';


    // `subdomain` was `slugify(name) + '.castillasorsogon.gov.ph'` — a hostname

    // invented on the LGU's REAL government domain, in a table column, the

    // detail panel, the CSV export and the search filter. None resolve; the

    // parent domain does, which is what made it plausible. The API refused to

    // serve it as "leftovers from a multi-tenant template" (P-F3).

    expect(text).not.toContain('.castillasorsogon.gov.ph');

    expect(text).not.toContain('Sub Domain');

    expect(text).not.toContain('yourapp.gov.ph');

  });


  it('businessRows() ids are exactly the real ApplicationStore business ids (no fabricated dataset)', () => {
    const rowIds: string[] = component.businessRows().map((r: { id: string }) => r.id);
    const realIds = new Set(store.businesses().map((b) => b.id));
    for (const id of rowIds) expect(realIds.has(id)).toBe(true);
    expect(rowIds.length).toBe(store.businesses().length);
  });

  it('each business row is a real join to its owning Applicant — contact name never fabricated', () => {
    const business = store.businesses()[0];
    const row = component.businessRows().find((r: { id: string }) => r.id === business.id);
    expect(row).toBeTruthy();
    const owner = store.getApplicant(business.ownerApplicantId)!;
    expect(row.contactName).toBe(`${owner.firstName} ${owner.lastName}`);
  });

  it('opening a detail for a business with known linked applications produces matching permits', () => {
    const business = store.businesses()[0];
    const expectedAppIds = new Set(
      store
        .applications()
        .filter((a) => a.businessId === business.id)
        .map((a) => a.id),
    );
    const row = component.businessRows().find((r: { id: string }) => r.id === business.id);
    component.openDetail(row);
    fixture.detectChanges();

    const detail = component.businessDetail();
    expect(detail).toBeTruthy();
    const actualAppIds = new Set(
      detail.permits.map((p: { applicationId: string }) => p.applicationId),
    );
    expect(actualAppIds).toEqual(expectedAppIds);
  });

  it('a business with zero linked applications shows an empty permits list, never a random fallback count', () => {
    // Every real seeded business may have applications, so this proves
    // the "no linked applications" path directly by using a row id that
    // cannot match any real application's businessId.
    const fakeRow = {
      id: 'NO-SUCH-BUSINESS-ID',
      code: 'Ghost Business',
      category: 'Other',
      city: 'Barangay Poblacion',
      contactName: 'Not provided',
      contactPhone: 'Not provided',
      dateCreated: 'Just now',
      userCount: 1,
      status: 'Active',
    };
    component.openDetail(fakeRow);
    fixture.detectChanges();
    const detail = component.businessDetail();
    expect(detail.permits).toEqual([]);
  });
});
