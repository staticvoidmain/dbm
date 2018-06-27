/*
  This is the linting section which parses your scripts and calls out inconsistencies in style.

  It's going to be an interesting ride.

  TODO: read the eslint source for inspiration.
  TODO: this should be parseable from a yml file
  TODO: this should be scoped to a specific database vendor.
   (think vscode settings)
   mssql.no_nolock: true
 */

import { SyntaxNode } from '../lib/parser/ast'
import { Parser } from '../lib/parser/parser'
import { SyntaxKind } from '../lib/parser/syntax'

// note: these are going to likely be platform specific.
// also, I'm totally making these names up as I go as a form of note taking.
const rules = {

  keyword_case: 'lower',

  key_names_must_end_with_id: true,

  // SomeID is just shouting.
  // Prefer SomeId instead
  sensible_id_casing: true,

  // create <type> Schema.SomeObjectName
  create_must_include_schema: true,

  // disallows the use of time-zone specific getdate()
  prefer_utc_time: true,
  no_execsql: true,
  no_trailing_space: true,

  // not sure about this one.
  // procedures_require_grant: true,
  no_underscores_in_columns: false,

  blocks_must_use_begin_end: true,

  // INNER OUTER LEFT CROSS etc.
  require_explicit_join_type: true,
  // documentation yo
  procedure_requires_doc_string: false,

  procedure_name_prefix: 'pr_',

  // NO hungarian names allowed, ever.
  not_from_hungary: true,

  // look out for n'quote' MSSQL
  must_use_unicode_strings: false,
  /**
   * ex: select * from DbName..Foo
   * just because
   */
  no_lazy_schema_resolution: true,

  // from F f -> from F as f
  table_aliases_require_as: true,

  /**
   * dirty reads should be off by default
   */
  no_nolock: true,
}

function isUpper (token) {
  // assumes this is a word token
  for (let i = 0, len = token.length; i < len; i++) {
    const char = token.charCodeAt(i)
    if (char > 90) {
      return false
    }
  }

  return true
}

function isHungarian(name: string) {
  // we'll just test the most common ones.
  const c = name[0];

  return c === 'n' || c === 'd';
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

function isKeyword(kind: SyntaxKind): boolean {
  return kind >= SyntaxKind.addKeyword
    && kind <= SyntaxKind.withKeyword
}

// todo: capture the case info in the AST
function requireCase(type) {
  return (node) => {
    // stuff
  }
}

interface Visitor {
  match: (SyntaxKind) => boolean,
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
