'use strict'

/* global describe it */
const Parser = require('../lib/parser.js')
const syntax = require('../lib/syntax.js')
const expect = require('chai').expect

describe('a statement parser', function () {
  // todo: model all the lovely options.
  var parser = new Parser({
    vendor: 'mssql',
    separator: 'GO'
  })

  it('returns an array of statements', function () {
    var statements = parser.parse('use MyDb; go; select 1 + 1')

    expect(statements).to.be.an('array')
    expect(statements.length).to.be(3)
  })

  it('ignores single-line comments', function () {
    var statements = parser.parse('-- header information \nselect * from mytable;')

    expect(statements.length).to.be(1)
  })

  it('ignores block comments', function () {
    var statements = parser.parse('/* header information */ select * from mytable;')

    expect(statements.length).to.be(1)
    expect(statements[0].type).to.be(syntax.select_statement)
  })
})
