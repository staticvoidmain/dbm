const sqlite = require('sqlite3')

function SqliteDb (options) {
  this.db = new sqlite.Database(options.host)
}

SqliteDb.prototype.run = function (statement) {
  let self = this
  return new Promise(function (resolve, reject) {
    self.db.run(statement, {}, function (err) {
      if (err) return reject(err)

      // this gets us the N rows affected
      return resolve(this.changes)
    })
  })
}

module.exports = SqliteDb
