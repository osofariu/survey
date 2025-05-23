import { createToken, Lexer } from "chevrotain";

export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const Equals = createToken({ name: "Equals", pattern: /equals/ });
export const Not = createToken({ name: "Not", pattern: /not/ });
export const Answer = createToken({ name: "Answer", pattern: /answer/ });
export const Includes = createToken({ name: "Includes", pattern: /includes/ });
export const And = createToken({ name: "And", pattern: /and/ });
export const Or = createToken({ name: "Or", pattern: /or/ });
export const StringValue = createToken({
  name: "StringValue",
  pattern: /'[a-zA-Z0-9]+'/,
});
export const StringArrayValue = createToken({
  name: "StringArrayValue",
  pattern: /\['[a-zA-Z0-9]+'(,\s*'[a-zA-Z0-9]+')*\]/,
});
export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z0-9]+/,
});
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// Define lexer
export const allTokens = [
  LParen,
  RParen,
  Equals,
  Not,
  Answer,
  Includes,
  And,
  Or,
  StringValue,
  StringArrayValue,
  Identifier,
  WhiteSpace,
];

export const lexer = new Lexer(allTokens);

export function lex(inputText: string) {
  const lexingResult = lexer.tokenize(inputText);

  if (lexingResult.errors.length > 0) {
    throw Error(
      "lexing errors detected: " +
        JSON.stringify(lexingResult.errors[0].message)
    );
  }

  return lexingResult;
}
