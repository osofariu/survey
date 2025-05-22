export class QuestionState implements Question {
  tag: string;
  condition?: string;

  constructor(tag: string, conditionExp?: string) {
    this.tag = tag;
    this.condition = conditionExp;
  }

  // store current answer state when it's recorded
  public answer?: string;

  // this is determined dynamically when an answer is recorded,
  // after evaluating all the conditions for the questions below
  private active?: boolean;
}

// Question describes the dependencies between questions through
// the conditional expression
export interface Question {
  tag: string;
  condition?: string;
}
