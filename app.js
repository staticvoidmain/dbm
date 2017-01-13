
'use strict'

// todo: get opt, and if we specify the -i, --interactive mode, then we show the  

const blessed = require('blessed')

var screen = blessed.screen({
  debug: true,
  // dump: __dirname + '/logs/dbm.log',
  // terminal: 'xterm',
  // fullUnicode: true,
  // warnings: true,
  // autoPadding: true,
  smartCSR: true
})

screen.title = "dbm -i"

// this should probably use his Layout thing...
// but I'm not sure how to use it.
var menu = blessed.form({
  parent: screen,
  left: 'center',
  top: 'center',
  keys: true,
  border: 'line',
  width: '50%',
  height: '50%'
})

// todo: at this point, we know how large the window is? right?

// a box for the title.
var title = blessed.box({
  tags: true,
  parent: menu,
  height: 1,
  width: "100%",
  content: '{center}DBM Interactive{/center}'
})

// var commands = ['migrate', 'dump', 'roll-back', 'validate']
// commands.forEach(function (label, i) {
//   var check = blessed.checkbox({
//     parent: menu,
//     vi: true,
//     keys: true,
//     mouse: false,
//     name: 'cmd_' + label,
//     content: label,
//     height: 1,
//     left: 1,
//     top: i + 1,
//     style: { fg: 'magenta' }
//   })
// })

var user = blessed.textbox({
  parent: menu,
  height: 1,
  name: "username",  
  style: { bg: "white", fg: "black" },
  width: 'half',
  left: 5, top: 5
})

var password = blessed.textbox({
  parent: menu,
  height: 1,
  censor: true,
  width: 'half',
  left: 5, top: 8,
  style: { bg: "white", fg: "black" },
  name: "password"
})

user.on('focus', function() { user.readInput(); })
password.on('focus', function() { password.readInput() })

// var submit = blessed.button({
//   parent: menu,
//   mouse: true,
//   keys: true,
//   shrink: true,
//   padding: {
//     left: 2,
//     right: 2
//   },
//   left: 2,
//   top: "90%",
//   name: 'next_button',
//   content: '[ Login ]',
//   style: {
//     bg: 'blue',
//     focus: {
//       bg: 'red'
//     }
//   }
// });

// todo: emacs-like keybindings.
screen.key(['C-c', 'q', 'escape'], () => {
  screen.destroy()
})

menu.focus()
screen.render()
