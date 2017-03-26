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
const fileName = '.dbm-creds'
const newline = (process.platform === 'win32' ? '\r\n' : '\n')

// wraps text in a readable stream.
function wrap(text) {
  var s: any = new Readable()
  s._read = function noop() { }
  // however there MAY be a case where this fucks up
  // if the string is too long. how big are the chunks supposed to be?
  s.push(text)
  s.push(null)

  return s
}

/**
 * 
 * @param stream a ReadableStream
 */
function read(stream): Promise<string> {

  return new Promise(function (resolve, reject) {
    let content = ""

    stream.on('data', (chunk) => {
      content += chunk;
    })

    stream.on('error', (e) => reject(e))
    stream.on('end', () => {
      resolve(content);
    })
  })
}

function encrypt(text, password) {
  let cipher = createCipher(algorithm, password)

  return wrap(text).pipe(cipher)
}

function decipher(stream, password) {
  let decipher = createDecipher(algorithm, password)

  return stream.pipe(decipher)
}

export interface CredentialItem {
  environment: string
  server: string
  database: string
  user: string
  password: string
}

export class CredentialStore {
  private credentials: Map<string, CredentialItem>
  // we can store this
  private passPhrase: string
  private isOpen: boolean
  private encrypted: boolean
  private new: boolean
  private path: string

  /**
   * Creates a new credential store.
   */
  constructor(opt) {
    this.new = false
    this.encrypted = opt.encrypted || false

    if (!opt.location) {
      let locations = [
        process.env.DBM_HOME,
        process.env.HOME,
        process.env.APPDATA,
        process.cwd()
      ]

      // probe all the possible locations looking for our credential file.
      for (var i = 0; i < locations.length; i++) {
        var element = locations[i]

        if (element) {

          let store = join(element, fileName)
          if (existsSync(store)) {
            this.path = store;
            break
          }
        }
      }
    } else {
      this.path = join(opt.location, fileName)
    }

    // otherwise create the file in the current directory.
    if (!this.path) {
      this.new = true

      let location = process.cwd()
      this.path = join(location, fileName)

      writeFileSync(this.path, '')
    }
  }

  open(phrase) {
    ok(phrase, 'passphrase is required')

    let stream = createReadStream(this.path, 'utf8')
    let source = this.encrypted
      ? decipher(stream, phrase)
      : stream

    return read(source)
      .then((text) => {

        // todo: how do we know we've successfully decyphered it?
        let lines = text.split(newline)

        if (lines.length > 0) {
          for (var i = 0; i < lines.length; i++) {
            let line = lines[i];
            let [path, password] = line.split(' ')
            let [env, server, db, user] = path.split('/')

            this.credentials.set(path, {
              environment: env,
              server: server,
              database: db,
              user: user,
              password: password
            })
          }
        }

        this.passPhrase = phrase
        this.isOpen = true
      })
  }

  // this actually allows the passphrase to be updated once the file has been opened
  // so that's a nice benefit.
  close(phrase?: string) {
    ok(this.isOpen, "Credential store not open!")

    return new Promise((resolve, reject) => {
      let output = createWriteStream(this.path, 'utf8')

      output.on('error', () => { reject() })
      output.on('finish', () => { resolve() })

      let lines = []
      this.credentials.forEach(function (item) {
        let path = [
          item.environment,
          item.server,
          item.database,
          item.user
        ].join('/')

        lines.push(path + " " + item.password)
      })

      let text = lines.join(newline)

      if (this.encrypted) {
        encrypt(text, phrase || this.passPhrase).pipe(output)
      }
      else {
        wrap(text).pipe(output)
      }
    })
  }

  /**
   * Gets a stored credential by env/server/db/user from the credential store.
   * This value should be transparently passed to the server connection when connecting to that db.
   * @param {String} path the path to fetch.
   */
  get(path) {
    ok(this.isOpen, "Credential store not open!")

    return this.credentials.get(path)
  }

  /**
   * SETS the password to something
   */
  set(path, password) {

    ok(this.isOpen, "Credential store not open!")
    ok(path.indexOf(' ') === -1, "path cannot contain spaces")
    ok(password.indexOf(' ') === -1, "password cannot contain spaces")

    this.credentials[path] = {
      path: path,
      password: password
    }
  }
}
