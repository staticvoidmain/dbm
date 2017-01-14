/*

  This screen handles some stuff.
*/
const blessed = require('blessed')
const MigrationRunner = require('../tasks/migrate.js')

module.exports = {
  show: function (app, doc) {
    var runner = new MigrationRunner(doc)
    var screen = app.screen({
      width: '95%',
      height: '95%',
      border: 'line'
    })

    var steps = blessed.list({
      label: 'steps',
      parent: screen,
      width: '50%',
      height: '100%',
      border: 'line',
      left: 0,
      top: 0,
      items: runner.getStepNames()
    })

    var logger = blessed.log({
      parent: screen,
      width: '50%',
      height: '100%',
      left: '50%+1',
      top: 0,
      border: 'line',
      tags: true,
      keys: true,
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
      parent: screen,
      label: 'commands',
      autoCommandKeys: true,
      width: 'shrink',
      height: 1,
      keys: true,
      style: {
        bg: 'green',
        item: {
          bg: 'red',
          focus: {
            bg: 'blue'
          }
        },
        selected: {
          bg: 'blue'
        }
      },
      heigth: 3,
      left: 5,
      bottom: 1,
      commands: {
        'start': function () { runner.start() },
        'retry': function () { runner.retry() },
        'skip': function () { runner.skip() },
        'pause': function () { runner.pause() },
        'stop': function () { runner.stop() }
      }
    })

    bar.on('press', function (command) {
      runner[command]()
    })

    runner.on('step', function (step) {
      let item = steps.items[step.i]
      steps.setItem(item, step.toString())
      screen.render()
    })

    runner.logger = logger
    bar.focus()
    screen.render()
  }
}
