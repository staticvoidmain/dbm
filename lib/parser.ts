// okay, let's keep this on hold for a bit.
// I may have opened myself up to some annoying complications by supporting
// code generation for multiple platforms...
import * as syntax from './syntax'

const space = ' '.charCodeAt(0)
const tab = '\t'.charCodeAt(0)
const newline = '\n'.charCodeAt(0)

/**
 * heavily inspired by the typescript compiler's scanner/lexer
 * @param {Object} options
 */
class Scanner {
  options: any;
  text: string;
  pos: number;
  len: number;

  constructor(text, options) {
    this.options = options
    this.text = text
    this.pos = 0
    this.len = text.length
  }

  whitespace() {
    let token = this.text.charCodeAt(this.pos)
    while (token === space || token === tab) {
      this.pos++;

      token = this.text.charCodeAt(this.pos)
    }
  }

  // starting at pos, returns the string, not that it matters.
  scanString() {
    return 'TODO'
  }

  scanInlineComment() {
    let start = this.pos
    var ch = -1
    // doesn't count as a statement. might not even emit it.
    while (this.pos < this.len) {
      ch = this.text.charCodeAt(this.pos)

      if (ch === newline) {
        return this.text.substring(start, this.pos)
      }

      this.pos++
    }

    return ''
  }
}

export class Parser {
  options: any;
  state: any;

  constructor(options) {
    this.options = options
  }

  visit(scanner) {

    let statements = []

    // todo: this isn't strictly right.
    while (scanner.pos < scanner.len) {
      
      switch (scanner.token) {
        case ' ':
        case '\t':
          scanner.whitespace()
          break
      }
    }

    return statements
  }

  scan(script) {
    // todo: options what was my plan here?
    return new Scanner(script, {

    })
  }

  parse(script) {
    let scanner = this.scan(script)
    let statements = this.visit(scanner)

    return statements
  }
};
