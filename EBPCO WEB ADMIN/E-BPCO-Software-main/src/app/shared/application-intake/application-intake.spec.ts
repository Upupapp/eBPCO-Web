import { TestBed } from '@angular/core/testing';
import { ApplicationIntake } from './application-intake';
import { ApplicationStore } from '../../core/domain/application-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';

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

describe('ApplicationIntake — validation blocks incomplete steps', () => {
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

  it('next() refuses to advance past Applicant while required fields are empty, and surfaces errors', () => {
    component.next();
    expect(component.stepIndex()).toBe(0);
    expect(component.showStepErrors()).toBe(true);
    expect(component.currentStepErrors().length).toBeGreaterThan(0);
  });

  it('rejects an invalid email/mobile with specific field errors, even when other fields are filled', () => {
    fillApplicant(component);
    component.applicant.email = 'not-an-email';
    component.applicant.mobileNumber = '123';
    component.next();
    expect(component.stepIndex()).toBe(0);
    const errors: string[] = component.currentStepErrors();
    expect(errors.some((e) => /email/i.test(e))).toBe(true);
    expect(errors.some((e) => /mobile/i.test(e))).toBe(true);
  });

  it('preserves every entered value after a failed validation attempt (nothing is cleared)', () => {
    fillApplicant(component);
    component.applicant.email = 'not-an-email';
    component.next();
    expect(component.applicant.fullName).toBe('Juan Dela Cruz');
    expect(component.applicant.email).toBe('not-an-email');
    expect(component.applicant.mobileNumber).toBe('09171234567');
  });

  it('advances once Applicant is valid, then blocks on an incomplete Business step', () => {
    fillApplicant(component);
    component.next();
    expect(component.stepIndex()).toBe(1);
    component.next();
    expect(component.stepIndex()).toBe(1); // Business step incomplete — stays put
  });

  it('blocks the Documents step while any required document has no file attached', () => {
    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'New Business Permit');
    component.next();
    expect(component.currentStep()).toBe('documents');
    component.next(); // no files attached yet
    expect(component.stepIndex()).toBe(3); // still on Documents
    const errors: string[] = component.currentStepErrors();
    expect(errors.some((e) => /required document/i.test(e))).toBe(true);
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
    component.applicationInfo.permitType = 'New Business Permit';
    component.onPermitTypeChange();
    const businessDocs = component
      .documents()
      .map((d: any) => d.requirementId)
      .sort();
    expect(businessDocs).toEqual(
      requirementsFor('New Business Permit')
        .documents.map((d) => d.id)
        .sort(),
    );

    component.applicationInfo.serviceDomain = 'Construction Permit';
    component.onDomainChange();
    component.applicationInfo.permitType = 'Renovation';
    component.onPermitTypeChange();
    const renovationDocs = component
      .documents()
      .map((d: any) => d.requirementId)
      .sort();
    expect(renovationDocs).toEqual(
      requirementsFor('Renovation')
        .documents.map((d) => d.id)
        .sort(),
    );
    expect(renovationDocs).not.toEqual(businessDocs);
  });

  it('switching the Application Type domain clears the permit type and checklist', () => {
    component.applicationInfo.permitType = 'New Business Permit';
    component.onPermitTypeChange();
    expect(component.documents().length).toBeGreaterThan(0);
    component.onDomainChange();
    expect(component.applicationInfo.permitType).toBe('');
    expect(component.documents().length).toBe(0);
  });

  it('a Business Permit permit type auto-locks the transaction type to match (New/Renewal/Amendment)', () => {
    component.applicationInfo.permitType = 'Business Permit Renewal';
    component.onPermitTypeChange();
    expect(component.applicationInfo.applicationAction).toBe('Renewal');
    expect(component.isBusinessDomain()).toBe(true);
  });
});

describe('ApplicationIntake — creation goes through the shared store honestly', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ApplicationIntake>>;
  let component: any;
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ApplicationIntake] });
    fixture = TestBed.createComponent(ApplicationIntake);
    component = fixture.componentInstance;
    store = TestBed.inject(ApplicationStore);
    fixture.detectChanges();

    fillApplicant(component);
    component.next();
    fillBusiness(component);
    component.next();
    fillApplication(component, 'New Business Permit');
    component.next();
    attachAllRequiredDocuments(component);
    component.next();
  });

  it('reaches the Review step once every earlier step is valid', () => {
    expect(component.currentStep()).toBe('review');
    expect(component.allStepsValid()).toBe(true);
  });

  it('creates exactly one new ApplicationRecord in the shared store on submit, in an honest starting state', () => {
    const before = store.applications().length;
    component.submit();
    // `create()` prepends new records (see ApplicationStore.create), so
    // the newest one is always at index 0 — avoids depending on the
    // `output()` API's subscribe surface for a plain unit test.
    const created = store.applications()[0];

    expect(store.applications().length).toBe(before + 1);
    expect(created).toBeTruthy();
    const record = store.getById(created.id);
    expect(record).toBeTruthy();
    // Honest starting state — never a fabricated completed evaluation or payment.
    expect(record!.lifecycleStatus).toBe('Submitted');
    expect(record!.evaluationStage).toBe('Initial');
    expect(record!.evaluationResult).toBe('Pending');
    expect(record!.paymentStatus).toBe('Not Yet Available');
    expect(record!.permitReleaseStatus).toBe('Not Ready');
    expect(record!.assessedAmountCentavos).toBeNull();
  });

  it('the new applicant starts Unverified on both email and mobile, even though both passed format validation', () => {
    component.submit();
    // `create()` prepends new records (see ApplicationStore.create), so
    // the newest one is always at index 0 — avoids depending on the
    // `output()` API's subscribe surface for a plain unit test.
    const created = store.applications()[0];
    const applicant = store.getApplicant(created.applicantId)!;
    expect(applicant.emailVerification.status).toBe('Unverified');
    expect(applicant.mobileVerification.status).toBe('Unverified');
  });

  it('normalizes the applicant email and mobile number before storing them', () => {
    component.applicant.email = '  Juan.DelaCruz@GMAIL.com  ';
    component.submit();
    // `create()` prepends new records (see ApplicationStore.create), so
    // the newest one is always at index 0 — avoids depending on the
    // `output()` API's subscribe surface for a plain unit test.
    const created = store.applications()[0];
    const applicant = store.getApplicant(created.applicantId)!;
    expect(applicant.email).toBe('juan.delacruz@gmail.com');
    expect(applicant.mobileNumber).toBe('+63 917 123 4567');
  });

  it('attaches every provided document to the created application through the store', () => {
    component.submit();
    // `create()` prepends new records (see ApplicationStore.create), so
    // the newest one is always at index 0 — avoids depending on the
    // `output()` API's subscribe surface for a plain unit test.
    const created = store.applications()[0];
    const docs = store.getDocuments(created.id);
    const requiredCount = requirementsFor('New Business Permit').documents.filter(
      (d) => d.required,
    ).length;
    expect(docs.length).toBeGreaterThanOrEqual(requiredCount);
  });

  it('prevents a duplicate submission from creating a second record', () => {
    const before = store.applications().length;
    component.submit();
    component.submit(); // second call while `submitting` is still true (or after) must not double-create
    expect(store.applications().length).toBe(before + 1);
  });
});
