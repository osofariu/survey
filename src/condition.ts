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
    console.log(`\n* booleanExpressionRule: ${JSON.stringify(ctx)}`);
    if (ctx.equalsRule) {
      return this.visit(ctx.equalsRule);
    } else if (ctx.notRule) {
      return this.visit(ctx.notRule);
    } else if (ctx.andRule) {
      return this.visit(ctx.andRule);
    } else if (ctx.orRule) {
      return this.visit(ctx.orRule);
    } else if (ctx.includesRule) {
      return this.visit(ctx.includesRule);
    } else {
      throw new Error(
        `Failed to match expression for booleanExpressionRule. context:\n${JSON.stringify(
          ctx
        )}`
      );
    }
  }

  stringExpressionRule(ctx: any): string {
    console.log(`\n* stringExpressionRule: ${JSON.stringify(ctx)}`);
    if (ctx.StringRule) {
      return this.visit(ctx.StringRule);
    } else if (ctx.answerRule) {
      return this.visit(ctx.answerRule);
    } else {
      throw new Error(
        `Failed to match expression for stringExpressionRule. context:\n${JSON.stringify(
          ctx
        )}`
      );
    }
  }
  stringArrayExpressionRule(ctx: any): string {
    console.log(`\n* stringArrayExpressionRule: ${JSON.stringify(ctx)}`);
    if (ctx.StringArrayRule) {
      return this.visit(ctx.StringArrayRule);
    } else if (ctx.answerArrayRule) {
      return this.visit(ctx.answerArrayRule);
    } else {
      throw new Error(
        `Failed to match expression for stringExpressionRule. context:\n${JSON.stringify(
          ctx
        )}`
      );
    }
  }
  equalsRule(ctx: any): boolean {
    console.log(`\n* equalsRule: ${JSON.stringify(ctx)}`);
    const left = this.visit(ctx.lhs);
    const right = this.visit(ctx.rhs);
    return left === right;
  }

  includesRule(ctx: any): boolean {
    console.log(`\n* includesRule: ${JSON.stringify(ctx)}`);
    const left = this.visit(ctx.left);
    const right = this.visit(ctx.right);
    return Array.isArray(left) ? left.includes(right) : false;
  }

  answerRule(ctx: any): string | string[] | undefined {
    console.log(`\n* answerRule: ${JSON.stringify(ctx)}`);
    const tag = this.visit(ctx.IdentifierRule);
    return this.survey.lookupAnswer(tag) as string;
  }

  answerArrayRule(ctx: any): string[] | undefined {
    console.log(`\n* answerArrayRule: ${JSON.stringify(ctx)}`);
    const tag = this.visit(ctx.IdentifierRule);
    const answer = this.survey.lookupAnswer(tag);
    return answer as string[];
  }

  andRule(ctx: any): boolean {
    console.log(`\n* andRule: ${JSON.stringify(ctx)}`);
    return this.visit(ctx.lhs) && this.visit(ctx.rhs);
  }

  orRule(ctx: any): boolean {
    console.log(`\n* orRule: ${JSON.stringify(ctx)}`);
    return this.visit(ctx.lhs) || this.visit(ctx.rhs);
  }

  notRule(ctx: any): boolean {
    console.log(`\n* notRule: ${JSON.stringify(ctx)}`);
    const expr = this.visit(ctx.booleanExpressionRule);
    return !expr;
  }

  StringRule(ctx: any): string {
    console.log(`\n* StringRule: ${JSON.stringify(ctx)}`);
    const result = ctx.StringValue[0].image;
    return result.replace(/^'|'$/g, "");
  }

  StringArrayRule(ctx: any): string[] {
    console.log(`\n* StringArrayRule: ${JSON.stringify(ctx)}`);
    const arrayExp = ctx.StringArrayValue[0].image;
    const parsableArrayExp = arrayExp.replaceAll("'", '"');
    return JSON.parse(parsableArrayExp);
  }

  IdentifierRule(ctx: any): string {
    console.log(`\n* IdentifierRule: ${JSON.stringify(ctx)}`);
    return ctx.Identifier[0].image;
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
