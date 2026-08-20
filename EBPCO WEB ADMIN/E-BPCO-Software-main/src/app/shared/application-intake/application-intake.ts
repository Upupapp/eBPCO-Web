import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../icon/icon';
import { ApplicationStore } from '../../core/domain/application-store';
import { SessionService } from '../../core/session/session.service';
import { ApplicationRecord } from '../../core/domain/application.model';
import { Applicant } from '../../core/domain/applicant.model';
import { BusinessCategory } from '../../core/domain/business.model';
import { ALL_PERMIT_TYPES, ApplicationAction, PermitType } from '../../core/domain/permit.model';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentById, departmentName } from '../../core/domain/department.model';
import {
  MOBILE_FORMAT_EXAMPLE,
  LANDLINE_FORMAT_EXAMPLE,
  validateEmail,
  validateLandlineNumber,
  validateMobileNumber,
} from '../utils/validators';

// Same barangay list the seed data and the Business Stages board's
// filter draw from (application-seed.ts's LOCATIONS) — kept as its own
// small constant here since importing the seed module (which also builds
// the full mock dataset) into a form component would be the wrong
// direction of dependency.
export const CASTILLA_BARANGAYS = [
  'Poblacion',
  'Buenavista',
  'Cogon',
  'Bonga',
  'Burabod',
  'Salvacion',
  'San Isidro',
];

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Retail',
  'Food Service',
  'Services',
  'Manufacturing',
  'Wholesale',
  'Other',
];
const APPLICANT_TYPES: NonNullable<Applicant['applicantType']>[] = [
  'Individual',
  'Authorized Representative',
  'Corporate Officer',
];
const APPLICATION_ACTIONS: ApplicationAction[] = ['New', 'Renewal', 'Amendment'];

interface DocumentDraft {
  requirementId: string;
  label: string;
  required: boolean;
  reviewingDepartmentId: string;
  fileName: string;
  documentType: string;
  issuingOffice: string;
  issueDate: string;
  expiryDate: string;
}

type Step = 'applicant' | 'business' | 'application' | 'documents' | 'review';
const STEPS: { key: Step; label: string }[] = [
  { key: 'applicant', label: 'Applicant Information' },
  { key: 'business', label: 'Business Information' },
  { key: 'application', label: 'Application Information' },
  { key: 'documents', label: 'Document Attachments' },
  { key: 'review', label: 'Review & Confirm' },
];

/**
 * Full walk-in/manually-submitted application intake — replaces the old
 * 4-field "New Application" modal. Organized into the sections the
 * consolidation spec asks for (Applicant / Business / Application /
 * Document Attachments / Review), backed by the same ApplicationStore
 * every other module reads, and driven by the centralized permit-type
 * and requirements catalogs so its document checklist is never a second,
 * independently-maintained list.
 */
@Component({
  selector: 'app-application-intake',
  imports: [FormsModule, Icon],
  templateUrl: './application-intake.html',
  styleUrl: './application-intake.scss',
})
export class ApplicationIntake {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);

  readonly cancelled = output<void>();
  readonly created = output<ApplicationRecord>();

  protected readonly steps = STEPS;
  protected readonly stepIndex = signal(0);
  protected readonly attempted = signal<ReadonlySet<Step>>(new Set());
  protected readonly submitError = signal('');

  protected readonly barangays = CASTILLA_BARANGAYS;
  protected readonly businessCategories = BUSINESS_CATEGORIES;
  protected readonly applicantTypes = APPLICANT_TYPES;
  protected readonly applicationActions = APPLICATION_ACTIONS;
  // The fixed, complete 16-value permit-type list — every entry, exact
  // wording and order, nothing filtered out. There is no domain/category
  // selection step before this one; the permit type IS the full choice.
  protected readonly permitTypeOptions = ALL_PERMIT_TYPES;

  protected readonly mobileExample = MOBILE_FORMAT_EXAMPLE;
  protected readonly landlineExample = LANDLINE_FORMAT_EXAMPLE;

  private todayInput(): string {
    return new Date().toISOString().slice(0, 10);
  }

  protected applicant = {
    fullName: '',
    applicantType: 'Individual' as Applicant['applicantType'],
    email: '',
    mobileNumber: '',
    landlineNumber: '',
    addressLine: '',
    barangay: this.barangays[0],
  };

  protected business = {
    registeredName: '',
    tradeName: '',
    category: BUSINESS_CATEGORIES[0],
    addressLine: '',
    barangay: this.barangays[0],
    ownerOrRepresentative: '',
    registrationNumber: '',
  };

  protected applicationInfo = {
    permitType: '' as PermitType | '',
    applicationAction: 'New' as ApplicationAction,
    scopeDescription: '',
    dateReceived: this.todayInput(),
    assignedEvaluator: 'Engr. Ricardo Buenaflor',
    initialRemarks: '',
  };

  // `applicant`/`business`/`applicationInfo` above are plain mutable
  // objects (not signals) — the simplest binding target for ngModel
  // across this many fields. Angular's `computed()` only invalidates its
  // cache when a SIGNAL it read changes; a computed that reads nothing
  // but plain object properties has no producers, so it would compute
  // once and then cache that result forever, never reflecting further
  // edits. Every value below that's derived purely from those plain
  // objects is therefore a plain method, not `computed()` — Angular's
  // default (non-OnPush) change detection re-evaluates plain method calls
  // in the template on every cycle, which is what keeps these correct as
  // the user types/selects. Only `currentStep`/`showStepErrors` below
  // are true `computed()`s, because they only ever read the real
  // `stepIndex`/`attempted` signals.

  protected responsibleDepartment() {
    if (!this.applicationInfo.permitType) return null;
    const req = requirementsFor(this.applicationInfo.permitType);
    return departmentById(req.responsibleDepartmentId) ?? null;
  }

  protected onPermitTypeChange(): void {
    const type = this.applicationInfo.permitType;
    if (!type) {
      this.documents.set([]);
      return;
    }
    const req = requirementsFor(type);
    this.documents.set(
      req.documents.map((d): DocumentDraft => ({
        requirementId: d.id,
        label: d.label,
        required: d.required,
        reviewingDepartmentId: d.reviewingDepartmentId,
        fileName: '',
        documentType: d.label,
        issuingOffice: '',
        issueDate: '',
        expiryDate: '',
      })),
    );
  }

  protected readonly documents = signal<DocumentDraft[]>([]);

  protected departmentLabel(id: string): string {
    return departmentName(id);
  }

  /** Replaces the draft immutably (rather than mutating `doc.fileName` in place) so the `documents` signal's own version actually changes — anything computed FROM `documents()` (e.g. `allStepsValid`) needs a real signal write to know a file was attached. */
  private updateDocument(requirementId: string, patch: Partial<DocumentDraft>): void {
    this.documents.update((docs) =>
      docs.map((d) => (d.requirementId === requirementId ? { ...d, ...patch } : d)),
    );
  }

  protected onFileChosen(doc: DocumentDraft, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.updateDocument(doc.requirementId, { fileName: file.name });
  }

  protected clearFile(doc: DocumentDraft): void {
    this.updateDocument(doc.requirementId, { fileName: '' });
  }

  protected onDocFieldChange(
    doc: DocumentDraft,
    field: 'documentType' | 'issuingOffice' | 'issueDate' | 'expiryDate',
    value: string,
  ): void {
    this.updateDocument(doc.requirementId, { [field]: value });
  }

  // ---- Validation ---------------------------------------------------------
  // Plain methods, not `computed()` — see the note above `permitTypeOptions`.

  protected emailValidation() {
    return validateEmail(this.applicant.email);
  }

  protected mobileValidation() {
    return validateMobileNumber(this.applicant.mobileNumber);
  }

  protected landlineValidation() {
    return validateLandlineNumber(this.applicant.landlineNumber, false);
  }

  private stepErrors(step: Step): string[] {
    const errors: string[] = [];
    if (step === 'applicant') {
      if (!this.applicant.fullName.trim()) errors.push('Applicant/user name is required.');
      if (!this.emailValidation().valid) errors.push(this.emailValidation().error!);
      if (!this.mobileValidation().valid) errors.push(this.mobileValidation().error!);
      if (!this.landlineValidation().valid) errors.push(this.landlineValidation().error!);
      if (!this.applicant.addressLine.trim()) errors.push('Address is required.');
    } else if (step === 'business') {
      if (!this.business.registeredName.trim())
        errors.push('Registered business name is required.');
      if (!this.business.addressLine.trim()) errors.push('Business address is required.');
      if (!this.business.ownerOrRepresentative.trim())
        errors.push('Owner or authorized representative is required.');
    } else if (step === 'application') {
      if (!this.applicationInfo.permitType) errors.push('Permit type is required.');
      if (!this.applicationInfo.scopeDescription.trim())
        errors.push('Description or scope of work is required.');
      if (!this.applicationInfo.dateReceived) errors.push('Date received is required.');
    } else if (step === 'documents') {
      const missing = this.documents().filter((d) => d.required && !d.fileName.trim());
      if (missing.length > 0) {
        errors.push(
          `${missing.length} required document${missing.length === 1 ? '' : 's'} still need${missing.length === 1 ? 's' : ''} a file: ${missing.map((d) => d.label).join(', ')}.`,
        );
      }
    }
    return errors;
  }

  // `currentStep`/`showStepErrors` stay real `computed()`s — both read
  // only real signals (`stepIndex`/`attempted`), so Angular's cache
  // invalidation genuinely applies to them.
  protected readonly currentStep = computed(() => this.steps[this.stepIndex()].key);
  protected readonly showStepErrors = computed(() => this.attempted().has(this.currentStep()));

  // Plain method — `stepErrors()` reads plain applicant/business/
  // applicationInfo fields for most steps, which a `computed()` can't
  // see change (see the note above `permitTypeOptions`).
  protected currentStepErrors(): string[] {
    return this.stepErrors(this.currentStep());
  }

  protected fieldTouched(step: Step): boolean {
    return this.attempted().has(step);
  }

  protected canGoNext(): boolean {
    return this.currentStepErrors().length === 0;
  }

  protected next(): void {
    const step = this.currentStep();
    this.attempted.update((set) => new Set(set).add(step));
    if (this.stepErrors(step).length > 0) return;
    if (this.stepIndex() < this.steps.length - 1) this.stepIndex.update((i) => i + 1);
  }

  protected back(): void {
    if (this.stepIndex() > 0) this.stepIndex.update((i) => i - 1);
  }

  protected goToStep(index: number): void {
    // Only allow jumping to a step that's already been reached, or one
    // step ahead once the current step is valid — keeps the form from
    // being skippable straight to Review with earlier sections blank.
    if (index <= this.stepIndex()) {
      this.stepIndex.set(index);
      return;
    }
    if (index === this.stepIndex() + 1) this.next();
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  protected allStepsValid(): boolean {
    return this.steps.every((s) => s.key === 'review' || this.stepErrors(s.key).length === 0);
  }

  // ---- Submission -----------------------------------------------------

  // Guards against a double-click / double-Enter firing `submit()` twice
  // before the first call finishes (there is no network round-trip here,
  // but the store mutation itself is synchronous and a second call would
  // otherwise create a second Applicant/Business/ApplicationRecord for
  // the same encoded submission) — set true for the remainder of this
  // call, and the template disables the submit button while it's true.
  protected readonly submitting = signal(false);

  protected submit(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');
    // Defensive re-check — the Review step is reachable only after every
    // earlier step validated, but this guards against a stale state.
    for (const step of this.steps) {
      if (step.key === 'review') continue;
      if (this.stepErrors(step.key).length > 0) {
        this.attempted.update((set) => new Set(set).add(step.key));
        this.submitError.set(
          'Some required information is missing or invalid — please review the earlier steps.',
        );
        this.submitting.set(false);
        return;
      }
    }
    const permitType = this.applicationInfo.permitType;
    if (!permitType) {
      this.submitting.set(false);
      return;
    }

    const actor = this.session.name() || 'Staff';
    const role = this.session.role() ?? 'Administrator';

    const [firstName, ...rest] = this.applicant.fullName.trim().split(/\s+/);
    const lastName = rest.length ? rest.join(' ') : firstName;

    const applicant = this.store.addApplicant({
      firstName,
      lastName: rest.length ? lastName : '',
      email: this.emailValidation().normalized,
      mobileNumber: this.mobileValidation().normalized,
      landlineNumber: this.landlineValidation().normalized || null,
      applicantType: this.applicant.applicantType,
      addressLine: this.applicant.addressLine.trim(),
      barangay: this.applicant.barangay,
      emailVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
      mobileVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
    });

    const business = this.store.addBusiness({
      name: this.business.registeredName.trim(),
      category: this.business.category,
      ownerApplicantId: applicant.id,
      street: this.business.addressLine.trim(),
      barangay: this.business.barangay,
      city: 'Castilla',
      province: 'Sorsogon',
      registrationNumber: this.business.registrationNumber.trim() || 'PENDING',
      status: 'Active',
    });

    const dateReceived = new Date(`${this.applicationInfo.dateReceived}T09:00:00`);
    const dateSubmitted = dateReceived.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const record = this.store.create(
      {
        businessId: business.id,
        businessName: business.name,
        applicantId: applicant.id,
        applicant: `${applicant.firstName} ${applicant.lastName}`.trim(),
        location: `Barangay ${this.business.barangay}`,
        permitType,
        applicationAction: this.applicationInfo.applicationAction,
        officer: this.applicationInfo.assignedEvaluator,
        dateSubmitted,
        dateValue: dateReceived,
        lifecycleStatus: 'Submitted',
        evaluationStage: 'Initial',
        evaluationResult: 'Pending',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      actor,
      role,
    );

    for (const doc of this.documents()) {
      if (!doc.fileName.trim()) continue;
      this.store.attachDocument(
        record.id,
        doc.requirementId,
        doc.documentType || doc.label,
        doc.fileName.trim(),
        actor,
        {
          issuingOffice: doc.issuingOffice.trim() || null,
          issueDate: doc.issueDate || null,
          expiryDate: doc.expiryDate || null,
        },
      );
    }

    if (this.applicationInfo.initialRemarks.trim()) {
      this.store.addNote(record.id, actor, role, this.applicationInfo.initialRemarks.trim());
    }

    this.created.emit(record);
  }
}
