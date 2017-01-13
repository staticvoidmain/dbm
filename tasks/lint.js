/*
  This is the linting section which parses your scripts and calls out inconsistencies in style.

  It's going to be an interesting ride.

  TODO: read the eslint source for inspiration.
 */

const Parser = require('../lib/parser.js')

// note: these are going to likely be platform specific.
var rules = [
  'keywords_must_be_capitalized',
  'prefer_utc_time',
  'no_execsql',
  'procedures_require_grant'
]

var reserved = [
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

// thoughts...
function isUpper(token) {
  // assumes this is 
  for (var i = 0, len = token.length; i < len; i++) {
    var char = token.charCodeAt(i);
    if ( char > 90 ) {
      return false;
    }
  }

  return true;
}

module.exports = {
  lint: function(script) {
    var parser = new Parser({});
    var statements = parser.parse(script);
  }
}