import { describe, it, expect, beforeEach } from "vitest";
import { Survey } from "./survey";
import { buildQuestion, Question } from "./question";

describe("Survey", () => {
  let survey: Survey;

  beforeEach(() => {
    survey = new Survey();
  });

  describe("record answer conditionally disables question", () => {
    it("with a simple lookup", () => {
      const survey = new Survey()
        .question(buildQuestion("q1"))
        .question(buildQuestion("q2", "(= (answer q1) 99)"));

      survey.recordAnswer("q1", 100);
      expect(survey.questions[1].enabled).toBe(false);

      survey.recordAnswer("q1", 99);
      expect(survey.questions[1].enabled).toBe(true);
    });
  });
  describe("question()", () => {
    it("should add a question to the survey", () => {
      const question: Question = { tag: "q1" };
      survey.question(question);
      expect(survey.questions).toHaveLength(1);
      expect(survey.questions[0].tag).toBe("q1");
    });

    it("should add a question with condition to the survey", () => {
      const question: Question = {
        tag: "q2",
        condition: "equals(answer('q1'), 'yes')",
      };
      survey.question(question);
      expect(survey.questions).toHaveLength(1);
      expect(survey.questions[0].tag).toBe("q2");
      expect(survey.questions[0].condition).toBe("equals(answer('q1'), 'yes')");
    });

    it("should return the survey instance for chaining", () => {
      const question: Question = { tag: "q1" };
      const result = survey.question(question);
      expect(result).toBe(survey);
    });
  });

  describe("recordAnswer()", () => {
    beforeEach(() => {
      survey.question({ tag: "q1" });
      survey.question({ tag: "q2" });
    });

    it("should record an answer for an existing question", () => {
      survey.recordAnswer("q1", "yes");
      expect(survey.questions[0].answer).toBe("yes");
    });

    it("should not modify questions when recording answer for non-existent question", () => {
      survey.recordAnswer("q3", "no");
      expect(survey.questions[0].answer).toBeUndefined();
      expect(survey.questions[1].answer).toBeUndefined();
    });
  });

  describe("lookupAnswer()", () => {
    beforeEach(() => {
      survey
        .question({ tag: "q1" })
        .question({ tag: "q2" })
        .question({ tag: "q3" });

      survey.recordAnswer("q1", "yes");
      survey.recordAnswer("q2", 100);
    });

    it("should return the answer for an existing question", () => {
      expect(survey.lookupAnswer("q1")).toBe("yes");
      expect(survey.lookupAnswer("q2")).toBe(100);
    });

    it("should return undefined for a question without an answer", () => {
      const answer = survey.lookupAnswer("q3");
      expect(answer).toBeUndefined();
    });

    it("should throw error for a non-existent question", () => {
      expect(() => survey.lookupAnswer("q4")).toThrow(
        Error("Failed to find questions with tag: q4")
      );
    });
  });
});
