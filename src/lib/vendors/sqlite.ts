import {IManagedDatabase} from '../database'

const sqlite = require('sqlite3')
const newline = (process.platform === 'win32' ? '\r\n' : '\n')

export function create(database) {
  return new SqliteDb(database)
}

export class SqliteDb implements IManagedDatabase {
  db: any
  separator: string
  name: string

  constructor(options) {
    this.db = new sqlite.Database(options.host)

    this.separator = ';' + newline
    this.name = 'sqlite3'
  }

  // should we just hook them all up?
  // var supportedEvents = [ 'trace', 'profile', 'insert', 'update', 'delete' ];
  on(name, handler) {
    // todo:
  }

  getSchema() {
    // todo: 
    return Promise.resolve({})
  }

  query(statement, args) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.db.run(statement, args, function (err, results) {
        if (err) return reject(err)

        return resolve(results)
      })
    })
  }

  run (statement, args) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.db.run(statement, args, function (err) {
        if (err) return reject(err)

        // this gets us the N rows affected
        return resolve(this.changes)
      })
    })
  } 
}
