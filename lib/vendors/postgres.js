'use strict'

const pg = require('pg')
const sqlgen = require('sql')
const EventEmitter = require('events')
const inherits = require('util').inherits
const assert = require('assert')

function PostgresDb (db) {
  let self = this
  this.config = {
    host: db.host,
    database: db.name,
    user: db.user,
    password: db.password,
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  }

  this.pool = new pg.Pool(this.config)

  this.pool.on('error', function (err, client) {
    self.emit('error', err)
  })
}

inherits(PostgresDb, EventEmitter)

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
    columns.tableSchema.notEqual('pg_catalog')
    .and(columns.tableSchema.notEqual('information_schema')))
  .toQuery()

const userTablesQuery = tables
  .select(tables.star())
  .from(tables)
  .where(
    tables.schema.notEqual('pg_catalog')
    .and(tables.schema.notEqual('information_schema')))
  .toQuery()

function getAllColumns (result) {
  return function (client) {
    let text = allColumnsQuery.text
    let args = allColumnsQuery.values

    return client.query(text, args)
      .then(function (res) {
        result.tables = res.rows.slice()
      })
      .then(function () { return client })
  }
}

function getAllTables (result) {
  return function (client) {
    let text = userTablesQuery.text
    let args = userTablesQuery.values

    return client.query(text, args)
      .then(function (res) {
        result.columns = res.rows.slice(0)
      })
      .then(function () { return client })
  }
}

function mergeResults (result) {
  return function () {
    assert(result.tables.length > 0)
    assert(result.columns.length > 0)

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
    // todo: delete
    // result.columns = null

    return result
  }
}

/**
 * Returns a promise that binds to a statement, and returns a
 */
function execute (statement, args) {
  args = args || []
  return function (client) {
    return client.query(statement, args)
      .then(function (res) {
        client.release()

        return res.rows
      })
  }
}

PostgresDb.prototype.connect = function () {
  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  return this.pool.connect()
}

PostgresDb.prototype.run = function (statement) {
  return this.connect()
    .then(execute(statement))
}

// useful when scripting a database
PostgresDb.prototype.getSchema = function () {
  var result = {}
  return this.connect()
    .then(getAllTables(result))
    .then(getAllColumns(result))
    .then(mergeResults(result))
}

module.exports = PostgresDb
