'use strict'

const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('../lib/database')

// todo: find and replace all my hard coded bullshit
// and make it nicer.
function BackupRunner (options) {
  this.db = factory.create(options.vendor, options)
}

inherits(BackupRunner, EventEmitter)

BackupRunner.prototype.run = function (backupConfig) {
  // todo: a bunch of stuffs

  // for each object in the requested backup thingo...
}

module.exports = BackupRunner
