import { Component, computed, inject, input } from '@angular/core';
import qrcodegen from 'qrcode-generator';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { formatPHP } from './doc-format';
import { agencyHeaderFor, documentTitleFor } from './user-portal-document-helpers';

type WatermarkText = 'DRAFT' | 'FOR REVIEW' | 'NOT VALID AS AN OFFICIAL PERMIT' | null;

interface QrCell {
  x: number;
  y: number;
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

  readonly applicationId = input.required<string>();

  protected readonly formatPHP = formatPHP;

  protected readonly generatedOn = new Date().toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  protected readonly row = computed(() => this.store.getById(this.applicationId()));
  protected readonly applicant = computed(() => {
    const row = this.row();
    return row ? this.store.getApplicant(row.applicantId) : undefined;
  });
  protected readonly business = computed(() => {
    const row = this.row();
    return row ? this.store.getBusiness(row.businessId) : undefined;
  });
  protected readonly permit = computed(() => this.store.getPermit(this.applicationId()));
  protected readonly assessment = computed(() =>
    this.assessmentStore.getActiveAssessment(this.applicationId()),
  );
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

  private readonly gate = computed(() => {
    const row = this.row();
    if (!row) return { cleared: false, watermarkText: 'DRAFT' as WatermarkText };

    // A real, store-issued permit record is the authoritative "this is
    // genuinely issued" signal, matching the User Portal's own gate logic.
    if (this.permit()) return { cleared: true, watermarkText: null as WatermarkText };

    if (!this.store.canApprove(row.id)) {
      return { cleared: false, watermarkText: 'DRAFT' as WatermarkText };
    }
    const paymentFinal = this.assessmentStore.canProcessPermit(row.id);
    if (!paymentFinal) return { cleared: false, watermarkText: 'FOR REVIEW' as WatermarkText };

    return { cleared: false, watermarkText: 'NOT VALID AS AN OFFICIAL PERMIT' as WatermarkText };
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
