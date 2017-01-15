'use strict'

const fs = require('fs')
const blessed = require('blessed')
const yaml = require('js-yaml')
const migration = require('./migration.js')
// const widgets = require('./widgets/custom.js')

// // todo: maybe read from the file system or something?
// function createTasks() {

// }

module.exports = {
  show: function (app) {
    // todo
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

    this.selectedOp = null

    // var form = blessed.form({

    // })

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
      height: 'half',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' {blue-fg}%path{/blue-fg} ',
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

    fm.refresh()
    fm.focus()

    screen.render()
  }
}
