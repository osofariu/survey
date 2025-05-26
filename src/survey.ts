import { Condition } from "./condition";
import { AnswerType, Question, QuestionState } from "./question";

export class Survey {
  questions: QuestionState[] = [];
  question(q: Question): Survey {
    this.questions.push(new QuestionState(q.tag, q.condition));
    return this;
  }
  traverse(predicate: (question: QuestionState) => boolean): QuestionState[] {
    return this.questions.filter(predicate);
  }

  recordAnswer(questionTag: string, answer?: AnswerType): void {
    const fondQuestionIndex = this.questions.findIndex(
      (question: QuestionState) => question.tag === questionTag
    );
    if (fondQuestionIndex >= 0) {
      this.questions[fondQuestionIndex].answer = answer;
      this.evaluateConditions(fondQuestionIndex);
    }
    // TODO .. else throw error
  }

  private evaluateConditions(position: number) {
    this.questions
      .slice(position + 1)
      .forEach((subsequentQuestion: QuestionState) => {
        if (subsequentQuestion.condition) {
          subsequentQuestion.enabled = new Condition(this).evaluate(
            subsequentQuestion.condition
          );
        }
      });
  }

  lookupAnswer(questionTag: string): AnswerType | undefined {
    const lookup = this.questions.find(
      (question: QuestionState) => question.tag === questionTag
    );
    if (lookup === undefined) {
      throw new Error(`Failed to find questions with tag: ${questionTag}`);
    }
    return lookup.answer;
  }
}
