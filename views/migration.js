/*

  This screen handles some stuff.
*/
const blessed = require('blessed')
const MigrationRunner = require('../tasks/migrate.js')

const statusToColorMap = {
  'failed': 'red',
  'complete': 'green',
  'running': 'blue'
}

function formatStepString (step) {
  let stepString = step.toString()
  let color = statusToColorMap[step.status]
  var start = ''
  var end = ''

  if (color) {
    start = `{${color}-bg}`
    end = `{/${color}-bg}`
  }

  return start + `${step.status} | ${stepString}` + end
}

module.exports = {
  show: function (app, doc) {
    var screen = app.screen({
      width: '95%',
      height: '95%',
      border: 'line'
    })

    var logger = blessed.log({
      parent: screen,
      width: '50%+1',
      height: '100%',
      left: '50%-1',
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

    var log = function (message) {
      let d = new Date()
      let date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
      let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
      let ts = date + ' ' + time

      logger.log('{yellow-fg}' + ts + '{/yellow-fg}: ' + message)
    }

    var runner = new MigrationRunner(doc, app.env)
    log('Loaded migration: ' + doc.path)

    runner.on('log', log)
    runner.on('error', function (err) {
      log('{red-fg}' + err + '{/red-fg}')
    })

    runner.validate()
    var steps = blessed.list({
      label: 'steps',
      parent: screen,
      width: '50%',
      height: '100%',
      border: 'line',
      tags: true,
      left: 0,
      top: 0,
      items: runner.steps.map(formatStepString)
    })

    runner.on('step', function (step) {
      let item = steps.items[step.i]
      steps.setItem(item, formatStepString(step))
      screen.render()
    })

    var bar = blessed.listbar({
      parent: screen,
      label: 'commands',
      autoCommandKeys: true,
      width: 'shrink',
      height: 1,
      keys: true,
      style: {
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

    bar.focus()
    screen.render()
  }
}
