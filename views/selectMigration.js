'use strict'
const blessed = require('blessed')

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const migration = require('./migration.js')

function testFileExtension (file) {
  let isJson = file.endsWith('.js') || file.endsWith('.json')
  let isYaml = file.endsWith('.yml') || file.endsWith('.yaml')

  return {
    isJson: isJson,
    isYaml: isYaml
  }
}

module.exports = {
  show: function (app) {
    var screen = app.screen()
    var prompt = blessed.prompt({
      parent: screen,
      left: 0,
      top: 0,
      height: 4,
      width: 'half',
      keys: true,
      tags: true,
      border: 'line',
      hidden: true
    })

    var msg = blessed.message({
      parent: screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: 'Info',
      tags: true,
      keys: true,
      hidden: true
    })

    // todo: file manager with a path, to support network drives and such
    var fm = blessed.filemanager({
      parent: screen,
      border: 'line',
      style: {
        selected: {
          bg: 'blue',
          bold: true
        }
      },
      height: 'half',
      width: '50%-1',
      top: 5,
      left: 0,
      label: ' {blue-fg}%path{/blue-fg}',
      cwd: process.env.DBM_HOME,
      vi: true,
      keys: true,
      scrollbar: {
        bg: 'white',
        ch: ' '
      },
      search: function (callback) {
        prompt.input('{bold}Find:{/bold}', '', function (err, value) {
          if (err) return
          return callback(null, value)
        })
      }
    })

    var preview = blessed.scrollablebox({
      parent: screen,
      tags: true,
      border: 'line',
      label: ' {blue-fg}{bold}Contents{/bold}{/blue-fg}',
      top: 5,
      left: '50%+1',
      width: '50%-1',
      height: 'half',
      content: ''
    })

    function onSelectedItemChange (item) {
      let value = blessed.helpers.cleanTags(item.content)
      let file = path.resolve(fm.cwd, value)

      fs.stat(file, function (err, stat) {
        if (err) {
          throw err
        }

        if (!stat.isDirectory()) {
          let test = testFileExtension(value)

          if (test.isYaml || test.isJson) {
            let content = fs.readFileSync(file, 'utf8')
            preview.setLabel(value)
            preview.setContent(content)
            screen.render()
          }
        }
      })
    }

    fm.on('select item', onSelectedItemChange)
    fm.key('backspace', () => fm.select(0))

    fm.on('file', function (file) {
      let doc = null
      let test = testFileExtension(file)

      if (test.isYaml || test.isJson) {
        let contents = fs.readFileSync(file)

        try {
          if (test.isYaml) {
            doc = yaml.safeLoad(contents)
          } else {
            doc = JSON.parse(contents)
          }

          doc.path = file
        } catch (ex) {
          msg.error(ex)
          return
        }

        migration.show(app, doc)
      }

      screen.destroy()
    })

    fm.focus()
    fm.refresh()
    screen.render()
  }
}

