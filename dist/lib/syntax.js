"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inlineComment = '--';
exports.blockCommentStart = '/*';
exports.blockCommentEnd = '*/';
exports.newline = "\n";
exports.syntax = {
    whitespace: 0,
    keyword: 1,
    semicolon: 2,
    lineComment: 3,
    blockComment: 4
};
exports.types = {
    token: {},
    statement: {
        select: 1,
        insert: 2,
        create: 3,
        update: 4,
        delete: 6,
        truncate: 7,
        drop: 8,
        alter: 9,
        declare: 10,
        use: 11,
        set: 12,
        begin_transaction: 13,
        commit_transaction: 14,
        rollback_transaction: 15
    }
};
