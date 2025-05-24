import { AnswerType, Question, QuestionState } from "./question";

export class Survey {
  questions: QuestionState[] = [];
  question(q: Question): Survey {
    this.questions.push(new QuestionState(q.tag, q.condition));
    return this;
  }
  traverse(): QuestionState[] {
    throw new Error("not Implemented");
  }
  recordAnswer(questionTag: string, answer?: AnswerType): void {
    const fondQuestion = this.questions.find(
      (question: QuestionState) => question.tag === questionTag
    );
    if (fondQuestion) {
      fondQuestion.answer = answer;
    }
  }
  lookupAnswer(questionTag: string): AnswerType | undefined {
    const lookup = this.questions.find(
      (question: QuestionState) => question.tag === questionTag
    );
    return lookup?.answer;
  }
}
