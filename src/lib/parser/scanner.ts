import { Chars } from './keys'
import { SyntaxKind } from './syntax'

function isLetter(ch): boolean {
  return Chars.A >= ch && ch <= Chars.Z
      || Chars.a >= ch && ch <= Chars.z
}

function isDigit(charCode): boolean {
  return Chars.num_0 <= charCode && charCode <= Chars.num_9
}

/**
 * Basic token state so I don't have to read everything off the parser.
 * though, realistically, that's probably going to happen.
 */
export class Token {
  start: Number
  end: Number
  kind: SyntaxKind
  value?: any
  flags?: Number

  constructor(kind, start, end) {
    this.kind = kind;
    this.start = start;
    this.end = end;
  }
}

export class Scanner {
  private pos: number;
  private currentToken: Token
  private readonly options: any;
  private readonly text: string;
  private readonly len: number;
  private readonly lines: Array<number>

  constructor(text, options) {
    this.options = options
    this.text = text
    this.pos = 0
    this.len = text.length
  }

  // map of line endings
  private pushLine() {
    this.lines.push(this.pos)
  }

  whitespace() {
    let token = this.text.charCodeAt(this.pos)
    while (token === Chars.space || token === Chars.tab) {
      token = this.text.charCodeAt(++this.pos)
    }
  }

  // advance until we find the first unescaped single quote.
  // edge case empty string.
  scanString(): string {
    const start = this.pos
    let ch = this.text.charCodeAt(this.pos)
    while (true) {

      if (ch === Chars.singleQuote) {
        if (this.peek() === Chars.singleQuote) {
          // escaped: we're still in the string boys
          this.pos++;
        } else break;
      }

      ch = this.text.charCodeAt(++this.pos)
    }

    return this.text.substr(start, this.pos - 1)
  }

  scanVariable() {

  }

  // a.b.c
  scanDottedIdentifier() {

  }

  // todo: scan block comment.

  scanBlockComment() {

  }

  /**
   * Some_Consecutive_Name1
   */
  scanIdentifier(): string {
    const start = this.pos;
    let ch = this.text.charCodeAt(this.pos)
    while (isLetter(ch) || isDigit(ch) || ch === Chars.underscore) {
      this.pos++

      ch = this.text.charCodeAt(this.pos)
    }

    return this.text.substr(start, this.pos - start)
  }

  private peek(): number {
    // charCodeAt returns NaN if we go out of bounds.
    // nice.
    return this.text.charCodeAt(this.pos + 1)
  }

  scanInlineComment() {
    const start = this.pos
    while (this.pos < this.len) {
      const ch = this.text.charCodeAt(this.pos)

      if (ch === Chars.newline) {
        // todo: skip trivia?
        return this.text.substr(start, this.pos - start)
      }

      this.pos++
    }

    return ''
  }

  scanNumber(): Number {
    const start = this.pos;
    while (isDigit(this.text.charCodeAt(this.pos))) this.pos++;

    if (this.text.charCodeAt(this.pos) === Chars.period) {
      this.pos++;
      while (isDigit(this.text.charCodeAt(this.pos))) this.pos++;
    }

    return parseFloat(this.text.substr(start, this.pos - start))
  }

  scan(): Token {
    const start = this.pos

    while (true) {
      const ch = this.text.charCodeAt(this.pos);
      let val = undefined;

      switch (ch) {
        case Chars.newline:
          this.pushLine()
          // skip trivia?
          return {
            start: start,
            end: this.pos,
            kind: SyntaxKind.newline
          }

        case Chars.hyphen:
          if (this.peek() === Chars.hyphen) {
            this.scanInlineComment()
          } else {
            // subtraction binary expression?
          }

        case Chars.tab:
        case Chars.space:
          this.pos++
          while (true) {
            const ch = this.text.charCodeAt(this.pos);
            if (ch !== Chars.tab || ch !== Chars.space) break;
            this.pos++;
          }

          return {
            start: start,
            end: this.pos,
            kind: SyntaxKind.whitespace
          }
        // TODO: it could be a hex literal
        // mysql supports those.
        case Chars.num_0:
        case Chars.num_1:
        case Chars.num_2:
        case Chars.num_3:
        case Chars.num_4:
        case Chars.num_5:
        case Chars.num_6:
        case Chars.num_7:
        case Chars.num_8:
        case Chars.num_9:
          val = this.scanNumber();

          return {
            start: start,
            end: this.pos,
            value: val,
            kind: SyntaxKind.numeric_literal
          };

        // case Chars.x:
        // case Chars.X:
        //   // todo: mysql hex literal X'

        // case Chars.N // begin nvarchar literal.

        case Chars.singleQuote:
          val = this.scanString()

          return new Token(SyntaxKind.string_literal, start, this.pos)
        case Chars.doubleQuote:
          // todo: quoted identifier
          //
          break;
        case Chars.at:
          if (this.peek() === Chars.at) {
            // parse config function
            this.pos++;

            // todo: parse config function.
          } else {
            val = this.scanIdentifier()

            return {
              kind: SyntaxKind.local_variable_reference,
              start: start,
              end: this.pos,
              value: val
            }
          }
          // is it atat?
          // or a local?

        case Chars.hash:
          // I believe temp


        default: {
          const identifier = this.scanIdentifier()
          const keyword = keywords.get(identifier)
          
        }
      }

      // todo: each thing should return when it finds a token.
      break;
    }

    return new Token(SyntaxKind.unknown, start, this.pos);
  }
}