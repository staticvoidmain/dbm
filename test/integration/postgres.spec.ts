'use strict'

import {} from 'mocha'
import { expect } from 'chai'
import { PostgresDb } from '../../src/lib/vendors/postgres'

describe('PostgresDb', function () {
  
  let db = new PostgresDb({
    host: 'localhost',
    name: 'ross',
    user: 'sql_pg',
    password: 'abc123'
  })

  function expectTableNotToExist (name) {

    return db.getAllTables()
      .then(function (tables) {
        tables.forEach(function (t) {
          let id = t.schema + '.' + t.name
          expect(id).not.to.equal(name)
        })
      })
  }

  function expectTableToExist (name) {
    return db.getAllTables()
      .then(function (tables) {
        let exists = tables.some(function (t) {
          let id = t.schema + '.' + t.name
          return id === name
        })

        expect(exists).to.equal(true)
      })
  }

  db.on('error', function (err) { console.error(err) })

  it('can run simple queries', function () {
    return db.run('select 1 as val;')
      .then(function (res) {
        expect(res).not.to.be.undefined
        expect(res.rows.length).to.equal(1)
        expect(res.rows[0].val).to.equal(1)
      })
  })

  it('can drop tables', function () {
    return db.run('drop table "sales"."visit"')
      .then(function (res) {
        expect(res).not.to.be.undefined
        return expectTableNotToExist('sales.visit')
      })
  })

  it('can create tables', function () {
    return db.run('create table "sales"."visit"(date timestamptz primary key)')
      .then(function (res) {
        expect(res).not.to.be.undefined

        return expectTableToExist('sales.visit')
      })
  })

  it('can insert values into tables', function () {
    return db.run('insert into sales.visit(date) values ($1)', [new Date()])
      .then(function (res) {
        expect(res).not.to.be.undefined
        expect(res.rowCount).to.equal(1)
      })
  })

  it('can dump the keys of a database', function () {
    return db.getKeys().then(function (keys) {
      expect(keys).to.exist
      expect(keys.length).to.be.greaterThan(0)
    })
  })

  it('can dump tables', function () {
    return db.getAllTables()
      .then(function (res) {
        expect(res).to.be.an('array')
        expect(res.length).to.be.greaterThan(0)
      })
  })

  it('can dump columns', function () {
    return db.getAllColumns()
      .then(function (res) {
        expect(res).to.be.an('array')
        expect(res.length).to.be.greaterThan(0)
      })
  })

  xit('can dump functions')
  xit('can dump views')

  xit('can dump FULL schema info', function () {
    // this is pretty slow
    this.timeout(2000)
    return db.getSchema()
      .then(function (schema) {
        expect(schema).to.be.an('object')
        expect(schema.tables.length).to.be.greaterThan(0)
      }).catch(function(ex) {
        console.error(ex)
      })
  })
})
