import { describe, it, expect, beforeEach } from "vitest";
import { Survey } from "./survey";
import { buildQuestion, Question } from "./question";
import { executionAsyncId } from "async_hooks";

describe("Survey", () => {
  let survey: Survey;

  beforeEach(() => {
    survey = new Survey();
  });

  describe("record answer conditionally disables question", () => {
    beforeEach(() => {
      survey
        .question({ tag: "q1" })
        .question({ tag: "q2", condition: "(> (answer q1) 99)" })
        .question({
          tag: "q3",
          condition: "(includes (arrayAnswer q2) 'red')",
        });
    });

    it("with  multiple dependent questions", () => {
      survey.recordAnswer("q1", 100);
      survey.recordAnswer("q2", ["blue", "red"]);

      const enabledQuestions = survey.traverse((q) => q.enabled);
      expect(enabledQuestions.length).toBe(3);

      survey.recordAnswer("q1", 99);
      expect(survey.traverse((q) => q.enabled).map((q) => q.tag)).not.toContain(
        "q2"
      );
    });
  });
  describe("question()", () => {
    it("should add a question to the survey", () => {
      const question: Question = { tag: "q1" };
      survey.question(question);
      expect(survey.traverse()).toHaveLength(1);
      expect(survey.traverse((q) => q.tag === "q1").length).toBe(1);
    });

    it("should add a question with condition to the survey", () => {
      const question: Question = {
        tag: "q2",
        condition: "equals(answer('q1'), 'yes')",
      };
      survey.question(question);
      expect(survey.traverse()).toHaveLength(1);
      expect(survey.traverse((q) => q.tag === "q2")).toHaveLength(1);
      expect(survey.traverse()[0].condition).toBe(
        "equals(answer('q1'), 'yes')"
      );
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
      expect(survey.traverse()[0].answer).toBe("yes");
    });

    it("should not modify questions when recording answer for non-existent question", () => {
      survey.recordAnswer("q3", "no");
      expect(survey.traverse()[0].answer).toBeUndefined();
      expect(survey.traverse()[1].answer).toBeUndefined();
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
  describe("traverse with predicate", () => {
    beforeEach(() => {
      survey
        .question({ tag: "q1" })
        .question({ tag: "q2", condition: "(< (answer q1) 99)" })
        .question({ tag: "q3" });

      survey.recordAnswer("q1", 99);
      survey.recordAnswer("q3", "yes");
    });

    it("should filter questions by tag", () => {
      const result = survey.traverse((q) => q.tag === "q1");
      expect(result).toHaveLength(1);
      expect(result[0].tag).toBe("q1");
    });

    it("should filter questions by enabled state", () => {
      const result = survey.traverse((q) => q.enabled);
      expect(result).toHaveLength(2); // q1 and q3 are enabled, q2 is disabled
      expect(result.map((q) => q.tag)).toEqual(["q1", "q3"]);
    });

    it("should filter questions by answer value", () => {
      const result = survey.traverse((q) => q.answer === "yes");
      expect(result).toHaveLength(1);
      expect(result[0].tag).toBe("q3");
    });

    it("should return empty array when no questions match predicate", () => {
      const result = survey.traverse((q) => q.tag === "nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should support complex predicates", () => {
      const result = survey.traverse(
        (q) => q.enabled && q.answer !== undefined && q.tag !== "q2"
      );
      expect(result).toHaveLength(2);
      expect(result.map((q) => q.tag)).toEqual(["q1", "q3"]);
    });
  });
});
