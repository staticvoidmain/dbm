'use strict'

const inherits = require('util').inherits
const EventEmitter = require('events')
const factory = require('../lib/database')

// todo: find and replace all my hard coded bullshit
// and make it nicer.
function BackupRunner (options) {
  this.db = factory.create('postgres', options)
}

inherits(BackupRunner, EventEmitter)

BackupRunner.prototype.run = function () {
  // todo: a bunch of stufffs
}

module.exports = BackupRunner
