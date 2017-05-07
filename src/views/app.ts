import * as blessed from 'blessed'
import * as menu from './menu'

export function show() {
  const app = {
    screen_settings: {
      debug: true,
      cursor: {
        shape: 'underline',
        color: 'blue',
        blink: true
      },
      /* not sure about these settings.. */
      dump: __dirname + '/logs/dbm.log',
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
        selected: {
          bg: 'blue'
        },
        border: {
          type: 'line',
          fg: 'cyan'
        },
        header: {
          fg: 'blue',
          underline: true
        },
        cell: {
          border: 'line',
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
      const screen = blessed.screen(Object.assign({}, this.screen_settings, opt))

      screen.key(['C-c'], () => {
        screen.destroy()
      })

      return screen
    }
  }

  menu.show(app)
}