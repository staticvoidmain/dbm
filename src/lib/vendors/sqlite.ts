import { IManagedDatabase } from '../database'
import { EventEmitter } from "events";

const sqlite = require('sqlite3')
const newline = (process.platform === 'win32' ? '\r\n' : '\n')

import {
  mergeResults,
  IDatabaseSchema
} from './common'

export function create(database) {
  return new SqliteDb(database)
}

const supportedEvents = [ 'trace', 'profile', 'insert', 'update', 'delete' ];

export class SqliteDb

extends EventEmitter
implements IManagedDatabase {
  db: any
  separator: string
  name: string

  /**
   * todo: support cached and verbose and shit.
   */
  constructor(options) {
    super()

    let Database = options.verbose
      ? sqlite.verbose().Database
      : sqlite.Database

    this.db = new Database(options.host)

    supportedEvents.forEach(() => {
      // todo: attach an event handler.
    })

    this.separator = ';' + newline
    this.name = 'sqlite'
  }

  getSchema() {
    return Promise.resolve()
  }

  query(statement, args = []) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.db.run(statement, args, function (err, results) {
        if (err) return reject(err)

        return resolve(results)
      })
    })
  }

  run (statement, args = []) {
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
