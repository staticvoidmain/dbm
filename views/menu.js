'use strict'

const blessed = require('blessed')

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

    fm.refresh()
    fm.focus()

    screen.render()
  }
}
