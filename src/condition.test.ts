import { describe, it, expect } from "vitest";
import { Survey } from "./survey";
import { Question } from "./question";
import { Condition } from "./condition";

describe("Conditional Expression", () => {
  it("equals - false example", () => {
    const condition = new Condition(new Survey());
    expect(condition.evaluate("(equals 'hi', 'ho')")).toBe(false);
  });
  it("equals - true example", () => {
    const condExp = new Condition(new Survey());
    expect(condExp.evaluate("(equals 'hi', 'hi')")).toBe(true);
  });
  it("question lookup - success", () => {
    const q1: Question = {
      tag: "q1",
    };
    const survey = new Survey().question(q1);
    survey.recordAnswer("q1", "hello");
    const condExp = new Condition(survey);
    expect(condExp.evaluate("(equals 'hello', (answer q1))")).toBe(true);
  });
});
