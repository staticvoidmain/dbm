'use strict'

import { } from 'mocha'
import { expect } from 'chai'
import { MicrosoftSql } from '../../src/lib/vendors/mssql'
import { exec } from 'child_process'

describe('MicrosoftSql', function () {

  function run(shell) : Promise<string> {
    return new Promise(function(resolve, reject) {
      exec(shell, function(err, stdout, stderr) {
        if (err) return reject(err);

        resolve(stdout)
      })
    })
  }

  before(() => {
    return run("SqlLocalDB.exe create spec -s")
      .then(() => {
        return run("SqlLocalDB.exe info spec")
          .then(function (output) {
             let pipe = /Instance pipe name: .*/g.exec(output)

             let query = `sqlcmd -S ${pipe} -Q "create logon ross with password='abc123'; create user ross; go;`

             return exec(query)
          })
      })
  })

  after(function() {
    return run("SqlLocalDB.exe stop spec")
      .then(() => {
        return run("SqlLocalDB.exe delete spec")
      })
  })

  // todo: this named pipe thing needs to be configured.
  let db = new MicrosoftSql({
    host: 'np:\\.\pipe\LOCALDB#SH048D43\tsql\query',
    name: 'ross',
    user: 'sql_pg',
    password: 'abc123'
  })

  function expectTableNotToExist(name) {
    return db.getSingleTable(name)
      .then(function (table) {
        expect(table).to.be.null
      })
  }

  function expectTableToExist(name) {
    return db.getSingleTable(name)
      .then(function (table) {
        expect(table).not.to.be.null
      })
  }

  db.on('error', function (err) { console.error(err) })

  it('can run simple queries', function () {
    return db.run('select 1 as val;', [])
      .then(function (res) {
        expect(res).not.to.be.undefined
        expect(res.rows.length).to.equal(1)
        expect(res.rows[0].val).to.equal(1)
      })
  })

  it('can drop tables', function () {
    return db.run('drop table "sales"."visit"', [])
      .then(function (res) {
        expect(res).not.to.be.undefined
        return expectTableNotToExist('sales.visit')
      })
  })

  it('can create tables', function () {
    return db.run('create table "sales"."visit"(date timestamptz primary key)', [])
      .then(function (res) {
        expect(res).not.to.be.undefined

        return expectTableToExist('sales.visit')
      })
  })

  it('can insert values into tables', function () {
    return db.run('insert into sales.visit(date) values (@value)', [ 'value', new Date() ])
      .then(function (res) {
        expect(res).not.to.be.undefined
        expect(res.rowCount).to.equal(1)
      })
  })

  xit('can dump the keys of a database', function () {
   
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
      }).catch(function (ex) {
        console.error(ex)
      })
  })
})
