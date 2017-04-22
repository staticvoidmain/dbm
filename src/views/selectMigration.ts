
import * as blessed from 'blessed'
import { MigrationDocument, testFileExtension } from "../tasks/migration/document";

import {
  stat,
  readFileSync
} from 'fs'

import { show as showMigration } from './migration'

import * as path from 'path'
import * as yaml from 'js-yaml'
import * as emphasize from 'emphasize'

export function show (app) {
    var screen = app.screen()
    // this is annoying...
    var input = blessed.textbox({
      parent: screen,
      top: 2,
      left: 0,
      height: 'shrink',
      width: '25%',
      border: 'line',
      label: 'Search: ',
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
          bg: 'blue'
        }
      },
      height: '100%-5',
      width: '50%-2',
      top: 5,
      left: 0,
      label: ' {blue-fg}%path{/blue-fg}',
      cwd: process.env.DBM_HOME,
      vi: true,
      keys: true,
      scrollbar: {
        bg: 'yellow',
        ch: ' '
      },
      search: function (callback) {
        input.show()
        input.readInput(function (err, value) {
          input.hide()
          screen.restoreFocus()
          if (err) return
          return callback(null, value)
        })
        screen.render()
      }
    })

    var preview = blessed.scrollablebox({
      parent: screen,
      tags: true,
      border: 'line',
      top: 5,
      left: '50%+1',
      width: '50%-2',
      height: '100%-5',
      scrollbar: {
        bg: 'yellow',
        ch: ' '
      },
      content: ''
    })

    function onSelectedItemChange (item) {
      let value = blessed.helpers.cleanTags(item.content)
      let file = path.resolve(fm.cwd, value)

      stat(file, function (err, stat) {
        if (err) {
          throw err
        }

        if (!stat.isDirectory()) {
          let test = testFileExtension(value)

          if (test.isYaml || test.isJson) {
            let content = readFileSync(file, 'utf8')
            let formatted = test.isYaml
              ? emphasize.highlight('yaml', content)
              : emphasize.highlight('json', content)

            preview.setLabel(value)
            preview.setContent(formatted.value)
            screen.render()
          }
        }
      })
    }

    fm.on('select item', onSelectedItemChange)
    fm.key('backspace', () => fm.select(0))

    fm.on('file', function (file) {

      let doc: MigrationDocument = null

      try {
        doc = new MigrationDocument(file)         
      } catch (ex) {
        msg.error(ex)
        return
      }

      showMigration(app, doc)
      screen.destroy()
    })

    fm.focus()
    fm.refresh()
    screen.render()
  }

