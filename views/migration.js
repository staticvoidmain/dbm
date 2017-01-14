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
      left: 5,
      bottom: 0,
      commands: {
        'start': function () { runner.start() },
        'stop': function () { runner.stop() },
        'pause': function () { runner.pause() },
        'skip': function () { runner.skip() },
        'retry': function () { runner.retry() }
      }
    })

    bar.on('press', function (command) {
      runner[command]()
    })

    runner.on('step', function (step) {
      let item = steps.items[step.i]
      steps.setItem(item, step.toString())
    })

    runner.logger = logger
    bar.focus()
    screen.render()
  }
}
