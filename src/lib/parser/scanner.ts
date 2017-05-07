import { Chars } from './keys'
import { SyntaxKind } from './syntax'

function isLetter(ch): boolean {
  return Chars.A >= ch && ch <= Chars.Z
      || Chars.a >= ch && ch <= Chars.z
}

function isDigit(charCode): boolean {
  return Chars.num_0 <= charCode && charCode <= Chars.num_9
}

/**
 * Basic token state so I don't have to read everything off the parser.
 * though, realistically, that's probably going to happen.
 */
export class Token {
  start: number
  end: number
  kind: SyntaxKind
  value?: any
  flags?: number

  constructor(kind, start, end) {
    this.kind = kind
    this.start = start
    this.end = end
  }
}

const keywordMap = new Map<string, SyntaxKind>([
  [ 'add',               SyntaxKind.addKeyword ],
  [ 'all',               SyntaxKind.allKeyword ],
  [ 'alter',             SyntaxKind.alterKeyword ],
  [ 'and',               SyntaxKind.andKeyword ],
  [ 'any',               SyntaxKind.anyKeyword ],
  [ 'as',                SyntaxKind.asKeyword ],
  [ 'asc',               SyntaxKind.ascKeyword ],
  [ 'authorization',     SyntaxKind.authorizationKeyword ],
  [ 'backup',            SyntaxKind.backupKeyword ],
  [ 'begin',             SyntaxKind.beginKeyword ],
  [ 'between',           SyntaxKind.betweenKeyword ],
  [ 'break',             SyntaxKind.breakKeyword ],
  [ 'by',                SyntaxKind.byKeyword ],
  [ 'cascade',           SyntaxKind.cascadeKeyword ],
  [ 'case',              SyntaxKind.caseKeyword ],
  [ 'check',             SyntaxKind.checkKeyword ],
  [ 'checkpoint',        SyntaxKind.checkpointKeyword ],
  [ 'close',             SyntaxKind.closeKeyword ],
  [ 'clustered',         SyntaxKind.clusteredKeyword ],
  [ 'coalesce',          SyntaxKind.coalesceKeyword ],
  [ 'collate',           SyntaxKind.collateKeyword ],
  [ 'column',            SyntaxKind.columnKeyword ],
  [ 'commit',            SyntaxKind.commitKeyword ],
  [ 'compute',           SyntaxKind.computeKeyword ],
  [ 'constraint',        SyntaxKind.constraintKeyword ],
  [ 'contains',          SyntaxKind.containsKeyword ],
  [ 'containstable',     SyntaxKind.containstableKeyword ],
  [ 'continue',          SyntaxKind.continueKeyword ],
  [ 'convert',           SyntaxKind.convertKeyword ],
  [ 'create',            SyntaxKind.createKeyword ],
  [ 'cross',             SyntaxKind.crossKeyword ],
  [ 'current',           SyntaxKind.currentKeyword ],
  [ 'current_date',      SyntaxKind.current_dateKeyword ],
  [ 'current_time',      SyntaxKind.current_timeKeyword ],
  [ 'current_timestamp', SyntaxKind.current_timestampKeyword ],
  [ 'current_user',      SyntaxKind.current_userKeyword ],
  [ 'cursor',            SyntaxKind.cursorKeyword ],
  [ 'database',          SyntaxKind.databaseKeyword ],
  [ 'dbcc',              SyntaxKind.dbccKeyword ],
  [ 'deallocate',        SyntaxKind.deallocateKeyword ],
  [ 'declare',           SyntaxKind.declareKeyword ],
  [ 'default',           SyntaxKind.defaultKeyword ],
  [ 'delete',            SyntaxKind.deleteKeyword ],
  [ 'deny',              SyntaxKind.denyKeyword ],
  [ 'desc',              SyntaxKind.descKeyword ],
  [ 'disk',              SyntaxKind.diskKeyword ],
  [ 'distinct',          SyntaxKind.distinctKeyword ],
  [ 'distributed',       SyntaxKind.distributedKeyword ],
  [ 'double',            SyntaxKind.doubleKeyword ],
  [ 'drop',              SyntaxKind.dropKeyword ],
  [ 'dump',              SyntaxKind.dumpKeyword ],
  [ 'else',              SyntaxKind.elseKeyword ],
  [ 'end',               SyntaxKind.endKeyword ],
  [ 'errlvl',            SyntaxKind.errlvlKeyword ],
  [ 'escape',            SyntaxKind.escapeKeyword ],
  [ 'except',            SyntaxKind.exceptKeyword ],
  [ 'exec',              SyntaxKind.execKeyword ],
  [ 'execute',           SyntaxKind.executeKeyword ],
  [ 'exists',            SyntaxKind.existsKeyword ],
  [ 'exit',              SyntaxKind.exitKeyword ],
  [ 'external',          SyntaxKind.externalKeyword ],
  [ 'fetch',             SyntaxKind.fetchKeyword ],
  [ 'file',              SyntaxKind.fileKeyword ],
  [ 'fillfactor',        SyntaxKind.fillfactorKeyword ],
  [ 'for',               SyntaxKind.forKeyword ],
  [ 'foreign',           SyntaxKind.foreignKeyword ],
  [ 'freetext',          SyntaxKind.freetextKeyword ],
  [ 'freetexttable',     SyntaxKind.freetexttableKeyword ],
  [ 'from',              SyntaxKind.fromKeyword ],
  [ 'full',              SyntaxKind.fullKeyword ],
  [ 'function',          SyntaxKind.functionKeyword ],
  [ 'goto',              SyntaxKind.gotoKeyword ],
  [ 'grant',             SyntaxKind.grantKeyword ],
  [ 'group',             SyntaxKind.groupKeyword ],
  [ 'having',            SyntaxKind.havingKeyword ],
  [ 'holdlock',          SyntaxKind.holdlockKeyword ],
  [ 'identity',          SyntaxKind.identityKeyword ],
  [ 'identity_insert',   SyntaxKind.identity_insertKeyword ],
  [ 'identitycol',       SyntaxKind.identitycolKeyword ],
  [ 'if',                SyntaxKind.ifKeyword ],
  [ 'in',                SyntaxKind.inKeyword ],
  [ 'index',             SyntaxKind.indexKeyword ],
  [ 'inner',             SyntaxKind.innerKeyword ],
  [ 'insert',            SyntaxKind.insertKeyword ],
  [ 'intersect',         SyntaxKind.intersectKeyword ],
  [ 'into',              SyntaxKind.intoKeyword ],
  [ 'is',                SyntaxKind.isKeyword ],
  [ 'join',              SyntaxKind.joinKeyword ],
  [ 'key',               SyntaxKind.keyKeyword ],
  [ 'kill',              SyntaxKind.killKeyword ],
  [ 'left',              SyntaxKind.leftKeyword ],
  [ 'like',              SyntaxKind.likeKeyword ],
  [ 'load',              SyntaxKind.loadKeyword ],
  [ 'merge',             SyntaxKind.mergeKeyword ],
  [ 'nocheck',           SyntaxKind.nocheckKeyword ],
  [ 'nonclustered',      SyntaxKind.nonclusteredKeyword ],
  [ 'not',               SyntaxKind.notKeyword ],
  [ 'null',              SyntaxKind.nullKeyword ],
  [ 'nullif',            SyntaxKind.nullifKeyword ],
  [ 'of',                SyntaxKind.ofKeyword ],
  [ 'off',               SyntaxKind.offKeyword ],
  [ 'offsets',           SyntaxKind.offsetsKeyword ],
  [ 'on',                SyntaxKind.onKeyword ],
  [ 'open',              SyntaxKind.openKeyword ],
  [ 'opendatasource',    SyntaxKind.opendatasourceKeyword ],
  [ 'openquery',         SyntaxKind.openqueryKeyword ],
  [ 'openrowset',        SyntaxKind.openrowsetKeyword ],
  [ 'openxml',           SyntaxKind.openxmlKeyword ],
  [ 'option',            SyntaxKind.optionKeyword ],
  [ 'or',                SyntaxKind.orKeyword ],
  [ 'order',             SyntaxKind.orderKeyword ],
  [ 'outer',             SyntaxKind.outerKeyword ],
  [ 'over',              SyntaxKind.overKeyword ],
  [ 'percent',           SyntaxKind.percentKeyword ],
  [ 'pivot',             SyntaxKind.pivotKeyword ],
  [ 'plan',              SyntaxKind.planKeyword ],
  [ 'precision',         SyntaxKind.precisionKeyword ],
  [ 'primary',           SyntaxKind.primaryKeyword ],
  [ 'print',             SyntaxKind.printKeyword ],
  [ 'proc',              SyntaxKind.procKeyword ],
  [ 'procedure',         SyntaxKind.procedureKeyword ],
  [ 'public',            SyntaxKind.publicKeyword ],
  [ 'raiserror',         SyntaxKind.raiserrorKeyword ],
  [ 'read',              SyntaxKind.readKeyword ],
  [ 'readtext',          SyntaxKind.readtextKeyword ],
  [ 'reconfigure',       SyntaxKind.reconfigureKeyword ],
  [ 'references',        SyntaxKind.referencesKeyword ],
  [ 'replication',       SyntaxKind.replicationKeyword ],
  [ 'restore',           SyntaxKind.restoreKeyword ],
  [ 'restrict',          SyntaxKind.restrictKeyword ],
  [ 'return',            SyntaxKind.returnKeyword ],
  [ 'revert',            SyntaxKind.revertKeyword ],
  [ 'revoke',            SyntaxKind.revokeKeyword ],
  [ 'right',             SyntaxKind.rightKeyword ],
  [ 'rollback',          SyntaxKind.rollbackKeyword ],
  [ 'rowcount',          SyntaxKind.rowcountKeyword ],
  [ 'rule',              SyntaxKind.ruleKeyword ],
  [ 'save',              SyntaxKind.saveKeyword ],
  [ 'schema',            SyntaxKind.schemaKeyword ],
  [ 'select',            SyntaxKind.selectKeyword ],
  [ 'set',               SyntaxKind.setKeyword ],
  [ 'union',             SyntaxKind.unionKeyword ],
  [ 'unique',            SyntaxKind.uniqueKeyword ],
  [ 'unpivot',           SyntaxKind.unpivotKeyword ],
  [ 'update',            SyntaxKind.updateKeyword ],
  [ 'updatetext',        SyntaxKind.updatetextKeyword ],
  [ 'use',               SyntaxKind.useKeyword ],
  [ 'user',              SyntaxKind.userKeyword ],
  [ 'values',            SyntaxKind.valuesKeyword ],
  [ 'varying',           SyntaxKind.varyingKeyword ],
  [ 'view',              SyntaxKind.viewKeyword ],
  [ 'waitfor',           SyntaxKind.waitforKeyword ],
  [ 'when',              SyntaxKind.whenKeyword ],
  [ 'where',             SyntaxKind.whereKeyword ],
  [ 'while',             SyntaxKind.whileKeyword ],
  [ 'with',              SyntaxKind.withKeyword ]
])

// todo: more options.
export interface ScannerOptions {
  skipTrivia?: boolean
}

export class Scanner {
  private line: number
  // token start position
  private start: number
  private pos: number
  private readonly options: any
  private readonly text: string
  private readonly len: number
  private readonly lines: Array<number>

  constructor(text: string, options: ScannerOptions) {
    this.options = options
    this.text = text
    this.pos = 0
    this.len = text.length
    // todo: create line map.
  }

  getCurrentLine(): number {
    // hehe, there isn't a binary search. 4head.
    // this will sorta have to be the line map bit.
    return -1
  }

  getTokenStart() {
    return this.start
  }

  whitespace() {
    let token = this.text.charCodeAt(this.pos)
    while (token === Chars.space || token === Chars.tab) {
      token = this.text.charCodeAt(++this.pos)
    }
  }

  // advance until we find the first unescaped single quote.
  // edge case empty string.
  scanString(): string {
    const start = this.pos
    let ch = this.text.charCodeAt(this.pos)
    while (true) {

      if (ch === Chars.singleQuote) {
        if (this.peek() === Chars.singleQuote) {
          // escaped: we're still in the string boys
          this.pos++;
        } else break;
      }

      ch = this.text.charCodeAt(++this.pos)
    }

    return this.text.substr(start, this.pos - 1)
  }

  // a.b.c.fk_fbab
  scanDottedIdentifier() {
    const start = this.pos;
    let ch = this.text.charCodeAt(this.pos)
    while (this.pos < this.len) {
      if ((isLetter(ch)
        || isDigit(ch)
        || ch === Chars.underscore
        || ch === Chars.period)) break

      this.pos++

      ch = this.text.charCodeAt(this.pos)
    }

    return this.text.substr(start, this.pos - start)
  }

  /**
   * Some_Consecutive_Name1
   */
  scanIdentifier(): string {
    const start = this.pos;
    let ch = this.text.charCodeAt(this.pos)
    while (this.pos < this.len && isLetter(ch) || isDigit(ch) || ch === Chars.underscore) {
      this.pos++

      ch = this.text.charCodeAt(this.pos)
    }

    return this.text.substr(start, this.pos - start)
  }

  private peek(): number {
    // charCodeAt returns NaN if we go out of bounds.
    // nice.
    return this.text.charCodeAt(this.pos + 1)
  }

  private scanInlineComment() {
    const start = this.pos
    while (this.pos < this.len) {
      const ch = this.text.charCodeAt(this.pos)

      if (ch === Chars.newline) {
        break;
      }

      this.pos++
    }
  }

  private scanBlockComment() {
    const start = this.pos
    let ch = this.text.charCodeAt(this.pos)

    while (this.pos < this.len) {

      if (ch === Chars.asterisk && this.peek() === Chars.forwardSlash) {
        this.pos++;
        break;
      }

      ch = this.text.charCodeAt(this.pos)
    }
  }

  scanNumber(): Number {
    const start = this.pos;
    while (isDigit(this.text.charCodeAt(this.pos))) this.pos++;

    if (this.text.charCodeAt(this.pos) === Chars.period) {
      this.pos++;
      while (isDigit(this.text.charCodeAt(this.pos))) this.pos++;
    }

    return parseFloat(this.text.substr(start, this.pos - start))
  }

  scan(): Token {
    const start = this.start = this.pos

    while (true) {
      const ch = this.text.charCodeAt(this.pos);
      let val = undefined;

      switch (ch) {
        case Chars.tab:
        case Chars.space:
          this.pos++
          while (true) {
            const ch = this.text.charCodeAt(this.pos);
            if (ch !== Chars.tab || ch !== Chars.space) break;
            this.pos++;
          }
          break;

        case Chars.newline: this.pos++; break;

        // we'll just eat trivia for now. There's no good reason to have it just yet.
        // maybe someday if we care about indent rules or someshit.

        case Chars.hyphen:
          if (this.peek() === Chars.hyphen) {
            this.scanInlineComment()
          } else {
            // subtraction binary expression?
          }
        case Chars.num_0:
        case Chars.num_1:
        case Chars.num_2:
        case Chars.num_3:
        case Chars.num_4:
        case Chars.num_5:
        case Chars.num_6:
        case Chars.num_7:
        case Chars.num_8:
        case Chars.num_9:
          val = this.scanNumber();

          return {
            start: start,
            end: this.pos,
            value: val,
            kind: SyntaxKind.numeric_literal
          };

        case Chars.singleQuote:
          val = this.scanString()

          return new Token(SyntaxKind.string_literal, start, this.pos)
        case Chars.doubleQuote:
          // todo: quoted identifiers are funky.
          return new Token(SyntaxKind.quoted_identifier, start, this.pos)
        case Chars.at:
          if (this.peek() === Chars.at) {
            // parse config function
            this.pos++;

            // todo: parse config function.
          } else {
            val = this.scanIdentifier()

            return {
              kind: SyntaxKind.local_variable_reference,
              start: start,
              end: this.pos,
              value: val
            }
          }
          // is it atat?
          // or a local?

        case Chars.hash:
          if (this.peek() === Chars.hash) {
            // mssql persistent temp tables.
          }

        default: {
          // case Chars.x:
          // case Chars.X:
          //   // todo: mysql hex literal X'

          // case Chars.N // begin nvarchar literal.


          const identifier = this.scanIdentifier()
          const keyword = keywordMap.get(identifier)

          if (keyword) {
            return {
              kind: keyword,
              start: start,
              end: this.pos,
              value: identifier
            }
          }

          // else it's just an identifier.
        }
      }

      // todo: each thing should return when it finds a token.
      break;
    }

    return new Token(SyntaxKind.unknown, start, this.pos);
  }
}