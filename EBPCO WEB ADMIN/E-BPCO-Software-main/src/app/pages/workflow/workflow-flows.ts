import { FlowEdge, FlowNode } from '../../shared/flow-chart/flow-chart';
import { FlowBuilder, ROW_GAP } from './flow-builder';
import { buildLifecycleFlow } from './lifecycle-flow';

export interface FlowDef {
  key: string;
  label: string;
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  width: number;
  height: number;
}

const CX = 455;
const LEFT = CX - 180;
const RIGHT = CX + 180;

interface SectionResult {
  first: FlowNode;
  last: FlowNode;
}

function buildApplicantIntake(b: FlowBuilder, includeStart: boolean): SectionResult {
  const start = includeStart ? b.start() : undefined;
  const login = b.process('Login / Register', 'Mobile');
  const dashboard = b.process('View Dashboard', 'Mobile');
  const clickStart = b.process("Click 'Start New Application'", 'Mobile');
  const initApp = b.process('Initialize New Application', 'System');
  const selectForm = b.process(
    'Select Form Type (Building Permit / Certificate of Occupancy)',
    'Mobile',
    { h: 140 },
  );
  const loadTemplate = b.process('Load Selected Form Template', 'System');
  const fillForm = b.process('Fill Out Dynamic Form', 'Mobile');

  if (start) b.linkDown(start, login);
  b.linkDown(login, dashboard);
  b.linkDown(dashboard, clickStart);
  b.linkDown(clickStart, initApp);
  b.linkDown(initApp, selectForm);
  b.linkDown(selectForm, loadTemplate);
  b.linkDown(loadTemplate, fillForm);

  b.linkAround(clickStart, fillForm, 'red', 'Return', {
    fromSide: 'left',
    toSide: 'left',
    viaX: clickStart.x - 90,
  });

  return { first: start ?? login, last: fillForm };
}

function buildFormValidation(b: FlowBuilder, entry: FlowNode): SectionResult {
  const autoSave = b.process('Auto-Save Draft', 'System');
  const validate = b.process('Validate Required Fields', 'System');
  const isComplete = b.decision('Is Form Complete?');

  b.linkDown(entry, autoSave, 'gray');
  b.linkDown(autoSave, validate);
  b.linkDown(validate, isComplete);

  const y = b.cursor;
  const reviewMissing = b.process('Review Missing Fields', 'Mobile', { cx: LEFT, y });
  const downloadForm = b.process("Click 'Download Form (PDF)'", 'Mobile', { cx: RIGHT, y });
  b.linkDown(isComplete, reviewMissing, 'red', 'NO');
  b.linkDown(isComplete, downloadForm, 'green', 'YES');
  b.linkAround(reviewMissing, downloadForm, 'green', 'YES', {
    fromSide: 'right',
    toSide: 'left',
    viaX: (reviewMissing.x + reviewMissing.w + downloadForm.x) / 2,
  });
  b.setCursor(y + 110 + ROW_GAP);

  const genPdf = b.process('Generate PDF', 'System');
  const engineerSigns = b.process('Engineer Reviews and Signs Form', 'External', { h: 130 });
  const uploadSigned = b.process('Upload Signed Form', 'Mobile');

  b.linkDown(downloadForm, genPdf);
  b.linkDown(genPdf, engineerSigns);
  b.linkDown(engineerSigns, uploadSigned);

  return { first: autoSave, last: uploadSigned };
}

function buildSubmission(b: FlowBuilder, entry: FlowNode): SectionResult {
  const validateFile = b.process('Validate Uploaded File', 'System');
  const isSigned = b.decision('Is Signed Form Uploaded?');

  b.linkDown(entry, validateFile);
  b.linkDown(validateFile, isSigned);

  const y = b.cursor;
  const showError = b.process('Show Upload Error', 'Mobile', { cx: RIGHT, y });
  const submitApp = b.process('Submit Application', 'Mobile', { cx: LEFT, y });
  b.linkDown(isSigned, showError, 'red', 'NO');
  b.linkDown(isSigned, submitApp, 'green', 'YES');
  b.linkAround(showError, validateFile, 'red', 'Return', {
    fromSide: 'right',
    toSide: 'right',
    viaX: showError.x + showError.w + 90,
  });
  b.setCursor(y + 110 + ROW_GAP);

  const genTracking = b.process('Generate Tracking Number', 'System');
  b.linkDown(submitApp, genTracking);

  return { first: validateFile, last: genTracking };
}

function buildZoningSection(b: FlowBuilder, includeStart: boolean, entry?: FlowNode): SectionResult {
  const start = includeStart ? b.start() : undefined;
  const forwardZoning = b.process('Forward to Zoning', 'Web');
  const zoningEval = b.process('Zoning Evaluation', 'Web');
  const signedUploaded = b.decision('Is Signed Form Uploaded?');

  if (start) b.linkDown(start, forwardZoning);
  else if (entry) b.linkDown(entry, forwardZoning);
  b.linkDown(forwardZoning, zoningEval);
  b.linkDown(zoningEval, signedUploaded);

  const y1 = b.cursor;
  const submitApp = b.process('Submit Application', 'Mobile', { cx: LEFT, y: y1 });
  const showError = b.process('Show Upload Error', 'Mobile', { cx: RIGHT, y: y1 });
  b.linkDown(signedUploaded, submitApp, 'green', 'YES');
  b.linkDown(signedUploaded, showError, 'red', 'NO');
  b.setCursor(y1 + 110 + ROW_GAP);

  const uploadSigned = b.process('Upload Signed Form', 'Mobile', { cx: RIGHT });
  b.linkDown(showError, uploadSigned, 'red', 'Return');

  const zoningApproved = b.decision('Zoning Approved?', { cx: LEFT });
  b.linkDown(submitApp, zoningApproved);

  const y2 = b.cursor;
  const returnApplicant = b.process('Return to Applicant', 'Web', { cx: LEFT - 130, y: y2 });
  const forwardFire = b.process('Forward to Fire', 'Web', { cx: LEFT + 130, y: y2 });
  b.linkDown(zoningApproved, returnApplicant, 'red', 'NO');
  b.linkDown(zoningApproved, forwardFire, 'green', 'YES');
  b.setCursor(y2 + 110 + ROW_GAP);

  return { first: start ?? forwardZoning, last: forwardFire };
}

function buildFireSafetySection(b: FlowBuilder, includeStart: boolean, entry?: FlowNode): SectionResult {
  const start = includeStart ? b.start() : undefined;
  let forwardFire: FlowNode;
  if (start) {
    forwardFire = b.process('Forward to Fire', 'Web');
    b.linkDown(start, forwardFire);
  } else if (entry) {
    forwardFire = entry;
  } else {
    forwardFire = b.process('Forward to Fire', 'Web');
  }
  const fireEval = b.process('Fire Safety Evaluation', 'Web');
  const fireApproved = b.decision('Fire Safety Approved?');

  b.linkDown(forwardFire, fireEval);
  b.linkDown(fireEval, fireApproved);

  const y = b.cursor;
  const returnApp = b.process('Return Application', 'Web', { cx: LEFT, y });
  const forwardObo = b.process('Forward to OBO', 'Web', { cx: RIGHT, y });
  b.linkDown(fireApproved, returnApp, 'red', 'NO');
  b.linkDown(fireApproved, forwardObo, 'green', 'YES');
  b.setCursor(y + 110 + ROW_GAP);

  return { first: start ?? forwardFire, last: forwardObo };
}

function buildOboSection(b: FlowBuilder, includeStart: boolean, entry?: FlowNode): SectionResult {
  const start = includeStart ? b.start() : undefined;
  let forwardObo: FlowNode;
  if (start) {
    forwardObo = b.process('Forward to OBO', 'Web', { h: 120 });
    b.linkDown(start, forwardObo);
  } else if (entry) {
    forwardObo = entry;
  } else {
    forwardObo = b.process('Forward to OBO', 'Web', { h: 120 });
  }
  const multiDiscipline = b.process('Multi-Discipline Review', 'Web', { h: 120 });
  const trackApprovals = b.process('Track Approvals', 'System', { h: 120 });
  const allDisciplines = b.decision('All Disciplines Reviewed?', { h: 150 });

  b.linkDown(forwardObo, multiDiscipline);
  b.linkDown(multiDiscipline, trackApprovals);
  b.linkDown(trackApprovals, allDisciplines);

  b.linkAround(allDisciplines, trackApprovals, 'red', 'NO', {
    fromSide: 'right',
    toSide: 'right',
    viaX: allDisciplines.x + allDisciplines.w + 110,
  });

  const boApproval = b.process('Building Official Approval', 'Web');
  b.linkDown(allDisciplines, boApproval, 'green', 'YES');

  return { first: start ?? forwardObo, last: boApproval };
}

function buildBuildingOfficialSection(
  b: FlowBuilder,
  includeStart: boolean,
  entry?: FlowNode,
): SectionResult {
  const start = includeStart ? b.start() : undefined;
  const allDisciplines = b.decision('All Disciplines Reviewed?');

  if (start) b.linkDown(start, allDisciplines);
  else if (entry) b.linkDown(entry, allDisciplines);

  const y = b.cursor;
  const boApproval = b.process('Building Official Approval', 'Web', { cx: LEFT, y });
  const trackApprovals = b.process('Track Approvals', 'System', { cx: RIGHT, y });
  b.linkDown(allDisciplines, boApproval, 'green', 'YES');
  b.linkDown(allDisciplines, trackApprovals, 'red', 'NO');
  b.setCursor(y + 110 + ROW_GAP);

  const genOrder = b.process('Generate Order of Payment', 'System');
  b.linkDown(boApproval, genOrder);

  return { first: start ?? allDisciplines, last: genOrder };
}

function buildPaymentSection(
  b: FlowBuilder,
  includeStart: boolean,
  entry?: FlowNode,
  entryIsSelectMethod = false,
): SectionResult {
  const start = includeStart ? b.start() : undefined;

  let selectMethod: FlowNode;
  if (entryIsSelectMethod && entry) {
    selectMethod = entry;
  } else {
    const genOrder = b.process('Generate Order of Payment', 'System');
    if (start) b.linkDown(start, genOrder);
    else if (entry) b.linkDown(entry, genOrder);
    selectMethod = b.process('Select Payment Method', 'Mobile');
    b.linkDown(genOrder, selectMethod);
  }

  const gateway = b.process('Payment Gateway Processing', 'External', { h: 130 });
  const verify = b.process('Verify Payment', 'System');
  const paySuccess = b.decision('Payment Successful?');

  b.linkDown(selectMethod, gateway);
  b.linkDown(gateway, verify);
  b.linkDown(verify, paySuccess);

  const y = b.cursor;
  const retryPay = b.process('Retry Payment', 'Mobile', { cx: LEFT, y });
  const genPdf = b.process('Generate Permit PDF', 'System', { cx: RIGHT, y });
  b.linkDown(paySuccess, retryPay, 'red', 'NO');
  b.linkDown(paySuccess, genPdf, 'green', 'YES');
  b.setCursor(y + 110 + ROW_GAP);

  b.linkAround(retryPay, selectMethod, 'gray', 'Retry', {
    fromSide: 'right',
    toSide: 'right',
    viaX: retryPay.x + retryPay.w + 340,
  });

  return { first: start ?? selectMethod, last: genPdf };
}

function buildReleasingSection(b: FlowBuilder, includeStart: boolean, entry?: FlowNode): SectionResult {
  const start = includeStart ? b.start() : undefined;
  let genPdf: FlowNode;
  if (start) {
    genPdf = b.process('Generate Permit PDF', 'System');
    b.linkDown(start, genPdf);
  } else if (entry) {
    genPdf = entry;
  } else {
    genPdf = b.process('Generate Permit PDF', 'System');
  }
  const markReleased = b.process('Mark as Released', 'Web');
  const receiveNotif = b.process('Receive Notification', 'Mobile');
  const claimPermit = b.process('Claim Permit', 'External');
  const end = b.end('END: Application Completed');

  b.linkDown(genPdf, markReleased);
  b.linkDown(markReleased, receiveNotif);
  b.linkDown(receiveNotif, claimPermit);
  b.linkDown(claimPermit, end);

  return { first: start ?? genPdf, last: end };
}

function buildDocumentReview(b: FlowBuilder, entry: FlowNode, fillFormNode: FlowNode): SectionResult {
  const docsComplete = b.decision('Documents Complete?');
  b.linkDown(entry, docsComplete);

  const y = b.cursor;
  const returnRevision = b.process('Return for Revision', 'Web', { cx: LEFT, y });
  const selectMethod = b.process('Select Payment Method', 'Mobile', { cx: RIGHT, y });
  b.linkDown(docsComplete, returnRevision, 'red', 'NO');
  b.linkDown(docsComplete, selectMethod, 'green', 'YES');
  b.setCursor(y + 110 + ROW_GAP);

  const updateStatus = b.process('Update Status', 'System', { cx: LEFT });
  b.linkDown(returnRevision, updateStatus);

  const y2 = b.cursor;
  const revisionComments = b.process('Display Revision Comments', 'Mobile', {
    cx: LEFT - 210,
    y: y2,
    h: 130,
  });
  b.linkAround(updateStatus, revisionComments, 'gray', 'Return', {
    fromSide: 'left',
    toSide: 'right',
    viaY: y2 + 65,
  });
  b.linkAround(revisionComments, fillFormNode, 'pink', 'Resubmit', {
    fromSide: 'left',
    toSide: 'left',
    viaX: revisionComments.x - 100,
  });

  return { first: docsComplete, last: selectMethod };
}

function makeFlow(key: string, label: string, title: string, b: FlowBuilder, pad = 60): FlowDef {
  const minX = Math.min(...b.nodes.map((n) => n.x)) - pad;
  const dx = minX < 0 ? -minX : 0;
  const nodes = dx > 0 ? shiftNodes(b.nodes, dx) : b.nodes;
  const edges = dx > 0 ? shiftEdges(b.edges, dx) : b.edges;
  const maxX = Math.max(...nodes.map((n) => n.x + n.w)) + pad;
  const maxY = Math.max(...nodes.map((n) => n.y + n.h)) + pad;

  return { key, label, title, nodes, edges, width: maxX, height: maxY };
}

function shiftNodes(nodes: FlowNode[], dx: number): FlowNode[] {
  return nodes.map((n) => ({ ...n, x: n.x + dx }));
}

function shiftEdges(edges: FlowEdge[], dx: number): FlowEdge[] {
  return edges.map((e) => ({
    ...e,
    path: e.path.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_m, x, y) => `${parseFloat(x) + dx},${y}`),
    labelX: e.labelX !== undefined ? e.labelX + dx : undefined,
  }));
}

export function buildAllFlows(): Record<string, FlowDef> {
  const flows: Record<string, FlowDef> = {};

  {
    const b = new FlowBuilder(CX);
    const intake = buildApplicantIntake(b, true);
    const validation = buildFormValidation(b, intake.last);
    const submission = buildSubmission(b, validation.last);
    const review = buildDocumentReview(b, submission.last, intake.last);
    const payment = buildPaymentSection(b, false, review.last, true);
    buildReleasingSection(b, false, payment.last);
    flows['applicant'] = makeFlow('applicant', 'Applicant', 'Applicant Flowchart', b);
  }

  {
    const b = new FlowBuilder(CX);
    buildZoningSection(b, true);
    flows['zoning'] = makeFlow('zoning', 'Zoning', 'Zoning Flowchart', b);
  }

  {
    const b = new FlowBuilder(CX);
    buildFireSafetySection(b, true);
    flows['fire-safety'] = makeFlow('fire-safety', 'Fire Safety', 'Fire Safety Flowchart', b);
  }

  {
    const b = new FlowBuilder(CX);
    buildOboSection(b, true);
    flows['obo-review'] = makeFlow('obo-review', 'OBO Review', 'OBO Review Flowchart', b);
  }

  {
    const b = new FlowBuilder(CX);
    buildBuildingOfficialSection(b, true);
    flows['building-official'] = makeFlow(
      'building-official',
      'Building Official',
      'Building Official Flowchart',
      b,
    );
  }

  {
    const b = new FlowBuilder(CX);
    buildPaymentSection(b, true);
    flows['payment'] = makeFlow('payment', 'Payment', 'Payment Flowchart', b);
  }

  {
    const b = new FlowBuilder(CX);
    buildReleasingSection(b, true);
    flows['releasing'] = makeFlow('releasing', 'Releasing', 'Releasing Flowchart', b);
  }

  {
    const b = new FlowBuilder(CX);
    const intake = buildApplicantIntake(b, true);
    const validation = buildFormValidation(b, intake.last);
    const submission = buildSubmission(b, validation.last);
    const zoning = buildZoningSection(b, false, submission.last);
    const fire = buildFireSafetySection(b, false, zoning.last);
    const obo = buildOboSection(b, false, fire.last);
    const payment = buildPaymentSection(b, false, obo.last);
    buildReleasingSection(b, false, payment.last);
    flows['overall'] = makeFlow('overall', 'Overall', 'OVERALL Flowchart', b, 80);
  }

  // ── Lifecycle: the only flow on this page that is DERIVED ──────────────
  //
  // The eight above are departmental procedures, hand-drawn: who does what, in
  // which office, in what order. None of them reads `VALID_TRANSITIONS`, so a
  // transition could be added or re-pointed and every picture would keep
  // showing the old process with nothing to notice (P-F2).
  //
  // This one is generated from the table the lifecycle engine enforces, so it
  // cannot drift. Deliberately last: an officer looking for their own office's
  // steps wants one of the flows above, and this answers a different question —
  // what the system will actually permit next.
  {
    const built = buildLifecycleFlow(CX);
    const b = new FlowBuilder(CX);
    b.nodes.push(...built.nodes);
    b.edges.push(...built.edges);
    flows['lifecycle'] = makeFlow(
      'lifecycle',
      'Lifecycle',
      'Application Lifecycle (generated from the transition rules)',
      b,
      80,
    );
  }

  return flows;
}
