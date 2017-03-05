'use strict'

const sql = require('sql')
const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('../lib/database.js')
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const steps = require('./migration/steps')

function identifier(id) {
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

function Step(i, action) {
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
function RunStep(i, key, step) {
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
        name: id.name.toLowerCase(),
        schema: id.schema.toLowerCase(),
        columns: []
      })

      // todo: restore safe drops is now an OPTION
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

function BeginTransaction (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('malformed step.')
  }

  Step.call(this, i, 'BEGIN transaction')

  this.name = step[key]
  this.type = parts[1]
  this.root = step.root
  this.path = step.from
  this.on = step.on
}

BeginTransaction.prototype.render = () => {
  // todo: named transactions?
  this.query = 'BEGIN TRANSACTION'
}

function CommitTransaction (i, key, step) {
  Step.call(this, i, 'COMMIT transaction')

  this.name = step[key]
  this.root = step.root
  this.on = step.on
}

function RollbackTransaction (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('malformed step.')
  }

  Step.call(this, i, 'ROLLBACK transaction')

  this.name = step[key]
  this.type = parts[1]
  this.root = step.root
  this.path = step.from
  this.on = step.on
}

inherits(BeginTransaction, Step)

module.exports = {
  status: stepStatus,
  create: (i, key, step) => {
    if (key.startsWith('drop')) {
      return new steps.DropObject(i, key, step)
    }

    if (key.startsWith('create')) {
      return new steps.CreateObject(i, key, step)
    }

    // this one is odd because these verbs don't make sense
    // for all the other step types.
    // begin/commit/rollback verbs
    if (key.endsWith('transaction')) {

      if (key.startsWith('begin')) {
        return new BeginTransaction(i, key, step)
      }

      if (key.startsWith('commit')) {
        return new CommitTransaction(i, key, step)
      }

      if (key.startsWith('rollback')) {
        return new RollbackTransaction(i, key, step)
      }
    }

    if (key === 'run') {
      return new RunStep(i, key, step)
    }

    return null
  }
}
