'use strict'

/* global describe it */
const MigrationRunner = require('../../tasks/migrate.js')
import expect from 'chai'
import readFileSync from 'fs'
import join from 'path'
import * as yaml from 'js-yaml'
import describe from 'mocha'


describe('this goddamn migration runner', function () {
  it('should fucking work', function (done) {
    let src = path.join(__dirname, 'marketing.yaml')
    let contents = fs.readFileSync(src)
    let doc = yaml.load(contents)

    doc.path = src

    var runner = new MigrationRunner(doc, {
      vendor: 'postgres',
      name: 'ross',
      user: 'sql_pg',
      password: 'abc123'
    })

    runner.on('log', function (msg) {
      console.log(msg)
    })

    runner.on('step', function (step) {
      console.log(step.status + ' ' + step.toString())
    })

    runner.on('done', function () {
      runner.steps.forEach(function (step) {
        expect(step.status).to.equal('complete')
      })
      done()
    })

    runner.on('error', function (err) {
      console.error(err)
      expect(err).not.to.exist
      done()
    })

    runner.validate()
    runner.start()
  })
})
