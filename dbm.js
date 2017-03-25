'use strict';
var syntax = require('./syntax');
function Scanner(text, options) {
    this.options = options;
    this.text = text;
    this.pos = 0;
    this.len = text.length;
}
var space = ' '.charCodeAt(0);
var tab = '\t'.charCodeAt(0);
Scanner.prototype.whitespace = function () {
    var token = this.text[this.pos];
    while (token === space || token === tab) {
        token = this.text[++this.pos];
    }
};
Scanner.prototype.scanInlineComment = function () {
    var start = this.pos;
    var ch = -1;
    while (this.pos < this.len) {
        ch = this.text.charCodeAt(this.pos);
        if (ch === syntax.newline) {
            return this.text.substring(start, this.pos);
        }
        this.pos++;
    }
    return '';
};
Scanner.prototype.scanString = function () {
    return 'TODO';
};
function scan(script) {
    return new Scanner(script);
}
function Parser(options) {
    this._options = options;
}
;
function visit(scanner) {
    while (true) {
        switch (scanner.token) {
            case ' ':
            case '\t':
                scanner.whitespace();
                break;
        }
    }
}
Parser.prototype.parse = function (script) {
    var scanner = scan(script);
    var statements = visit(scanner);
    return statements;
};
module.exports = Parser;
var inlineComment = '--';
var blockCommentStart = '/*';
var blockCommentEnd = '*/';
var syntax = {
    whitespace: 0,
    keyword: 1,
    semicolon: 2,
    lineComment: 3,
    blockComment: 4
};
module.exports = {
    token: {},
    statement: {
        select: 1,
        insert: 2,
        create: 3,
        update: 4,
        "delete": 6,
        truncate: 7,
        drop: 8,
        alter: 9,
        declare: 10,
        use: 11,
        set: 12,
        begin_transaction: 13
    }
};
'use strict';
var mssql = require('mssql');
var sqlgen = require('sql');
var newline = (process.platform === 'win32' ? '\r\n' : '\n');
var columns = sqlgen.define({
    name: 'columns',
    schema: 'information_schema',
    columns: [
        { name: 'table_schema', property: 'tableSchema' },
        { name: 'table_name', property: 'tableName' },
        { name: 'table_catalog', property: 'tableCatalog' },
        { name: 'column_name', property: 'name' },
        { name: 'ordinal_position', property: 'ordinalPosition' },
        { name: 'data_type', property: 'type' },
        { name: 'character_maximum_length', property: 'charLength' },
        { name: 'column_default', property: 'defaultValue' },
        { name: 'is_nullable', property: 'isNullable' }
    ]
});
var tables = sqlgen.define({
    name: 'tables',
    schema: 'information_schema',
    columns: [
        { name: 'table_name', property: 'name' },
        { name: 'table_schema', property: 'schema' },
        { name: 'table_catalog', property: 'catalog' },
        { name: 'table_type', property: 'type' }
    ]
});
function MicrosoftSql(database) {
    if (!(this instanceof MicrosoftSql)) {
        return new MicrosoftSql(database);
    }
    this.connect = function () {
        var connection = new mssql.Connection({
            user: database.user,
            password: database.password,
            server: database.host,
            database: database.name
        });
        return connection.connect();
    };
    this.name = 'mssql';
    this.separator = newline + 'go;' + newline;
}
function getAllColumns(result) {
    return function (connection) {
        var req = new mssql.Request(connection);
        var query = columns.select().toQuery().text;
        return req.query(query)
            .then(function (res) {
            result.tables = res[0];
        });
    };
}
function getAllTables(result) {
    return function (connection) {
        var req = new mssql.Request(connection);
        var getAllTables = tables.select().toQuery().text;
        return req.query(getAllTables)
            .then(function (res) {
            result.columns = res[0];
        });
    };
}
function mergeResults(result) {
    return function () {
        var tableLookup = {};
        for (var tableIndex = 0; tableIndex < result.tables.length; tableIndex++) {
            var table = result.tables[tableIndex];
            var key = table.schema + '.' + table.name;
            tableLookup[key] = table;
            table.columns = [];
        }
        for (var columnIndex = 0; columnIndex < result.columns.length; columnIndex++) {
            var column = result.columns[columnIndex];
            var key = column.tableSchema + '.' + column.tableName;
            var table = tableLookup[key];
            if (table) {
                table.columns.push(column);
            }
        }
        result.columns = null;
        return result;
    };
}
MicrosoftSql.prototype.getSchema = function () {
    var result = {};
    return this.connect()
        .then(getAllTables(result))
        .then(getAllColumns(result))
        .then(mergeResults(result));
};
MicrosoftSql.prototype.run = function (query) {
    return this.connect()
        .then(function (connection) {
        var req = new mssql.Request(connection);
        return req.query(query)
            .then(function (res) {
            return res[0];
        });
    });
};
MicrosoftSql.prototype.getProcedures = function () {
};
module.exports = MicrosoftSql;
'use strict';
var pg = require('pg');
var sqlgen = require('sql');
var EventEmitter = require('events');
var inherits = require('util').inherits;
var newline = (process.platform === 'win32' ? '\r\n' : '\n');
function PostgresDb(db) {
    this.config = {
        host: db.host,
        database: db.name,
        user: db.user,
        password: db.password,
        port: 5432,
        max: 10,
        idleTimeoutMillis: 30000
    };
    this.separator = ';' + newline;
    this.name = 'postgres';
}
inherits(PostgresDb, EventEmitter);
var columns = sqlgen.define({
    name: 'columns',
    schema: 'information_schema',
    columns: [
        { name: 'table_schema', property: 'tableSchema' },
        { name: 'table_name', property: 'tableName' },
        { name: 'table_catalog', property: 'tableCatalog' },
        { name: 'column_name', property: 'name' },
        { name: 'ordinal_position', property: 'ordinalPosition' },
        { name: 'data_type', property: 'type' },
        { name: 'character_maximum_length', property: 'charLength' },
        { name: 'column_default', property: 'defaultValue' },
        { name: 'is_nullable', property: 'isNullable' }
    ]
});
var fetchAllKeys = "\nSELECT\n  pg_namespace.nspname as tableSchema,\n  pg_class.relname as tableName,\n  pg_attribute.attname as keyType,\n  indisprimary as isPrimaryKey\nFROM pg_index, pg_class, pg_attribute, pg_namespace \nWHERE\n  pg_namespace.nspname not like 'pg_%' AND\n  pg_namespace.nspname <> 'information_schema' AND\n  pg_class.relnamespace = pg_namespace.oid AND \n  pg_attribute.attrelid = pg_class.oid AND \n  pg_attribute.attnum = any(pg_index.indkey) AND\n  indrelid = pg_class.oid;\n";
var tables = sqlgen.define({
    name: 'tables',
    schema: 'information_schema',
    columns: [
        { name: 'table_name', property: 'name' },
        { name: 'table_schema', property: 'schema' },
        { name: 'table_catalog', property: 'catalog' },
        { name: 'table_type', property: 'type' }
    ]
});
var allColumnsQuery = columns
    .select(columns.star())
    .from(columns)
    .where(columns.tableSchema.notLike('pg_%')
    .and(columns.tableSchema.notEqual('information_schema')))
    .toQuery();
var userTablesQuery = tables
    .select(tables.star())
    .from(tables)
    .where(tables.schema.notLike('pg_%')
    .and(tables.schema.notEqual('information_schema')))
    .toQuery();
function mergeResults(values) {
    var tables = values[0];
    var columns = values[1];
    var tableLookup = {};
    for (var tableIndex = 0; tableIndex < tables.length; tableIndex++) {
        var table = tables[tableIndex];
        var key = table.schema + '.' + table.name;
        tableLookup[key] = table;
        table.columns = [];
    }
    for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
        var column = columns[columnIndex];
        var key = column.tableSchema + '.' + column.tableName;
        var table = tableLookup[key];
        if (table) {
            table.columns.push(column);
        }
    }
    return {
        tables: tables
    };
}
var varchar = 'character varying';
var char = 'character';
function coerceColumnTypes(columns) {
    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        switch (col.type) {
            case varchar:
                col.type = 'varchar';
                break;
            case char:
                col.type = 'char';
                break;
            default:
                break;
        }
    }
    return columns;
}
PostgresDb.prototype.run = function (statement, args) {
    if (typeof statement !== 'string') {
        throw new Error('Only strings can be passed to run!');
    }
    return pg.connect(this.config)
        .then(function (client) {
        return client.query(statement, args)
            .then(function (res) {
            client.end();
            return res;
        });
    });
};
PostgresDb.prototype.getSchema = function () {
    return Promise.all([
        this.getAllTables(),
        this.getAllColumns(),
        this.getKeys()
    ]).then(mergeResults);
};
PostgresDb.prototype.getAllColumns = function () {
    return pg.connect(this.config)
        .then(function (client) {
        var text = allColumnsQuery.text;
        var args = allColumnsQuery.values;
        return client.query(text, args)
            .then(function (res) {
            client.end();
            return coerceColumnTypes(res.rows.slice());
        });
    });
};
PostgresDb.prototype.getKeys = function () {
    return pg.connect(this.config)
        .then(function (client) {
        return client.query(fetchAllKeys, [])
            .then(function (res) {
            client.end();
            return res.rows.slice();
        });
    });
};
PostgresDb.prototype.getAllTables = function () {
    return pg.connect(this.config)
        .then(function (client) {
        var text = userTablesQuery.text;
        var args = userTablesQuery.values;
        return client.query(text, args)
            .then(function (res) {
            client.end();
            return res.rows.slice();
        });
    });
};
module.exports = PostgresDb;
var sqlite = require('sqlite3');
var newline = (process.platform === 'win32' ? '\r\n' : '\n');
function SqliteDb(options) {
    this.db = new sqlite.Database(options.host);
    this.separator = ';' + newline;
    this.name = 'sqlite3';
}
SqliteDb.prototype.run = function (statement) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.db.run(statement, {}, function (err) {
            if (err)
                return reject(err);
            return resolve(this.changes);
        });
    });
};
module.exports = SqliteDb;
//# sourceMappingURL=dbm.js.map