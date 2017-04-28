/*

map a SIMPLE sql grammar that accepts
as many kinds of sql specifications as possible


// totally made up AST

  if (@x > 10)
  begin
    select *
    from Foo.Bar.Baz
    where Val > @x
  end

  if_statement
    boolean_expression
      openParen
      variable x
      greater_than
      numeric_literal 10
      closeParen
    block
      begin_keyword
      expression
        select_statement
          columns: ['*']
          source: implicit
        from_clause
          table_identity
            db: Label<Foo>
            schame: Label<Bar>
            table: Label<Baz>
        where_clause
          boolean_expression

      end_keyword
*/

import { SyntaxKind } from './syntax'

export interface Identitifier extends Node {
  text: string
}

export interface TextRange {
  pos: number
  end: number
}

export interface Node extends TextRange {
  kind: SyntaxKind
  parent?: Node
}

// todo: types and interfaces oh my!
export type CommentKind =
  SyntaxKind.singleLineComment
  | SyntaxKind.blockComment;

export interface CommentRange extends TextRange {
  hasTrailingNewLine?: boolean;
  kind: CommentKind;
}
