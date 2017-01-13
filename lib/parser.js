'use strict'

const syntax = require('./syntax')
/**
 * heavily inspired by the typescript compiler's scanner/lexer
 * @param {Object} options
 */
function Scanner (text, options) {
  this.options = options
  this.text = text
  this.pos = 0
  this.len = text.length
}

Scanner.prototype.scanInlineComment = function () {
  let start = this.pos
  var ch = -1
  // doesn't count as a statement. might not even emit it.
  while (this.pos < this.len) {
    ch = this.text.charCodeAt(this.pos)

    if (ch === syntax.newline) {
      return this.text.substring(start, this.pos)
    }

    this.pos++
  }

  return ''
}

// starting at pos, returns the string, not that it matters.
Scanner.prototype.scanString = function () {
  return 'TODO'
}

function scan (script) {
  return new Scanner(script)
}

function Parser (options) {
  this._options = options
};

function visit (scanner) {
  while (true) {
    // do stuff.
    switch (scanner.token) {
      case ' ':
      case '\t':
        scanner.whitespace()
        break
    }
  }
}

Parser.prototype.parse = function (script) {
  let scanner = scan(script)
  let statements = visit(scanner)

  return statements
}

module.exports = Parser
