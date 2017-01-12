
'use strict'

const blessed = require('blessed')

var screen = blessed.screen({
  terminal: 'xterm-256color',
  fullUnicode: true,
  warnings: true,
  autoPadding: true,
  fastCSR: true
})

var menu = blessed.form({
  left: 'center',
  top: 'center',
  keys: true,
  mouse: false,
  content: 'dbm interactive session',
  border: 'line',
  width: '50%',
  height: '50%'
})

var commands = ['migrate', 'dump', 'roll-back', 'validate']
commands.forEach(function (label, i) {
  var check = blessed.checkbox({
    vi: true,
    keys: true,
    mouse: false,
    name: 'cmd_' + label,
    content: label,
    height: 1,
    top: i + 2,
    style: { fg: 'magenta' }
  })

  menu.append(check)
})

screen.append(menu)

// todo: emacs-like keybindings.
screen.key(['C-c', 'q', 'escape'], () => {
  screen.destroy()
})

screen.render()
