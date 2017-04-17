import {Parser} from '../../src/lib/parser'
import {syntax, types} from '../../src/lib/syntax'
import {expect} from 'chai'

describe('a statement parser', function () {
  // todo: model all the lovely options.
  var parser = new Parser({
    vendor: 'mssql',
    separator: 'GO'
  })

  // TODO: parse things like blocks in addition to statements.
  xit('returns an array of statements', function () {
    var statements = parser.parse('use MyDb; go; select 1 + 1')

    expect(statements).to.be.an('array')
    expect(statements.length).to.equal(3)
  })

  xit('ignores single-line comments', function () {
    var statements = parser.parse('-- header information \nselect * from mytable;')

    expect(statements.length).to.equal(1)
  })

  xit('ignores block comments', function () {
    var statements = parser.parse('/* header information */ select * from mytable;')

    expect(statements.length).to.equal(1)
    expect(statements[0].type).to.equal(types.statement.select)
  })
})
