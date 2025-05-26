import { CstParser, tokenLabel } from "chevrotain";
import {
  allTokens,
  And,
  Or,
  Answer,
  ArrayAnswer,
  Equals,
  Identifier,
  Includes,
  LParen,
  Not,
  RParen,
  StringValue,
  WhiteSpace,
  StringArrayValue,
  NumericValue,
  NumericArrayValue,
  Greater,
  Less,
} from "./lexer";
import { config } from "process";

export class ExpressionParser extends CstParser {
  constructor() {
    super(allTokens, { maxLookahead: 2 });

    this.performSelfAnalysis();
  }

  // Top level rule
  public expressionRule = this.RULE("expressionRule", () => {
    return this.SUBRULE(this.booleanExpressionRule);
  });

  // Boolean expressions
  private booleanExpressionRule = this.RULE("booleanExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.comparisonRule) },
      { ALT: () => this.SUBRULE(this.logicalRule) },
    ]);
  });

  // Comparison expressions
  private comparisonRule = this.RULE("comparisonRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.equalsRule) },
      { ALT: () => this.SUBRULE(this.greaterRule) },
      { ALT: () => this.SUBRULE(this.lessRule) },
      { ALT: () => this.SUBRULE(this.includesRule) },
    ]);
  });

  // Logical expressions
  private logicalRule = this.RULE("logicalRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.notRule) },
      { ALT: () => this.SUBRULE(this.andRule) },
      { ALT: () => this.SUBRULE(this.orRule) },
    ]);
  });

  // Value expressions
  private elementExpressionRule = this.RULE("elementExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.valueRule) },
      { ALT: () => this.SUBRULE(this.valueAnswerRule) },
    ]);
  });

  private arrayExpressionRule = this.RULE("arrayExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.ValueArrayRule) },
      { ALT: () => this.SUBRULE(this.arrayAnswerRule) },
    ]);
  });

  // Comparison rules
  private equalsRule = this.RULE("equalsRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Equals);
    this.SUBRULE1(this.elementExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.elementExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private greaterRule = this.RULE("greaterRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Greater);
    this.SUBRULE1(this.elementExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.elementExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private lessRule = this.RULE("lessRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Less);
    this.SUBRULE1(this.elementExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.elementExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private includesRule = this.RULE("includesRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Includes);
    this.SUBRULE1(this.arrayExpressionRule, { LABEL: "left" });
    this.SUBRULE2(this.elementExpressionRule, { LABEL: "right" });
    this.CONSUME(RParen);
  });

  // Logical rules
  private notRule = this.RULE("notRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Not);
    this.SUBRULE(this.booleanExpressionRule);
    this.CONSUME(RParen);
  });

  private andRule = this.RULE("andRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(And);
    this.SUBRULE1(this.booleanExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.booleanExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private orRule = this.RULE("orRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Or);
    this.SUBRULE1(this.booleanExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.booleanExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private valueRule = this.RULE("valueRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.StringRule) },
      { ALT: () => this.SUBRULE(this.NumericRule) },
    ]);
  });

  private valueAnswerRule = this.RULE("valueAnswerRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Answer);
    this.SUBRULE(this.IdentifierRule);
    this.CONSUME(RParen);
  });

  private arrayAnswerRule = this.RULE("arrayAnswerRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(ArrayAnswer);
    this.SUBRULE(this.IdentifierRule);
    this.CONSUME(RParen);
  });

  // Terminal rules (these are capitalized)

  private StringRule = this.RULE("StringRule", () => {
    this.CONSUME(StringValue);
  });

  private NumericRule = this.RULE("NumericRule", () => {
    this.CONSUME(NumericValue);
  });

  private ValueArrayRule = this.RULE("ValueArrayRule", () => {
    return this.OR([
      { ALT: () => this.CONSUME(StringArrayValue) },
      { ALT: () => this.CONSUME(NumericArrayValue) },
    ]);
  });

  private IdentifierRule = this.RULE("IdentifierRule", () => {
    this.CONSUME(Identifier);
  });
}
