import { describe, it, expect } from "vitest";
import { Survey } from "./survey";
import { buildQuestion, Question, QuestionState } from "./question";
import { Condition } from "./condition";

const evalWithSurvey = (expression: string, surveyArg?: Survey): boolean => {
  const survey = surveyArg || new Survey();
  return new Condition(survey).evaluate(expression).enabled;
};

const surveyWithQuestionTags = (...tags: string[]) => {
  const survey = new Survey();
  for (const tag of tags) {
    survey.question(buildQuestion(tag));
  }
  return survey;
};
describe("Conditional Expression", () => {
  describe("boolean expressions with or,and", () => {
    it("and with answer", () => {
      const survey = surveyWithQuestionTags("q1", "q2");
      survey.recordAnswer("q1", "apple");
      survey.recordAnswer("q2", "pie");
      expect(
        evalWithSurvey(
          "(and (= (answer q1) 'apple') (= (answer q2) 'pie'))",
          survey
        )
      ).toBe(true);
      expect(
        evalWithSurvey(
          "(and (= (answer q1) 'apple') (= (answer q2) 'pies'))",
          survey
        )
      ).toBe(false);
    });

    it("and with literals", () => {
      expect(evalWithSurvey("(and (= 'apple' 'apple') (= 'pie' 'pie'))")).toBe(
        true
      );
      expect(evalWithSurvey("(and (= 'apple' 'apple') (= 'pie' 'pies'))")).toBe(
        false
      );
    });

    it("or - with answer", () => {
      const survey = surveyWithQuestionTags("q1", "q2");
      survey.recordAnswer("q1", "apple");
      survey.recordAnswer("q2", "pie");
      expect(
        evalWithSurvey(
          "(or (= (answer q1) 'apple') (= (answer q2) 'bust'))",
          survey
        )
      ).toBe(true);
      expect(
        evalWithSurvey(
          "(or (= (answer q1) 10) (= (answer q1) 'apple'))",
          survey
        )
      ).toBe(true);
    });
    it("or - with answer fails", () => {
      const survey = surveyWithQuestionTags("q1", "q2");
      survey.recordAnswer("q1", "apple");
      survey.recordAnswer("q2", "pie");
      expect(
        evalWithSurvey(
          "(or (= (answer q1) 'rust') (= (answer q2) 'nails'))",
          survey
        )
      ).toBe(false);
    });
  });

  describe("equals", () => {
    describe("string types", () => {
      it("equals - false with literals", () => {
        expect(evalWithSurvey("(= 'hi' 'ho')")).toBe(false);
      });
      it("equals - true with literals", () => {
        expect(evalWithSurvey("(= 'hi' 'hi')")).toBe(true);
      });

      it("not equals - with literals", () => {
        expect(evalWithSurvey("(not (= 'hi' 'hi'))")).toBe(false);
      });
      it("equals answer on right", () => {
        const survey = surveyWithQuestionTags("q1");
        survey.recordAnswer("q1", "hello");
        expect(evalWithSurvey("(= 'hello' (answer q1))", survey)).toBe(true);
        expect(evalWithSurvey("(= 'hellow' (answer q1))", survey)).toBe(false);
      });
      it("equals answer on left", () => {
        const survey = surveyWithQuestionTags("q1");
        survey.recordAnswer("q1", "hello");
        expect(evalWithSurvey("(= (answer q1) 'hello')", survey)).toBe(true);
        expect(evalWithSurvey("(= (answer q1) 'hellow')", survey)).toBe(false);
      });

      it("equals answer on both side", () => {
        const survey = surveyWithQuestionTags("q1", "q2", "q3");
        survey.recordAnswer("q1", "hellow");
        survey.recordAnswer("q2", "hellow");
        survey.recordAnswer("q3", "hello");
        expect(evalWithSurvey("(= (answer q1) (answer q2))", survey)).toBe(
          true
        );
        expect(evalWithSurvey("(= (answer q1) (answer q3))", survey)).toBe(
          false
        );
      });
    });

    describe("numeric types", () => {
      it("equals - false with literals", () => {
        expect(evalWithSurvey("(= 12 22)")).toBe(false);
      });
      it("equals - true with literals", () => {
        expect(evalWithSurvey("(= 12 12)")).toBe(true);
      });
    });

    describe("with mixed types", () => {
      it("equals - false with literals", () => {
        expect(evalWithSurvey("(= 12 '12')")).toBe(false);
      });
      it("equals - true with literals", () => {
        expect(evalWithSurvey("(= '12' 12)")).toBe(false);
      });
    });
    describe("question or answer not found", () => {
      it("answer is not found", () => {
        const survey = surveyWithQuestionTags("q1");
        expect(evalWithSurvey("(= (answer q1) '10')", survey)).toBe(false);
      });
      it("question is not found", () => {
        expect(() => evalWithSurvey("(= (answer q1) '10')")).toThrow(
          Error("Failed to find questions with tag: q1")
        );
      });
    });
  });

  describe("greater than", () => {
    it("is greater with literals", () => {
      expect(evalWithSurvey("(> 20 10)")).toBe(true);
    });
    it("is not greater with literals", () => {
      expect(evalWithSurvey("(> 20 30)")).toBe(false);
    });
    it("is greater with answer", () => {
      const survey = surveyWithQuestionTags("q1");
      survey.recordAnswer("q1", 100);
      expect(evalWithSurvey("(> (answer q1) 99)", survey)).toBe(true);
    });
    it("is not greater with answer", () => {
      const survey = surveyWithQuestionTags("q1");
      survey.recordAnswer("q1", 100);
      expect(evalWithSurvey("(> (answer q1) 101)", survey)).toBe(false);
    });
  });

  describe("less than", () => {
    it("is less with literals", () => {
      expect(evalWithSurvey("(< 5 10)")).toBe(true);
    });
    it("is not less with literals", () => {
      expect(evalWithSurvey("(< 20 10)")).toBe(false);
    });
    it("is less with answer", () => {
      const survey = surveyWithQuestionTags("q1");
      survey.recordAnswer("q1", 99);
      expect(evalWithSurvey("(< (answer q1) 100)", survey)).toBe(true);
    });
    it("is not less with answer", () => {
      const survey = surveyWithQuestionTags("q1");
      survey.recordAnswer("q1", 100);
      expect(evalWithSurvey("(< (answer q1) 99)", survey)).toBe(false);
    });
  });

  describe("includes", () => {
    describe("with string types", () => {
      it("includes with lookup, and passes", () => {
        const survey = surveyWithQuestionTags("q");
        survey.recordAnswer("q", ["apple", "pear", "plum"]);
        expect(
          evalWithSurvey("(includes (arrayAnswer q) 'apple')", survey)
        ).toBe(true);
      });

      it("includes with lookup, and fails", () => {
        const survey = surveyWithQuestionTags("q");
        survey.recordAnswer("q", ["apple", "pear", "plum"]);

        expect(
          new Condition(survey).evaluate("(includes (arrayAnswer q) 'apples')")
            .enabled
        ).toBe(false);
      });
      it("includes with literal array", () => {
        expect(evalWithSurvey("(includes ['pear', 'apple'] 'apple')")).toBe(
          true
        );
      });
    });

    describe("with numeric types", () => {
      it("includes with arrayAnswer", () => {
        const survey = surveyWithQuestionTags("q1");
        survey.recordAnswer("q1", [12, 21]);

        expect(evalWithSurvey("(includes (arrayAnswer q1) 12)", survey)).toBe(
          true
        );
        expect(evalWithSurvey("(includes (arrayAnswer q1) 13)", survey)).toBe(
          false
        );
      });
      it("includes with literal array", () => {
        expect(evalWithSurvey("(includes [12, 21] 12)")).toBe(true);
        expect(evalWithSurvey("(includes [12, 21] 13)")).toBe(false);
      });
    });
  });
  describe("with mixed types", () => {
    it("does not include incorrect type", () => {
      expect(evalWithSurvey("(includes [12, 21] '12')")).toBe(false);
      expect(evalWithSurvey("(includes ['12', '21'] 12)")).toBe(false);
    });
  });
});
