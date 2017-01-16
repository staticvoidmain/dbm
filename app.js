
'use strict'

// todo: should we actually support stand-alone commands too?
const fs = require('fs')
const blessed = require('blessed')
const login = require('./views/login.js')
const menu = require('./views/menu.js')

// blessed forces a lot of duplicate declarations of common things.
// like, if I want vi-mode then... like... wtf.
var app = {
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
    // autoPadding: true,
    smartCSR: true
  },
  buttonStyle: {
    bg: 'blue',
    fg: 'black',
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
// let exists = fs.existsSync('.creds')

// if (exists) {
//   app.creds = fs.readFileSync('.creds', 'utf8')
//   menu.show(app)
// } else {
//   login.show(app)
// }

menu.show(app)
