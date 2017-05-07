
import * as blessed from 'blessed'
import { show as showBackup } from './backup'
import { show as showConfig } from './config'
import { show as showMigrationSelect } from './selectMigration'
import { show as showServerSelect } from './serverSelection'

export function show(app) {
  const screen = app.screen()

  const menu = blessed.list({
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
    // todo: all of these are actually server-select first.

    if (i === 0) {

      showServerSelect(app,
        (server) => showBackup(app, server))

    } else if (i === 1) {
      showServerSelect(app,
        (server) => showMigrationSelect(app, server))

    } else if (i === 2) {
      //  showServerSelect(app,
      //   (server) => showAnalysis(app, server))


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
