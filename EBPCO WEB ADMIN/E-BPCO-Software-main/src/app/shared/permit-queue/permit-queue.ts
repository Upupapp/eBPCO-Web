import { StackedBarSegment } from '../stacked-bar-chart/stacked-bar-chart';

// Mirrors the 16 permit-application wizards offered in E-BPCO Mobile
// (ebpco-mobile/lib/features/applications/presentation/), using each
// wizard's exact AppBar title as the canonical permit name.
export const PERMIT_LABELS = [
  'Building Permit',
  'Architectural Permit',
  'Civil / Structural Permit',
  'Demolition Permit',
  'Addition / Extension Permit',
  'Renovation Permit',
  'Electrical Permit',
  'Electronics Permit',
  'Mechanical Permit',
  'Plumbing Permit',
  'Sanitary / Plumbing Permit',
  'Interior Design Permit',
  'Fencing Permit',
  'Sign Permit',
  'Excavation & Ground Preparation Permit',
  'Certificate of Occupancy',
];

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

// One stacked bar per permit type — bar length is that permit's total queue
// volume, and the fill is its own Pending/Approved/Rejected split — used by
// both the admin and tenant dashboards.
export function buildPermitQueueRows(): PermitQueueRow[] {
  return PERMIT_LABELS.map((label, i) => {
    // Deterministic sample counts per permit type/status (demo data, same
    // spirit as the rest of this dashboard's mock rows) — each segment's
    // size is driven by this value, not by decorative randomness.
    const pending = 6 + ((i * 7) % 18);
    const approved = 14 + ((i * 11) % 34);
    const rejected = 2 + ((i * 5) % 9);
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
        .map((s) => `${s.label}: ${s.value} (${total > 0 ? Math.round((s.value / total) * 100) : 0}%)`)
        .join(' · '),
    };
  });
}
