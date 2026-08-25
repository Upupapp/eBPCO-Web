import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Evaluations } from './evaluations';
import { ApplicationStore } from '../../core/domain/application-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';

// `protected` members are accessed via `as any` throughout — the standard
// pattern in this codebase for exercising component-internal state from a
// spec without loosening the component's own public API (see
// businesses.spec.ts).
describe('Evaluations — record view is genuinely store-sourced (not the old Applications-page mock)', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Evaluations>>;
  let component: any;
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Evaluations],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(Evaluations);
    component = fixture.componentInstance;
    store = TestBed.inject(ApplicationStore);
    fixture.detectChanges();
  });

  function findUnderEvaluationApp() {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Under Evaluation');
    if (!app) throw new Error('Seed data is expected to include an Under Evaluation application');
    return app;
  }

  it('the `?applicationId=` query param opens the record view for the real application, without going through a stage card first', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    expect(component.view()).toBe('record');
    expect(component.selectedRow()?.id).toBe(app.id);
    expect(component.selectedCard()).toBeTruthy();
  });

  it('recordDocumentRows() matches the real requirements-catalog checklist for the application\'s permit type', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const expectedDocs = requirementsFor(app.permitType).documents;
    const rows = component.recordDocumentRows();
    expect(rows.length).toBe(expectedDocs.length);
    expect(rows.map((r: { requirementId: string }) => r.requirementId).sort()).toEqual(
      expectedDocs.map((d) => d.id).sort(),
    );
  });

  it('recordEvaluationSteps() has exactly 5 real stages, with the application\'s real current stage marked current', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const steps = component.recordEvaluationSteps();
    expect(steps.length).toBe(5);
    const current = steps.find((s: { isCurrent: boolean }) => s.isCurrent);
    expect(current?.stage).toBe(app.evaluationStage);
  });

  it('advanceStage() reached via the `?applicationId=` entry path really advances the application through ApplicationStore', () => {
    const app = findUnderEvaluationApp();
    const startingStage = app.evaluationStage;
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const row = component.selectedRow();
    component.advanceStage(row);
    fixture.detectChanges();

    expect(component.actionError()).toBeNull();
    const updated = store.getById(app.id)!;
    // Either the application moved to the next real evaluation stage, or
    // (if it was already at Final Approval) on to fee assessment — either
    // way it must have genuinely moved, not just flipped a local mock flag.
    expect(
      updated.evaluationStage !== startingStage || updated.lifecycleStatus !== 'Under Evaluation',
    ).toBe(true);
  });

  it('returnForRevision() reached via the record view requires remarks and really moves the application in ApplicationStore', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const row = component.selectedRow();
    component.returnForRevision(row);
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Under Evaluation');

    component.revisionRemarks.set('Missing signature on plans');
    component.returnForRevision(row);

    expect(component.actionError()).toBeNull();
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Revision Required');
  });

  it('recordAuditTrail() reflects a real audit event after a real mutation, not a hardcoded timeline', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const before = component.recordAuditTrail().length;
    component.returnForRevision(component.selectedRow());
    component.revisionRemarks.set('Missing signature on plans');
    component.returnForRevision(component.selectedRow());
    fixture.detectChanges();

    const after = component.recordAuditTrail();
    expect(after.length).toBeGreaterThan(before);
    expect(after.every((e: { applicationId: string | null }) => e.applicationId === app.id)).toBe(
      true,
    );
  });
});
