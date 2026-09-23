import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../icon/icon';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { Applicant } from '../../core/domain/applicant.model';
import { CASTILLA_BARANGAYS } from '../../core/domain/castilla-barangays';
import { ALL_PERMIT_TYPES, ApplicationAction, PermitType } from '../../core/domain/permit.model';
import { documentsFor, requirementsFor } from '../../core/domain/requirements-catalog';
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
import { StaffCitizensApi } from '../../core/api/staff-citizens.api';
import { IdentityApi } from '../../core/api/identity.api';
import { QueueLoader } from '../../core/domain/queue-loader';
import { toBase64 } from '../utils/to-base64';
import { CapitalizeNameDirective } from '../utils/capitalize-name.directive';

/**
 * The server's own `business.category` vocabulary for a staff filing
 * (`staff-applications.controller.ts` `onBehalfShape`). Not the mobile app's
 * six-value list this used to offer: that one had "Wholesale", which the
 * route refuses with a 400, and lacked the three the route accepts.
 */
const BUSINESS_CATEGORIES: readonly string[] = [
  'Retail',
  'Food Service',
  'Services',
  'Manufacturing',
  'Construction',
  'Transport',
  'Agriculture',
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
  /** The real, picked File — kept alongside `fileName` so `submit()` has real bytes to send to `POST /documents`, not just the name `onFileChosen` used to keep alone. `null` until a file is chosen. */
  file: File | null;
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

const SIX_DIGITS = /^\d{6}$/;

/**
 * Full walk-in/manually-submitted application intake — replaces the old
 * 4-field "New Application" modal. Organized into the sections the
 * consolidation spec asks for (Applicant / Business / Application /
 * Document Attachments / Review), backed by the same ApplicationStore
 * every other module reads, and driven by the centralized permit-type
 * and requirements catalogs so its document checklist is never a second,
 * independently-maintained list.
 *
 * Everything this form asks for is sent and kept: the applicant's name and
 * own address on their applicant record, the extra answers (applicant type,
 * landline, trade name, owner, scope, date received) in the application's
 * `form`, and each attachment's issuing office and dates with the document.
 * A field that is collected and then dropped is a field that lies to the
 * officer filling it in — that is what the earlier version did with the
 * address and the document dates.
 */
@Component({
  selector: 'app-application-intake',
  imports: [FormsModule, Icon, CapitalizeNameDirective],
  templateUrl: './application-intake.html',
  styleUrl: './application-intake.scss',
})
export class ApplicationIntake {
  private readonly store = inject(ApplicationStore);
  private readonly requirementsConfig = inject(RequirementsConfigStore);
  private readonly toast = inject(ToastService);
  private readonly applicationsApi = inject(StaffApplicationsApi);
  private readonly citizensApi = inject(StaffCitizensApi);
  private readonly identity = inject(IdentityApi);
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

  /** Belt-and-suspenders alongside hasSaneYear()'s own check below: a native `<input type="date">`'s year segment does not reliably stay capped at 4 digits while typing, so this bounds the picker itself rather than relying on it alone. */
  protected readonly maxDocumentDate = `${new Date().getFullYear() + 50}-12-31`;

  private todayInput(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Name split the same way the citizen sign-up collects it (first / middle /
  // last), because that is how the server keeps it — the single "full name"
  // box this used to have was split on the first space, so "Maria Clara
  // Dela Cruz" became first name "Maria", last name "Clara Dela Cruz".
  protected applicant = {
    firstName: '',
    middleName: '',
    lastName: '',
    applicantType: 'Individual' as Applicant['applicantType'],
    email: '',
    mobileNumber: '',
    landlineNumber: '',
    addressLine: '',
    // No default: a barangay silently pre-selected is a barangay silently wrong.
    barangay: '',
  };

  protected business = {
    registeredName: '',
    tradeName: '',
    category: BUSINESS_CATEGORIES[0],
    addressLine: '',
    barangay: '',
    ownerOrRepresentative: '',
    registrationNumber: '',
    dateRegistered: this.todayInput(),
  };

  protected applicationInfo = {
    permitType: '' as PermitType | '',
    applicationAction: 'New' as ApplicationAction,
    /** The permit being renewed or amended, verified against a real eBPCO-issued permit — the server refuses a Renewal that names neither this nor `priorPermitClaim`. */
    relatedPermitNumber: '',
    /**
     * The unverified alternative, for a permit that predates eBPCO — the
     * common case at the counter, not a fraud signal (053). Mutually
     * exclusive with `relatedPermitNumber` (the server refuses both set);
     * `onRelatedPermitNumberChange`/`onPriorPermitClaimChange` below keep
     * that true as the officer types, rather than a toggle they have to
     * click to switch between the two.
     */
    priorPermitClaim: '',
    scopeDescription: '',
    dateReceived: this.todayInput(),
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

  protected fullName(): string {
    return [this.applicant.firstName, this.applicant.middleName, this.applicant.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ');
  }

  // ---- Email verification (Step 1, before an account exists) --------------
  // The same real 6-digit code the citizen portal's own sign-up sends and
  // checks (`/auth/register/email/request` + `/confirm`); the server spends
  // the confirmed proof when this filing creates the applicant's account, so
  // the account starts Verified instead of Unverified-forever.

  protected readonly emailVerified = signal(false);
  protected readonly codeSent = signal(false);
  protected readonly sendingCode = signal(false);
  protected readonly confirmingCode = signal(false);
  protected readonly codeError = signal<string | null>(null);
  /** A non-error status line under the code field — "code sent", not a failure. */
  protected readonly codeNotice = signal<string | null>(null);
  /**
   * Set only when the LGU could not send a code at all (no mail provider, or
   * a real one that just failed). It is what lets Next work without a
   * confirmed code, and it says so on screen — the account is then filed
   * Unverified, and the applicant can verify from their own Profile later.
   */
  protected readonly verificationUnavailable = signal<string | null>(null);
  protected verificationCode = '';

  // ---- Email availability (Step 1) -----------------------------------------
  // Independent of emailVerified()/verificationUnavailable() above: those
  // prove the officer's TYPED email reaches a real inbox, never whether an
  // account already exists at it. The server's own account-creation step
  // refuses a duplicate email, but that refusal used to only ever surface
  // at Review & Confirm (the LAST step), sending the officer all the way
  // back to Step 1 to fix it (found live 2026-09-20). Checked here instead,
  // against the same real citizen directory the Citizens module lists from
  // (StaffCitizensApi), the moment the officer leaves the field.
  protected readonly checkingEmailAvailability = signal(false);
  protected readonly emailTaken = signal(false);

  protected async checkEmailAvailability(): Promise<void> {
    const email = this.emailValidation();
    if (!email.valid) return;
    this.checkingEmailAvailability.set(true);
    try {
      const result = await this.citizensApi.list({ search: email.normalized, pageSize: 5 });
      this.emailTaken.set(
        result.kind === 'ok'
          && result.rows.some((row) => row.email.toLowerCase() === email.normalized.toLowerCase()),
      );
    } finally {
      this.checkingEmailAvailability.set(false);
    }
  }

  /** Editing the address after a code was sent or confirmed voids that state — the code belonged to the PREVIOUS address. */
  protected onEmailInput(value: string): void {
    this.applicant.email = value;
    this.emailTaken.set(false);
    if (this.emailVerified() || this.codeSent() || this.verificationUnavailable()) {
      this.resetVerification();
    }
  }

  protected changeEmail(): void {
    this.resetVerification();
  }

  private resetVerification(): void {
    this.emailVerified.set(false);
    this.codeSent.set(false);
    this.verificationCode = '';
    this.codeError.set(null);
    this.codeNotice.set(null);
    this.verificationUnavailable.set(null);
  }

  protected async sendVerificationCode(): Promise<void> {
    const email = this.emailValidation();
    if (!email.valid) {
      this.attempted.update((set) => new Set(set).add('applicant'));
      return;
    }
    this.codeError.set(null);
    this.codeNotice.set(null);
    this.sendingCode.set(true);
    try {
      const result = await this.identity.requestRegistrationEmailCode(email.normalized);
      switch (result.kind) {
        case 'sent':
          this.codeSent.set(true);
          this.verificationUnavailable.set(null);
          this.codeNotice.set(`A 6-digit code was sent to ${email.normalized}. Ask the applicant to read it back; it expires in a few minutes.`);
          break;
        case 'too-soon':
          // A live code from moments ago is still good — keep that entry open
          // rather than treating this as a failure.
          this.codeSent.set(true);
          this.codeNotice.set(result.message);
          break;
        case 'unavailable':
          this.codeSent.set(false);
          this.verificationUnavailable.set(
            'This deployment cannot send verification codes yet. You can continue; the account will be filed '
              + 'Unverified and the applicant can verify this email from their own Profile later.',
          );
          break;
        default:
          // 'not-sent' (no provider configured) or 'failed' (a real one that
          // just failed) — the officer must not be unable to file a walk-in
          // because of an LGU infrastructure problem.
          this.codeSent.set(false);
          this.verificationUnavailable.set(
            `${result.message} You can continue; the account will be filed Unverified and the applicant `
              + 'can verify this email from their own Profile later.',
          );
      }
    } catch {
      this.verificationUnavailable.set(
        'Could not reach the Municipality’s system to send a code. You can continue; the account will be '
          + 'filed Unverified and the applicant can verify this email from their own Profile later.',
      );
    } finally {
      this.sendingCode.set(false);
    }
  }

  protected async confirmVerificationCode(): Promise<void> {
    if (!SIX_DIGITS.test(this.verificationCode)) {
      this.codeError.set('Enter the 6-digit code exactly as sent.');
      return;
    }
    this.codeError.set(null);
    this.codeNotice.set(null);
    this.confirmingCode.set(true);
    try {
      const result = await this.identity.confirmRegistrationEmailCode(
        this.emailValidation().normalized, this.verificationCode,
      );
      if (result.kind === 'confirmed') {
        this.emailVerified.set(true);
        this.codeSent.set(false);
        this.verificationCode = '';
      } else if (result.kind === 'unavailable') {
        this.codeError.set('This deployment cannot check verification codes yet.');
      } else {
        this.codeError.set(result.message);
      }
    } catch {
      this.codeError.set('Could not reach the Municipality’s system to check the code. Try again.');
    } finally {
      this.confirmingCode.set(false);
    }
  }

  // ---- Document checklist ----------------------------------------------

  /**
   * Re-run whenever the permit type OR the application action changes
   * (`onApplicationActionChange` below just delegates here) — since backend
   * migration 047, Building Permit's checklist varies by action, so a
   * change to either input can change what step 4 should show.
   */
  protected async onPermitTypeChange(): Promise<void> {
    const type = this.applicationInfo.permitType;
    if (!type) {
      this.documents.set([]);
      return;
    }
    const action = this.applicationInfo.applicationAction;
    // Renders immediately from whatever the store already holds (the static
    // catalog seed, or an earlier session's live fetch), then refreshes once
    // the live checklist for this type/action has actually loaded — Permit
    // Release > Permit Types is the one place it can be edited server-side.
    this.applyDocumentsFor(type, action);
    await this.requirementsConfig.ensureLoaded(type, action);
    if (this.applicationInfo.permitType === type && this.applicationInfo.applicationAction === action) {
      this.applyDocumentsFor(type, action);
    }
  }

  protected onApplicationActionChange(): void {
    if (this.applicationInfo.applicationAction === 'New') {
      this.applicationInfo.relatedPermitNumber = '';
      this.applicationInfo.priorPermitClaim = '';
    }
    void this.onPermitTypeChange();
  }

  /** Typing a verified permit number and an unverified claim at once is what the server refuses — this is what keeps that from happening as the officer types, instead of a toggle they'd have to click. */
  protected onRelatedPermitNumberChange(value: string): void {
    this.applicationInfo.relatedPermitNumber = value;
    if (value.trim()) this.applicationInfo.priorPermitClaim = '';
  }

  /** The other half of `onRelatedPermitNumberChange`'s own mutual-exclusion. */
  protected onPriorPermitClaimChange(value: string): void {
    this.applicationInfo.priorPermitClaim = value;
    if (value.trim()) this.applicationInfo.relatedPermitNumber = '';
  }

  protected needsRelatedPermit(): boolean {
    return this.applicationInfo.applicationAction !== 'New';
  }

  /** The claim path's own upload target, once the checklist for this type/action actually carries it (see `applyDocumentsFor`). */
  protected priorPermitProofDocument(): DocumentDraft | undefined {
    return this.documents().find((d) => d.requirementId === 'prior-permit-proof');
  }

  /**
   * `DocumentDraft.required` is the catalog's own answer — a pure function
   * of permit type and action, blind to whether THIS applicant has a
   * matched permit to select instead. `prior-permit-proof` is deliberately
   * `required: false` there (053) for exactly that reason; this is where
   * its real requiredness, specific to the claim path, is enforced.
   */
  protected isRequired(d: DocumentDraft): boolean {
    return d.required || (d.requirementId === 'prior-permit-proof' && !!this.applicationInfo.priorPermitClaim.trim());
  }

  private applyDocumentsFor(type: PermitType, action: ApplicationAction): void {
    const live = this.requirementsConfig.documentsFor(type, action);
    // A successful live fetch that came back empty means nobody has
    // published a checklist for this type/action yet (see
    // RequirementsConfigStore's own doc comment) — correct and honest on
    // the editor that manages that checklist, but a brand-new application's
    // intake step has no such context to offer; showing a step that is
    // silently, unexplainedly blank between the tab strip and the
    // Back/Next buttons reads as broken, not as "nothing required".
    // Falling back to the office's static reference catalog here — the
    // same one the per-application Documents tab already reads directly —
    // keeps the step usable and honestly labelled instead.
    const usingFallback = live.length === 0;
    const docs = usingFallback ? documentsFor(type, action) : live;
    this.documentsFallbackActive.set(usingFallback);
    // Keep what the officer already filled in for a requirement that is still
    // on the list — switching Transaction Type and back must not wipe the
    // files they attached.
    const previous = new Map(this.documents().map((d) => [d.requirementId, d]));
    this.documents.set(
      docs.map((d): DocumentDraft => previous.get(d.id) ?? {
        requirementId: d.id,
        label: d.label,
        required: d.required,
        reviewingDepartmentId: d.reviewingDepartmentId,
        fileName: '',
        file: null,
        documentType: d.label,
        issuingOffice: '',
        issueDate: '',
        expiryDate: '',
      }),
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
    if (file) this.updateDocument(doc.requirementId, { fileName: file.name, file });
  }

  protected clearFile(doc: DocumentDraft, input?: HTMLInputElement): void {
    this.updateDocument(doc.requirementId, { fileName: '', file: null });
    // The native control still shows the old name otherwise, and choosing the
    // same file again would not fire `change`.
    if (input) input.value = '';
  }

  protected onDocFieldChange(
    doc: DocumentDraft,
    field: 'documentType' | 'issuingOffice' | 'issueDate' | 'expiryDate',
    value: string,
  ): void {
    this.updateDocument(doc.requirementId, { [field]: value });
  }

  private static readonly MIN_DOCUMENT_YEAR = 1900;
  private static readonly MAX_DOCUMENT_YEAR = new Date().getFullYear() + 50;

  /**
   * A native `<input type="date">`'s year segment does not reliably cap at
   * 4 digits while typing — confirmed live 2026-09-20: "01/02/29252" and
   * "01/03/29252" both went straight through as Issue/Expiry Date, since
   * `documentIssue()` below only ever checked presence and ordering, never
   * whether the date was one a real document could actually carry.
   * Splitting on '-' (not a fixed character offset) is what actually
   * catches a 5-digit year — `iso.slice(0, 4)` would have silently read
   * "2925" off "29252-01-02" and called it fine.
   */
  private hasSaneYear(iso: string): boolean {
    const [yearPart] = iso.split('-');
    if (!yearPart || yearPart.length !== 4) return false;
    const year = Number(yearPart);
    return Number.isInteger(year)
      && year >= ApplicationIntake.MIN_DOCUMENT_YEAR
      && year <= ApplicationIntake.MAX_DOCUMENT_YEAR;
  }

  /**
   * What is wrong with one attached document's own details, or `null`. The
   * dates are required once a file is attached — an officer used to be able
   * to leave both blank and the form went straight through — and the expiry
   * cannot precede the issue (the server refuses that too, as a 400).
   */
  protected documentIssue(doc: DocumentDraft): string | null {
    if (!doc.file) return null;
    if (!doc.issueDate && !doc.expiryDate) return 'Issue Date and Expiry Date are required.';
    if (!doc.issueDate) return 'Issue Date is required.';
    if (!doc.expiryDate) return 'Expiry Date is required.';
    if (!this.hasSaneYear(doc.issueDate)) return 'Issue Date has an invalid year.';
    if (!this.hasSaneYear(doc.expiryDate)) return 'Expiry Date has an invalid year.';
    if (doc.expiryDate < doc.issueDate) return 'Expiry Date cannot be earlier than the Issue Date.';
    return null;
  }

  // ---- Validation ---------------------------------------------------------
  // Plain methods, not `computed()` — see the note above `permitTypeOptions`.

  protected emailValidation() {
    return validateEmail(this.applicant.email);
  }

  protected mobileValidation() {
    return validateMobileNumber(this.applicant.mobileNumber);
  }

  /**
   * Digits only, capped at 11 — the field used to accept anything typed
   * (letters, unlimited length), leaving `mobileValidation()`'s error the
   * only thing catching it, and only once the encoder tried to move on
   * (found live 2026-09-20). `validateMobileNumber` still separately
   * accepts a typed `+63`/spaces/hyphens and normalizes them, but a
   * walk-in encoder almost always types the plain local 09XXXXXXXXX form,
   * so narrowing what CAN be typed to that costs nothing real.
   *
   * `.value` is set directly, not left to `[ngModel]`'s own re-render —
   * same reasoning as the citizen portal's own `onMobileNumberInput`
   * (register.page.ts): a rejected keystroke that sanitizes back to the
   * SAME string the model already held ('' -> '' typing a letter into an
   * empty field) produces no bound-expression change for Angular to act
   * on, so the field would keep showing what was typed, letters included.
   */
  protected onMobileNumberInput(value: string, input: HTMLInputElement): void {
    this.applicant.mobileNumber = value.replace(/\D/g, '').slice(0, 11);
    input.value = this.applicant.mobileNumber;
  }

  protected landlineValidation() {
    return validateLandlineNumber(this.applicant.landlineNumber, false);
  }

  protected emailNeedsVerification(): boolean {
    return this.emailValidation().valid && !this.emailVerified() && !this.verificationUnavailable();
  }

  private stepErrors(step: Step): string[] {
    const errors: string[] = [];
    if (step === 'applicant') {
      if (!this.applicant.firstName.trim()) errors.push('First name is required.');
      if (!this.applicant.lastName.trim()) errors.push('Last name is required.');
      if (!this.emailValidation().valid) errors.push(this.emailValidation().error!);
      else if (this.emailTaken()) {
        errors.push('This email already belongs to an existing citizen account.');
      } else if (this.emailNeedsVerification()) {
        errors.push('Verify the applicant’s email address with the 6-digit code before continuing.');
      }
      if (!this.mobileValidation().valid) errors.push(this.mobileValidation().error!);
      if (!this.landlineValidation().valid) errors.push(this.landlineValidation().error!);
      if (!this.applicant.barangay) errors.push('Barangay is required.');
      if (!this.applicant.addressLine.trim()) errors.push('Address is required.');
    } else if (step === 'business') {
      if (!this.business.registeredName.trim())
        errors.push('Registered business name is required.');
      if (!this.business.addressLine.trim()) errors.push('Business address is required.');
      if (!this.business.barangay) errors.push('Business barangay is required.');
      if (!this.business.ownerOrRepresentative.trim())
        errors.push('Owner or authorized representative is required.');
      if (!this.business.registrationNumber.trim())
        errors.push('Registration / reference number is required.');
      if (!this.business.dateRegistered) errors.push('Date registered is required.');
    } else if (step === 'application') {
      if (!this.applicationInfo.permitType) errors.push('Permit type is required.');
      if (this.needsRelatedPermit()) {
        const hasNumber = !!this.applicationInfo.relatedPermitNumber.trim();
        const hasClaim = !!this.applicationInfo.priorPermitClaim.trim();
        if (!hasNumber && !hasClaim) {
          errors.push(`The permit number being ${this.applicationInfo.applicationAction === 'Renewal' ? 'renewed' : 'amended'} is required.`);
        }
        if (hasClaim) {
          const proof = this.priorPermitProofDocument();
          if (proof && !proof.file) errors.push('Please attach a photo or scan of the permit being claimed.');
        }
      }
      if (!this.applicationInfo.scopeDescription.trim())
        errors.push('Description or scope of work is required.');
      if (!this.applicationInfo.dateReceived) errors.push('Date received is required.');
    } else if (step === 'documents') {
      const missing = this.documents().filter((d) => this.isRequired(d) && !d.file);
      if (missing.length > 0) {
        errors.push(
          `${missing.length} required document${missing.length === 1 ? '' : 's'} still need${missing.length === 1 ? 's' : ''} a file: ${missing.map((d) => d.label).join(', ')}.`,
        );
      }
      const incomplete = this.documents().filter((d) => this.documentIssue(d) !== null);
      if (incomplete.length > 0) {
        errors.push(
          `Fill in the Issue Date and Expiry Date for: ${incomplete.map((d) => d.label).join(', ')}.`,
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

  /** The attachments that will actually be sent — the Review step counts these, not the checklist. */
  protected attachedDocuments(): DocumentDraft[] {
    return this.documents().filter((d) => d.file !== null);
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
      const result = await this.applicationsApi.fileOnBehalf({
        applicant: {
          firstName: this.applicant.firstName.trim(),
          middleName: this.applicant.middleName.trim() || undefined,
          lastName: this.applicant.lastName.trim(),
          email: this.emailValidation().normalized,
          mobileNumber: this.mobileValidation().normalized || undefined,
          street: this.applicant.addressLine.trim(),
          barangay: this.applicant.barangay,
        },
        business: {
          name: this.business.registeredName.trim(),
          category: this.business.category,
          street: this.business.addressLine.trim(),
          barangay: this.business.barangay,
          city: 'Castilla',
          province: 'Sorsogon',
          registrationNumber: this.business.registrationNumber.trim(),
          dateRegistered: this.business.dateRegistered,
        },
        permitType,
        applicationAction: this.applicationInfo.applicationAction,
        renewsPermitNumber: this.needsRelatedPermit() && this.applicationInfo.relatedPermitNumber.trim()
          ? this.applicationInfo.relatedPermitNumber.trim() : null,
        priorPermitClaim: this.needsRelatedPermit() && this.applicationInfo.priorPermitClaim.trim()
          ? this.applicationInfo.priorPermitClaim.trim() : null,
        location: `${this.business.addressLine.trim()}, Barangay ${this.business.barangay}, Castilla, Sorsogon`,
        // The answers that have no column of their own, kept on the
        // application's `form` the same way the citizen wizard keeps its
        // scope of work — so the detail page reads them back from the record.
        form: {
          scopeOfWork: this.applicationInfo.scopeDescription.trim(),
          applicantType: this.applicant.applicantType,
          landlineNumber: this.landlineValidation().normalized || null,
          tradeName: this.business.tradeName.trim() || null,
          ownerOrRepresentative: this.business.ownerOrRepresentative.trim(),
          dateReceived: this.applicationInfo.dateReceived,
          filedAtCounter: true,
        },
      });

      if (result.kind === 'name-mismatch') {
        // Nothing was filed. Send the officer back to the applicant step with
        // the server's own sentence, which names who the address belongs to.
        this.stepIndex.set(0);
        this.attempted.update((set) => new Set(set).add('applicant'));
        this.submitError.set(result.message);
        this.toast.error(result.message);
        return;
      }
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

      // Real `POST /documents` per chosen file — the same real route/method
      // (`StaffApplicationsApi.attachDocument`) `applications.ts`'s own
      // `attachDocumentFile` already uses for an existing application, now
      // carrying the issuing office and dates the officer typed beside it.
      const failedAttachments: string[] = [];
      for (const doc of this.attachedDocuments()) {
        if (!doc.file) continue;
        try {
          const contentBase64 = await toBase64(doc.file);
          const attachResult = await this.applicationsApi.attachDocument(
            record.id,
            doc.requirementId,
            doc.documentType.trim() || doc.label,
            doc.file.name,
            contentBase64,
            {
              issuingOffice: doc.issuingOffice.trim() || undefined,
              issuedOn: doc.issueDate || undefined,
              expiresOn: doc.expiryDate || undefined,
            },
          );
          if (attachResult.kind !== 'done') failedAttachments.push(doc.label);
        } catch {
          failedAttachments.push(doc.label);
        }
      }
      if (failedAttachments.length > 0) {
        this.toast.error(
          `Application ${result.referenceNumber} filed, but ${failedAttachments.length} document`
            + `${failedAttachments.length === 1 ? '' : 's'} could not be attached: ${failedAttachments.join(', ')}. `
            + 'Attach them from the application\'s own Documents tab.',
        );
      }

      const who = this.fullName();
      const under = result.returningApplicant
        ? ` under ${who}’s existing account`
        : ` — a new account for ${who}`;
      const verified = result.emailVerified === undefined
        ? ''
        : result.emailVerified ? ' (email verified)' : ' (email not yet verified)';
      this.toast.success(`Application ${result.referenceNumber} filed${under}${verified}.`);
      this.created.emit(this.store.getById(record.id) ?? record);
    } finally {
      this.submitting.set(false);
    }
  }
}
