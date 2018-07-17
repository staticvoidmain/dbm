/*
  This is the linting section which parses your scripts and calls out inconsistencies in style.

  TODO: spellchecker?
  TODO: read the eslint source for inspiration.
  TODO: this should be parseable from a yml file
  TODO: this should be scoped to a specific database vendor.
   (think vscode settings)
   mssql.no_nolock: true
 */

import { SyntaxNode } from '../lib/parser/ast'
import { Parser } from '../lib/parser/parser'
import { SyntaxKind } from '../lib/parser/syntax'
import { Chars } from '../lib/parser/keys';

// note: these are going to likely be platform specific.
// also, I'm totally making these names up as I go as a form of note taking.

// some name validators
const nameValidators = {
  'PascalCase': /^(?:[A-Z][a-z]+)+$/,
  'camelCase': /^[a-z]+(?:[A-Z][a-z]+)+$/,
  'snake_case': /^[a-z]+(?:_[a-z]+)*$/,
  'SCREAMING_SNAKE_CASE': /^[A-Z]+(?:_[A-Z])*$/
}

const rules = {

  keyword_case: 'lower',

  indent_style: 'spaces',

  /**
   * other options:
   * - SCREAMING_SNAKE_CASE
   * - 4N4rChY
   */
  allowed_identifier_styles: [
    'PascalCase',
    'camelCase',
    'snake_case'
  ],

  allow_upper_ID: false,

  // create <type> Schema.SomeObjectName
  create_must_include_schema: true,

  // disallows the use of time-zone specific getdate()
  prefer_utc_time: true,

  // currently not tracked.
  // requires trivia to be enabled.
  no_trailing_space: true,

  // inner | (left | right) join
  require_explicit_join_type: true,

  /**
   * most people do this anyway, but we'll make it required
   */
  procedure_requires_doc_string: true,

  view_requires_doc_string: false,

  /**
   * disallow the obvious use of hungarian notation in identifiers
   */
  not_from_hungary: true,

  // look out for n'quote' MSSQL
  must_use_unicode_strings: false,

  /**
   * ex: select * from DbName..Foo
   */
  no_lazy_schema_resolution: true,

  // from F f -> from F as f
  aliases_require_as: false,

  /**
   * dirty reads should be off by default
   */
  no_nolock: true,

  // line lengths exceeding N characters are too long
  max_line_length: 80,

  max_consecutive_blank_lines: 1,

  // we'll prefer the more portable style
  select_column_style: 'expr_as_name',

  block_style: 'require_begin_end',

  // braces | quotes | none
  quoted_identifier_style: 'quotes',

  disallowed_functions: [
    'xp_cmdshell',
    'EXECUTE'
  ],

  // just some general problem patterns
  // could be info | warn | error

  /**
   * using datatypes (n)char, (n)varchar, (n)text
   * without specifying length args
   *
   * exceptions: cast(1234 as varchar) works as intended...
   */
  missing_string_length: 'error',

  /**
   * usage of decimal | numeric | float | real datatypes
   * without specifying any arguments for (scale, precision)
   */
  missing_number_args: 'error',

  /**
   * when using a value comparison against null
   * or something that could be null
   */
  broken_null_comparison: 'error',

  /**
   * delete / update without a where clause
   */
  modify_without_where_clause: 'error',

  /**
   * "SARG-ability" test
   * when a 'where' clause contains an expression
   * that would defeat indexing
   */
  non_seekable_predicate: 'warning',

  /**
   * dividing by a column value that could be zero
   * which might raise divide-by-zero
   */
  divide_by_column: 'warning',

  /**
   * the default can be changed via ANSI_NULL_DFLT_ON,
   * so it's better to be explicit
   */
  column_decl_missing_nullability: 'warning',

  /**
   * a table identifier only has a single 'part'
   */
  missing_schema_name: 'warning',

  /**
   * sp_help vs exec sp_help
   */
  missing_exec_for_procedure_call: 'warning',

  // prefer exists
  count_greater_than_zero: 'warning'
}

function isUpperChar(n: number) {
  return Chars.A <= n && n <= Chars.Z
}

function isLowerChar(n: number) {
  return Chars.a <= n && n <= Chars.a
}

function isHungarian(name: string) {
  // there are probably lots more of these
  // floating around.
  if (/^(?:udf|usp|pr|vw|tbl|fn)[_A-Z]/.test(name)) {
    return true
  }

  // column data type embedding:
  // nSomeInt, dSomeDate, bSomeBit, cSomeVarchar
  return isLowerChar(name.charCodeAt(0))
    && isUpperChar(name.charCodeAt(1))
}

function visit (node, handlers) {

  for (const visitor of handlers) {
    if (visitor.match(node.kind)) {
      visitor.action(node)
    }
  }

  for (const child of node.children) {
    visit(child, handlers)
  }
}

// todo: there's a flag for this now
function isKeyword(node: SyntaxNode): boolean {
  return false
  // return kind >= SyntaxKind.add_keyword
  //   && kind <= SyntaxKind.with_keyword
}

// todo: capture the case info in the AST
function requireCase(type) {
  return (node) => {
    // stuff
  }
}

interface Visitor {
  match: (SyntaxNode) => boolean,
  action: (SyntaxNode) => void
}

export class Linter {
  rules: any;
  handlers: Visitor[]

  // todo: specify the LinterOptions type.
  constructor(options) {
    this.rules = Object.assign(rules, options)
  }

  lint (script) {
    const parser = new Parser()
    const tree = parser.parse(script, {})
    const result = []

    // todo: put the rules into classes
    // so we don't have to register for node callbacks.
    // that don't matter.
    if (rules.keyword_case) {
      this.handlers.push({
        match: isKeyword,
        action: requireCase(rules.keyword_case)
      });
    }

    tree.nodes.forEach(n => {
      visit(n, this.handlers);
    });
  }
}
