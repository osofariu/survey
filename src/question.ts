export class QuestionState implements Question {
  tag: string;
  condition?: string;
  enabled: boolean;

  constructor(tag: string, conditionExp?: string) {
    this.tag = tag;
    this.condition = conditionExp;
    this.enabled = true;
  }

  // store current answer state when it's recorded
  public answer?: AnswerType;

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

export const buildQuestion = (tag: string, condition?: string): Question => {
  if (condition) {
    return {
      tag,
      condition,
    };
  } else {
    return {
      tag,
    };
  }
};

export type AnswerType = string | number | string[] | number[];
