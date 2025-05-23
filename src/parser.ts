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
} from "./lexer";

export class ExpressionParser extends CstParser {
  constructor() {
    super(allTokens);
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
  private valueExpressionRule = this.RULE("valueExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.stringExpressionRule) },
      { ALT: () => this.SUBRULE(this.stringArrayExpressionRule) },
    ]);
  });

  private stringExpressionRule = this.RULE("stringExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.StringRule) },
      { ALT: () => this.SUBRULE(this.stringAnswerRule) },
    ]);
  });

  private stringArrayExpressionRule = this.RULE(
    "stringArrayExpressionRule",
    () => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.StringArrayRule) },
        { ALT: () => this.SUBRULE(this.arrayAnswerRule) },
      ]);
    }
  );

  // Comparison rules
  private equalsRule = this.RULE("equalsRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Equals);
    this.SUBRULE1(this.valueExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.valueExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private includesRule = this.RULE("includesRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Includes);
    this.SUBRULE1(this.stringArrayExpressionRule, { LABEL: "left" });
    this.SUBRULE2(this.stringExpressionRule, { LABEL: "right" });
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

  // Value rules
  private StringRule = this.RULE("StringRule", () => {
    this.CONSUME(StringValue);
  });

  private StringArrayRule = this.RULE("StringArrayRule", () => {
    this.CONSUME(StringArrayValue);
  });

  // Answer rules with distinct keywords
  private stringAnswerRule = this.RULE("stringAnswerRule", () => {
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

  private IdentifierRule = this.RULE("IdentifierRule", () => {
    this.CONSUME(Identifier);
  });
}
