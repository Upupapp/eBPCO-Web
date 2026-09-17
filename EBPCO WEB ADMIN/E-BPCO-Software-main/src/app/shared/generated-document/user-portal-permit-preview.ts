import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import qrcodegen from 'qrcode-generator';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { formatPHP } from './doc-format';
import { agencyHeaderFor, documentTitleFor } from './user-portal-document-helpers';
import { ApplicationDetail, StaffApplicationsApi } from '../../core/api/staff-applications.api';
import { FeeLine, FEE_LINES } from '../../core/api/staff-payments.api';

type WatermarkText = 'SAMPLE — NOT AN OFFICIAL PERMIT';

interface QrCell {
  x: number;
  y: number;
}

const LINE_LABELS: Record<FeeLine, string> = {
  filing: 'Filing Fee',
  processing: 'Processing Fee',
  architectural: 'Architectural Fee',
  structural: 'Structural Fee',
  electrical: 'Electrical Fee',
  others: 'Other Fees',
};

/** The template's own view of an assessment — the minimal shape shared by a real Order of Payment and the local demo `Assessment` model, so `assessment()` can return either without either one leaking fields the other doesn't have. */
interface PermitAssessmentLine {
  readonly code: string;
  readonly name: string;
  readonly legalBasisTitle: string;
  readonly authority: string;
  readonly amountCentavos: number | null;
}
interface PermitAssessmentView {
  readonly lineItems: readonly PermitAssessmentLine[];
  readonly totalCentavos: number;
  readonly balanceCentavos: number;
  readonly opsNumber: string | null;
  readonly status: string;
}

/**
 * Renders the SAME document an applicant sees on the User Portal's own
 * permit page (ebpco-user-portal's features/applications/permit-document.page.ts)
 * — same fields, same section order, same CSS classes — so a staff member
 * previewing a permit here sees exactly what the applicant would download.
 * Deliberately does not surface the richer technical-data/equipment/
 * professional/related-permit sections the Admin Portal's own
 * GeneratedPermitDocument shows: the User Portal has no data source for
 * those, so a "same as the applicant sees" preview cannot show them either.
 */
@Component({
  selector: 'app-user-portal-permit-preview',
  templateUrl: './user-portal-permit-preview.html',
  styleUrl: './user-portal-permit-preview.scss',
})
export class UserPortalPermitPreview {
  private readonly store = inject(ApplicationStore);
  private readonly assessmentStore = inject(AssessmentStore);
  private readonly userPortalBaseUrl = inject(USER_PORTAL_BASE_URL);
  private readonly applicationsApi = inject(StaffApplicationsApi);

  readonly applicationId = input.required<string>();

  protected readonly formatPHP = formatPHP;

  // ---- Real backend data --------------------------------------------------
  //
  // `GET /staff/applications/:id` already returns `business` and `permit`
  // (staff-queue.service.ts queries `generated_permits`/`businesses`
  // directly) — this component just never fetched it, so it fell back to
  // ApplicationStore's local demo records (always empty for a real
  // application) and, for the permit specifically, to a same-session-only
  // cache that went blank on refresh or in a second tab. That is why a
  // permit generated moments earlier could read "Not yet assigned" again,
  // and why a real business's own address read "Not on file".

  private readonly detail = signal<ApplicationDetail | null>(null);

  constructor() {
    effect(() => {
      const id = this.applicationId();
      untracked(() => void this.loadDetail(id));
    });
  }

  private async loadDetail(applicationId: string): Promise<void> {
    const result = await this.applicationsApi.detail(applicationId);
    this.detail.set(result.kind === 'ok' ? result.detail : null);
  }

  protected readonly generatedOn = new Date().toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  protected readonly row = computed(() => this.store.getById(this.applicationId()));
  /** Contact mobile number: real, from the applicant's account — `applicant()`'s own `mobileNumber` is a local-demo-only field that a real application never has. */
  protected readonly contactMobile = computed(() => this.detail()?.applicantMobile ?? null);
  protected readonly applicant = computed(() => {
    const row = this.row();
    return row ? this.store.getApplicant(row.applicantId) : undefined;
  });
  protected readonly business = computed(() => {
    const real = this.detail()?.business;
    if (real) return real;
    const row = this.row();
    return row ? this.store.getBusiness(row.businessId) : undefined;
  });
  protected readonly permit = computed(() => {
    const real = this.detail()?.permit;
    if (real) {
      return {
        permitNumber: real.permitNumber,
        issuedDate: real.issuedDate,
        expiryDate: null as string | null,
        approvingOfficial: undefined as string | undefined,
        approvingOffice: undefined as string | undefined,
      };
    }
    // Seed/demo fallback only — a real application's permit always comes
    // from `detail().permit` above once `POST .../permit` has run.
    return this.store.getPermit(this.applicationId());
  });
  /** Whatever the approving officer typed into "Conditions" when generating this permit — real, per-permit text, never invented. `null`/empty falls back to the permit type's generic validity boilerplate in the template. */
  protected readonly permitConditions = computed(() => this.detail()?.permit?.conditions ?? null);

  protected readonly assessment = computed<PermitAssessmentView | null>(() => {
    const order = this.detail()?.orderOfPayment;
    if (order) {
      const centavosByLine: Record<FeeLine, number> = {
        filing: order.filingCentavos,
        processing: order.processingCentavos,
        architectural: order.architecturalCentavos,
        structural: order.structuralCentavos,
        electrical: order.electricalCentavos,
        others: order.othersCentavos,
      };
      const lineItems = FEE_LINES
        .filter((line) => centavosByLine[line] > 0)
        .map((line) => ({
          code: line as string,
          name: LINE_LABELS[line],
          legalBasisTitle: '',
          authority: order.feeScheduleVersion,
          amountCentavos: centavosByLine[line] as number | null,
        }));
      const settled = (this.detail()?.payments ?? []).some((p) => p.status === 'Paid');
      return {
        lineItems,
        totalCentavos: order.totalCentavos,
        balanceCentavos: settled ? 0 : order.totalCentavos,
        opsNumber: order.number,
        status: settled ? 'Paid' : 'Assessed',
      };
    }
    // Seed/demo fallback only.
    const demo = this.assessmentStore.getActiveAssessment(this.applicationId());
    if (!demo) return null;
    return {
      lineItems: demo.lineItems.map((l) => ({
        code: l.code,
        name: l.name,
        legalBasisTitle: l.legalBasisTitle,
        authority: l.authority,
        amountCentavos: l.amountCentavos,
      })),
      totalCentavos: demo.totalCentavos,
      balanceCentavos: demo.balanceCentavos,
      opsNumber: demo.opsNumber,
      status: demo.status,
    };
  });
  protected readonly requirements = computed(() => {
    const row = this.row();
    return row ? requirementsFor(row.permitType) : null;
  });

  protected readonly reviewingOffice = computed(() => {
    const req = this.requirements();
    return req ? departmentName(req.responsibleDepartmentId) : null;
  });

  protected readonly config = computed(() => {
    const row = this.row();
    if (!row) return null;
    return {
      header: agencyHeaderFor(this.reviewingOffice() ?? 'Office of the Building Official (OBO)'),
      // A document cannot be titled for a permit the portal cannot name. The
      // subtitle says so rather than the header implying a specific permit.
      title:
        row.permitType === null
          ? { title: 'Permit', subtitle: 'Permit type not recorded' }
          : documentTitleFor(row.permitType),
    };
  });

  // Owner decision: this system produces no real permits — there is no real
  // LGU behind any of it — so every stage gets the SAME watermark rather
  // than a "DRAFT" / "FOR REVIEW" progression that reads as if the document
  // itself were becoming more real as it moves along. `cleared` still tracks
  // whether a genuine permit record exists (it gates the QR code below), but
  // the watermark text no longer varies with it.
  private readonly gate = computed(() => {
    const row = this.row();
    const watermarkText: WatermarkText = 'SAMPLE — NOT AN OFFICIAL PERMIT';
    if (!row) return { cleared: false, watermarkText };
    return { cleared: !!this.permit(), watermarkText };
  });

  protected readonly watermarkText = computed(() => this.gate().watermarkText);

  protected readonly verificationUrl = computed(() => {
    const p = this.permit();
    if (!p || !this.gate().cleared) return null;
    // NOT `window.location.origin`. Staff preview this on the admin portal,
    // which has no /verify route and whose router ends in a wildcard redirect
    // to login — so that origin sent a scanning citizen to a staff sign-in page.
    // Unconfigured means no QR at all rather than one pointing at a guess.
    const base = this.userPortalBaseUrl;
    if (base === '') return null;
    return `${base}/verify/${p.permitNumber}`;
  });

  /**
   * Why there is no QR, in the reader's terms.
   *
   * The two reasons are different and were both reported as "not yet issued",
   * which is false when the permit IS issued and the portal simply has not been
   * told where the User Portal lives.
   */
  protected readonly qrUnavailableReason = computed(() => {
    const p = this.permit();
    if (!p || !this.gate().cleared) {
      return 'QR verification not yet available — this permit has not been issued.';
    }
    return 'QR verification unavailable — this portal has not been told the User Portal address.';
  });

  protected readonly qr = computed<{ count: number; cells: QrCell[] } | null>(() => {
    const url = this.verificationUrl();
    if (!url) return null;
    const qr = qrcodegen(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const cells: QrCell[] = [];
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) cells.push({ x: col, y: row });
      }
    }
    return { count, cells };
  });
}
