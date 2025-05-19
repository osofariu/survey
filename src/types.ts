class SurveyBuilder {
  questions: QuestionState[] = [];
  question(q: Question): SurveyBuilder {
    throw new Error("not Implemented");
  }
  traverse(): QuestionState[] {
    throw new Error("not Implemented");
  }
  recordAnswer(questionTag: string, answer: string): QuestionState {
    throw new Error("not Implemented");
  }
}

// if a question is active it can be presented
// if not it cannot be presented
class QuestionState implements Question {
  tag: string;
  required: boolean;
  conditionExp: string;

  constructor(tag: string, required: boolean, conditionExp: string) {
    this.tag = tag;
    this.required = required;
    this.conditionExp = conditionExp;
  }

  public answered() {
    this.answer !== undefined;
  }

  private answer?: string; // store current answer state
  private active?: boolean; // store current active state
}

// this is a data container; it is used to define the survey
// questions and their dependence on other questions
interface Question {
  tag: string;
  required: boolean;
  conditionExp: string;
}

/*



*/
