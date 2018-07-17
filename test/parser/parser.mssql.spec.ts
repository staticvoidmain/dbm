import { } from 'mocha'
import { expect } from 'chai'

import { Parser } from '../../src/lib/parser/parser'
import { SyntaxKind } from '../../src/lib/parser/syntax'

describe('a statement parser', function () {
  const parser = new Parser()

  it('parses operator precedence correctly', () => {
    const tree = parser.parse('declare @x int = 1 + 2 * 3 / -4', { name: 'test.sql' });

    console.log(tree);
  })

  xit('returns an array of statements', function () {
    const tree = parser.parse('use MyDb; go; select 1 + 1', { name: 'test.sql' })

    expect(tree).to.be.an('array')
    expect(tree.nodes.length).to.equal(3)
  })

  xit('ignores single-line comments', function () {
    const tree = parser.parse('-- header information \nselect * from mytable;', { name: 'test.sql', ignoreTrivia: true })

    expect(tree.nodes.length).to.equal(1)
  })

  xit('ignores block comments', function () {
    const tree = parser.parse('/* header information */ select * from mytable;', { name: 'test.sql', ignoreTrivia: true })

    expect(tree.nodes.length).to.equal(1)
    expect(tree[0].type).to.equal(SyntaxKind.select_expession)
  })
})
