'use strict'

// global process assert

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function CredentialStore(config) {
  if (!config) {
    throw new Error('Config not specified!')
  }

  this.new = false

  // todo: search along an array of paths for the file until we find one.
  let locations = [
    process.env.DBM_HOME,
    process.env.HOME,
    process.env.APPDATA,
    process.cwd()
  ]

  let valid = []
  // probe all the possible locations looking for our credential file.
  for (var i = 0; i < locations.length; i++) {
    var element = locations[i]

    if (element) {
      valid.push(element)

      let store = path.join(element, '.dbm-creds')
      if (fs.existsSync(store)) {
        this.file = fs.openSync(store, 'r+')
        break
      }
    }
  }

  // otherwise create the file.
  if (!this.file) {
    this.new = true

    let location = valid[0]
    let store = path.join(location, '.dbm-creds')

    this.file = fs.openSync(store, 'w+')
    // todo: create a PEM file? is that posssible here?
    // we need that for the nice impl
  }
}

function validateRequest(req) {
  assert(req.env, 'env is required')
  assert(req.server, 'server is required')
  assert(req.db, 'db is required')
  assert(req.phrase, 'phrase is required')
}

/**
 * Gets a stored credential by env/server/db from the credential store.
 * This value should be transparently passed to the server connection when connecting to that db.
 * @param {Object} req the credential request object
 */
CredentialStore.prototype.get = function (req, cb) {
  validateRequest(req)

  let decipher = crypto.createDecipher('aes256', req.phrase)

  let decrypted = ''
  decipher.on('readable', () => {
    const data = decipher.read()
    if (data) {
      decrypted += data.toString('utf8')
    }
  })

  decipher.on('error', () => {
    // I think this is error.
  })

  decipher.on('end', () => {
    console.log(decrypted)
    // Prints: some clear text data
  })

  this.file.c

  // todo: decrypt the file.
  // find the path.
  // do some stuff.
}