'use strict'

const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('../lib/database')
const sql = require('sql')
const fs = require('fs')
const path = require('path')

// todo: find and replace all my hard coded bullshit
// and make it nicer.
function BackupRunner (options) {
  this.sqlgen = sql.create(options.vendor, {})
  this.db = factory.create(options.vendor, options)
}

inherits(BackupRunner, EventEmitter)

BackupRunner.prototype.run = function (schema, options) {
  let self = this

  if (!schema) {
    throw Error('I need a schema fool')
  }

  // TODO!! None of these options actually exist or are able to
  // be specified by callers, it is always undefined.
  options = options || {}
  let backupName = options.backupName || 'backup.sql'
  let backupPath = options.backupPath
  let sqlgen = self.sqlgen

  if (!options.scriptPerObject) {
    let filePath = path.join(backupPath, backupName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  if (schema.tables) {
    schema.tables.forEach(function (table) {
      let tableGenerator = sqlgen.define({
        name: table.name,
        schema: table.schema,
        columns: []
      })

      table.columns.forEach(function (col) {
        tableGenerator.addColumn({
          // todo: these columns and generators
          // are a little fiddly
          name: col.name,
          precision: col.precision,
          dataType: col.type,
          defaultValue: col.defaultValue,
          notNull: !col.isNullable
        })
      })

      let q = tableGenerator.create()

      if (options.safe) {
        q = q.ifNotExists()
      }

      if (options.scriptPerObject) {
        backupName = table.schema + '.' + table.name + '.sql'
      }

      // add platform batch separator?
      let text = q.toQuery().text + self.db.separator
     
      fs.appendFileSync(
        path.join(backupPath, backupName), text, 'utf8')

      self.emit('done')
    })
  }
}

module.exports = BackupRunner
