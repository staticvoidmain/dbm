'use strict'

const pg = require('pg')

class PostgresDb {
  constructor (db) {
    this.config = {
      user: db.user,
      database: db.name,
      password: db.password,
      host: db.host,
      port: 5432,
      max: 10,
      idleTimeoutMillis: 30000
    }

    this.pool = pg.Pool(this.config)

    this.pool.on('error', function (err, client) {
      console.error('idle client error', err.message, err.stack)
    })
  }
}

function execute (statement) {
  return function (client) {
    return client.query(statement, [])
      .then(function (res) {
        client.release()

        return res
      })
  }
}

PostgresDb.prototype.connect = function () {
  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  return this.pool.connect()
}

PostgresDb.prototype.run = function (statement) {
  return this.connect()
    .then(execute(statement))
}

module.exports = PostgresDb
