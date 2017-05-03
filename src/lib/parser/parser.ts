// okay, let's keep this on hold for a bit.
// I may have opened myself up to some annoying complications by supporting
// code generation for multiple platforms...
import { Scanner } from './scanner'
import { Chars } from './keys'
import { SyntaxKind } from './syntax';
import { SyntaxNode } from './ast'

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

export class ParseTree {
  nodes: Array<SyntaxNode>
}

export class Parser {
  private scanner: Scanner

  private next(): SyntaxNode {

    const statements = []

    while (true) {
      const token = this.scanner.scan()

      switch (token.kind) {
        case SyntaxKind.use:
        // todo: parse the database if this is mssql.
        case SyntaxKind.declare:
          this.scanner.scanVariableDeclarationList()
        // todo: declare some locals

        case SyntaxKind.select:
          // todo: perhaps this is too complex for the scanner... we don't have a terminal
          // to know when we're done scanning.
          this.scanner.scanSelectColumnList()
          let fromOrInto = this.expect(SyntaxKind.from_clause | SyntaxKind.into_expression)
          if (fromOrInto.kind === SyntaxKind.into_expression) {

          }


        case SyntaxKind.insert:
          // todo: insert into X values (xyz)
          // todo: insert X select Y from Z
        case SyntaxKind.update:
        case SyntaxKind.create:
        case SyntaxKind.drop:

        default:
          break
      }

    }
  }

  private expect(kind: SyntaxKind) {
    const next = this.scanner.scan();
    if (next.kind !== kind) {
      // error?
    }
  }
  private expect(kind: SyntaxKind) {
    const next = this.scanner.scan();
    if (next.kind !== kind) {
      // error?
    }
  }



  /**
   * Parse a given sql string into a tree.
   *
   * @param script the script to parse.
   * @returns a list of statements within the script.
   */
  parse(script, info): ParseTree {
    this.scanner = new Scanner(script, { skipTrivia: true });

    return undefined

    /*
    // this is sync CPU bound
    this.scan(script)
    while (true) {
      const token = this.next()

      // push things into the array of statements.
      // todo: handle all the tokens.
    }

    // return statements

    */
  }
};
