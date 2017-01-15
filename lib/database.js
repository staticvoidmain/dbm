'use strict'

module.exports = {
  create: function (vendor, options) {
    let Db = require('./vendors/' + vendor)

    return new Db(options)
  }
}
