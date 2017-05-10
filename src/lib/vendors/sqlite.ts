
import * as sqlgen from 'sql'

import { IManagedDatabase } from '../database'
import { EventEmitter } from 'events';
import { Database } from 'sqlite3'
const newline = (process.platform === 'win32' ? '\r\n' : '\n')

import {
  mergeResults,
  IDatabaseSchema
} from './common'

export function create(database) {
  return new SqliteDb(database)
}

/*
notes:
  .bail on|off           Stop after hitting an error.  Default OFF

*/

// interestingly, this already has the create script built in.
const getAllTablesQuery = "select * from sqlite_master where type = 'table'"
const getAllViews = "select * from sqlite_master where type = 'view'"

// table-valued function versions added in SQLite version 3.16.0
const fullSchema = `
 select * from
   sqlite_master AS t,
   pragma_table_info(t.name) as cols,
   pragma_index_list(t.name) as indexes,
   pragma_index_info(indexes.name) as index_info
 where m.type = 'table'
 order by 1;`

// const supportedEvents = [ 'trace', 'profile', 'insert', 'update', 'delete' ];

export class SqliteDb extends EventEmitter implements IManagedDatabase {

  db: any
  separator: string
  name: string

  constructor(options) {
    super()

    this.db = new Database(options.host)

    // todo: wire this up later.
    // supportedEvents.forEach((e) => {
    //   this.db.on(e, (args) => this.emit(e, args))
    // })

    this.separator = ';' + newline
    this.name = 'sqlite'
  }

  getSingleTable(name) {
    const getTableByName = "select * from sqlite_master where type = 'table' and name = ? limit 1";
    return new Promise((resolve, reject) => {
      const cb = (err, rows) => {
        if (err) return reject(err)

        resolve(rows[0])
      }

      this.db.run(getTableByName, [ name ], cb)
    })
  }

  getAllTables() {
    return new Promise((resolve, reject) => {
      this.db.run(getAllTablesQuery, [], (err, rows) => {
        if (err) return reject(err);

        resolve(rows);
      });
    })
  }

  getSchema() {
    return Promise.all([
      this.getAllTables(),
      // this.getAllColumns(),
      // this.getAllViews(),
    ]).then(mergeResults)
  }

  query(statement, args = []) {
    return new Promise((resolve, reject) => {
      this.db.run(statement, args, function (err, results) {
        if (err) return reject(err)

        return resolve(results)
      })
    })
  }

  run (statement, args = []) {
    // we need the scoped 'this' inside the promise.
    const self = this
    return new Promise(function (resolve, reject) {
      self.db.run(statement, args, function (err) {
        if (err) return reject(err)

        // this gets us the N rows affected
        return resolve(this.changes)
      })
    })
  }
}
