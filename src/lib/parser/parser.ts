// okay, let's keep this on hold for a bit.
// I may have opened myself up to some annoying complications by supporting
// code generation for multiple platforms...
import * as syntax from './syntax'
import {Chars} from './keys'

// todo: map these to syntaxkinds, and all the other crazy unsupported
// keywords just map to SyntaxKind.miscKeyword
const reserved = [
  'add', 'all', 'alter', 'and', 'any', 'as', 'asc',
  'authorization', 'backup', 'begin', 'between', 'break', 'browse',
  'bulk', 'by', 'cascade', 'case', 'check', 'checkpoint', 'close',
  'clustered', 'coalesce', 'collate', 'column', 'commit',
  'compute', 'constraint', 'contains', 'containstable', 'continue',
  'convert', 'create', 'cross', 'current', 'current_date',
  'current_time', 'current_timestamp', 'current_user', 'cursor',
  'database', 'dbcc', 'deallocate', 'declare', 'default', 'delete',
  'deny', 'desc', 'disk', 'distinct', 'distributed', 'double',
  'drop', 'dump', 'else', 'end', 'errlvl', 'escape', 'except',
  'exec', 'execute', 'exists', 'exit', 'external', 'fetch', 'file',
  'fillfactor', 'for', 'foreign', 'freetext', 'freetexttable',
  'from', 'full', 'function', 'goto', 'grant', 'group', 'having',
  'holdlock', 'identity', 'identity_insert', 'identitycol', 'if',
  'in', 'index', 'inner', 'insert', 'intersect', 'into', 'is',
  'join', 'key', 'kill', 'left', 'like', 'lineno', 'load', 'merge',
  'national', 'nocheck', 'nonclustered', 'not', 'null', 'nullif',
  'of', 'off', 'offsets', 'on', 'open', 'opendatasource',
  'openquery', 'openrowset', 'openxml', 'option', 'or', 'order',
  'outer', 'over', 'percent', 'pivot', 'plan', 'precision',
  'primary', 'print', 'proc', 'procedure', 'public', 'raiserror',
  'read', 'readtext', 'reconfigure', 'references', 'replication',
  'restore', 'restrict', 'return', 'revert', 'revoke', 'right',
  'rollback', 'rowcount', 'rowguidcol', 'rule', 'save', 'schema',
  'securityaudit', 'select', 'semantickeyphrasetable',
  'semanticsimilaritydetailstable', 'semanticsimilaritytable',
  'session_user', 'set', 'setuser', 'shutdown', 'try_convert',
  'tsequal', 'union', 'unique', 'unpivot', 'update', 'updatetext',
  'use', 'user', 'values', 'varying', 'view', 'waitfor', 'when',
  'where', 'while', 'with', 'within group', 'writetext'
]

export class Parser {
  options: any;
  state: any;

  constructor(options) {
    this.options = options
  }

  visit(scanner) {

    const statements = []

    while (scanner.pos <= scanner.len) {

      switch (scanner.token) {
        case Chars.space:
        case Chars.tab:
          scanner.whitespace()
          break

        default:
          break
      }

      scanner.pos++
    }

    return statements
  }

  scan(script) {
    // todo: options what was my plan here?
    return new Scanner(script, {

    })
  }
  /**
   * Parse a given sql string into... blocks.
   *
   * TODO: figure out a good AST for this.
   *
   * @param script the script to parse.
   * @returns a list of statements within the script.
   */
  parse(script) {
    const scanner = this.scan(script)
    const statements = this.visit(scanner)

    return statements
  }
};
