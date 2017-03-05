'use strict';
var _this = this;
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var StringDecoder = require('string_decoder').StringDecoder;
var algorithm = 'aes256';
function CredentialStore(config) {
    if (!config) {
        throw new Error('Config not specified!');
    }
    this["new"] = false;
    var locations = [
        process.env.DBM_HOME,
        process.env.HOME,
        process.env.APPDATA,
        process.cwd()
    ];
    var valid = [];
    for (var i = 0; i < locations.length; i++) {
        var element = locations[i];
        if (element) {
            valid.push(element);
            var store = path.join(element, '.dbm-creds');
            if (fs.existsSync(store)) {
                this.file = fs.openSync(store, 'r+');
                break;
            }
        }
    }
    if (!this.file) {
        this["new"] = true;
        var location_1 = valid[0];
        var store = path.join(location_1, '.dbm-creds');
        this.file = fs.openSync(store, 'w+');
    }
}
function validateRequest(req) {
    assert(req.env, 'env is required');
    assert(req.server, 'server is required');
    assert(req.db, 'db is required');
    assert(req.user, 'user name is required');
    assert(req.phrase, 'passphrase is required');
}
function encrypt(text, password) {
    var cipher = crypto.createCipher(algorithm, password);
    return wrap(text).pipe(cipher);
}
function decipher(stream, password) {
    var decipher = crypto.createDecipher(algorithm, password);
    return stream.pipe(decipher);
}
CredentialStore.prototype.get = function (req, cb) {
    validateRequest(req);
    var stream = fs.createReadStream(this.file, 'utf8');
    var text = decipher(stream, req.phrase);
};
CredentialStore.prototype.set = function (req) {
    validateRequest(req);
    var env = req.env;
    var srv = req.srv;
    var db = req.db;
    var user = req.user;
    var path = "$env/$srv/$db/$user";
    var clearText = decrypt();
    var output = fs.createWriteStream(_this.file);
    encrypt(newText).pipe(output);
};
'use strict';
module.exports = {
    create: function (vendor, options) {
        var Db = require('./vendors/' + vendor);
        return new Db(options);
    }
};
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
'use strict';
var inherits = require('util').inherits;
var EventEmitter = require('events');
var factory = require('../lib/database');
var sql = require('sql');
var fs = require('fs');
var path = require('path');
function BackupRunner(options) {
    this.sqlgen = sql.create(options.vendor, {});
    this.db = factory.create(options.vendor, options);
}
inherits(BackupRunner, EventEmitter);
BackupRunner.prototype.run = function (schema, options) {
    var self = this;
    if (!schema) {
        throw Error('I need a schema fool');
    }
    options = options || {};
    var backupName = options.backupName || 'backup.sql';
    var backupPath = options.backupPath;
    var sqlgen = self.sqlgen;
    if (!options.scriptPerObject) {
        var filePath = path.join(backupPath, backupName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    if (schema.tables) {
        schema.tables.forEach(function (table) {
            var tableGenerator = sqlgen.define({
                name: table.name,
                schema: table.schema,
                columns: []
            });
            table.columns.forEach(function (col) {
                tableGenerator.addColumn({
                    name: col.name,
                    precision: col.precision,
                    dataType: col.type,
                    defaultValue: col.defaultValue,
                    notNull: !col.isNullable
                });
            });
            var q = tableGenerator.create();
            if (options.safe) {
                q = q.ifNotExists();
            }
            if (options.scriptPerObject) {
                backupName = table.schema + '.' + table.name + '.sql';
            }
            var text = q.toQuery().text + self.db.separator;
            fs.appendFileSync(path.join(backupPath, backupName), text, 'utf8');
            self.emit('done');
        });
    }
};
module.exports = BackupRunner;
//# sourceMappingURL=dbm.js.map