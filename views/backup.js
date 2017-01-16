'use strict'

const blessed = require('blessed')
const BackupRunner = require('../tasks/backup.js')
const factory = require('../lib/database.js')

// todo: check the terminal settings maybe?
// to make sure they actually see this.
// otherwise make it an asterisk
const check = '✓'

module.exports = {
  show: function (app) {
    let self = this
    let screen = app.screen({
      height: '90%',
      width: '90%'
    })

    // okay, so we'll backup some shit.
    let objects = blessed.listtable({
      hidden: true,
      parent: screen,
      top: 'center',
      left: 'center',
      data: null,
      border: 'line',
      align: 'center',
      tags: true,
      keys: true,
      width: 'shrink',
      height: '70%',
      vi: true,
      mouse: true,
      style: {
        border: {
          fg: 'red'
        },
        header: {
          fg: 'blue',
          bold: true
        },
        cell: {
          fg: 'magenta',
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

    // todo: get this passed in somewhere.
    var conf = {
      host: 'localhost',
      name: 'ross',
      user: 'sql_pg',
      password: 'abc123'
    }

    var db = factory.create('postgres', conf)

    db.on('error', function (err) {
      msg.error(err)
    })

    db.getSchema().then(function (schema) {
      var headers = ['include', 'data', 'type', 'schema', 'name']
      var tables = schema.tables.map(function (table) {
        return [ check, ' ', 'table', table.schema, table.name ]
      })
      // stash it for later.
      self.schema = schema
      self.data = headers.concat(tables)
      objects.setData(self.data)
      objects.show()
      screen.render()
    }).catch(function (err) {
      msg.error(err, 10)
    })

    objects.on('action', function (item) {
      // toggle in order: include, data, none
      let i = objects.getItemIndex(item)
      let line = self.data[i]
      if (line[0] === check && line[1] === check) {
        line[0] = line[1] = ' '
      } else if (line[0] === check) {
        line[1] = check
      } else {
        line[0] = check
      }

      screen.render()
    })

    var backup = new BackupRunner(conf)

    backup.on('log', function () {
      // todo: do some stuff.
    })

    let start = blessed.button({
      parent: screen,
      left: 5,
      border: 'line',
      width: 'shrink',
      style: { },
      bottom: 0,
      content: 'Start'
    })

    start.on('press', function () {
      // todo: convert the options to
      backup.run()
    })

    screen.render()
  }
}
