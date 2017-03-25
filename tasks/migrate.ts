const sql = require('sql')

import { EventEmitter } from 'events'

const factory = require('../lib/database.js')
const path = require('path')
const assert = require('assert')
import {Step, stepStatus, create as stepFactory} from './migration/steps'

export interface MigrationDocument {
  name: string
  path: string
  steps: any[]

  // optional bits
  db: string
  aliases: object[]
  disableStepSort: boolean
  disableBackups: boolean
  singleTransaction: boolean
}

enum RunnerState {
  none,
  running,
  paused,
  error,
  terminated,
  complete,
  stopping,
  stopped
}

/**
 * TODO: support journaling to a database?
 * @param {Object} doc the document describing the migration
 * @param {Object} env the 'environment' to use along with the passwords for each.
 */
class MigrationRunner extends EventEmitter {

  // todo: less 'any' abuse
  root: string
  sqlgen: any
  name: string
  env: any
  db: any
  activeStep: any
  stepIndex: number
  stepCount: number
  steps: Array<Step> 
  transactions: Array<string>
  state: RunnerState

  constructor(doc: MigrationDocument, env: any) {
    super()

    assert(doc, 'Must supply a valid document')
    assert(env, 'Must supply a valid environment config')

    this.name = doc.name
    this.root = path.dirname(doc.path)
    this.sqlgen = sql.create(env.vendor, {})
    this.activeStep = null
    this.stepIndex = 0
    this.stepCount = doc.steps.length
    this.steps = this.createSteps(doc)
    this.env = env

    // lazy create them?
    // we might need multiple connections of different types
    // in the worst case scenario...
    this.db = factory.create(env.vendor, env)
  }

  // options is just the doc, right?
  createSteps(doc: MigrationDocument) {
    let models: Step[]
    let steps = doc.steps
    for (let i = 0; i < steps.length; i++) {
      let step = steps[i]
      // todo: add tag property
      step.root = this.root

      for (let key in step) {
        models.push(stepFactory(i, key, step))
      }
    }

    // each step may define an ON property
    // which MAY be an alias for one of these elements.
    // or it may be implicitly set if the 
    // fill in any non-explicit ONs
    if (!doc.aliases) {
      models.forEach(function (m) {
        // todo: validate that these stepwise dbs are either aliases
        // or full server/db specifications.
        m.on = m.on || doc.db
      })
    }

    return models
  }

  log(message: string) {
    this.emit('log', message)
  }

  // currently does nothing. xD
  sortSteps() {
    // todo: sort into the proper order.
    // - drops (in order?)
    // - create
    // - trigger
    // - views
    // - constraints
    // - procs
    // - run
  }

  start() {
    if (this.state == RunnerState.none) {
      this.state = RunnerState.running
      this.log('Migration Started: ' + this.name)
      this.log('Details: ' + JSON.stringify(this.env))
      this.next()
    }
  }

  next() {
    if (this.state == RunnerState.paused 
      || this.state == RunnerState.terminated) {
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

    this.state = RunnerState.running
    this.emit('step', step)

    this.log('running step: ' + step.toString())
    let query: string = step.render(this.sqlgen)

    this.log('query: \n' + query)

    // TODO!! if the step has the 'as' attribute,
    // then swap out the connection for one that connects as the other user
    // this allows even administrative changes to work nicely
    if (step.as) {
      this.log('ERROR: step.as is not implemented yet.')
    }

    this.db.run(query).then((result) => {
      this.log('Step Completed')

      if (result.rowCount) {
        this.log('( ' + result.rowCount + ' ) rows affected')
      }

      step.status = stepStatus.complete
      this.emit('step', step)
      this.stepIndex++
      this.next()
    }).catch(function (err) {
      this.status = stepStatus.failed
      this.emit('step', step)
      this.emit('error', err)
    })
  }

  retry() {
    this.state = RunnerState.running;
    this.next()
  }

  skip() {
    let step = this.steps[this.stepIndex]
    step.status = stepStatus.skipped
    this.stepIndex++
    this.next()
  }

  stop() {
    this.state = RunnerState.stopped
    while (this.stepIndex < this.stepCount) {
      let step = this.steps[this.stepIndex]
      step.status = stepStatus.canceled

      this.emit('step', step)
      this.stepIndex++
    }
  }

  pause() {
    this.state = RunnerState.paused
  }

  validate() {
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

}