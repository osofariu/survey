import { lex, lexer } from "./lexer";
import { ExpressionParser } from "./parser";
import { Survey } from "./survey";
import { createToken, Lexer, CstParser, CstNode } from "chevrotain";

const parserInstance = new ExpressionParser();
const BaseConditionVisitor = parserInstance.getBaseCstVisitorConstructor();

class ConditionVisitor extends BaseConditionVisitor {
  private survey: Survey;

  constructor(survey: Survey) {
    super();
    this.survey = survey;
    this.validateVisitor();
  }

  booleanExpressionRule(ctx: any): boolean {
    if (ctx.children[0].Equals) {
      return ctx.EqualsRule.lhs.image === ctx.Equals.rhs.image;
    }
    return ctx.expression;
  }

  stringExpressionRule(ctx: any): string {
    console.log("** STRING");
    console.log(JSON.stringify(ctx));
    return ctx.expression;
  }

  equalsRule(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left === right;
  }

  notRule(ctx: any): boolean {
    const expr = this.visit(ctx.expression[0]);
    return !expr;
  }

  answerRule(ctx: any): any {
    const tag = ctx.String[0].image.replace(/'/g, "");
    return this.survey.lookupAnswer(tag);
  }

  includesRule(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return Array.isArray(right) ? right.includes(left) : false;
  }

  andRule(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left && right;
  }

  orRule(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left || right;
  }

  StringRule(ctx: any): string {
    return this.visit(ctx.expression);
  }

  visit(ctx: any): any {
    if (ctx.equals) return this.equalsRule(ctx.equals);
    if (ctx.not) return this.notRule(ctx.not);
    if (ctx.answer) return this.answerRule(ctx.answer);
    if (ctx.includes) return this.includesRule(ctx.includes);
    if (ctx.and) return this.andRule(ctx.and);
    if (ctx.or) return this.orRule(ctx.or);
    return ctx;
  }
}
export class Condition {
  private survey: Survey;

  public constructor(survey: Survey) {
    this.survey = survey;
  }

  public evaluate(expression: string): boolean {
    const lexResult = lex(expression);
    parserInstance.input = lexResult.tokens;
    const cst = parserInstance.booleanExpressionRule();

    if (parserInstance.errors.length > 0) {
      throw Error(
        "parsing errors detected!\n" + parserInstance.errors[0].message
      );
    }

    const visitorInstance = new ConditionVisitor(this.survey);
    return visitorInstance.visit(cst);
  }
}
