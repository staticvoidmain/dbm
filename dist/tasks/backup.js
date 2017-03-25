'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("sql");
const events_1 = require("events");
const database_1 = require("../lib/database");
const fs_1 = require("fs");
const path_1 = require("path");
class BackupRunner extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.sqlgen = sql.create(options.vendor, {});
        this.db = database_1.create(options.vendor, options);
    }
    run(schema, options) {
        if (!schema) {
            throw Error('I need a schema fool');
        }
        options = options || {};
        let backupName = options.backupName || 'backup.sql';
        let backupPath = options.backupPath;
        let sqlgen = this.sqlgen;
        if (!options.scriptPerObject) {
            let filePath = path_1.join(backupPath, backupName);
            if (fs_1.existsSync(filePath)) {
                fs_1.unlinkSync(filePath);
            }
        }
        if (schema.tables) {
            schema.tables.forEach(function (table) {
                let tableGenerator = sqlgen.define({
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
                let q = tableGenerator.create();
                if (options.safe) {
                    q = q.ifNotExists();
                }
                if (options.scriptPerObject) {
                    backupName = table.schema + '.' + table.name + '.sql';
                }
                let text = q.toQuery().text + this.db.separator;
                fs_1.appendFileSync(path_1.join(backupPath, backupName), text, 'utf8');
            });
        }
        this.emit('done');
    }
}
exports.BackupRunner = BackupRunner;
