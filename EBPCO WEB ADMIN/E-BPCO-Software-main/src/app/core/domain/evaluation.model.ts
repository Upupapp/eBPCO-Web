import { EvaluationResult, EvaluationStage } from './status.model';

// One evaluation record per application per stage — replaces the old
// single shared EVAL_CARDS/EVAL_DETAILS constants every application used
// to display identically.
export interface EvaluationRecord {
  id: string;
  applicationId: string;
  stage: EvaluationStage;
  result: EvaluationResult;
  evaluator: string;
  /** Required (enforced by the store) whenever result is 'Revision Required' or 'Rejected'. */
  remarks: string | null;
  evaluatedAtValue: Date | null;
  evaluatedAt: string | null;
}
