import { TestBed } from '@angular/core/testing';
import { ApplicationIntake } from './application-intake';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { documentsFor, requirementsFor } from '../../core/domain/requirements-catalog';
import { ALL_PERMIT_TYPES } from '../../core/domain/permit.model';
import { FileOnBehalfInput, FileOnBehalfResult, StaffApplicationsApi } from '../../core/api/staff-applications.api';

function fillApplicant(component: any): void {
  component.applicant.fullName = 'Juan Dela Cruz';
  component.applicant.email = 'juan.delacruz@gmail.com';
  component.applicant.mobileNumber = '09171234567';
  component.applicant.addressLine = 'Purok 1, Rizal Street';
  component.applicant.barangay = component.barangays[0];
}

function fillBusiness(component: any): void {
  component.business.registeredName = 'Dela Cruz Sari-Sari Store';
  component.business.addressLine = '123 Rizal Street';
  component.business.barangay = component.barangays[0];
  component.business.ownerOrRepresentative = 'Juan Dela Cruz';
  component.business.dateRegistered = new Date().toISOString().slice(0, 10);
}

function fillApplication(component: any, permitType: string): void {
  component.applicationInfo.permitType = permitType;
  component.onPermitTypeChange();
  component.applicationInfo.scopeDescription = 'General merchandise retail.';
  component.applicationInfo.dateReceived = new Date().toISOString().slice(0, 10);
}

function attachAllRequiredDocuments(component: any): void {
  for (const doc of component.documents()) {
    if (doc.required) doc.fileName = `${doc.requirementId}.pdf`;
  }
}

describe('ApplicationIntake — next() refuses to advance past an invalid step', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ApplicationIntake>>;
  let component: any;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ApplicationIntake] });
    fixture = TestBed.createComponent(ApplicationIntake);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts on the Applicant step with nothing marked attempted', () => {
    expect(component.currentStep()).toBe('applicant');
    expect(component.showStepErrors()).toBe(false);
  });

  it('next() does not advance past Applicant while required fields are empty, but does reveal the errors', () => {
    expect(component.currentStepErrors().length).toBeGreaterThan(0);
    component.next();
    expect(component.stepIndex()).toBe(0);
    expect(component.showStepErrors()).toBe(true);
  });

  it('detects an invalid email/mobile with specific field errors, even when other fields are filled', () => {
    fillApplicant(component);
    component.applicant.email = 'not-an-email';
    component.applicant.mobileNumber = '123';
    const errors: string[] = component.currentStepErrors();
    expect(errors.some((e) => /email/i.test(e))).toBe(true);
    expect(errors.some((e) => /mobile/i.test(e))).toBe(true);
  });

  it('preserves every entered value after calling next() on an invalid step (nothing is cleared)', () => {
    fillApplicant(component);
    component.applicant.email = 'not-an-email';
    component.next();
    expect(component.applicant.fullName).toBe('Juan Dela Cruz');
    expect(component.applicant.email).toBe('not-an-email');
    expect(component.applicant.mobileNumber).toBe('09171234567');
  });

  it('advances only as far as each step passes its own validation', () => {
    fillApplicant(component);
    component.next();
    expect(component.stepIndex()).toBe(1);
    component.next(); // Business left blank — refused
    expect(component.stepIndex()).toBe(1);
    fillBusiness(component);
    component.next();
    expect(component.stepIndex()).toBe(2);
  });

  it('does not reach Review while required documents are left unattached', () => {
    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'Building Permit');
    component.next();
    component.next(); // no files attached yet — refused, stays on documents
    expect(component.currentStep()).toBe('documents');
    expect(component.allStepsValid()).toBe(false);
  });
});

describe('ApplicationIntake — dynamic document checklist', () => {
  let component: any;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ApplicationIntake] });
    const fixture = TestBed.createComponent(ApplicationIntake);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("changing the permit type reloads the checklist to match that type's own requirements", () => {
    component.applicationInfo.permitType = 'Building Permit';
    component.onPermitTypeChange();
    const buildingDocs = component
      .documents()
      .map((d: any) => d.requirementId)
      .sort();
    expect(buildingDocs).toEqual(
      documentsFor('Building Permit', 'New')
        .map((d) => d.id)
        .sort(),
    );

    component.applicationInfo.permitType = 'Demolition Permit';
    component.onPermitTypeChange();
    const demolitionDocs = component
      .documents()
      .map((d: any) => d.requirementId)
      .sort();
    expect(demolitionDocs).toEqual(
      requirementsFor('Demolition Permit')
        .documents.map((d) => d.id)
        .sort(),
    );
    expect(demolitionDocs).not.toEqual(buildingDocs);
  });

  it(
    'changing the TRANSACTION TYPE reloads the checklist too, for Building Permit — since migration 047 ' +
      "consolidated its three former permit-type entries into one, its checklist now varies by " +
      'New/Renewal/Amendment instead',
    () => {
      component.applicationInfo.permitType = 'Building Permit';
      component.applicationInfo.applicationAction = 'New';
      component.onPermitTypeChange();
      const newDocs = component
        .documents()
        .map((d: any) => d.requirementId)
        .sort();
      expect(newDocs).toEqual(documentsFor('Building Permit', 'New').map((d) => d.id).sort());

      component.applicationInfo.applicationAction = 'Renewal';
      component.onApplicationActionChange();
      const renewalDocs = component
        .documents()
        .map((d: any) => d.requirementId)
        .sort();
      expect(renewalDocs).toEqual(documentsFor('Building Permit', 'Renewal').map((d) => d.id).sort());
      expect(renewalDocs).not.toEqual(newDocs);
    },
  );

  it('offers exactly the fixed permit-type list, in the required order, with no domain/category selection step', () => {
    expect(component.permitTypeOptions).toEqual(ALL_PERMIT_TYPES);
  });

  it('clearing the permit type back to empty clears the checklist too', () => {
    component.applicationInfo.permitType = 'Building Permit';
    component.onPermitTypeChange();
    expect(component.documents().length).toBeGreaterThan(0);
    component.applicationInfo.permitType = '';
    component.onPermitTypeChange();
    expect(component.documents().length).toBe(0);
  });
});

/**
 * Filing now goes through `POST /staff/applications` (`StaffApplicationsApi.
 * fileOnBehalf`) — the server creates the applicant's account and the
 * business row, and this screen only gets back `{applicationId,
 * referenceNumber, applicantId}`. It then reloads the queue and reopens the
 * server's own record rather than trusting a locally-assembled guess, which
 * is why what an applicant's email normalizes to or whether they start
 * Unverified are no longer things this screen can observe directly — those
 * are server-owned facts now, not something a client-side test can honestly
 * assert against a local store mutation.
 */
describe('ApplicationIntake — filing goes through the real backend', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ApplicationIntake>>;
  let component: any;
  let store: ApplicationStore;
  let fileOnBehalfCalls: FileOnBehalfInput[];
  let filedRecord: ApplicationRecord | null;

  function serverRecord(id: string, referenceNumber: string): ApplicationRecord {
    return withProjectedFields({
      id,
      referenceNumber,
      businessId: '',
      businessName: 'Dela Cruz Sari-Sari Store',
      applicantId: 'APL-server-9',
      applicant: 'Juan Dela Cruz',
      location: 'Barangay ' + (component.barangays?.[0] ?? 'Poblacion'),
      permitType: 'Building Permit',
      applicationAction: 'New',
      officer: '—',
      dateSubmitted: new Date().toISOString().slice(0, 10),
      dateValue: new Date(),
      lifecycleStatus: 'Submitted',
      evaluationStage: null,
      evaluationResult: null,
      paymentStatus: 'Not Yet Available',
      permitReleaseStatus: 'Not Ready',
      assessedAmountCentavos: null,
    });
  }

  function setup(fileOnBehalfResult: FileOnBehalfResult): void {
    fileOnBehalfCalls = [];
    filedRecord = null;
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
            page: () =>
              Promise.resolve({
                rows: filedRecord ? [filedRecord] : [],
                nextCursor: null,
              }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ApplicationIntake);
    component = fixture.componentInstance;
    store = TestBed.inject(ApplicationStore);
    fixture.detectChanges();

    if (fileOnBehalfResult.kind === 'done') {
      filedRecord = serverRecord(fileOnBehalfResult.applicationId, fileOnBehalfResult.referenceNumber);
    }

    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'Building Permit');
    component.next();
    attachAllRequiredDocuments(component);
    component.next();
  }

  it('reaches the Review step once every earlier step is valid', () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });
    expect(component.currentStep()).toBe('review');
    expect(component.allStepsValid()).toBe(true);
  });

  it('files exactly once and reopens the server\'s own record, in an honest starting state', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });

    await component.submit();

    expect(fileOnBehalfCalls.length).toBe(1);
    // The business/permit/action this screen collected, sent as the real
    // request shape — not a locally-invented Applicant/Business/
    // ApplicationRecord trio.
    expect(fileOnBehalfCalls[0].business?.name).toBe('Dela Cruz Sari-Sari Store');
    expect(fileOnBehalfCalls[0].permitType).toBe('Building Permit');

    const record = store.getById('APP-1');
    expect(record).toBeTruthy();
    // Honest starting state — never a fabricated completed evaluation or payment.
    expect(record!.lifecycleStatus).toBe('Submitted');
    expect(record!.evaluationStage).toBeNull();
    expect(record!.paymentStatus).toBe('Not Yet Available');
    expect(record!.permitReleaseStatus).toBe('Not Ready');
    expect(record!.assessedAmountCentavos).toBeNull();
  });

  it('attaches every provided document to the reopened server record', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });

    await component.submit();

    const docs = store.getDocuments('APP-1');
    const requiredCount = requirementsFor('Building Permit').documents.filter(
      (d) => d.required,
    ).length;
    expect(docs.length).toBeGreaterThanOrEqual(requiredCount);
  });

  it('prevents a duplicate submission from filing a second time', async () => {
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });

    const first = component.submit();
    const second = component.submit(); // second call while `submitting` is still true must not double-file
    await Promise.all([first, second]);

    expect(fileOnBehalfCalls.length).toBe(1);
  });

  it('surfaces a server refusal instead of pretending the application was filed', async () => {
    setup({ kind: 'refused', message: 'Staff cannot file under their own email address.' });

    await component.submit();

    expect(component.submitError()).toContain('Staff cannot file under their own email address.');
    expect(store.applications().find((a: ApplicationRecord) => a.id === 'APP-1')).toBeUndefined();
  });
});
