import {Chars} from './keys'
import {SyntaxKind} from './syntax'

/**
 * heavily inspired by the typescript compiler's scanner/lexer
 * @param {Object} options
 */

function isDigit(charCode): boolean {
  return Chars.num_0 <= charCode && charCode <= Chars.num_9
}

function isIdentifierStart(charCode): boolean {
  // sql should be... words only?
  return Chars.num_0 <= charCode && charCode <= Chars.num_9
}


export class Token {
  value: any
  kind: SyntaxKind
}

export class Scanner {
  private pos: number;

  private readonly options: any;
  private readonly text: string;
  private readonly len: number;

  constructor(text, options) {
    this.options = options
    this.text = text
    this.pos = 0
    this.len = text.length
  }

  whitespace() {
    let token = this.text.charCodeAt(this.pos)
    while (token === Chars.space || token === Chars.tab) {
      this.pos++;

      token = this.text.charCodeAt(this.pos)
    }
  }

  // starting at pos, returns the string, not that it matters.
  scanString() {
    return 'TODO'
  }

  scanVariable() {

  }

  scanIdentifier() {

  }

  // todo: scan block comment.

  scanBlockComment() {

  }

  private peek(): number {
    // charCodeAt returns NaN if we go out of bounds.
    // nice.
    return this.text.charCodeAt(this.pos + 1)
  }

  scanInlineComment() {
    const start = this.pos
    let ch = -1
    // doesn't count as a statement. might not even emit it.
    while (this.pos < this.len) {
      ch = this.text.charCodeAt(this.pos)

      if (ch === Chars.newline) {
        return this.text.substring(start, this.pos)
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

    return parseFloat(this.text.substr(start, this.pos)
  }

  scan(): Token {

    // wheeeee
    while (true) {
       const ch = this.text.charCodeAt(this.pos);

       switch (ch) {
        case Chars.newline:
          // todo: let the scanner push a newline into the map?
          // seems good.
          break;

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
          const val = this.scanNumber();
          return {
            value: val,
            kind: SyntaxKind.numeric_literal
          };
       }

       // todo: each thing should return when it finds a token.
       break;
    }






    return SyntaxKind.Unknown;
  }
}