/*

map a SIMPLE sql grammar that accepts
as many kinds of sql specifications as possible


// totally made up AST

  if (@x > 10)
  begin
    select *
    from Foo.Bar.Baz
    where Val > @x or Val < @x
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

export type LogicalOperator =
  SyntaxKind.lessThan
  | SyntaxKind.greaterThan
  | SyntaxKind.lessThanEqual
  | SyntaxKind.greaterThanEqual
  | SyntaxKind.ltGt
  | SyntaxKind.notEqual
  | SyntaxKind.equal;

export interface TextRange {
  start: number
  end: number
}

export interface SyntaxNode extends TextRange {
  kind: SyntaxKind
  parent?: Node
}

export interface Identitifier extends SyntaxNode {
  text: string
}

export type Comment =
  SyntaxKind.singleLineComment
  | SyntaxKind.blockComment;

export interface CommentRange extends TextRange {
  kind: Comment;
}

export interface WhereClause extends SyntaxNode {
  // predicate
}

export interface FromClause extends SyntaxNode {
  
}

export interface DeclareStatement extends SyntaxNode {
  // todo: support duplicate declarations in a single declare
}

export interface WhereClause extends SyntaxNode {

}
