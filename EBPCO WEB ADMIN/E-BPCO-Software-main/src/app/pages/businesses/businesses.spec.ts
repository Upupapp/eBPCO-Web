import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Businesses } from './businesses';
import { ApplicationStore } from '../../core/domain/application-store';
import { API_BASE_URL } from '../../core/api/api.config';

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
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
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

describe('Businesses — real business directory (P-4b, GET /staff/businesses)', () => {
  async function mountReal(
    respond: (http: HttpTestingController) => void,
  ): Promise<{ fixture: ReturnType<typeof TestBed.createComponent<Businesses>>; component: any }> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Businesses],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    });
    // Flips `store.isSeedData()` to false before the component ever reads
    // it, the same way a real AdminLayout queue load already would have.
    TestBed.inject(ApplicationStore).replaceApplications([]);
    const fixture = TestBed.createComponent(Businesses);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    respond(http);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance as any };
  }

  const realBusiness = (over: Record<string, unknown> = {}) => ({
    id: 'BIZ-1',
    name: 'Reyes Hardware & Construction Supply',
    category: 'Construction',
    street: '12 Rizal St',
    barangay: 'Poblacion',
    city: 'Castilla',
    province: 'Sorsogon',
    registrationNumber: 'REG-0001',
    dateRegistered: '2026-01-05',
    status: 'Active',
    createdAt: '2026-01-05T00:00:00.000Z',
    owner: {
      applicantId: 'APL-1',
      name: 'Ana Reyes',
      email: 'ana@example.com',
      mobileNumber: '09171234567',
    },
    applicationCount: 1,
    ...over,
  });

  it('lists a real business from the server, including a category the seed vocabulary never had', async () => {
    const { component } = await mountReal((http) =>
      http.expectOne('/staff/businesses').flush({ data: [realBusiness()] }),
    );
    const rows = component.businessRows();
    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe('BIZ-1');
    // 'Construction' is real (businesses.controller.ts's own category enum)
    // but was never in this page's seed-only BusinessCategory union — proves
    // the category field is no longer narrowed to the seed vocabulary.
    expect(rows[0].category).toBe('Construction');
    expect(rows[0].contactName).toBe('Ana Reyes');
    expect(rows[0].contactPhone).toBe('09171234567');
    expect(rows[0].status).toBe('Active');
  });

  it('shows an honest business-directory error rather than a silent empty table when the fetch fails', async () => {
    const { component } = await mountReal((http) =>
      http.expectOne('/staff/businesses').flush('boom', { status: 500, statusText: 'Server Error' }),
    );
    expect(component.businessRows()).toEqual([]);
    expect(component.realListError()).toBeTruthy();
  });

  it('opens a real detail via GET /staff/businesses/:id and shows its real linked application', async () => {
    const { fixture, component } = await mountReal((http) =>
      http.expectOne('/staff/businesses').flush({ data: [realBusiness()] }),
    );
    const http = TestBed.inject(HttpTestingController);
    component.openDetail(component.businessRows()[0]);
    fixture.detectChanges();
    http.expectOne('/staff/businesses/BIZ-1').flush({
      ...realBusiness(),
      applications: [
        {
          id: 'APP-1',
          referenceNumber: 'E-BPCO-2026-000001',
          permitType: 'Fencing Permit',
          applicationAction: 'New',
          lifecycleStatus: 'Released',
          submittedAt: '2026-01-06T00:00:00.000Z',
        },
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    const detail = component.businessDetail();
    expect(detail.permits.length).toBe(1);
    expect(detail.permits[0].applicationId).toBe('E-BPCO-2026-000001');
    // coarseStatus('Released') === 'Approved' — same coarse projection the
    // seed path already uses, not a fabricated status of its own.
    expect(detail.permits[0].status).toBe('Approved');
  });
});
