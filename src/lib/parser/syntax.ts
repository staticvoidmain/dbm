export const enum SyntaxKind {
  unknown,
  // tokens
  whitespace,
  newline,
  openParen,
  closeParen,
  openBracket,
  closeBracket,
  at,                   // *
  atAt,                 // @@
  ltGt,                 // <>
  notEqual,             // !=
  equal,                // =
  lessThan,             // <
  greaterThan,          // >
  lessThanEqual,        // <=
  greaterThanEqual,     // >=
  singleLineComment,    // --
  blockCommentStart,    // /*
  blockCommentEnd,      // */
  // keywords
  go,
  null,
  and,
  or,
  as,
  is,
  if,
  else,
  while,
  case,
  begin,
  exists,
  end,
  when,
  then,
  select,
  insert,
  create,
  update,
  delete,
  truncate,
  drop,
  alter,
  declare,
  use,
  set,
  procedure,
  trigger,
  column,
  miscKeyword, // to sneak around the pgsql/mssql/mysql diffs

  // expressions
  blockComment,
  select_expession,
  into_expression,
  from_clause,
  where_clause,
  group_by,
  order_by,
  having_clause,
  begin_transaction,
  commit_transaction,
  rollback_transaction,
  temp_table,
  shared_temp_table,
  local_variable_reference,
  boolean_expression,
  numeric_literal,
  boolean_literal,
  string_literal,
  quoted_identifier,
  table_alias,
  column_alias,
  // todo: all kinds of kinds
}

// todo: create a map of keywords and tokens to syntax kind.
