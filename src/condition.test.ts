import { describe, it, expect } from "vitest";
import { Survey } from "./survey";
import { Question } from "./question";
import { Condition } from "./condition";

describe("Conditional Expression", () => {
  it("equals - false example", () => {
    const condition = new Condition(new Survey());
    expect(condition.evaluate("(equals 'hi' 'ho')")).toBe(false);
  });
  it("equals - true example", () => {
    const condition = new Condition(new Survey());
    expect(condition.evaluate("(equals 'hi' 'hi')")).toBe(true);
  });

  it("not equals - true example", () => {
    const condition = new Condition(new Survey());
    expect(condition.evaluate("(not (equals 'hi' 'hi'))")).toBe(false);
  });
  it("question lookup - answer is on right", () => {
    const q1: Question = {
      tag: "q1",
    };
    const survey = new Survey().question(q1);
    survey.recordAnswer("q1", "hello");
    const condition = new Condition(survey);
    expect(condition.evaluate("(equals 'hello' (answer q1))")).toBe(true);
  });

  it("question lookup - answer is on left", () => {
    const q1: Question = {
      tag: "q1",
    };
    const survey = new Survey().question(q1);
    survey.recordAnswer("q1", "hellow");
    const condition = new Condition(survey);
    expect(condition.evaluate("(equals (answer q1) 'hello')")).toBe(false);
  });

  it("and example", () => {
    const q1: Question = {
      tag: "q1",
    };
    const q2: Question = {
      tag: "q2",
    };
    const survey = new Survey().question(q1).question(q2);
    survey.recordAnswer("q1", "apple");
    survey.recordAnswer("q2", "pie");
    const condition = new Condition(survey);
    expect(
      condition.evaluate(
        "(and (equals (answer q1) 'apple') (equals (answer q2) 'pie'))"
      )
    ).toBe(true);
  });
});
