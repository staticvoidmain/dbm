'use strict'

const fs = require('fs')
const blessed = require('blessed')
const yaml = require('js-yaml')
const migration = require('./migration.js')
const backupView = require('./backup.js')

module.exports = {
  show: function (app) {
    var screen = app.screen()
    var box = blessed.box({
      label: 'Main Menu',
      parent: screen,
      border: 'line',
      width: '90%',
      height: '80%',
      tags: true
    })

    // todo: here we let them... select the operation to perform
    var menu = blessed.list({
      parent: box,
      label: 'Tasks',
      border: 'line',
      style: {
        selected: {
          bg: 'blue'
        }
      },
      keys: true,
      hidden: false,
      height: 'half',
      width: 'half',
      top: 'center',
      left: 'center'
    })

    menu.add('Backup:   export the schema and data to the file-system')
    menu.add('Migrate:  run a set of scripts against the database to create/update or remove db objects')
    menu.add('Analyze:  inspect your database for potential problems.')
    menu.add('Optimize: automatically fix common database performance issues.')

    menu.on('action', function (item, i) {
      if (i === 0) {
        backup()
      } else if (i === 1) {
        migrate()
      }
      // todo: all the rest
    })

    function backup () {
      backupView.show(app)
      screen.destroy()
    }

    function migrate () {
      menu.hide()
      fm.refresh()
      fm.show()
      fm.focus()
    }

    var msg = blessed.message({
      parent: screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: '{red-fg}Error{/red-fg} ',
      tags: true,
      keys: true,
      hidden: true
    })

    // todo: file manager with a path, to support network drives and such
    var fm = blessed.filemanager({
      parent: box,
      border: 'line',
      style: {
        selected: {
          bg: 'blue'
        }
      },
      hidden: true,
      height: 'half',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' {blue-fg}%path{/blue-fg}',
      cwd: process.env.DBM_HOME,
      keys: true,
      scrollbar: {
        bg: 'white',
        ch: ' '
      }
    })

    fm.on('file', function (file) {
      let isJson = file.endsWith('.js') || file.endsWith('.json')
      let isYaml = file.endsWith('.yml') || file.endsWith('.yaml')
      let doc = null

      if (isYaml || isJson) {
        let contents = fs.readFileSync(file)

        try {
          if (isYaml) {
            doc = yaml.safeLoad(contents)
          } else {
            doc = JSON.parse(contents)
          }
        } catch (ex) {
          // TODO: error logging? to where?
          msg.error(ex)
          return
        }

        migration.show(app, doc)
      }

      screen.destroy()
    })

    menu.focus()
    screen.render()
  }
}
