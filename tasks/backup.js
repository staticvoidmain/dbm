'use strict'

const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('../lib/database')
const sql = require('sql')
const fs = require('fs')

// todo: find and replace all my hard coded bullshit
// and make it nicer.
function BackupRunner (options) {
  this.sqlgen = sql.create(options.vendor, {})
  this.db = factory.create(options.vendor, options)
}

inherits(BackupRunner, EventEmitter)

BackupRunner.prototype.run = function (schema) {
  let path = 'c:/dev/projects/dbm/test/backup.sql'

  if (schema.tables) {
    schema.tables.forEach(function (table) {
      let tableGenerator = sql.define({
        name: table.name,
        schema: table.schema
      })

      table.columns.forEach(function (col) {
        tableGenerator.addColumn({
          name: col.name,
          precision: col.precision,
          dataType: col.dataType
        })
      })

      let text = tableGenerator.create().toQuery().text

      fs.writeFileSync(path, text)
    })
  }
}

module.exports = BackupRunner
