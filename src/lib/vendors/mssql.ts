// TODO!!: implement some kind of base DB with some of this shared stuff

import * as mssql from 'mssql'
import * as sqlgen from 'sql'
import {IManagedDatabase} from '../database'

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

/**
* Creates an instance of the MicrosoftSql adapter.
*
* @param {Object} database a database connection info Object
* @param {string} database.user username to connect with
* @param {string} database.password password for the specified user
* @param {string} database.host the host name of the database
* @param {string} database.name name of the database to connect to
*/
export class MicrosoftSql implements IManagedDatabase {
  name: string;
  separator: string;
  connect: any;

  constructor(database) {
    if (!(this instanceof MicrosoftSql)) {
      return new MicrosoftSql(database)
    }

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

  // useful when scripting a database
  getSchema() {
    // todo: this should match more closely with the postgres one
    var result = {}
    return this.connect()
      .then(getAllTables(result))
      .then(getAllColumns(result))
      .then(mergeResults(result))
  }

  /**
   * Runs a query, but does not return the results.
   * @param query transact sql query to execute
   * @returns {Promise} returns the top result from the query.
   */
  run(query) {
    return this.connect()
      .then(function (connection) {
        let req = new mssql.Request(connection)

        return req.query(query)
          .then(function (res) {
            return res[0]
          })
      })
  }

  query(query) {
    return this.connect()
      .then(function (connection) {
        let req = new mssql.Request(connection)
        return req.query(query)
          .then(function (res) {
            return res
          })
      })
  }


  getProcedures() {
    // execute some sp_helptext up in this biatch.
  }

  on () {
    
  }
}

function getAllColumns(result) {
  return function (connection) {
    let req = new mssql.Request(connection)
    let query = columns.select().toQuery().text
    return req.query(query)
      .then(function (res) {
        result.tables = res[0]
      })
  }
}

function getAllTables(result) {
  return function (connection) {
    let req = new mssql.Request(connection)
    let getAllTables = tables.select().toQuery().text
    return req.query(getAllTables)
      .then(function (res) {
        result.columns = res[0]
      })
  }
}

function mergeResults(result) {
  return function () {
    let tableLookup = {}

    for (let tableIndex = 0; tableIndex < result.tables.length; tableIndex++) {
      let table = result.tables[tableIndex]
      let key = table.schema + '.' + table.name

      tableLookup[key] = table
      table.columns = []
    }

    for (let columnIndex = 0; columnIndex < result.columns.length; columnIndex++) {
      let column = result.columns[columnIndex]
      let key = column.tableSchema + '.' + column.tableName
      let table = tableLookup[key]

      if (table) {
        table.columns.push(column)
      }
    }

    // unsorted columns can go now
    result.columns = null

    return result
  }
}
