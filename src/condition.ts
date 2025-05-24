import { lex } from "./lexer";
import { ExpressionParser } from "./parser";
import { Survey } from "./survey";
import log from "loglevel";

log.setLevel(log.levels.WARN);

const parserInstance = new ExpressionParser();
const BaseConditionVisitor = parserInstance.getBaseCstVisitorConstructor();

type BooleanResult = boolean;
type StringResult = string;
type NumericResult = number;
type StringArrayResult = string[];
type NumericArrayResult = number[];

class ConditionVisitor extends BaseConditionVisitor {
  private survey: Survey;

  constructor(survey: Survey) {
    super();
    this.survey = survey;
    this.validateVisitor();
  }

  // Top level expression rule
  expressionRule(ctx: any): BooleanResult {
    log.info(`expressionRule; ctx: ${JSON.stringify(ctx)}\n`);
    return this.visit(ctx.booleanExpressionRule);
  }

  // Boolean expressions
  booleanExpressionRule(ctx: any): BooleanResult {
    log.info(`booleanExpressionRule; ctx: ${JSON.stringify(ctx)}\n`);
    if (ctx.comparisonRule) return this.visit(ctx.comparisonRule);
    if (ctx.logicalRule) return this.visit(ctx.logicalRule);

    throw new Error(`Invalid boolean expression: ${JSON.stringify(ctx)}`);
  }

  // Comparison expressions
  comparisonRule(ctx: any): BooleanResult {
    log.info(`comparisonRule; ctx: ${JSON.stringify(ctx)}\n`);
    if (ctx.equalsRule) return this.visit(ctx.equalsRule);
    if (ctx.includesRule) return this.visit(ctx.includesRule);

    throw new Error(`Invalid comparison expression: ${JSON.stringify(ctx)}`);
  }

  // Logical expressions
  logicalRule(ctx: any): BooleanResult {
    log.info(`logicalRule; ctx: ${JSON.stringify(ctx)}\n`);
    if (ctx.notRule) return this.visit(ctx.notRule);
    if (ctx.andRule) return this.visit(ctx.andRule);
    if (ctx.orRule) return this.visit(ctx.orRule);

    throw new Error(`Invalid logical expression: ${JSON.stringify(ctx)}`);
  }

  elementExpressionRule(ctx: any): StringResult | NumericResult {
    log.info(`elementExpressionRule; ctx: ${JSON.stringify(ctx)}\n`);
    if (ctx.valueRule) return this.visit(ctx.valueRule);
    if (ctx.valueAnswerRule) return this.visit(ctx.valueAnswerRule);

    throw new Error(`Invalid element expression: ${JSON.stringify(ctx)}`);
  }

  arrayExpressionRule(ctx: any): StringArrayResult | NumericArrayResult {
    log.info(`arrayExpressionRule; ctx: ${JSON.stringify(ctx)}\n`);
    if (ctx.ValueArrayRule) return this.visit(ctx.ValueArrayRule);
    if (ctx.arrayAnswerRule) return this.visit(ctx.arrayAnswerRule);

    throw new Error(`Invalid string array expression: ${JSON.stringify(ctx)}`);
  }

  // Comparison rules
  equalsRule(ctx: any): BooleanResult {
    log.info(`equalsRule; ctx: ${JSON.stringify(ctx)}\n`);
    const left = this.visit(ctx.lhs);
    const right = this.visit(ctx.rhs);
    return left === right;
  }

  includesRule(ctx: any): BooleanResult {
    log.info(`includesRule; ctx: ${JSON.stringify(ctx)}\n`);
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
    log.info(`notRule; ctx: ${JSON.stringify(ctx)}\n`);
    return !this.visit(ctx.booleanExpressionRule);
  }

  andRule(ctx: any): BooleanResult {
    log.info(`andRule; ctx: ${JSON.stringify(ctx)}\n`);
    return this.visit(ctx.lhs) && this.visit(ctx.rhs);
  }

  orRule(ctx: any): BooleanResult {
    log.info(`orRule; ctx: ${JSON.stringify(ctx)}\n`);
    return this.visit(ctx.lhs) || this.visit(ctx.rhs);
  }

  valueRule(ctx: any): NumericResult | StringResult {
    log.info(`valueRule; ctx: ${JSON.stringify(ctx)}\n`);
    if (ctx.StringRule) return this.visit(ctx.StringRule);
    if (ctx.NumericRule) return this.visit(ctx.NumericRule);
    throw new Error(`Unexpected valueRule: ${JSON.stringify(ctx)}`);
  }

  // Answer rules with distinct types
  valueAnswerRule(ctx: any): StringResult | NumericResult {
    log.info(`valueAnswerRule; ctx: ${JSON.stringify(ctx)}\n`);
    const tag = this.visit(ctx.IdentifierRule);
    const answer = this.survey.lookupAnswer(tag);
    if (typeof answer !== "string" && typeof answer !== "number") {
      throw new Error(
        `Expected string or number type answer for tag ${tag}, got ${typeof answer}`
      );
    }
    return answer;
  }

  arrayAnswerRule(ctx: any): StringArrayResult | NumericArrayResult {
    log.info(`arrayAnswerRule; ctx: ${JSON.stringify(ctx)}\n`);
    const tag = this.visit(ctx.IdentifierRule);
    const answer = this.survey.lookupAnswer(tag);
    if (!Array.isArray(answer)) {
      throw new Error(
        `Expected array answer for tag ${tag}, got ${typeof answer}`
      );
    }
    return answer;
  }

  // Value rules
  StringRule(ctx: any): StringResult {
    log.info(`StringRule; ctx: ${JSON.stringify(ctx)}\n`);
    const result = ctx.StringValue[0].image;
    return result.replace(/^'|'$/g, ""); // strip-off single quotes
  }

  NumericRule(ctx: any): NumericResult {
    log.info(`NumericRule; ctx: ${JSON.stringify(ctx)}\n`);
    return Number(ctx.Numeric[0].image.replace(/^'|'$/g, "")); // strip-off single quotes
  }

  ValueArrayRule(ctx: any): StringArrayResult | NumericArrayResult {
    log.info(`ValueArrayRule; ctx: ${JSON.stringify(ctx)}\n`);
    let arrayToParse;
    if (ctx.StringArrayValue) {
      arrayToParse = ctx.StringArrayValue[0].image;
      arrayToParse = arrayToParse.replaceAll("'", '"'); // needs double quotes to parse as JSON object
    } else {
      arrayToParse = ctx.NumericArrayValue[0].image;
    }
    try {
      return JSON.parse(arrayToParse);
    } catch (e) {
      throw new Error(`Failed to parse array expression: ${arrayToParse}`);
    }
  }

  IdentifierRule(ctx: any): string {
    log.info(`IdentifierRule; ctx: ${JSON.stringify(ctx)}\n`);
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
