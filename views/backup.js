'use strict'

const blessed = require('blessed')
const BackupRunner = require('../tasks/backup.js')
const factory = require('../lib/database.js')

// todo: check the terminal settings maybe?
// to make sure they actually see this.
// otherwise make it an asterisk
const check = 'Y'

module.exports = {
  show: function (app) {
    var self = this
    let screen = app.screen({
      height: '100%',
      width: '100%'
    })

    // let box = blessed.box({
    //   label: 'Backup Database'
    // })

    let objects = blessed.listtable({
      label: 'Objects',
      hidden: true,
      parent: screen,
      top: 'center',
      left: 'center',
      border: 'line',
      align: 'center',
      tags: true,
      keys: true,
      width: '70%',
      height: '70%',
      style: {
        border: {
          fg: 'red'
        },
        header: {
          fg: 'blue',
          bold: true
        },
        cell: {
          fg: 'white',
          selected: {
            bg: 'blue'
          }
        }
      }
    })

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

    // var loading = blessed.loading({
    //   parent: screen,
    //   top: 'center',
    //   left: 'center',
    //   width: 'shrink',
    //   height: 'shrink',
    //   label: 'Loading Schema...'
    // })

    var db = factory.create(app.env.vendor, app.env)

    db.on('error', function (err) {
      msg.error(err)
    })

    let flags = []
    db.getSchema().then(function (schema) {
      self.schema = schema
      let rows = [
        ['include', 'data', 'type', 'schema', 'name']
      ]

      if (schema.tables) {
        schema.tables.forEach(function (table) {
          rows.push([ check, ' ', 'table', table.schema, table.name ])
          flags.push(table)
        })
      } else {
        msg.log("You ain't got no tables fool!")
      }

      self.data = rows
      objects.setData(self.data)
      objects.show()
      objects.focus()
      screen.render()
    }).catch(function (err) {
      msg.error(err.stack, 10)
    })

    objects.key('y', function () {
      // toggle things on.
    })

    objects.key('n', function () {
      // toggle things off.
    })

    objects.on('action', function (item) {
      // toggle in order: include, data, none
      let i = objects.getItemIndex(item)
      let line = self.data[i]

      if (line[1] === check) {
        line[0] = line[1] = 'N'
      } else if (line[0] === check) {
        line[1] = check
      } else {
        line[0] = check
      }

      var selected = objects.selected
      objects.setData(self.data)
      objects.select(selected)
      screen.render()
    })

    var backup = new BackupRunner(app.env)

    backup.on('log', function () {
      // todo: do some stuff.
    })

    let start = blessed.button({
      parent: screen,
      left: 5,
      width: 'shrink',
      style: app.buttonStyle,
      bottom: 0,
      keys: true,
      mouse: true,
      content: '[ Start ]',
      shrink: true,
      padding: {
        left: 2,
        right: 2
      }
    })

    start.on('press', function () {
      let data = self.data.slice(1)

      for (let i = 0; i < data.length; data++) {
        let row = data[i]

        if (row[0] === 'Y') {
          flags[i].include = true

          if (row[1] === 'Y') {
            flags[i].data = true
          }
        }
      }

      backup.run(this.schema, app.env)
    })

    screen.render()
  }
}
