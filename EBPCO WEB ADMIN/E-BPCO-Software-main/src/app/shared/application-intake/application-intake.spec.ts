import { TestBed } from '@angular/core/testing';
import { ApplicationIntake } from './application-intake';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { documentsFor, requirementsFor } from '../../core/domain/requirements-catalog';
import { ALL_PERMIT_TYPES } from '../../core/domain/permit.model';
import {
  DocumentProvenance, FileOnBehalfInput, FileOnBehalfResult, StaffApplicationsApi,
} from '../../core/api/staff-applications.api';
import { CASTILLA_BARANGAYS } from '../../core/domain/castilla-barangays';

/**
 * Fills Step 1 the way an officer would, INCLUDING the email code: the step
 * refuses to advance until the address is verified (or the LGU cannot send a
 * code at all), so a test that skips it never gets past the first screen.
 */
function fillApplicant(component: any, verified = true): void {
  component.applicant.firstName = 'Juan';
  component.applicant.lastName = 'Dela Cruz';
  component.applicant.email = 'juan.delacruz@gmail.com';
  component.applicant.mobileNumber = '09171234567';
  component.applicant.addressLine = 'Purok 1, Rizal Street';
  component.applicant.barangay = component.barangays[0];
  if (verified) component.emailVerified.set(true);
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

/**
 * Attaches a real `File` to every required document draft — mutating
 * `doc.fileName` alone (as this used to) never reaches `submit()`'s upload
 * loop, which reads `doc.file` and silently skips a draft that has none
 * (see `application-intake.ts`'s own doc comment on `DocumentDraft.file`).
 * Goes through the component's own `updateDocument`, the same write
 * `onFileChosen` makes from a real `<input type="file">` change event, so
 * this exercises the real code path rather than hand-assembling a draft
 * shape the component itself never produces.
 */
function attachAllRequiredDocuments(component: any, withDates = true): void {
  for (const doc of component.documents()) {
    if (!doc.required) continue;
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], `${doc.requirementId}.pdf`, {
      type: 'application/pdf',
    });
    component['updateDocument'](doc.requirementId, {
      fileName: file.name, file,
      ...(withDates ? { issuingOffice: 'Barangay Hall', issueDate: '2026-08-01', expiryDate: '2027-08-01' } : {}),
    });
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
    expect(component.applicant.firstName).toBe('Juan');
    expect(component.applicant.lastName).toBe('Dela Cruz');
    expect(component.applicant.email).toBe('not-an-email');
    expect(component.applicant.mobileNumber).toBe('09171234567');
  });

  it('does not leave Applicant until the email is verified with the code — the same gate as the citizen sign-up', () => {
    fillApplicant(component, false);
    component.next();
    expect(component.stepIndex()).toBe(0);
    expect(component.currentStepErrors().some((e: string) => /verify/i.test(e))).toBe(true);

    component.emailVerified.set(true);
    component.next();
    expect(component.stepIndex()).toBe(1);
  });

  it('lets the officer continue unverified only when the LGU could not send a code at all, and says so', () => {
    fillApplicant(component, false);
    component.verificationUnavailable.set('No mail provider is configured.');
    component.next();
    expect(component.stepIndex()).toBe(1);
  });

  it('voids a verified email the moment the address is edited — the code belonged to the old address', () => {
    fillApplicant(component);
    expect(component.emailVerified()).toBe(true);
    component.onEmailInput('someone.else@gmail.com');
    expect(component.emailVerified()).toBe(false);
    expect(component.codeSent()).toBe(false);
  });

  it('offers every one of Castilla\u2019s 34 barangays, the same list the citizen sign-up offers, with none pre-selected', () => {
    expect(component.barangays).toEqual(CASTILLA_BARANGAYS);
    expect(component.barangays.length).toBe(34);
    expect(component.applicant.barangay).toBe('');
    expect(component.business.barangay).toBe('');
  });

  it('requires the registration number instead of inventing "PENDING"', () => {
    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.business.registrationNumber = '';
    component.next();
    expect(component.stepIndex()).toBe(1);
    expect(component.currentStepErrors().some((e: string) => /registration/i.test(e))).toBe(true);
  });

  it('requires the permit number for a Renewal, which the server would otherwise refuse', () => {
    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'Building Permit');
    component.applicationInfo.applicationAction = 'Renewal';
    component.onApplicationActionChange();
    component.next();
    expect(component.currentStep()).toBe('application');
    component.applicationInfo.relatedPermitNumber = 'BP-2025-000123';
    component.next();
    expect(component.currentStep()).toBe('documents');
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

  it('does not reach Review while an attached document has no Issue Date / Expiry Date', () => {
    // Found live: both dates blank and the form went straight through.
    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'Building Permit');
    component.next();
    attachAllRequiredDocuments(component, false);
    component.next();
    expect(component.currentStep()).toBe('documents');
    expect(component.currentStepErrors().some((e: string) => /issue date and expiry date/i.test(e))).toBe(true);

    for (const doc of component.documents()) {
      if (doc.file) component['updateDocument'](doc.requirementId, { issueDate: '2026-08-01', expiryDate: '2027-08-01' });
    }
    component.next();
    expect(component.currentStep()).toBe('review');
  });

  it('refuses an expiry earlier than the issue date', () => {
    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'Building Permit');
    component.next();
    attachAllRequiredDocuments(component);
    const first = component.documents().find((d: any) => d.file);
    component['updateDocument'](first.requirementId, { issueDate: '2026-08-01', expiryDate: '2026-07-01' });
    expect(component.documentIssue(component.documents().find((d: any) => d.requirementId === first.requirementId)))
      .toMatch(/earlier than/i);
    component.next();
    expect(component.currentStep()).toBe('documents');
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
  let attachDocumentCalls: {
    applicationId: string; requirementCode: string; label: string; fileName: string; provenance?: DocumentProvenance;
  }[];
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
    attachDocumentCalls = [];
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
            attachDocument: (
              applicationId: string, requirementCode: string, label: string, fileName: string,
              _contentBase64: string, provenance?: DocumentProvenance,
            ) => {
              attachDocumentCalls.push({ applicationId, requirementCode, label, fileName, provenance });
              return Promise.resolve({ kind: 'done', documentId: `DOC-${attachDocumentCalls.length}` });
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
    // Everything the form asked for goes somewhere real: the applicant's own
    // address on their record, the rest on the application's form.
    expect(fileOnBehalfCalls[0].applicant).toMatchObject({
      firstName: 'Juan', lastName: 'Dela Cruz', street: 'Purok 1, Rizal Street', barangay: CASTILLA_BARANGAYS[0],
    });
    expect(fileOnBehalfCalls[0].business?.registrationNumber).toBe('DTI-2026-0001');
    expect(fileOnBehalfCalls[0].form).toMatchObject({
      scopeOfWork: 'General merchandise retail.', ownerOrRepresentative: 'Juan Dela Cruz', applicantType: 'Individual',
    });

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
    // Real `POST /documents` per file (`StaffApplicationsApi.attachDocument`),
    // against the real filed application's id — not a local-only annotation
    // on `store`, which this flow stopped writing to (see the doc comment on
    // `application-intake.ts`'s own upload loop).
    setup({ kind: 'done', applicationId: 'APP-1', referenceNumber: 'E-BPCO-2026-000099', applicantId: 'APL-9' });

    await component.submit();

    const requiredCount = requirementsFor('Building Permit').documents.filter(
      (d) => d.required,
    ).length;
    expect(attachDocumentCalls.length).toBeGreaterThanOrEqual(requiredCount);
    for (const call of attachDocumentCalls) {
      expect(call.applicationId).toBe('APP-1');
      // The issuing office and dates typed beside each file travel with it —
      // they used to be collected and dropped.
      expect(call.provenance).toEqual({ issuingOffice: 'Barangay Hall', issuedOn: '2026-08-01', expiresOn: '2027-08-01' });
    }
  });

  it('sends the officer back to Applicant, with the server\u2019s own sentence, when the address belongs to someone else', async () => {
    setup({ kind: 'name-mismatch', message: 'juan.delacruz@gmail.com is already registered to John Doe.' });

    await component.submit();

    expect(component.currentStep()).toBe('applicant');
    expect(component.submitError()).toContain('registered to John Doe');
    expect(store.applications().find((a: ApplicationRecord) => a.id === 'APP-1')).toBeUndefined();
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
