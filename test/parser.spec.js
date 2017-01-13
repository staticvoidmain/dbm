'use strict'

const Parser = require('../lib/parser.js')
const expect = require('chai').expect;

describe("a statement parser", function() {
  var parser = new Parser({
    separator: "GO"
  });
  
  it("returns an array of statements", function() {
    var statements = parser.parse("use MyDb; go; select 1 + 1")

    expect(statements).to.be.an('array');
    expect(statements.length).to.be(3);
  });

  it('ignores single-line comments', function() {

  });
  
  it('ignores block comments', function() {

  });
});