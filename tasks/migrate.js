
// this is the migration runner.

const sql = require('sql')
const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('../lib/database.js')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

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

Step.prototype.toString = function () {
  let action = this.action
  let type = this.type
  let name = this.name
  let on = this.on

  return `${action} ${type} ${name} on ${on}`
}

/**
 * if the path is not set explicitly, this function automatically resolves
 * steps of the form
 *  drop.table: Foo.Bar
 *  to <root>/tables/Foo.bar.sql
 */
Step.prototype.getPath = function () {
  let convention = '/' + this.type + 's/' + this.name + '.sql'
  return path.join(this.root, (this.path || convention))
}

// TODO: support capturing the 'as' attribute
function RunStep (i, key, step) {
  Step.call(this, i, 'run')
  this.root = step.root
  this.name = step['run']
  this.on = step.on
  this.type = 'script'
}

inherits(RunStep, Step)

RunStep.prototype.render = function () {
  if (!this.query) {
    let path = this.getPath()
    this.query = fs.readFileSync(path, 'utf8')
  }

  return this.query
}

function DropObject (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('malformed drop, missing type')
  }

  Step.call(this, i, 'drop')

  this.type = parts[1]
  this.name = step[key]
  this.db = step.on
}

inherits(DropObject, Step)

DropObject.prototype.render = function (sqlgen) {
  if (!this.query) {
    var id = identifier(this.name)

    if (this.type === 'table') {
      var table = sqlgen.define({
        // fucking postgres... case sensitive identifiers
        name: id.name.toLowerCase(),
        schema: id.schema.toLowerCase(),
        columns: []
      })

      // todo: restore safe drops
      this.query = table.drop().ifExists().toQuery().text + ';'
    } else {
      // todo: not cross-vendor, or even very good.
      this.query = `drop ${this.type} ${this.name};`
    }
  }

  return this.query
}

function CreateObject (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('malformed create, missing type')
  }

  Step.call(this, i, 'create')

  this.name = step[key]
  this.type = parts[1]
  this.root = step.root
  this.path = step.from
  this.on = step.on
}

inherits(CreateObject, Step)

CreateObject.prototype.render = function () {
  if (!this.query) {
    // convention-based file resolution, woo
    let script = this.getPath()

    this.query = fs.readFileSync(script, 'utf8')
  }

  return this.query
}

/**
 * TODO: support journaling to a database?
 * @param {Object} doc the document describing the migration
 * @param {Object} env the 'environment' to use along with the passwords for each.
 */
function MigrationRunner (doc, env) {
  // stole this from a tutorial, but I kinda like it.
  // saves you if you forget the new keyword.
  EventEmitter.call(this)

  assert(doc, 'Must supply a valid document')
  assert(env, 'Must supply a valid environment config')

  this.root = path.dirname(doc.path)
  this.sqlgen = sql.create(env.vendor, {})
  this.activeStep = null
  this.stepIndex = 0
  this.stepCount = doc.steps.length
  this.steps = this.createSteps(doc)
  this.doc = doc
  this.env = env

  // lazy create them? // we might need multiple connections of different types
  // in the worst case scenario...
  // fuck okay we just can't do the complex one yet.
  this.db = factory.create(env.vendor, env)
}

MigrationRunner.prototype.createSteps = function (options) {
  let models = []
  let steps = options.steps
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]
    step.root = this.root

    for (let key in step) {
      if (key.startsWith('drop')) {
        models.push(new DropObject(i, key, step))
        break
      }

      if (key.startsWith('create')) {
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
      m.on = m.on || options.db
    })
  }

  return models
}

inherits(MigrationRunner, EventEmitter)

MigrationRunner.prototype.log = function (message) {
  this.emit('log', message)
}

// currently does nothing. xD
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

MigrationRunner.prototype.start = function () {
  if (!this.started) {
    this.log('Migration Started: ' + this.doc.name)
    this.log('Details: ' + JSON.stringify(this.env))
    this.next()
    this.started = true
  }
}

MigrationRunner.prototype.next = function () {
  if (this.paused || this.terminated) {
    return
  }

  // maybe something a little more sophisticated here
  // like completed with errors or something.
  if (this.stepIndex >= this.stepCount) {
    this.log('Migration Complete!')
    this.emit('done')
    return
  }

  let step = this.steps[this.stepIndex]

  // I guess this should just be runStep
  step.status = 'running'
  this.emit('step', step)

  this.log('running step: ' + step.toString())
  let query = step.render(this.sqlgen)
  let self = this

  self.log('query: \n' + query)

  // TODO!! if the step has the 'as' attribute,
  // then swap out the connection for one that connects as the other user
  // this allows even administrative changes to work nicely
  this.db.run(query).then(function (result) {
    self.log('Step Completed')

    if (result.rowCount) {
      self.log('( ' + result.rowCount + ' ) rows affected')
    }

    step.status = stepStatus.complete
    self.emit('step', step)
    self.stepIndex++
    self.next()
  }).catch(function (err) {
    step.status = stepStatus.failed
    self.emit('step', step)
    self.emit('error', err)
  })
}

MigrationRunner.prototype.retry = function () {
  this.paused = false
  this.next()
}

MigrationRunner.prototype.skip = function () {
  let step = this.steps[this.stepIndex]
  step.status = stepStatus.skipped
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
  // todo: implement pause.. later....
}

MigrationRunner.prototype.validate = function () {
  // todo: this could look at the migration and do some pre-checks
  let self = this
  self.steps.forEach(function (step) {
    // pre-render all the steps
    try {
      self.emit('log', 'pre-rendering: ' + step.toString())
      step.render(self.sqlgen)
    } catch (err) {
      self.emit('error', err)
    }
  })

  // todo: ensure create has drop
}

module.exports = MigrationRunner
