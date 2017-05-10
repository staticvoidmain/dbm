/*
  This is the linting section which parses your scripts and calls out inconsistencies in style.

  It's going to be an interesting ride.

  TODO: read the eslint source for inspiration.
  TODO: this should be parseable from a yml file
  TODO: this should be scoped to a specific database vendor.
   (think vscode settings)
   mssql.no_nolock: true
 */

import {Parser} from '../lib/parser/parser'
import {SyntaxKind} from '../lib/parser/syntax'

// note: these are going to likely be platform specific.
// also, I'm totally making these names up as I go as a form of note taking.
const rules = {
  key_names_must_end_with_id: true,

  // SomeID is just shouting.
  // Prefer SomeId instead
  sensible_id_casing: true,
  keywords_must_be_lower: true,

  // if you are some kind of MONSTER...
  keywords_must_be_upper: false,

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
  procedure_requires_doc_string: false,
  procedure_name_must_begin_with_prefix: true,

  // NO hungarian names allowed, ever.
  not_from_hunary: true,

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
  no_nolock: true
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

function visit (node, kind, callback) {
  if (node.kind === kind) {
    callback(node)
  }

  for (const child of node.children) {
    visit(child, kind, callback)
  }
}

function evaluate (rule, statement, lintResult) {
  return
}

export class Linter {
  rules: any;

  // todo: specify the LinterOptions type.
  constructor(options) {
    this.rules = Object.assign(rules, options)
  }

  lint (script) {
    const parser = new Parser()
    const tree = parser.parse(script, {})
    const result = []

    tree.nodes.forEach((statement) => {

      for (const key in this.rules) {
        const rule = this.rules[key]
        if (rule) {
          evaluate(key, statement, result)
        }
      }
    })

    return result
  }
}
