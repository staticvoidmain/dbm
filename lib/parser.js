'use strict'

const inlineComment = '--'
const blockCommentStart = '/*'
const blockCommentEnd = '*/'

const syntax = {
  whitespace: 0,
  keyword: 1,
  semicolon: 2,
  lineComment: 3,
  blockComment: 4,
}

/**
 * heavily inspired by the typescript compiler's scanner/lexer
 * @param {Object} options
 */
function Scanner(text, options) { 
  this.options = options;
  this.text = text;
  this.pos = 0;
  this.len = text.length;
}

Scanner.prototype.scanInlineComment = function() {
  // doesn't count as a statement. might not even emit it.
  while (pos < len) {
    
    
    
    pos++;
  }

  return comment;
}

// starting at pos, returns the string, not that it matters.
Scanner.prototype.scanString = function() { 

}

function scan(script) {
  return new Scanner(script);
}

function Parser(options) { 
  this._options = options;
};

function visit(scanner) {
  while (true) {
    // do stuff.
    
  }
}

Parser.prototype.parse = function(script) { 
  var scanner = scan(script);
  var statements = visit(tokens);

  return statements;
}

module.exports = Parser;