// we could name this NodeType or something so it isn't a blatant
// ripoff of typescript.
export const enum SyntaxKind {
  Unknown,
  // tokens
  singleLineComment,
  blockComment,
  openParen,
  closeParen,
  openBracket,
  closeBracket,
  at,                   // *
  atAt,                 // @@
  ltGt,                 // <>

  // keywords
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
  miscKeyword, // to sneak around the pgsql/mssql/mysql diffs

  // expressions
  select_expession,
  from_clause,
  where_clause,
  group_by,
  order_by,
  having_clause,
  begin_transaction,
  commit_transaction,
  rollback_transaction,
  temp_table_reference,
  variable_reference,
  boolean_expression,
  numeric_literal,
  boolean_literal,
  string_literal,

  // todo: all kinds of kinds
}

// todo: create a map of keywords and tokens to syntax kind.
