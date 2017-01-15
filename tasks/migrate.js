
// this is the migration runner.

const sql = require('sql')
const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('./dbfactory')

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

const stepStatus = {
  pending: 'pending',
  running: 'running',
  complete: 'complete',
  skipped: 'skipped',
  failed: 'failed'
}

function Step (i, action) {
  this.i = i
  this.action = action
  this.status = stepStatus.pending
  this.query = null
}

function RunStep (i, key, step) {
  this.script = step['run']
  this.on = step.on

  Step.call(this, [i, 'run'])
}

inherits(RunStep, Step)

function DropObject (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('unable to parse drop')
  }

  Step.call(this, [i, 'drop'])

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
    // todo: not cross-vendor, or even good.
    this.query = `drop ${this.type} ${this.name}\ngo;`
  }

  return this.query
}

DropObject.prototype.toString = function () {
  let type = this.type
  let name = this.name
  let on = this.on

  if (on) {
    return `DROP ${type} ${name} ${on}`
  }

  return `DROP ${type} ${name}`
}

function CreateObject (i, key, step) {
  Step.call(this, [i])


}

CreateObject.prototype.toString = function () {

}

function createSteps (options) {
  // todo: pass in the sql generator... or pass it to render...
  let models = []
  let steps = options.steps
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]

    for (let key in step) {
      if (key.startsWith('drop')) {
        models.push(new DropObject(i, key, step))
        break
      }

      if (key.startsWith('create')) {
        // create triggers/views/etc
        models.push(new CreateObject(i, key, step))
        break
      }

      if (key === 'run') {
        models.push(new RunStep(i, key, step))
        break
      }

      // if (key.startsWith('insert')) {
      //   models.push(new InsertRows(i, key, step))
      //   break
      // }

      // todo: alter etc etc etc
    }
  }

  // fill in any non-explicit ONs
  if (!options.dbs) {
    models.forEach(function (m) {
      if (!m.on) {
        m.on = options.db
      }
    })
  }

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
  this.stepIndex = 0
  this.stepCount = options.steps.length
  this.steps = createSteps(options)
  if (!options.no_sort) {
    this.sortSteps()
  }
  // todo: this is required for codegen... uncomment
  // this.platform = options.platform || 'mssql'
  // zomg fake db help.
  this.db = database.create('mssql', {
    host: 'localhost',
    name: 'adventureworks'
  })

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
  // - drops (in order?)
  // - create
  // - trigger
  // - views
  // - constraints
  // - procs
  // - run
}

MigrationRunner.prototype.getSteps = function () {
  return this.steps
}

MigrationRunner.prototype.start = function () {
  if (this.status) {
    return
  }

  this.log('Migration Started')
  this.status = 'started'
  this.next()
}

MigrationRunner.prototype.next = function () {
  let self = this
  let step = this.steps[this.stepIndex]

  if (this.paused || this.terminated) {
    return
  }

  // maybe something a little more sophisticated here
  // like completed with errors or something.
  if (!step) {
    this.log('Migration Complete')
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

MigrationRunner.prototype.stop = function () {
  this.stop = true
  while (this.stepIndex < this.stepCount) {
    let step = this.steps[this.stepIndex]
    step.status = 'canceled'
    this.emit('step', step)
    this.stepIndex++
  }
}

MigrationRunner.prototype.pause = function () {
  this.pause = true
  // todo: implement pause, later....
}

MigrationRunner.prototype.constructor = EventEmitter

module.exports = MigrationRunner
