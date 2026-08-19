import { StackedBarSegment } from '../stacked-bar-chart/stacked-bar-chart';
import { ApplicationRecord } from '../../core/domain/application.model';
import { ALL_PERMIT_TYPES } from '../../core/domain/permit.model';

// Validated status palette (dataviz skill validate_palette.js — CVD
// separation, lightness band, and chroma floor all PASS for this trio).
export const QUEUE_COLORS = ['#f59e0b', '#16a34a', '#dc2626'];
// Mirrors E-BPCO Mobile's ApplicationStatus labels (application_model.dart).
const QUEUE_STATUS_LABELS = ['Under Review', 'Approved', 'Rejected'];

export interface PermitQueueRow {
  label: string;
  total: number;
  segments: StackedBarSegment[];
  tooltip: string;
}

/**
 * One stacked bar per permit type — bar length is that permit's total
 * queue volume, and the fill is its own Under Review/Approved/Rejected
 * split. Reads the centralized `ALL_PERMIT_TYPES` catalog (permit.model.ts)
 * for which bars to draw, and real counts from the shared
 * `ApplicationStore`'s application pool — the same records every other
 * page (Applications, Business Stages, Evaluations, Payments, Permit
 * Release) reads — so this chart's totals can never drift from what the
 * rest of the app shows. A permit type with zero applications still gets
 * a (empty) row rather than being silently dropped.
 */
export function buildPermitQueueRows(applications: readonly ApplicationRecord[]): PermitQueueRow[] {
  return ALL_PERMIT_TYPES.map((label) => {
    const rows = applications.filter((a) => a.permitType === label);
    const pending = rows.filter((a) => a.status === 'Under Review').length;
    const approved = rows.filter((a) => a.status === 'Approved').length;
    const rejected = rows.filter((a) => a.status === 'Rejected').length;
    const values = [pending, approved, rejected];
    const total = pending + approved + rejected;

    const segments: StackedBarSegment[] = values.map((value, statusIndex) => ({
      value,
      color: QUEUE_COLORS[statusIndex],
      label: QUEUE_STATUS_LABELS[statusIndex],
    }));

    return {
      label,
      total,
      segments,
      tooltip: segments
        .map(
          (s) => `${s.label}: ${s.value} (${total > 0 ? Math.round((s.value / total) * 100) : 0}%)`,
        )
        .join(' · '),
    };
  });
}
