export class QuestionState implements Question {
  tag: string;
  // required: boolean;
  conditionExp?: string;

  constructor(tag: string, conditionExp?: string) {
    this.tag = tag;
    this.conditionExp = conditionExp;
  }

  public answered() {
    this.answer !== undefined;
  }

  public answer?: string; // store current answer state
  private active?: boolean; // store current active state
}

// this is a data container; it is used to define the survey
// questions and their dependence on other questions
export interface Question {
  tag: string;
  conditionExp?: string;
}
