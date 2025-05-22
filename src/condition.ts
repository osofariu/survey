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

  booleanExpressionRule(ctx: any) {
    console.log(`\n* booleanExpressionRule: ${JSON.stringify(ctx)}`);
    if (ctx.equalsRule) {
      return this.visit(ctx.equalsRule);
    } else if (ctx.notRule) {
      return this.visit(ctx.notRule);
    } else if (ctx.andRule) {
      return this.visit(ctx.andRule);
    }
  }

  stringExpressionRule(ctx: any): string {
    console.log(`\n* stringExpressionRule: ${JSON.stringify(ctx)}`);
    if (ctx.StringRule) {
      return this.visit(ctx.StringRule);
    } else if (ctx.answerRule) {
      return this.visit(ctx.answerRule);
    }
  }

  equalsRule(ctx: any): boolean {
    console.log(`\n* equalsRule: ${JSON.stringify(ctx)}`);
    const left = this.visit(ctx.lhs);
    const right = this.visit(ctx.rhs);
    console.log(`\n*** ${left} === ${right}`);
    return left === right;
  }

  notRule(ctx: any): boolean {
    console.log(`\n* notRule: ${JSON.stringify(ctx)}`);
    const expr = this.visit(ctx.booleanExpressionRule);
    return !expr;
  }

  answerRule(ctx: any): string | string[] | undefined {
    console.log(`\n* answerRule: ${JSON.stringify(ctx)}`);
    const tag = this.visit(ctx.IdentifierRule);
    return this.survey.lookupAnswer(tag);
  }

  includesRule(ctx: any): boolean {
    console.log(`\n* includesRule: ${JSON.stringify(ctx)}`);
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return Array.isArray(right) ? right.includes(left) : false;
  }

  andRule(ctx: any): boolean {
    console.log(`\n* andRule: ${JSON.stringify(ctx)}`);
    const left = this.visit(ctx.lhs);
    const right = this.visit(ctx.rhs);
    return left && right;
  }

  orRule(ctx: any): boolean {
    console.log(`\n* orRule: ${JSON.stringify(ctx)}`);
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left || right;
  }

  StringRule(ctx: any): string {
    console.log(`\n* StringRule: ${JSON.stringify(ctx)}`);
    const result = ctx.StringValue[0].image;
    return result.replace(/^'|'$/g, "");
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
