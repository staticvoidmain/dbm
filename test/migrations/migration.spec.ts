import {MigrationRunner} from '../../tasks/migrate.js'
import {expect} from 'chai'
import {readFileSync} from 'fs'
import {join} from 'path'
import {load} from 'js-yaml'

describe('this goddamn migration runner', function () {
  
  it('should fucking work', function (done) {
    let src = join(__dirname, 'marketing.yaml')
    let contents = readFileSync(src)
    let doc = load(contents)

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
