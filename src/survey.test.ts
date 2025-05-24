import { describe, it, expect, beforeEach } from "vitest";
import { Survey } from "./survey";
import { Question } from "./question";

describe("Survey", () => {
  let survey: Survey;

  beforeEach(() => {
    survey = new Survey();
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
      survey.question({ tag: "q1" });
      survey.question({ tag: "q2" });
      survey.recordAnswer("q1", "yes");
    });

    it("should return the answer for an existing question", () => {
      const answer = survey.lookupAnswer("q1");
      expect(answer).toBe("yes");
    });

    it("should return undefined for a question without an answer", () => {
      const answer = survey.lookupAnswer("q2");
      expect(answer).toBeUndefined();
    });

    it("should throw error for a non-existent question", () => {
      expect(() => survey.lookupAnswer("q3")).toThrow(
        Error("Failed to find questions with tag: q3")
      );
    });
  });
});
