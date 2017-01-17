'use strict'

/* global describe it */
const expect = require('chai').expect
const factory = require('../../lib/database.js')

describe('my shitty postgres wrapper', function () {
  let db = factory.create('postgres', {
    host: 'localhost',
    name: 'ross',
    user: 'sql_pg',
    password: 'abc123'
  })

  db.on('error', function (err) { console.error(err) })

  it('can run simple queries', function () {
    return db.run('select 1 as val;')
      .then(function (res) {
        expect(res).not.to.be.undefined
        expect(res.rows.length).to.equal(1)
        expect(res.rows[0].val).to.equal(1)
      })
  })

  it('can inspect the keys of a database', function () {
    return db.getKeys().then(function (keys) {
      expect(keys).to.exist
      expect(keys.length).to.be.greaterThan(0)
    })
  })

  it('can drop fucking tables', function () {
    return db.run('drop table sales.visit')
      .then(function (res) {
        expect(res).not.to.be.undefined
      })
  })

  it('can create fucking tables', function () {
    return db.run('create table sales.visit(date timestamptz)')
      .then(function (res) {
        expect(res).not.to.be.undefined
      })
  })

  it('can insert values into fucking tables', function () {
    return db.run('insert into sales.visit(date) values ($1)', [new Date()])
      .then(function (res) {
        expect(res).not.to.be.undefined
        expect(res.rowCount).to.equal(1)
      })
  })

  it('can dump tables', function () {
    return db.getAllTables()
      .then(function (res) {
        expect(res).to.be.an('array')
        expect(res.length).to.be.greaterThan(0)
      })
  })

  it('can dump columns', function (done) {
    return db.getAllColumns()
      .then(function (res) {
        expect(res).to.be.an('array')
        expect(res.length).to.be.greaterThan(0)
        done()
      })
  })

  it('can dump schema info', function () {
    return db.getSchema()
      .then(function (schema) {
        expect(schema).to.be.an('object')
        expect(schema.tables.length).to.be.greaterThan(0)
      })
  })
})
