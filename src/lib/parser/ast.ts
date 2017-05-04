/*

map a SIMPLE sql grammar that accepts
as many kinds of sql specifications as possible

// totally made up AST based on zero CS theory or practical
// knowledge of how parsers and scanners should work. :)

  if (@x > 10)
  begin
    select *
    from Foo.Bar.Baz
    where Val > @x or Val < @x
  end

  if_statement
    binary_expression
      left: variable(@x)
      op: greater_than
      right: numeric_literal(10)
    block
      begin_keyword
      expression
        select_statement
          columns: [
            select_all_columns
          ]
        from_clause
          table_identity
            db: Label<Foo>
            schame: Label<Bar>
            table: Label<Baz>
        where_clause
          binary_expression
            left:
              binary_expression
            op: or_operator
            right:
              binary_expression

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

export interface SelectNode extends SyntaxNode {
  columns: Array<ColumnNode>
  from: FromClause
  into: IntoClause
  where?: WhereClause
  // todo: account for these.
  order_by?: any
  group_by?: any
  having?: any
}

// todo: name node OR an aliased expression
// what to do?

export type ColumnNode = ColumnExpression | NamedColumn

export interface NamedColumn extends SyntaxNode {
  column: Identitifier
  table?: Identitifier
  alias?: string
}

export interface ColumnExpression extends SyntaxNode {
  expression: ValueExpression
  alias?: string
}

export interface BinaryExpression extends SyntaxNode {

}

// really just anything but BinaryExpr
export type ValueExpression =
FunctionExpression
| ConstantExpression
| CaseExpression
// todo: more

export interface ConstantExpression extends SyntaxNode {
  value: any
}

export interface CaseExpression extends SyntaxNode {
  cases: Array<WhenExpression>
  else: FunctionExpression | ConstantExpression
}

export interface WhenExpression extends SyntaxNode {
  when: BinaryExpression
  then: FunctionExpression | ConstantExpression
}

export interface FunctionExpression {

}


export interface WhereClause extends SyntaxNode {
  // predicate
}

export interface IntoClause extends SyntaxNode {
  target: Identifier
  
}

export interface FromClause extends SyntaxNode {
  // todo
}

export interface DeclareStatement extends SyntaxNode {
  // todo: support duplicate declarations in a single declare
}

export interface WhereClause extends SyntaxNode {

}
