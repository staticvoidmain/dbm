'use strict'

import * as sql from 'sql'
import { EventEmitter } from 'events'
import { create as factory } from '../lib/database'
import { existsSync, unlinkSync, appendFileSync } from 'fs'
import { join } from 'path'

export class BackupRunner extends EventEmitter {
  sqlgen: any
  db: any

  constructor(options) {
    super()

    this.sqlgen = sql.create(options.vendor, {})
    this.db = factory(options.vendor, options)
  }

  run(schema, options) {
    if (!schema) {
      throw Error('I need a schema fool')
    }

    options = options || {}
    let backupName = options.backupName || 'backup.sql'
    let backupPath = options.backupPath
    let sqlgen = this.sqlgen

    if (!options.scriptPerObject) {
      let filePath = join(backupPath, backupName)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
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

        // add platform batch separator
        let text = q.toQuery().text + this.db.separator

        appendFileSync(
          join(backupPath, backupName), text, 'utf8')
      })
    }

    this.emit('done')
  }
}