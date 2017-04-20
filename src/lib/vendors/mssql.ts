import * as mssql from 'mssql'
import * as sqlgen from 'sql'
import { IManagedDatabase } from '../database'
import { EventEmitter } from 'events'
import { mergeResults } from './common'
import { ok } from "assert";

const newline = (process.platform === 'win32' ? '\r\n' : '\n')
const columns = sqlgen.define({
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
})

const getAllColumnsQuery = columns.select().toQuery().text

const tables = sqlgen.define({
  name: 'tables',
  schema: 'information_schema',
  columns: [
    { name: 'table_name', property: 'name' },
    { name: 'table_schema', property: 'schema' },
    { name: 'table_catalog', property: 'catalog' },
    { name: 'table_type', property: 'type' }
  ]
})

const getAllTablesQuery = tables.select().toQuery().text

export function create(database) {
  return new MicrosoftSql(database)
}

function addArgs(req: mssql.Request, args) {
  ok(args.length % 2 === 0, "must supply an even number of args!")

  for (var i = 0; i < args.length; i+=2) {
    req.input(args[i], args[i+1])
  }
}

/**
* Creates an instance of the MicrosoftSql adapter.
*
* @param {Object} database a database connection info Object
* @param {string} database.user username to connect with
* @param {string} database.password password for the specified user
* @param {string} database.host the host name of the database
* @param {string} database.name name of the database to connect to
*/
export class MicrosoftSql

  extends EventEmitter
  implements IManagedDatabase {

  name: string;
  separator: string;
  connect: any;

  constructor(database) {
    super()

    this.connect = function () {
      let connection = new mssql.Connection({
        user: database.user,
        password: database.password,
        server: database.host,
        database: database.name
      })

      return connection.connect()
    }

    this.name = 'mssql'
    this.separator = newline + 'go;' + newline
  }

  getSchema() {
    return Promise.all([
      this.getAllColumns,
      this.getAllTables,
      // getAllKeys
      // getAllProcedures
      // getAllViews
    ]).then(mergeResults)
  }

  getSingleTable(name) {
    return this.connect()
      .then(function (connection) {

        let [schema, tableName] = name.split('.')

        let req = new mssql.Request(connection)

        // this is a common query that's copy-pasted
        let singleTable = tables
          .select()
          .where(tables.schema.equals(schema)
            .and(tables.name.equals(tableName)))
          .limit(1)
          .toQuery().text

        return req.query(singleTable)
      })
  }

  /**
   * Runs a query, but does not return the results.
   * @param query transact sql query to execute
   * @returns {Promise} returns the top result from the query.
   */
  run(query, args = []) {
    return this.connect()
      .then(function (connection) {
        let req = new mssql.Request(connection)
        addArgs(req, args)

        return req.query(query)
          .then(function (res) {
            return res[0]
          })
      })
  }

  query(query, args) {
    return this.connect()
      .then(function (connection) {
        let req = new mssql.Request(connection)
        return req.query(query)
          .then(function (res) {
            return res[0]
          })
      })
  }

  getProcedures() {
    // execute some sp_helptext up in this biatch.
  }

  getAllColumns() {
    return this.connect()
      .then(function (connection) {
        let req = new mssql.Request(connection)
        
        return req.query(getAllColumnsQuery)
          .then(function (res) {
            return res[0]
          })
      })
  }

  getAllTables() {
    return this.connect()
      .then((connection) => {
        let req = new mssql.Request(connection)
     
        return req.query(getAllTablesQuery)
          .then(function (res) {
            return res[0]
          })
      }) 
  }
}