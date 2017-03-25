const sqlite = require('sqlite3');
const newline = (process.platform === 'win32' ? '\r\n' : '\n');
function SqliteDb(options) {
    this.db = new sqlite.Database(options.host);
    this.separator = ';' + newline;
    this.name = 'sqlite3';
}
SqliteDb.prototype.run = function (statement) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.db.run(statement, {}, function (err) {
            if (err)
                return reject(err);
            return resolve(this.changes);
        });
    });
};
module.exports = SqliteDb;
