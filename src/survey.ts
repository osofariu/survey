import { Question, QuestionState } from "./question";

export class Survey {
  questions: QuestionState[] = [];
  question(q: Question): Survey {
    this.questions.push(new QuestionState(q.tag, q.condition));
    return this;
  }
  traverse(): QuestionState[] {
    throw new Error("not Implemented");
  }
  recordAnswer(questionTag: string, answer: string): void {
    const findQuestion = this.questions.find(
      (question: QuestionState) => question.tag === questionTag
    );
    if (findQuestion) {
      findQuestion.answer = answer;
    }
  }
  lookupAnswer(questionTag: string): string | undefined {
    const lookup = this.questions.find(
      (question: QuestionState) => question.tag === questionTag
    );
    console.log(`lookup question ${questionTag}: ${lookup}`);

    return lookup?.answer;
  }
}
