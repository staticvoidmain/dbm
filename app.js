
'use strict'

// todo: should we actually support stand-alone commands too?
// const fs = require('fs')
const blessed = require('blessed')
// const login = require('./views/login.js')
const menu = require('./views/menu.js')

// blessed forces a lot of duplicate declarations of common things.
// like, if I want vi-mode then... like... wtf.
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
    border: {
      type: 'line', fg: 'cyan'
    },
    cursor: {
      shape: 'underline',
      color: 'cyan',
      blink: true
    },
    /* not sure about these settings.. */
    // dump: __dirname + '/logs/dbm.log',
    // terminal: 'xterm',
    // fullUnicode: true,
    // warnings: true,
    // autoPadding: true,
    smartCSR: true
  },
  buttonStyle: {
    bg: 'blue',
    fg: 'white',
    focus: {
      bg: 'magenta'
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

// // todo: sprinkle in some emacs-like keybindings.
// let exists = fs.existsSync('creds.yml')

// if (exists) {
//   app.creds = fs.readFileSync('creds.yml', 'utf8')
//   menu.show(app)
// } else {
//   login.show(app)
// }

menu.show(app)
