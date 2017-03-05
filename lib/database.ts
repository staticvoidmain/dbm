'use strict'

module.exports = {
  /**
   * @return {Object}
   */
  create: function (vendor, options) {
    let Db = require('./vendors/' + vendor)

    return new Db(options)
  }
}
