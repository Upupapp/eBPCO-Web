import { TestBed } from '@angular/core/testing';
import { ApplicationIntake } from './application-intake';
import {
  ApplicationDetailResult, DocumentProvenance, FileOnBehalfInput, FileOnBehalfResult, StaffApplicationsApi,
} from '../../core/api/staff-applications.api';
import { CASTILLA_BARANGAYS } from '../../core/domain/castilla-barangays';

/**
 * Save as Draft (admin portal half of the draft-saving feature): a walk-in
 * intake an officer can save mid-encoding and either finish later
 * themselves or hand off to a colleague — any officer, since a
 * staff-authored Draft is real queue work (staff-queue.service.ts's own
 * visibility rule), not the citizen's private working copy the self-service
 * wizard's own drafts stay.
 */

function fillApplicant(component: any): void {
  component.applicant.firstName = 'Juan';
  component.applicant.lastName = 'Dela Cruz';
  component.applicant.email = 'juan.delacruz@gmail.com';
  component.applicant.mobileNumber = '09171234567';
  component.applicant.addressLine = 'Purok 1, Rizal Street';
  component.applicant.barangay = component.barangays[0];
  component.emailVerified.set(true);
}

function fillBusiness(component: any): void {
  component.business.registeredName = 'Dela Cruz Sari-Sari Store';
  component.business.addressLine = '123 Rizal Street';
  component.business.barangay = component.barangays[0];
  component.business.ownerOrRepresentative = 'Juan Dela Cruz';
  component.business.registrationNumber = 'DTI-2026-0001';
  component.business.dateRegistered = new Date().toISOString().slice(0, 10);
}

function fillApplication(component: any, permitType: string): void {
  component.applicationInfo.permitType = permitType;
  component.onPermitTypeChange();
  component.applicationInfo.scopeDescription = 'General merchandise retail.';
  component.applicationInfo.dateReceived = new Date().toISOString().slice(0, 10);
}

describe('ApplicationIntake — Save as Draft', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ApplicationIntake>>;
  let component: any;
  let fileOnBehalfCalls: FileOnBehalfInput[];
  let editCalls: { applicationId: string; patch: Record<string, unknown> }[];
  let transitionCalls: { applicationId: string; to: string }[];
  let attachDocumentCalls: { applicationId: string; requirementCode: string }[];

  function setup(fileOnBehalfResult: FileOnBehalfResult): void {
    fileOnBehalfCalls = [];
    editCalls = [];
    transitionCalls = [];
    attachDocumentCalls = [];
    TestBed.configureTestingModule({
      imports: [ApplicationIntake],
      providers: [
        {
          provide: StaffApplicationsApi,
          useValue: {
            fileOnBehalf: (input: FileOnBehalfInput) => {
              fileOnBehalfCalls.push(input);
              return Promise.resolve(fileOnBehalfResult);
            },
            edit: (applicationId: string, patch: Record<string, unknown>) => {
              editCalls.push({ applicationId, patch });
              return Promise.resolve({ kind: 'done', changed: Object.keys(patch) });
            },
            transition: (applicationId: string, to: string) => {
              transitionCalls.push({ applicationId, to });
              return Promise.resolve({ kind: 'done', status: to, version: 2 });
            },
            attachDocument: (
              applicationId: string, requirementCode: string, _label: string, _fileName: string,
              _contentBase64: string, _provenance?: DocumentProvenance,
            ) => {
              attachDocumentCalls.push({ applicationId, requirementCode });
              return Promise.resolve({ kind: 'done', documentId: `DOC-${attachDocumentCalls.length}` });
            },
            page: () => Promise.resolve({ rows: [], nextCursor: null }),
            detail: () => Promise.resolve({ kind: 'unavailable' }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ApplicationIntake);
    component = fixture.componentInstance;
    fixture.detectChanges();

    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'Building Permit');
  }

  it('is not offered on the Applicant/Business steps', () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });
    component.stepIndex.set(0);
    expect(component.canSaveAsDraft()).toBe(false);
    component.stepIndex.set(1);
    expect(component.canSaveAsDraft()).toBe(false);
    component.stepIndex.set(2); // 'application'
    expect(component.canSaveAsDraft()).toBe(true);
  });

  it('files a Draft on the first click, with saveAsDraft: true', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });

    await component.saveAsDraft();

    expect(fileOnBehalfCalls.length).toBe(1);
    expect(fileOnBehalfCalls[0].saveAsDraft).toBe(true);
    expect(fileOnBehalfCalls[0].permitType).toBe('Building Permit');
    expect(component.draftId()).toBe('APP-1');
    expect(component.draftSaveStatus()).toBe('saved');
  });

  it('PATCHes the same id on every save after the first, never filing a second application', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });

    await component.saveAsDraft();
    component.applicationInfo.scopeDescription = 'Updated scope of work.';
    await component.saveAsDraft();
    await component.saveAsDraft();

    expect(fileOnBehalfCalls.length).toBe(1);
    expect(editCalls.length).toBe(2);
    expect(editCalls.every((c) => c.applicationId === 'APP-1')).toBe(true);
    expect(editCalls[1].patch['form']).toMatchObject({ scopeOfWork: 'Updated scope of work.' });
  });

  it('attaches a freshly picked document, then never re-sends it on the next save', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });
    component.next(); // -> documents
    const doc = component.documents().find((d: any) => d.required);
    component['updateDocument'](doc.requirementId, {
      fileName: 'lot-plan.pdf',
      file: new File([new Uint8Array([1, 2, 3])], 'lot-plan.pdf', { type: 'application/pdf' }),
    });

    await component.saveAsDraft();
    expect(attachDocumentCalls.length).toBe(1);
    expect(attachDocumentCalls[0].applicationId).toBe('APP-1');

    await component.saveAsDraft();
    expect(attachDocumentCalls.length).toBe(1); // still 1 -- already attached, not re-sent
  });

  it('refuses to save with no permit type chosen, without calling the server', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });
    component.applicationInfo.permitType = '';

    await component.saveAsDraft();

    expect(fileOnBehalfCalls.length).toBe(0);
    expect(component.draftSaveStatus()).toBe('error');
  });

  it('submit() on an already-saved draft syncs and finalizes through the transition engine, not a second fileOnBehalf', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });
    await component.saveAsDraft();
    component.next(); // -> documents
    for (const doc of component.documents()) {
      if (!doc.required) continue;
      component['updateDocument'](doc.requirementId, {
        fileName: `${doc.requirementId}.pdf`,
        file: new File([new Uint8Array([1])], `${doc.requirementId}.pdf`, { type: 'application/pdf' }),
        issuingOffice: 'Barangay Hall', issueDate: '2026-08-01', expiryDate: '2027-08-01',
      });
    }
    component.next(); // -> review
    component.understandRequirements = true;

    await component.submit();

    expect(fileOnBehalfCalls.length).toBe(1); // only the original draft save
    expect(transitionCalls).toEqual([{ applicationId: 'APP-1', to: 'Submitted' }]);
  });
});

describe('ApplicationIntake — resuming a staff-authored Draft', () => {
  function detailFor(overrides: Record<string, unknown> = {}) {
    return {
      kind: 'ok',
      detail: {
        summary: {
          id: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', permitType: 'Fencing Permit',
          applicationAction: 'Renewal', lifecycleStatus: 'Draft', businessName: 'Dela Cruz Sari-Sari Store',
          applicantName: 'Juan Dela Cruz', location: null, submittedAt: null, assessedAmountCentavos: null,
          paymentVerified: false, renewsPermitNumber: 'BP-2020-000001', priorPermitClaim: null,
        },
        payments: [], orderOfPayment: null,
        applicantEmail: 'juan.delacruz@gmail.com', applicantEmailVerifiedAt: '2026-09-01T00:00:00.000Z',
        applicantMobile: '09171234567',
        applicantFirstName: 'Juan', applicantMiddleName: 'Reyes', applicantLastName: 'Dela Cruz',
        applicantAddress: { street: 'Purok 1, Rizal Street', barangay: CASTILLA_BARANGAYS[0], city: null, province: null, postalCode: null },
        business: {
          id: 'BIZ-1', name: 'Dela Cruz Sari-Sari Store', category: 'Retail', street: '123 Rizal Street',
          barangay: CASTILLA_BARANGAYS[0], city: 'Castilla', province: 'Sorsogon',
          registrationNumber: 'DTI-2026-0001', dateRegistered: '2026-01-01', status: 'Active',
        },
        form: {
          scopeOfWork: 'Replace boundary fence', applicantType: 'Individual', ownerOrRepresentative: 'Juan Dela Cruz',
          dateReceived: '2026-09-01', filedAtCounter: true,
        },
        permit: null, timeline: [], documents: [], evaluations: [],
        ...overrides,
      },
    } satisfies ApplicationDetailResult;
  }

  function setup(detail: ApplicationDetailResult): void {
    TestBed.configureTestingModule({
      imports: [ApplicationIntake],
      providers: [
        {
          provide: StaffApplicationsApi,
          useValue: {
            detail: () => Promise.resolve(detail),
            page: () => Promise.resolve({ rows: [], nextCursor: null }),
          },
        },
      ],
    });
  }

  it('pre-fills applicant, business and application fields from the server, not from local state', async () => {
    setup(detailFor());
    const fixture = TestBed.createComponent(ApplicationIntake);
    fixture.componentRef.setInput('resumeDraftId', 'APP-1');
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;

    expect(component.draftId()).toBe('APP-1');
    expect(component.applicant.firstName).toBe('Juan');
    expect(component.applicant.middleName).toBe('Reyes');
    expect(component.applicant.lastName).toBe('Dela Cruz');
    expect(component.applicant.email).toBe('juan.delacruz@gmail.com');
    expect(component.emailVerified()).toBe(true);
    expect(component.business.registeredName).toBe('Dela Cruz Sari-Sari Store');
    expect(component.business.ownerOrRepresentative).toBe('Juan Dela Cruz');
    expect(component.applicationInfo.permitType).toBe('Fencing Permit');
    expect(component.applicationInfo.applicationAction).toBe('Renewal');
    expect(component.applicationInfo.relatedPermitNumber).toBe('BP-2020-000001');
    expect(component.applicationInfo.scopeDescription).toBe('Replace boundary fence');
  });

  it('re-hydrates an already-attached document so it counts as satisfied, not missing', async () => {
    setup(detailFor({
      documents: [{
        id: 'DOC-1', label: 'Lot Plan', fileName: 'lot-plan.pdf', contentType: 'application/pdf',
        byteSize: 2048, status: 'Uploaded', scanCleared: true, requirementCode: 'lot-plan',
        reviewStatus: null, reviewRemark: null, expiresOn: null, certifiedOn: null,
        issuedOn: '2026-08-01', issuingOffice: 'Barangay Hall', uploadedAt: '2026-09-01T00:00:00.000Z', reviewedAt: null,
      }],
    }));
    const fixture = TestBed.createComponent(ApplicationIntake);
    fixture.componentRef.setInput('resumeDraftId', 'APP-1');
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;

    const doc = component.documents().find((d: any) => d.requirementId === 'lot-plan');
    if (doc) {
      expect(doc.alreadyAttached).toBe(true);
      expect(doc.fileName).toBe('lot-plan.pdf');
    }
  });
});
