/*
  This screen handles some stuff.
*/
import * as blessed from 'blessed'
import { MigrationRunner } from '../tasks/migrate'

const statusToColorMap = {
  'failed': 'red',
  'complete': 'green',
  'running': 'blue'
}

function formatStepString(step) {
  const stepString = step.toString()
  const color = statusToColorMap[step.status]
  let start = ''
  let end = ''

  if (color) {
    start = `{${color}-bg}`
    end = `{/${color}-bg}`
  }

  return start + `${step.status} | ${stepString}` + end
}

export function show(app, doc, server) {
  const screen = app.screen({
    width: '95%',
    height: '95%',
    border: 'line'
  })

  const logger = blessed.log({
    label: 'output',
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

  const log = function (message) {
    const d = new Date()
    const date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
    const time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
    const ts = date + ' ' + time

    logger.log('{yellow-fg}' + ts + '{/yellow-fg}: ' + message)
  }

  const runner = new MigrationRunner(doc, server)
  log('Loaded migration: ' + doc.path)

  runner.on('log', log)
  runner.on('error', function (err) {
    log('{red-fg}' + err + '{/red-fg}')
  })

  runner.validate()
  const steps = blessed.list({
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
    const item = steps.items[step.i]
    steps.setItem(item, formatStepString(step))
    screen.render()
  })

  const bar = blessed.listbar({
    parent: screen,
    autoCommandKeys: true,
    width: 'shrink',
    height: 1,
    style: app.listbarStyle,
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
