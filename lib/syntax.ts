// todo: a bunch of constants and shit.
const inlineComment = '--'
const blockCommentStart = '/*'
const blockCommentEnd = '*/'

const syntax = {
  whitespace: 0,
  keyword: 1,
  semicolon: 2,
  lineComment: 3,
  blockComment: 4
}

module.exports = {
  token: { },
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
    // now we're getting fucking serious.
    begin_transaction: 13
  }
}
