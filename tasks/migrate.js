
// this is the migration runner.

const sql = require('sql')
const inherits = require('util').inherits
const EventEmitter = require('events')

function identifier (id) {
  let parts = id.split('.')

  if (parts.length > 1) {
    return {
      schema: parts[0],
      name: parts[1]
    }
  } else {
    return { name: id }
  }
}

function Step () {
  this.status = 'pending'
  this.query = null
}

function DropObject (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('unable to parse drop')
  }

  Step.call(this)

  this.i = i
  this.type = parts[1]
  this.name = step[key]
  this.db = step.on
}

inherits(DropObject, Step)

DropObject.prototype.render = function (sqlgen) {
  if (this.query) {
    return this.query
  }

  var id = identifier(this.name)

  if (this.type === 'table') {
    var table = sqlgen.define({
      name: id.name,
      schema: id.schema || 'dbo',
      columns: [] // doesn't matter, we're dropping it
    })

    this.query = table.drop().ifExists().toQuery().text
  } else {
    this.query = 'todo'
    // well shit.
  }

  return this.query
}

DropObject.prototype.toString = function () {
  let status = this.status
  let type = this.type
  let name = this.name

  return `${status} | DROP ${type} ${name}`
}

function CreateObject (key, step) { }

function createSteps (steps) {
  // todo: pass in the sql generator... or pass it to render...
  let models = []
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]

    for (let key in step) {
      if (key.startsWith('drop')) {
        models.push(new DropObject(i, key, step))
        break
      }

      if (key.startsWith('create')) {
        models.push(new CreateObject(i, key, step))
        break
      }

      // todo: alter etc etc etc
    }
  }

  // todo: stuff
  return models
}

/**
 * TODO: support journaling to a database?
 */
function MigrationRunner (options) {
  // stole this from a tutorial, but I kinda like it.
  // saves you if you forget the new keyword.
  if (!(this instanceof MigrationRunner)) {
    return new MigrationRunner(options)
  }

  this.sqlgen = sql.create('mssql', {})
  this.activeStep = null
  this.stepIndex = -1
  this.stepCount = options.steps.length
  this.steps = createSteps(options.steps)
  if (!options.no_sort) {
    this.sortSteps()
  }
  // todo: this is required for codegen... uncomment
  // this.platform = options.platform || 'mssql'
  // zomg fake db help.
  this.db = {
    run: function (command) {
      return new Promise(function (resolve) {
        let sleep = Math.floor(Math.random() * 5000)
        setTimeout(function () {
          resolve({
            success: true,
            messages: 'execution time = ' + sleep + 'ms'
          })
        }, sleep)
      })
    }
  }

  EventEmitter.call(this)
}

inherits(MigrationRunner, EventEmitter)

MigrationRunner.prototype.log = function (message) {
  let d = new Date()
  let date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
  let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
  let ts = date + ' ' + time

  this.logger.log('{yellow-fg}' + ts + '{/yellow-fg}: ' + message)
}

MigrationRunner.prototype.sortSteps = function () {
  // todo: sort into the proper order.
  // order as follows
  // - drops
  // - create
  // - trigger
  // - views
  // - procs
  // - run
}

MigrationRunner.prototype.getStepNames = function () {
  return this.steps.map(function (step) {
    return step.toString()
  })
}

MigrationRunner.prototype.start = function () {
  if (this.status) {
    return
  }

  // TODO: need timestamps on all logger calls.
  // and some formatting might be nice too.
  this.log('migration started')
  this.status = 'started'
  this.stepIndex++
  this.next()
}

MigrationRunner.prototype.next = function () {
  let self = this
  let step = this.steps[this.stepIndex]

  // maybe something a little more sophisticated here
  // like completed with errors or something.
  if (!step) {
    this.log('Migration Complete')
    this.status = 'COMPLETE'
    this.emit('done')
    return
  }

  // I guess this should just be runStep
  step.status = 'running'
  this.emit('step', step)

  this.log('running step: ' + step.toString())
  let query = step.render(this.sqlgen)

  self.log(query)

  this.db.run(query).then(function (result) {
    self.log('Step Completed')
    self.log(result.messages)

    if (result.success) {
      step.status = 'complete'
      self.emit('step', step)
      self.stepIndex++
      self.next()
    } else {
      step.status = 'failed'
      self.emit('step', step)
    }
  }).catch(function (err) {
    self.log('{red-fg}' + err + '{/red-fg}')
  })
}

MigrationRunner.prototype.retry = function () {
  this.next()
}

MigrationRunner.prototype.skip = function () {
  this.stepIndex++
  this.next()
}

MigrationRunner.prototype.constructor = EventEmitter

module.exports = MigrationRunner
