
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

// function CreateObject() { }
// I wonder if we could use that sql library...
// imma import it tonight
function DropObject (key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('unable to parse drop')
  }

  Step.call(this)

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

    this.query = table.drop().ifExists().toQuery()
  } else {

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
        models.push(new DropObject(key, step))
        break
      }

      if (key.startsWith('create')) {
        models.push(new CreateObject(key, step))
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
      return new Promise(function (resolve, reject) {
        let sleep = Math.floor(Math.random() * 5000)
        setTimeout(function () {
          resolve({
            success: Math.random() > 0.5,
            messages: command + '\ntook ' + sleep + 'ms'
          })
        }, sleep)
      })
    }
  }

  EventEmitter.call(this)
}

inherits(MigrationRunner, EventEmitter)

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
  this.logger.log('migration started')
  this.status = 'started'
  this.stepIndex++
  this.next()
}

MigrationRunner.prototype.next = function () {
  let step = this.steps[this.stepIndex]

  // I guess this should just be runStep
  step.status = 'running'
  this.emit('step', step)

  this.logger.log('running step: ' + step.toString())
  let query = step.render(this.sqlgen)

  this.db.run(query).then(function (result) {
    this.logger.log(result.messages)

    if (result.success) {
      step.status = 'complete'
      this.emit('step', step)
      this.stepIndex++
      this.next()
    } else {
      step.status = 'failed'
      this.emit('step', step)
    }
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
