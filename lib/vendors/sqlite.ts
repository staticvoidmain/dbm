const sqlite = require('sqlite3')
const newline = (process.platform === 'win32' ? '\r\n' : '\n')

export class SqliteDb {
  db: any
  separator: string
  name: string

  constructor(options) {
    this.db = new sqlite.Database(options.host)

    this.separator = ';' + newline
    this.name = 'sqlite3'
  }

  run (statement) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.db.run(statement, {}, function (err) {
        if (err) return reject(err)

        // this gets us the N rows affected
        return resolve(this.changes)
      })
    })
  } 
}
