import { positionFor } from './position';

describe('positionFor', () => {
  it('names an evaluator by the stage they decide', () => {
    expect(positionFor(['evaluator'], ['Fire Safety'])).toBe('Fire Safety Evaluator');
    expect(positionFor(['evaluator'], ['Zoning'])).toBe('Zoning Officer');
    expect(positionFor(['evaluator'], ['Initial'])).toBe('Initial Evaluator');
  });

  it('lists the stages of an evaluator who holds several', () => {
    expect(positionFor(['evaluator'], ['Zoning', 'OBO'])).toBe('Evaluator (Zoning, OBO)');
  });

  it('calls an evaluator with no stage yet just "Evaluator"', () => {
    expect(positionFor(['evaluator'], [])).toBe('Evaluator');
    expect(positionFor(['evaluator'], null)).toBe('Evaluator');
  });

  it('names an account with two roles by the broader one', () => {
    // The Building Official also signs the Final Approval stage as an evaluator.
    expect(positionFor(['evaluator', 'building-official'], ['Final Approval'])).toBe('Building Official');
  });

  it('keeps apart the roles the portal used to merge', () => {
    expect(positionFor(['receiving-officer'], null)).toBe('Receiving Officer');
    expect(positionFor(['records-officer'], null)).toBe('Records Officer');
    expect(positionFor(['assessor'], null)).toBe('Assessor');
    expect(positionFor(['cashier'], null)).toBe('Cashier');
  });

  it('says "Staff" for roles it does not know rather than guessing', () => {
    expect(positionFor([], null)).toBe('Staff');
  });
});
