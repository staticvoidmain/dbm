
'use strict'

// todo: should we actually support stand-alone commands too?
// const fs = require('fs')
const blessed = require('blessed')
// const login = require('./views/login.js')
const menu = require('./views/menu.js')

var app = {
  // todo: these are just temp settings
  env: {
    vendor: 'postgres',
    host: 'localhost',
    user: 'sql_pg',
    password: 'abc123',
    name: 'ross'
  },
  screen_settings: {
    debug: true,
    cursor: {
      shape: 'underline',
      color: 'blue',
      blink: true
    },
    /* not sure about these settings.. */
    // dump: __dirname + '/logs/dbm.log',
    // terminal: 'xterm',
    // fullUnicode: true,
    // warnings: true,
    smartCSR: true
  },
  styles: {
    button: {
      bg: 'blue',
      fg: 'white',
      focus: {
        bg: 'magenta'
      }
    },
    listtable: {
      border: {
        type: 'line',
        fg: 'cyan'
      },
      header: {
        fg: 'blue',
        bold: 'true'
      },
      cell: {
        fg: 'white',
        selected: {
          bg: 'blue'
        }
      }
    },
    listbar: {
      bg: 'black',
      item: {
        fg: 'white',
        bg: 'cyan'
      },
      selected: {
        bg: 'blue'
      }
    }
  },
  screen: function (opt) {
    let screen = blessed.screen(Object.assign({}, this.screen_settings, opt))

    screen.key(['C-c', 'q', 'escape'], () => {
      screen.destroy()
    })

    return screen
  }
}

menu.show(app)
// login.show(app)