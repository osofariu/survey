import { describe, it, expect } from "vitest";
import { Survey } from "./survey";
import { Question } from "./question";
import { ConditionalExpression } from "./cond_exp";

describe("Conditional Expression", () => {
  it.only("equals - false example", () => {
    const exp = "(equals 'hi', 'ho')";
    const question: Question = {
      tag: "Q1",
      conditionExp: exp,
    };
    const survey = new Survey().question(question);
    const condExp = new ConditionalExpression(exp, survey);
    expect(condExp.evaluate()).toBe(false);
  });
  it("equals - true example", () => {
    const exp = "(equals 'hi' 'hi')";
    const question: Question = {
      tag: "Q1",
      conditionExp: exp,
    };
    const survey = new Survey().question(question);
    const condExp = new ConditionalExpression(exp, survey);
    expect(condExp.evaluate()).toBe(true);
  });
  it("question lookup - success", () => {
    const q1: Question = {
      tag: "q1",
    };
    const q2_exp = "(question q1 (equals 'hello'))";

    const q2: Question = {
      tag: "q2",
      conditionExp: q2_exp,
    };
    const survey = new Survey().question(q1).question(q2);
    const condExp = new ConditionalExpression(q2_exp, survey);
    expect(condExp.evaluate()).toBe(true);
  });
});
