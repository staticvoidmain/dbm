export const inlineComment = '--'
export const blockCommentStart = '/*'
export const blockCommentEnd = '*/'
export const newline = "\n"

// should this be a lookup?
export const syntax = {
  whitespace: 0,
  keyword: 1,
  semicolon: 2,
  lineComment: 3,
  blockComment: 4
}

// todo: make the statement types an enum?
export const types = {
  token: {
    // todo: I have no idea what I'm modeling this after.
    // I feel like this should be flattened.
  },
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
    begin_transaction: 13,
    commit_transaction: 14,
    rollback_transaction: 15
  }
}
