"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const space = ' '.charCodeAt(0);
const tab = '\t'.charCodeAt(0);
const newline = '\n'.charCodeAt(0);
class Scanner {
    constructor(text, options) {
        this.options = options;
        this.text = text;
        this.pos = 0;
        this.len = text.length;
    }
    whitespace() {
        let token = this.text.charCodeAt(this.pos);
        while (token === space || token === tab) {
            this.pos++;
            token = this.text.charCodeAt(this.pos);
        }
    }
    scanString() {
        return 'TODO';
    }
    scanInlineComment() {
        let start = this.pos;
        var ch = -1;
        while (this.pos < this.len) {
            ch = this.text.charCodeAt(this.pos);
            if (ch === newline) {
                return this.text.substring(start, this.pos);
            }
            this.pos++;
        }
        return '';
    }
}
class Parser {
    constructor(options) {
        this.options = options;
    }
    visit(scanner) {
        while (true) {
            switch (scanner.token) {
                case ' ':
                case '\t':
                    scanner.whitespace();
                    break;
            }
        }
    }
    scan(script) {
        return new Scanner(script, {});
    }
    parse(script) {
        let scanner = this.scan(script);
        let statements = this.visit(scanner);
        return statements;
    }
}
exports.Parser = Parser;
;
