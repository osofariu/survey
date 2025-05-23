import { CstParser, tokenLabel } from "chevrotain";
import {
  allTokens,
  And,
  Or,
  Answer,
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

  public booleanExpressionRule = this.RULE("booleanExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.equalsRule) },
      { ALT: () => this.SUBRULE(this.notRule) },
      { ALT: () => this.SUBRULE(this.includesRule) },
      { ALT: () => this.SUBRULE(this.andRule) },
      { ALT: () => this.SUBRULE(this.orRule) },
    ]);
  });

  private includesRule = this.RULE("includesRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Includes);
    this.SUBRULE1(this.stringArrayExpressionRule, { LABEL: "left" });
    this.SUBRULE2(this.stringExpressionRule, { LABEL: "right" });
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
    const left = this.SUBRULE1(this.booleanExpressionRule, { LABEL: "lhs" });
    const right = this.SUBRULE2(this.booleanExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  public stringExpressionRule = this.RULE("stringExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.answerRule) },
      { ALT: () => this.SUBRULE(this.StringRule) },
    ]);
  });

  public stringArrayExpressionRule = this.RULE(
    "stringArrayExpressionRule",
    () => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.answerArrayRule) },
        { ALT: () => this.SUBRULE(this.StringArrayRule) },
      ]);
    }
  );
  private StringRule = this.RULE("StringRule", () => {
    this.CONSUME(StringValue);
  });

  private StringArrayRule = this.RULE("StringArrayRule", () => {
    this.CONSUME(StringArrayValue);
  });

  private answerRule = this.RULE("answerRule", (): any => {
    this.CONSUME(LParen);
    this.CONSUME(Answer);
    this.SUBRULE(this.IdentifierRule);
    this.CONSUME(RParen);
  });

  private answerArrayRule = this.RULE("answerArrayRule", (): any => {
    this.CONSUME(LParen);
    this.CONSUME(Answer);
    this.SUBRULE(this.IdentifierRule);
    this.CONSUME(RParen);
  });

  private equalsRule = this.RULE("equalsRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Equals);
    this.SUBRULE1(this.stringExpressionRule, { LABEL: "lhs" });
    this.SUBRULE2(this.stringExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private notRule = this.RULE("notRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Not);
    this.SUBRULE(this.booleanExpressionRule);
    this.CONSUME(RParen);
  });

  private IdentifierRule = this.RULE("IdentifierRule", (): any => {
    this.CONSUME(Identifier);
  });
}
