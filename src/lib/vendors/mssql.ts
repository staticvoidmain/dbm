import * as mssql from 'mssql'
import * as sqlgen from 'sql'
import { IManagedDatabase } from '../database'
import { EventEmitter } from 'events'
import { mergeResults } from './common'
import { ok } from "assert";
import { Server } from "../environment";

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

const getProceduresQuery = `
select name, text
from sys.procedures p
left join syscomments c
  on p.object_id = c.id
where is_ms_shipped = 0
order by number, colid
`

const getKeyInfoQuery = `select 
	[key_id] = keys.[object_id],
	[parent] = object_name(keys.parent_object_id),
	[key_name] = keys.name,
	[column_name] = column_def_parent.name,

	[reference_table] = object_name(cols.referenced_object_id),	
	[reference_column_name] = column_def_referenced.name
from sys.foreign_keys keys 
left join sys.foreign_key_columns cols
	on cols.constraint_object_id = keys.object_id
left join sys.all_columns column_def_parent
	on column_def_parent.column_id = cols.parent_column_id
	and column_def_parent.object_id = cols.parent_object_id

left join sys.all_columns column_def_referenced
	on column_def_referenced.column_id = cols.referenced_column_id
	and column_def_referenced.object_id = cols.referenced_object_id
order by [key_id]`

const getAllTablesQuery = tables.select().toQuery().text

// todo: is this a HOST?
export function create(database: Server) {
  return new MicrosoftSql(database)
}

function addArgs(req: mssql.Request, args) {
  ok(args.length % 2 === 0, "must supply an even number of args!")

  for (var i = 0; i < args.length; i += 2) {
    req.input(args[i], args[i + 1])
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

  constructor(database: Server) {
    super()

    this.connect = function () {
      let config: any = {
        server: database.host,
        database: database.name,
        options: {}
      };

      // todo: this doesn't work currently..
      if (database.security === "integrated") {
        // if you want to use integrated security, well, you can.
        // but you must have the right driver, and it's a little maybe sketchy.
        config.driver = "msnodesqlv8";
        config.options.trustedConnection = true
      } else {
        config.user = database.user;
        config.password = database.password;
      }

      let connection = new mssql.Connection(config)

      return connection.connect()
    }

    this.name = 'mssql'
    this.separator = newline + 'go;' + newline
  }

  getSchema() {
    return Promise.all([
      this.getAllColumns,
      this.getAllTables,
      // this.getAllKeys
      // this.getAllProcedures
      // this.getAllViews
    ]).then(mergeResults)
  }

  getSingleTable(name) {
    return this.connect()
      .then(function (connection) {

        let [schema, tableName] = name.split('.')
        let req = new mssql.Request(connection)
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
    return this.connect()
      .then(function(connection) {
        let req = new mssql.Request(connection)

        return req.query(proceduresQuery)
      })
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