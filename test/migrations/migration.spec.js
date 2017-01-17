'use strict'

/* global describe it */
const MigrationRunner = require('../../tasks/migrate.js')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

describe('this goddamn migration runner', function () {
  it('should fucking work', function (done) {
    let src = path.join(__dirname, 'marketing.yaml')
    let contents = fs.readFileSync(src)
    let doc = yaml.load(contents)

    doc.path = src

    var runner = new MigrationRunner(doc, {
      vendor: 'postgres',
      host: 'localhost',
      name: 'ross',
      user: 'sql_pg',
      password: 'abc123'
    })

    runner.on('step', function (step) {
      console.log(step)
    })

    runner.on('done', function () {
      runner.steps.forEach(function (step) {
        expect(step.status).to.equal('complete')
      })
      done()
    })

    runner.on('error', function (err) {
      expect(err).not.to.exist
    })

    runner.start()
  })
})
