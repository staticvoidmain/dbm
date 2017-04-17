'use strict'

import * as blessed from 'blessed'
import { show as showBackup } from './backup'
import { show as showConfig } from './config'
import { show as showMigrationSelect } from './selectMigration'

export function show(app) {
  var screen = app.screen()

  var menu = blessed.list({
    parent: screen,
    label: 'Tasks',
    border: 'line',
    style: {
      selected: {
        bg: 'blue'
      }
    },
    keys: true,
    height: 'half',
    width: 'half',
    top: 5,
    left: 5
  })

  menu.add('Backup:   export the schema and data to the file-system')
  menu.add('Migrate:  run a set of scripts against the database to create/update or remove db objects')
  menu.add('Analyze:  inspect your database for potential problems.')
  menu.add('Optimize: automatically fix common database performance issues.')
  menu.add('Config:   configure dbm')

  menu.on('action', function (item, i) {
    if (i === 0) {
      showBackup(app)
    } else if (i === 1) {
      showMigrationSelect(app)
    } else if (i === 2) {
      // todo
    } else if (i === 3) {
      // todo
    } else if (i === 4) {
      showConfig(app)
    }

    screen.destroy()
    // todo: all the rest
  })

  menu.focus()
  screen.render()
}
