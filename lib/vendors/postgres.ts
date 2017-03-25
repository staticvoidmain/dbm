'use strict'

import * as pg from 'pg'
import * as sqlgen from 'sql'
import { inherits } from 'util'

const newline = (process.platform === 'win32' ? '\r\n' : '\n')

// was I using EventEmitter to fire off log messages?
export class PostgresDb {
  config: any;
  separator: string;
  name: string;

  constructor(db: any) {

    this.config = {
      host: db.host,
      database: db.name,
      user: db.user,
      password: db.password,
      port: 5432,
      max: 10,
      idleTimeoutMillis: 30000
    }

    this.separator = ';' + newline
    this.name = 'postgres'
  }

  run(statement, args) {
    if (typeof statement !== 'string') {
      throw new Error('Only strings can be passed to run!')
    }

    return pg.connect(this.config)
      .then(function (client) {
        return client.query(statement, args)
          .then(function (res) {
            client.end()

            return res
          })
      })
  }

  // useful when scripting a database
  // this list will continue to grow
  getSchema() {
    return Promise.all([
      this.getAllTables(),
      this.getAllColumns(),
      this.getKeys()
    ]).then(mergeResults)
  }

  getAllColumns() {
    return pg.connect(this.config)
      .then(function (client) {
        let text = allColumnsQuery.text
        let args = allColumnsQuery.values

        return client.query(text, args)
          .then(function (res) {
            client.end()
            return coerceColumnTypes(res.rows.slice())
          })
      })
  }

  getKeys() {
    return pg.connect(this.config)
      .then(function (client) {
        return client.query(fetchAllKeys, [])
          .then(function (res) {
            client.end()
            return res.rows.slice()
          })
      })
  }

  getAllTables() {
    return pg.connect(this.config)
      .then(function (client) {
        let text = userTablesQuery.text
        let args = userTablesQuery.values

        return client.query(text, args)
          .then(function (res) {
            client.end()
            return res.rows.slice()
          })
      })
  }
}

// TODO: information_schema.table_constraints

/*
postgres column schema
  table_catalog
  table_schema
  table_name
  column_name
  ordinal_position
  column_default
  is_nullable
  data_type
  character_maximum_length
  character_octet_length
  numeric_precision
  numeric_precision_radix
  numeric_scale
  datetime_precision
  interval_type
  interval_precision
  character_set_catalog
  character_set_schema
  character_set_name
  collation_catalog
  collation_schema
  collation_name
  domain_catalog
  domain_schema
  domain_name
  udt_catalog
  udt_schema
  udt_name
  scope_catalog
  scope_schema
  scope_name
  maximum_cardinality
  dtd_identifier
  is_self_referencing
  is_identity
  identity_generation
  identity_start
  identity_increment
  identity_maximum
  identity_minimum
  identity_cycle
  is_generated
  generation_expression
  is_updatable
 */
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

/*
  this query fetches all primary and secondary keys on all objects in the database.
 */
const fetchAllKeys = `
SELECT
  pg_namespace.nspname as tableSchema,
  pg_class.relname as tableName,
  pg_attribute.attname as keyType,
  indisprimary as isPrimaryKey
FROM pg_index, pg_class, pg_attribute, pg_namespace 
WHERE
  pg_namespace.nspname not like 'pg_%' AND
  pg_namespace.nspname <> 'information_schema' AND
  pg_class.relnamespace = pg_namespace.oid AND 
  pg_attribute.attrelid = pg_class.oid AND 
  pg_attribute.attnum = any(pg_index.indkey) AND
  indrelid = pg_class.oid;
`

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

const allColumnsQuery = columns
  .select(columns.star())
  .from(columns)
  .where(
  columns.tableSchema.notLike('pg_%')
    .and(columns.tableSchema.notEqual('information_schema')))
  .toQuery()

const userTablesQuery = tables
  .select(tables.star())
  .from(tables)
  .where(
  tables.schema.notLike('pg_%')
    .and(tables.schema.notEqual('information_schema')))
  .toQuery()

function mergeResults(values) {
  let tables = values[0]
  let columns = values[1]
  let tableLookup = {}

  for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
    let table = tables[tableIndex]
    let key = table.schema + '.' + table.name

    tableLookup[key] = table
    table.columns = []
  }

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
    let column = columns[columnIndex]
    let key = column.tableSchema + '.' + column.tableName
    let table = tableLookup[key]

    if (table) {
      table.columns.push(column)
    }
  }

  return {
    tables: tables
  }
}

const varchar = 'character varying'
const char = 'character'

// todo: there are probably more.
function coerceColumnTypes(columns) {
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i]

    switch (col.type) {
      case varchar:
        col.type = 'varchar'
        break
      case char:
        col.type = 'char'
        break
      default:
        break
    }
  }

  return columns
}


