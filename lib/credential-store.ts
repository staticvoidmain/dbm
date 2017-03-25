'use strict'

/* global process assert */

import { join } from 'path'
import {
  readFileSync,
  existsSync,
  writeFileSync,
  createReadStream,
  createWriteStream
} from 'fs'

import { createDecipher, createCipher } from 'crypto'
import { StringDecoder } from 'string_decoder'
import { ok } from 'assert'
import { Readable } from 'stream'

const algorithm = 'aes256'

function wrap(text) {
  // wraps text in a readable stream.
  var s: any = new Readable();
  s._read = function noop() { };
  s.push(text);
  s.push(null);

  return s
}

function validateRequest(req) {
  ok(req.path, 'env is required')
  ok(req.phrase, 'passphrase is required')
}

function encrypt(text, password) {
  let cipher = createCipher(algorithm, password)

  return wrap(text).pipe(cipher)
}

function decipher(stream, password) {
  let decipher = createDecipher(algorithm, password)

  return stream.pipe(decipher)
}

class CredentialStore {

  new: boolean
  path: string

  constructor(config) {
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

        let store = join(element, '.dbm-creds')
        if (existsSync(store)) {
          this.path = store;
          break
        }
      }
    }

    // otherwise create the file.
    if (!this.path) {
      this.new = true

      let location = valid[0]
      this.path = join(location, '.dbm-creds')

      writeFileSync(this.path, '')
    }
  }

  /**
   * Gets a stored credential by env/server/db/user from the credential store.
   * This value should be transparently passed to the server connection when connecting to that db.
   * @param {Object} req the credential request object
   */
  get(req, cb) {
    validateRequest(req)
    let stream = createReadStream(this.path, 'utf8')
    let text = decipher(stream, req.phrase).read()
    let lines = text.split('\n')

    for (var i = 0; i < lines.length; i++) {
      let line: string = lines[i];
      if (line.indexOf(req.path) === 0) {
        return line.substring(line.indexOf('=') + 1)
      }
    }

    return null
  }

  set(req) {
    validateRequest(req)
    let path = req.path
    let password = req.password
    let line = `$path=$password`

    let stream = createReadStream(this.path, 'utf8')
    let clearText = decipher(stream, req.phrase)
    let newText = clearText + '\n' + line
    let output = createWriteStream(this.path)

    encrypt(newText, req.phrase).pipe(output)
  }
}
