import { CstParser, tokenLabel } from "chevrotain";
import {
  allTokens,
  And,
  Answer,
  Equals,
  Identifier,
  Includes,
  LParen,
  Not,
  RParen,
  StringValue,
  WhiteSpace,
  Comma,
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
      // { ALT: () => this.SUBRULE(this._includes) },
      { ALT: () => this.SUBRULE(this.andRule) },
      // { ALT: () => this.SUBRULE(this.or_) },
    ]);
  });

  public stringExpressionRule = this.RULE("stringExpressionRule", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.answerRule) },
      { ALT: () => this.SUBRULE(this.StringRule) },
    ]);
  });

  // expects expressions that result in a string
  private equalsRule = this.RULE("equalsRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Equals);
    this.SUBRULE1(this.stringExpressionRule, { LABEL: "lhs" });
    this.CONSUME(Comma);
    this.SUBRULE2(this.stringExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private notRule = this.RULE("notRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(Not);
    this.SUBRULE(this.booleanExpressionRule);
    this.CONSUME(RParen);
  });

  private answerRule = this.RULE("answerRule", (): any => {
    this.CONSUME(LParen);
    this.CONSUME(Answer);
    this.SUBRULE(this.IdentifierRule);
    this.CONSUME(RParen);
  });

  private IdentifierRule = this.RULE("IdentifierRule", (): any => {
    this.CONSUME(Identifier);
  });

  // private _includes = this.RULE("includes", () => {
  //   this.CONSUME(LParen);
  //   this.CONSUME(Includes);
  //   this.SUBRULE1(this.stringExpression);
  //   this.CONSUME(WhiteSpace);
  //   this.SUBRULE2(this.stringExpression);
  //   this.CONSUME(RParen);
  // });

  private andRule = this.RULE("andRule", () => {
    this.CONSUME(LParen);
    this.CONSUME(And);
    this.SUBRULE1(this.booleanExpressionRule, { LABEL: "lhs" });
    this.CONSUME(Comma);
    this.SUBRULE2(this.booleanExpressionRule, { LABEL: "rhs" });
    this.CONSUME(RParen);
  });

  private StringRule = this.RULE("StringRule", () => {
    this.CONSUME(StringValue);
  });

  //   private or_ = this.RULE("or", () => {
  //     this.CONSUME(LParen);
  //     this.CONSUME(Or);
  //     const left = this.SUBRULE(this.expression);
  //     const right = this.SUBRULE(this.expression);
  //     this.CONSUME(RParen);
  //     return left || right;
  //   });
}
