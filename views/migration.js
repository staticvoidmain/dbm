/*

  This screen handles some stuff.
*/
const blessed = require('blessed')
const runner = require('../tasks/migrate.js')

module.exports = {
  show: function (app) {
    // do we show a new screen each time?
    // I'm not sure how this is really supposed to be designed
    var screen = app.screen()
    var steps = blessed.list({
      parent: app.screen,
      width: '50%',
      height: '50%',
      left: 0,
      items: runner.getStepNames()
    })

    var logger = blessed.log({
      parent: app.screen,
      width: '50%+1',
      height: '50%+1',
      border: 'line',
      tags: true,
      keys: true,
      vi: true,
      mouse: true,
      scrollback: 100,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'yellow'
        },
        style: {
          inverse: true
        }
      }
    })

    var bar = blessed.listbar({
      items: [
        'start',
        'stop',
        'pause',
        'skip',
        'retry'
      ],
      top: app.screen.height - 5
    })

    bar.on('press', function (command) {
      runner.send(command)
    })
     // pseudocode.
    runner.on('step', function () { 

    })

    runner.logger = logger
  }
}
