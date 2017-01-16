'use strict'

/* global describe it */
const PostgresDb = require('../../lib/vendors/postgres.js')
const expect = require('chai').expect

describe('my shitty postgres wrapper', function () {
  let db = new PostgresDb({
    host: 'localhost',
    name: 'ross',
    user: 'sql_pg',
    password: 'abc123'
  })

  db.on('error', function (err) { console.error(err) })

  it('can run simple queries', function (done) {
    db.run('select 1 as val;')
      .then(function (res) {
        console.log(res)
        expect(res).not.to.be.undefined
        expect(res.length).to.equal(1)
        expect(res[0].val).to.equal(1)
        done()
      }).catch(function (err) {
        console.error(err)
      })
  })

  it('can dump schema info', function (done) {
    db.getSchema()
      .then(function (res) {
        console.log(res)
        expect(res.tables).to.be.an('array')
        expect(res.tables.length).to.be.greaterThan(0)
        done()
      }).catch(function (err) {
        console.error(err)
      })
  })
})
