import {IManagedDatabase} from '../database'

const sqlite = require('sqlite3')
const newline = (process.platform === 'win32' ? '\r\n' : '\n')

export class SqliteDb implements IManagedDatabase {
  db: any
  separator: string
  name: string

  constructor(options) {
    this.db = new sqlite.Database(options.host)

    this.separator = ';' + newline
    this.name = 'sqlite3'
  }

  on(name, handler) {
    // todo:
  }

  getSchema() {
    // todo: 
    return Promise.resolve({})
  }

  query(statement) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.db.run(statement, {}, function (err, results) {
        if (err) return reject(err)

        return resolve(results)
      })
    })
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
