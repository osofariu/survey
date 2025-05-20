import { Survey } from "./survey";
import { createToken, Lexer, CstParser } from "chevrotain";

// Define tokens
const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const Equals = createToken({ name: "Equals", pattern: /equals/ });
const Not = createToken({ name: "Not", pattern: /not/ });
const Answer = createToken({ name: "Answer", pattern: /answer/ });
const Includes = createToken({ name: "Includes", pattern: /includes/ });
const And = createToken({ name: "And", pattern: /and/ });
const Or = createToken({ name: "Or", pattern: /or/ });
const String = createToken({ name: "String", pattern: /'[^']*'/ });
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z0-9]+/ });
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /[ \t\n\r]+/,
  group: Lexer.SKIPPED,
});

// Define lexer
const allTokens = [
  LParen,
  RParen,
  Equals,
  Not,
  Answer,
  Includes,
  And,
  Or,
  String,
  Identifier,
  WhiteSpace,
];
const lexer = new Lexer(allTokens);

// Define parser
class ExpressionParser extends CstParser {
  private survey: Survey;

  constructor(survey: Survey) {
    super(allTokens);
    this.survey = survey;

    this.performSelfAnalysis();
  }

  public expression = this.RULE("expression", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.equals) },
      { ALT: () => this.SUBRULE(this.not) },
      { ALT: () => this.SUBRULE(this.answer) },
      { ALT: () => this.SUBRULE(this._includes) },
      { ALT: () => this.SUBRULE(this.and) },
      // { ALT: () => this.SUBRULE(this.or_) },
    ]);
  });

  private equals = this.RULE("equals", () => {
    this.CONSUME(LParen);
    this.CONSUME(Equals);
    const left = this.SUBRULE(this.expression);
    const right = this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    return left === right;
  });

  private not = this.RULE("not", () => {
    this.CONSUME(LParen);
    this.CONSUME(Not);
    const expr = this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    return !expr;
  });

  private answer = this.RULE("answer", () => {
    this.CONSUME(LParen);
    this.CONSUME(Answer);
    const tag = this.CONSUME(String);
    this.CONSUME(RParen);
    return this.survey.lookupAnswer(tag.image.replace(/'/g, ""));
  });

  private _includes = this.RULE("includes", () => {
    this.CONSUME(LParen);
    this.CONSUME(Includes);
    const left = this.SUBRULE(this.expression);
    const right = this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    return Array.isArray(right) ? right.includes(left) : false;
  });

  private and = this.RULE("and", () => {
    this.CONSUME(LParen);
    this.CONSUME(And);
    const left = this.SUBRULE(this.expression);
    const right = this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    return left && right;
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

// Create parser instance

class ExpressionVisitor {
  private survey: Survey;

  constructor(survey: Survey) {
    this.survey = survey;
  }

  visitEquals(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left === right;
  }

  visitNot(ctx: any): boolean {
    const expr = this.visit(ctx.expression[0]);
    return !expr;
  }

  visitAnswer(ctx: any): any {
    const tag = ctx.String[0].image.replace(/'/g, "");
    return this.survey.lookupAnswer(tag);
  }

  visitIncludes(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return Array.isArray(right) ? right.includes(left) : false;
  }

  visitAnd(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left && right;
  }

  visitOr(ctx: any): boolean {
    const left = this.visit(ctx.expression[0]);
    const right = this.visit(ctx.expression[1]);
    return left || right;
  }

  visit(ctx: any): any {
    if (ctx.equals) return this.visitEquals(ctx.equals);
    if (ctx.not) return this.visitNot(ctx.not);
    if (ctx.answer) return this.visitAnswer(ctx.answer);
    if (ctx.includes) return this.visitIncludes(ctx.includes);
    if (ctx.and) return this.visitAnd(ctx.and);
    if (ctx.or) return this.visitOr(ctx.or);
    return ctx;
  }
}

export class ConditionalExpression {
  private value: string;
  private survey: Survey;
  private parser: ExpressionParser;

  public constructor(value: string, survey: Survey) {
    this.survey = survey;
    this.value = value;
    this.parser = new ExpressionParser(survey);
  }
  public evaluate(): boolean {
    const lexResult = lexer.tokenize(this.value);
    this.parser.input = lexResult.tokens;
    const cst = this.parser.expression();
    const visitor = new ExpressionVisitor(this.survey);
    return visitor.visit(cst);
  }
}
