const blessed = require('blessed')
const main = require('./menu.js')

module.exports = {
  show: function (app) {
    // todo: test out the "layout" instead of just a raw box.
    // but I'm not sure how to use it.
    var screen = app.screen()

    var menu = blessed.form({
      parent: screen,
      label: 'login',
      left: 'center',
      top: 'center',
      keys: true,
      border: 'line',
      width: '50%',
      height: '50%'
    })

    blessed.text({
      left: 6,
      top: 4,
      width: 'half',
      parent: menu,
      tags: true,
      style: { fg: 'white' },
      content: '{bold}User Name:{/bold}'
    })

    var user = blessed.textbox({
      parent: menu,
      height: 1,
      name: 'username',
      style: { bg: 'white', fg: 'black' },
      width: 'half',
      left: 5,
      top: 5
    })

    blessed.text({
      left: 6,
      top: 6,
      tags: true,
      width: 'half',
      parent: menu,
      style: { fg: 'white' },
      content: '{bold}Password:{/bold}'
    })

    var password = blessed.textbox({
      parent: menu,
      height: 1,
      censor: true,
      width: 'half',
      left: 5,
      top: 7,
      style: { bg: 'white', fg: 'black' },
      name: 'password'
    })

    user.on('focus', function () { user.readInput() })
    password.on('focus', function () { password.readInput() })

    var submit = blessed.button({
      parent: menu,
      mouse: true,
      keys: true,
      shrink: true,
      padding: {
        left: 2,
        right: 2
      },
      left: 2,
      bottom: 0,
      name: 'next_button',
      content: '[ Login ]',
      style: app.styles.button
    })

    let showMenu = function () {
      // todo: stash login creds.
      // show the main menu, this can be bypassed maybe.
      main.show(app)
      // todo: destroy the login screen?
      // seems legit
      screen.destroy()
    }

    password.on('enter', showMenu)
    submit.on('press', showMenu)

    user.focus()
    screen.render()
  }
}

