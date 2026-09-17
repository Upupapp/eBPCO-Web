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
import { RequirementsConfigStore } from '../../core/domain/requirements-config-store';
import { departmentById, departmentName } from '../../core/domain/department.model';
import {
  MOBILE_FORMAT_EXAMPLE,
  LANDLINE_FORMAT_EXAMPLE,
  validateEmail,
  validateLandlineNumber,
  validateMobileNumber,
} from '../utils/validators';
import { ToastService } from '../toast/toast.service';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';
import { QueueLoader } from '../../core/domain/queue-loader';
import { CapitalizeNameDirective } from '../utils/capitalize-name.directive';

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
  imports: [FormsModule, Icon, CapitalizeNameDirective],
  templateUrl: './application-intake.html',
  styleUrl: './application-intake.scss',
})
export class ApplicationIntake {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
  private readonly requirementsConfig = inject(RequirementsConfigStore);
  private readonly toast = inject(ToastService);
  private readonly applicationsApi = inject(StaffApplicationsApi);
  private readonly loader = inject(QueueLoader);

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
    dateRegistered: this.todayInput(),
  };

  protected applicationInfo = {
    permitType: '' as PermitType | '',
    applicationAction: 'New' as ApplicationAction,
    scopeDescription: '',
    dateReceived: this.todayInput(),
    assignedEvaluator: 'Engr. Ricardo Buenaflor',
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

  protected async onPermitTypeChange(): Promise<void> {
    const type = this.applicationInfo.permitType;
    if (!type) {
      this.documents.set([]);
      return;
    }
    // Renders immediately from whatever the store already holds (the static
    // catalog seed, or an earlier session's live fetch), then refreshes once
    // the live checklist for this type has actually loaded — Permit Release
    // > Permit Types is the one place it can be edited server-side.
    this.applyDocumentsFor(type);
    await this.requirementsConfig.ensureLoaded(type);
    if (this.applicationInfo.permitType === type) this.applyDocumentsFor(type);
  }

  private applyDocumentsFor(type: PermitType): void {
    const live = this.requirementsConfig.documentsFor(type);
    // A successful live fetch that came back empty means nobody has
    // published a checklist for this type yet (see RequirementsConfigStore's
    // own doc comment) — correct and honest on the editor that manages that
    // checklist, but a brand-new application's intake step has no such
    // context to offer; showing a step that is silently, unexplainedly blank
    // between the tab strip and the Back/Next buttons reads as broken, not
    // as "nothing required". Falling back to the office's static reference
    // catalog here — the same one the per-application Documents tab already
    // reads directly — keeps the step usable and honestly labelled instead.
    const usingFallback = live.length === 0;
    const docs = usingFallback ? requirementsFor(type).documents : live;
    this.documentsFallbackActive.set(usingFallback);
    this.documents.set(
      docs.map((d): DocumentDraft => ({
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
  /** True while Step 4 is showing the static reference catalog because no live checklist has been published for the selected type yet — drives the honest notice in the template. */
  protected readonly documentsFallbackActive = signal(false);

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
      if (!this.business.dateRegistered) errors.push('Date registered is required.');
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
    // Marking the step attempted BEFORE the validity check is what actually
    // reveals each field's inline error — previously this ran unconditionally
    // followed by an unconditional advance, so `canGoNext()` existed and was
    // computed correctly but nothing ever consulted it: clicking Next with
    // every required field blank (name, email, mobile, address) silently
    // advanced to the next step with no error shown anywhere.
    this.attempted.update((set) => new Set(set).add(step));
    if (!this.canGoNext()) return;
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
  // before the first call's own request lands — a fresh idempotency key is
  // generated per attempt (see `StaffApplicationsApi.fileOnBehalf`), so a
  // second concurrent call would otherwise file the same application twice.
  protected readonly submitting = signal(false);

  protected async submit(): Promise<void> {
    if (this.submitting()) return;
    this.submitError.set('');
    // `next()` now refuses to advance past an invalid step, but this is
    // still the real gate before anything is sent — a step can go from
    // valid to invalid after being passed (e.g. a field cleared after
    // going back), and this is what catches that before submission.
    const invalidStep = this.steps.find(
      (s) => s.key !== 'review' && this.stepErrors(s.key).length > 0,
    );
    if (invalidStep) {
      this.attempted.update((set) => new Set(set).add(invalidStep.key));
      this.stepIndex.set(this.steps.indexOf(invalidStep));
      this.submitError.set(
        `Fix the issues in "${invalidStep.label}" before creating this application.`,
      );
      this.toast.error(`Fix the issues in "${invalidStep.label}" before creating this application.`);
      return;
    }

    const permitType = this.applicationInfo.permitType;
    if (!permitType) return;

    this.submitting.set(true);
    try {
      const [firstName, ...rest] = this.applicant.fullName.trim().split(/\s+/);
      const lastName = rest.length ? rest.join(' ') : '';

      const result = await this.applicationsApi.fileOnBehalf({
        applicant: {
          firstName,
          lastName,
          email: this.emailValidation().normalized,
          mobileNumber: this.mobileValidation().normalized || undefined,
        },
        business: {
          name: this.business.registeredName.trim(),
          category: this.business.category,
          street: this.business.addressLine.trim(),
          barangay: this.business.barangay,
          city: 'Castilla',
          province: 'Sorsogon',
          registrationNumber: this.business.registrationNumber.trim() || 'PENDING',
          dateRegistered: this.business.dateRegistered,
        },
        permitType,
        applicationAction: this.applicationInfo.applicationAction,
        location: `Barangay ${this.business.barangay}`,
      });

      if (result.kind !== 'done') {
        const message =
          result.kind === 'unavailable'
            ? 'This deployment cannot file applications on behalf of an applicant yet.'
            : result.message;
        this.submitError.set(message);
        this.toast.error(message);
        return;
      }

      // The server's own record, not a locally-assembled guess — filing
      // creates the applicant's account and the business row too, and this
      // is the one place that gets to see exactly what it decided (e.g. a
      // returning email reused instead of duplicated).
      await this.loader.reload();
      const record = this.store.getById(result.applicationId);
      if (!record) {
        const message =
          'The application was filed, but this screen could not find it in the reloaded queue. Refresh and look for it directly.';
        this.submitError.set(message);
        this.toast.error(`Application ${result.referenceNumber} filed, but could not be reopened here.`);
        return;
      }

      // Document attachment has no server-side counterpart yet (see the
      // "not stored" note on the Document Attachments step) — this stays a
      // local-only annotation layered on the real, now server-backed record.
      const actor = this.session.name() || 'Staff';
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

      this.toast.success(`Application ${result.referenceNumber} filed for ${this.business.registeredName.trim()}.`);
      this.created.emit(this.store.getById(record.id) ?? record);
    } finally {
      this.submitting.set(false);
    }
  }
}
