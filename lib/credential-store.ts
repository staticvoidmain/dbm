'use strict'

/* global process assert */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const StringDecoder = require('string_decoder').StringDecoder

const algorithm = 'aes256'

function CredentialStore (config) {
  if (!config) {
    throw new Error('Config not specified!')
  }

  this.new = false

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

function validateRequest (req) {
  assert(req.env, 'env is required')
  assert(req.server, 'server is required')
  assert(req.db, 'db is required')
  assert(req.user, 'user name is required')
  assert(req.phrase, 'passphrase is required')
}

function encrypt (text, password) {
  let cipher = crypto.createCipher(algorithm, password)
  
  return wrap(text).pipe(cipher)
}

// promisify?
function decipher (stream, password) {
  let decipher = crypto.createDecipher(algorithm, password)

  return stream.pipe(decipher)
}

/**
 * Gets a stored credential by env/server/db/user from the credential store.
 * This value should be transparently passed to the server connection when connecting to that db.
 * @param {Object} req the credential request object
 */
CredentialStore.prototype.get = function (req, cb) {
  validateRequest(req)
    // it's an FD
  let stream = fs.createReadStream(this.file, 'utf8')
  let text = decipher(stream, req.phrase)

  // todo: decrypt the file.
  // find the path.
  // do some stuff.
}

CredentialStore.prototype.set = (req) => {
  validateRequest(req)
  let env = req.env
  let srv = req.srv
  let db = req.db
  let user = req.user
  let path = `$env/$srv/$db/$user`

  let clearText = decrypt()


  let output = fs.createWriteStream(this.file)

  encrypt(newText).pipe(output)
}
