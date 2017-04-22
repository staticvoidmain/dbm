import * as sql from 'sql'
import { EventEmitter } from 'events'
import { create as factory, IManagedDatabase } from '../lib/database'
import { existsSync, unlinkSync, appendFileSync } from 'fs'
import { join } from 'path'
import { Server } from "../lib/environment";
import { IDatabaseSchema } from "../lib/vendors/common";

export class IBackupOptions {
  backupName?: string
  backupPath?: string
  scriptPerObject?: boolean
  safe?: boolean
}

export class BackupRunner extends EventEmitter {
  private sqlgen: any
  private db: IManagedDatabase

  constructor(server: Server) {
    super()

    this.sqlgen = sql.create(server.vendor, {})
    
    // so... we create the db, just to get the separator...
    // 4head
    this.db = factory(server)
  }

  /**
   * this runs a FILE backup. there will also be a backup STEP that runs during a migration.
   * @param schema if this is schema selective
   * @param options specific backup options.
   */
  run(schema: IDatabaseSchema, options?: IBackupOptions) {
    if (!schema) {
      throw Error('I need a schema fool')
    }

    options = options || {}
    let backupName = options.backupName || 'backup.sql'
    let backupPath = options.backupPath

    if (!options.scriptPerObject) {
      let filePath = join(backupPath, backupName)
      if (existsSync(filePath)) {
        this.emit('log', 'deleting previous backup file: ' + filePath)
        unlinkSync(filePath)
      }
    }

    if (schema.tables) {
      schema.tables.forEach((table) => {
        let tableGenerator = this.sqlgen.define({
          name: table.name,
          schema: table.schema,
          columns: []
        })

        table.columns.forEach((col) => {
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
        
        this.emit('log', 'table: ' + table.schema + '.' + table.name)
      })
    }

    if (schema.views) {
      // todo
    }

    if (schema.procedures) {
      
    }

    this.emit('done')
  }
}