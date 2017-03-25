'use strict'
/* global describe it beforeEach */
const pg = require('pg')
const fs = require('fs')
const expect = require('chai').expect

// moral of the story, specify an encoding, you scrub.
// just to illustrate that these are exactly the same
// and the only difference is the buffer vs string
function exec (query) {
  var config = {
    database: 'postgres',
    user: 'postgres',
    password: 'root'
  }

  return pg.connect(config)
    .then(function (client) {
      return client.query(query, null)
        .then(function (res) {
          expect(res).not.to.be.undefined
          expect(res.rows.length).to.equal(1)
          expect(res.rows[0].val).to.equal(1)
        })
    })
}

describe('#client.query()', function () {
  var noEncoding
  var withEncoding

  beforeEach(function () {
    fs.writeFileSync('query.sql', 'select 1 as val;')

    // so this was my goof up, obviously...
    // but I'd imagine a lot of people would have similar issues.
    noEncoding = fs.readFileSync('query.sql')
    withEncoding = fs.readFileSync('query.sql', 'utf8')
  })

  it('ignores buffers', function () {
    return exec(noEncoding)
  })

  it('likes strings', function () {
    return exec(withEncoding)
  })
})
