import {} from 'mocha'
import { expect } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { load } from 'js-yaml'
import { MigrationRunner } from '../../src/tasks/migrate'
import { MigrationDocument } from '../../src/tasks/migration/document'


describe('this goddamn migration runner', function () {
  
  // todo: this is currently broken
  xit('should fucking work', function (done) {
    this.timeout(5000)
    
    let doc = new MigrationDocument(join(__dirname, 'marketing.yaml'))
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
