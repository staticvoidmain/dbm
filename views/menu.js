'use strict'

const fs = require('fs')
const blessed = require('blessed')
const migration = require('./migration.js')
const yaml = require('js-yaml')

module.exports = {
  show: function (app) {
    // todo
    var screen = app.screen()
    var box = blessed.box({
      parent: screen,
      border: 'line',
      width: '90%',
      height: '80%',
      content: 'PLACEHOLDER MENU',
      tags: true
    })

    // sliiiiiick
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
      // todo: make this impl_home or something.
      cwd: process.env.HOME,
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
          // TODO: error logging.
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
