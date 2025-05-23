import { lex, lexer } from "./lexer";
import { ExpressionParser } from "./parser";
import { Survey } from "./survey";
import { createToken, Lexer, CstParser, CstNode } from "chevrotain";

const parserInstance = new ExpressionParser();
const BaseConditionVisitor = parserInstance.getBaseCstVisitorConstructor();

// Type definitions for better type safety
type ValueType = string | string[] | number;
type BooleanResult = boolean;
type StringResult = string;
type StringArrayResult = string[];

class ConditionVisitor extends BaseConditionVisitor {
  private survey: Survey;

  constructor(survey: Survey) {
    super();
    this.survey = survey;
    this.validateVisitor();
  }

  // Top level expression rule
  expressionRule(ctx: any): BooleanResult {
    return this.visit(ctx.booleanExpressionRule);
  }

  // Boolean expressions
  booleanExpressionRule(ctx: any): BooleanResult {
    if (ctx.comparisonRule) {
      return this.visit(ctx.comparisonRule);
    } else if (ctx.logicalRule) {
      return this.visit(ctx.logicalRule);
    }
    throw new Error(`Invalid boolean expression: ${JSON.stringify(ctx)}`);
  }

  // Comparison expressions
  comparisonRule(ctx: any): BooleanResult {
    if (ctx.equalsRule) {
      return this.visit(ctx.equalsRule);
    } else if (ctx.includesRule) {
      return this.visit(ctx.includesRule);
    }
    throw new Error(`Invalid comparison expression: ${JSON.stringify(ctx)}`);
  }

  // Logical expressions
  logicalRule(ctx: any): BooleanResult {
    if (ctx.notRule) {
      return this.visit(ctx.notRule);
    } else if (ctx.andRule) {
      return this.visit(ctx.andRule);
    } else if (ctx.orRule) {
      return this.visit(ctx.orRule);
    }
    throw new Error(`Invalid logical expression: ${JSON.stringify(ctx)}`);
  }

  // Value expressions
  valueExpressionRule(ctx: any): ValueType {
    if (ctx.stringExpressionRule) {
      return this.visit(ctx.stringExpressionRule);
    } else if (ctx.stringArrayExpressionRule) {
      return this.visit(ctx.stringArrayExpressionRule);
    }
    throw new Error(`Invalid value expression: ${JSON.stringify(ctx)}`);
  }

  stringExpressionRule(ctx: any): StringResult {
    if (ctx.StringRule) {
      return this.visit(ctx.StringRule);
    } else if (ctx.stringAnswerRule) {
      return this.visit(ctx.stringAnswerRule);
    }
    throw new Error(`Invalid string expression: ${JSON.stringify(ctx)}`);
  }

  stringArrayExpressionRule(ctx: any): StringArrayResult {
    if (ctx.StringArrayRule) {
      return this.visit(ctx.StringArrayRule);
    } else if (ctx.arrayAnswerRule) {
      return this.visit(ctx.arrayAnswerRule);
    }
    throw new Error(`Invalid string array expression: ${JSON.stringify(ctx)}`);
  }

  // Comparison rules
  equalsRule(ctx: any): BooleanResult {
    const left = this.visit(ctx.lhs);
    const right = this.visit(ctx.rhs);
    return left === right;
  }

  includesRule(ctx: any): BooleanResult {
    const left = this.visit(ctx.left);
    const right = this.visit(ctx.right);
    if (!Array.isArray(left)) {
      throw new Error(
        `Left side of includes must be an array, got: ${typeof left}`
      );
    }
    return left.includes(right);
  }

  // Logical rules
  notRule(ctx: any): BooleanResult {
    return !this.visit(ctx.booleanExpressionRule);
  }

  andRule(ctx: any): BooleanResult {
    return this.visit(ctx.lhs) && this.visit(ctx.rhs);
  }

  orRule(ctx: any): BooleanResult {
    return this.visit(ctx.lhs) || this.visit(ctx.rhs);
  }

  // Value rules
  StringRule(ctx: any): StringResult {
    const result = ctx.StringValue[0].image;
    return result.replace(/^'|'$/g, "");
  }

  StringArrayRule(ctx: any): StringArrayResult {
    const arrayExp = ctx.StringArrayValue[0].image;
    const parsableArrayExp = arrayExp.replaceAll("'", '"');
    try {
      return JSON.parse(parsableArrayExp);
    } catch (e) {
      throw new Error(`Failed to parse array expression: ${arrayExp}`);
    }
  }

  // Answer rules with distinct types
  stringAnswerRule(ctx: any): StringResult {
    const tag = this.visit(ctx.IdentifierRule);
    const answer = this.survey.lookupAnswer(tag);
    if (typeof answer !== "string") {
      throw new Error(
        `Expected string answer for tag ${tag}, got ${typeof answer}`
      );
    }
    return answer;
  }

  arrayAnswerRule(ctx: any): StringArrayResult {
    const tag = this.visit(ctx.IdentifierRule);
    const answer = this.survey.lookupAnswer(tag);
    if (!Array.isArray(answer)) {
      throw new Error(
        `Expected array answer for tag ${tag}, got ${typeof answer}`
      );
    }
    return answer;
  }

  IdentifierRule(ctx: any): string {
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
    const cst = parserInstance.expressionRule();

    if (parserInstance.errors.length > 0) {
      throw Error(
        "parsing errors detected!\n" + parserInstance.errors[0].message
      );
    }

    const visitorInstance = new ConditionVisitor(this.survey);
    return visitorInstance.visit(cst);
  }
}
