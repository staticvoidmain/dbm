/*
  This is the linting section which parses your scripts and calls out inconsistencies in style.

  It's going to be an interesting ride.

  TODO: read the eslint source for inspiration.
 */

import {Parser} from '../lib/parser'
import {syntax} from '../lib/syntax'

// note: these are going to likely be platform specific.
// also, I'm totally making these names up as I go.
// also this should be a dictionary.
const rules = {
  keywords_must_be_lower: true,
  create_must_include_schema: true,
  prefer_utc_time: true,
  no_execsql: true,
  procedures_require_grant: true,
  no_underscores_in_columns: false,
  require_explicit_join: true,
  procedure_requires_doc_string: false,
  procedure_name_must_begin_with_prefix: true,

  /**
   * ex: select * from DbName..Foo
   * just because
   */
  no_lazy_schema_resolution: true,
  aliases_require_as: true,

  /**
   * dirty reads should be off by default
   */
  no_nolock: true
}

const reserved = [
  'ADD', 'ALL', 'ALTER', 'AND', 'ANY', 'AS', 'ASC',
  'AUTHORIZATION', 'BACKUP', 'BEGIN', 'BETWEEN', 'BREAK', 'BROWSE',
  'BULK', 'BY', 'CASCADE', 'CASE', 'CHECK', 'CHECKPOINT', 'CLOSE',
  'CLUSTERED', 'COALESCE', 'COLLATE', 'COLUMN', 'COMMIT',
  'COMPUTE', 'CONSTRAINT', 'CONTAINS', 'CONTAINSTABLE', 'CONTINUE',
  'CONVERT', 'CREATE', 'CROSS', 'CURRENT', 'CURRENT_DATE',
  'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'CURRENT_USER', 'CURSOR',
  'DATABASE', 'DBCC', 'DEALLOCATE', 'DECLARE', 'DEFAULT', 'DELETE',
  'DENY', 'DESC', 'DISK', 'DISTINCT', 'DISTRIBUTED', 'DOUBLE',
  'DROP', 'DUMP', 'ELSE', 'END', 'ERRLVL', 'ESCAPE', 'EXCEPT',
  'EXEC', 'EXECUTE', 'EXISTS', 'EXIT', 'EXTERNAL', 'FETCH', 'FILE',
  'FILLFACTOR', 'FOR', 'FOREIGN', 'FREETEXT', 'FREETEXTTABLE',
  'FROM', 'FULL', 'FUNCTION', 'GOTO', 'GRANT', 'GROUP', 'HAVING',
  'HOLDLOCK', 'IDENTITY', 'IDENTITY_INSERT', 'IDENTITYCOL', 'IF',
  'IN', 'INDEX', 'INNER', 'INSERT', 'INTERSECT', 'INTO', 'IS',
  'JOIN', 'KEY', 'KILL', 'LEFT', 'LIKE', 'LINENO', 'LOAD', 'MERGE',
  'NATIONAL', 'NOCHECK', 'NONCLUSTERED', 'NOT', 'NULL', 'NULLIF',
  'OF', 'OFF', 'OFFSETS', 'ON', 'OPEN', 'OPENDATASOURCE',
  'OPENQUERY', 'OPENROWSET', 'OPENXML', 'OPTION', 'OR', 'ORDER',
  'OUTER', 'OVER', 'PERCENT', 'PIVOT', 'PLAN', 'PRECISION',
  'PRIMARY', 'PRINT', 'PROC', 'PROCEDURE', 'PUBLIC', 'RAISERROR',
  'READ', 'READTEXT', 'RECONFIGURE', 'REFERENCES', 'REPLICATION',
  'RESTORE', 'RESTRICT', 'RETURN', 'REVERT', 'REVOKE', 'RIGHT',
  'ROLLBACK', 'ROWCOUNT', 'ROWGUIDCOL', 'RULE', 'SAVE', 'SCHEMA',
  'SECURITYAUDIT', 'SELECT', 'SEMANTICKEYPHRASETABLE',
  'SEMANTICSIMILARITYDETAILSTABLE', 'SEMANTICSIMILARITYTABLE',
  'SESSION_USER', 'SET', 'SETUSER', 'SHUTDOWN', 'TRY_CONVERT',
  'TSEQUAL', 'UNION', 'UNIQUE', 'UNPIVOT', 'UPDATE', 'UPDATETEXT',
  'USE', 'USER', 'VALUES', 'VARYING', 'VIEW', 'WAITFOR', 'WHEN',
  'WHERE', 'WHILE', 'WITH', 'WITHIN GROUP', 'WRITETEXT'
]

function isUpper (token) {
  // assumes this is a word token
  for (var i = 0, len = token.length; i < len; i++) {
    var char = token.charCodeAt(i)
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

  for (let child of node.children) {
    visit(child, kind, callback)
  }
}

function evaluate (rule, statement, lintResult) {
  return
}

export class Linter {
  rules: any;

  constructor(options) {
    this.rules = Object.assign(rules, options)

  }
  
  lint (script) {
    var parser = new Parser({})
    var statements = parser.parse(script)
    var result = []

    statements.forEach(function (statement) {
      this.rules.forEach(function (enabled, rule) {
        if (enabled) {
          evaluate(rule, statement, result)
        }
      })
    })

    return result
  }
}

