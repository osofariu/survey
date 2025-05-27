import { Condition } from "./condition";
import { Answer } from "./lexer";
import { AnswerType, Question, QuestionState } from "./question";
import log from "loglevel";

log.setLevel(log.levels.WARN);
export class Survey {
  private questions: QuestionState[] = [];
  question(q: Question): Survey {
    this.questions.push(new QuestionState(q.tag, q.condition));
    return this;
  }
  traverse(predicate?: (question: QuestionState) => boolean): QuestionState[] {
    if (!predicate) return this.questions;
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
          const evaluationResult = new Condition(this).evaluate(
            subsequentQuestion.condition
          );
          const dependentQuestionsEnabled =
            evaluationResult.dependentQuestions.every((questionTag) =>
              this.isEnabledQuestion(questionTag)
            );
          subsequentQuestion.enabled =
            evaluationResult.enabled && dependentQuestionsEnabled;
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
    log.debug(`lookupAnswer for ${questionTag}: ${lookup.answer}`);
    return lookup.answer;
  }

  isEnabledQuestion(questionTag: string): boolean {
    const question = this.traverse((q) => q.tag === questionTag)[0]; // array should not be empty
    return question && question.enabled;
  }
}
