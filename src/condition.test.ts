import { describe, it, expect } from "vitest";
import { Survey } from "./survey";
import { Question, QuestionState } from "./question";
import { Condition } from "./condition";

describe("Conditional Expression", () => {
  describe("multiple expressions with or,and", () => {
    it("and", () => {
      const q1: Question = {
        tag: "q1",
      };
      const q2: Question = {
        tag: "q2",
      };
      const survey = new Survey().question(q1).question(q2);
      survey.recordAnswer("q1", "apple");
      survey.recordAnswer("q2", "pie");
      expect(
        new Condition(survey).evaluate(
          "(and (equals (answer q1) 'apple') (equals (answer q2) 'pie'))"
        )
      ).toBe(true);
    });

    it("or - match", () => {
      const q1: Question = {
        tag: "q1",
      };
      const q2: Question = {
        tag: "q2",
      };
      const survey = new Survey().question(q1).question(q2);
      survey.recordAnswer("q1", "apple");
      survey.recordAnswer("q2", "pie");
      expect(
        new Condition(survey).evaluate(
          "(or (equals (answer q1) 'apple') (equals (answer q2) 'bust'))"
        )
      ).toBe(true);
    });
    it("or - no match", () => {
      const q1: Question = {
        tag: "q1",
      };
      const q2: Question = {
        tag: "q2",
      };
      const survey = new Survey().question(q1).question(q2);
      survey.recordAnswer("q1", "apple");
      survey.recordAnswer("q2", "pie");
      expect(
        new Condition(survey).evaluate(
          "(or (equals (answer q1) 'rusr') (equals (answer q2) 'nails'))"
        )
      ).toBe(false);
    });
  });

  describe("equals", () => {
    describe("string types", () => {
      it("equals - false with literals", () => {
        expect(new Condition(new Survey()).evaluate("(equals 'hi' 'ho')")).toBe(
          false
        );
      });
      it("equals - true with literals", () => {
        expect(new Condition(new Survey()).evaluate("(equals 'hi' 'hi')")).toBe(
          true
        );
      });

      it("not equals - with literals", () => {
        expect(
          new Condition(new Survey()).evaluate("(not (equals 'hi' 'hi'))")
        ).toBe(false);
      });
      it("equals answer - on right", () => {
        const q1: Question = {
          tag: "q1",
        };
        const survey = new Survey().question(q1);
        survey.recordAnswer("q1", "hello");
        expect(
          new Condition(survey).evaluate("(equals 'hello' (answer q1))")
        ).toBe(true);
      });
      it("equals answer  -  on left", () => {
        const q1: Question = {
          tag: "q1",
        };
        const survey = new Survey().question(q1);
        survey.recordAnswer("q1", "hellow");
        expect(
          new Condition(survey).evaluate("(equals (answer q1) 'hello')")
        ).toBe(false);
      });

      it("equals answer  -  on both side", () => {
        const q1: Question = {
          tag: "q1",
        };
        const q2: Question = {
          tag: "q2",
        };
        const survey = new Survey().question(q1).question(q2);
        survey.recordAnswer("q1", "hellow");
        survey.recordAnswer("q2", "hellow");
        expect(
          new Condition(survey).evaluate("(equals (answer q1) (answer q2))")
        ).toBe(true);
      });
    });
    describe("numeric types", () => {
      it("equals - false with literals", () => {
        expect(new Condition(new Survey()).evaluate("(equals 12 22)")).toBe(
          false
        );
      });
      it("equals - true with literals", () => {
        expect(new Condition(new Survey()).evaluate("(equals 12 12)")).toBe(
          true
        );
      });
    });
    describe("array types", () => {
      it("equals - false with literals", () => {
        const q1: Question = {
          tag: "q1",
        };
        const survey = new Survey().question(q1);
        survey.recordAnswer("q1", [12, 21]);
        expect(new Condition(survey).evaluate("(includes [12, 21] 12)")).toBe(
          true
        );
        expect(
          new Condition(survey).evaluate("(includes (arrayAnswer q1) 12)")
        ).toBe(true);
      });
    });
  });

  describe("includes", () => {
    it("includes with lookup, and passes", () => {
      const q: Question = {
        tag: "q",
      };
      const survey = new Survey().question(q);
      survey.recordAnswer("q", ["apple", "pear", "plum"]);
      expect(
        new Condition(survey).evaluate("(includes (arrayAnswer q) 'apple')")
      ).toBe(true);
    });

    it("includes with lookup, and fails", () => {
      const q: Question = {
        tag: "q",
      };
      const survey = new Survey().question(q);
      survey.recordAnswer("q", ["apple", "pear", "plum"]);
      expect(
        new Condition(survey).evaluate("(includes (arrayAnswer q) 'apples')")
      ).toBe(false);
    });
    it("includes with literal array", () => {
      const q: Question = {
        tag: "q",
      };
      expect(
        new Condition(new Survey()).evaluate(
          "(includes ['pear', 'apple'] 'apple')"
        )
      ).toBe(true);
    });
  });
});
