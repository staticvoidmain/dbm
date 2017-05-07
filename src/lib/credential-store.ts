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

const PATH_DELIMITER = '/'
const ALGO = 'aes256'
const FILE_NAME = '.dbm-creds'
const NEW_LINE = (process.platform === 'win32' ? '\r\n' : '\n')

/**
 *
 * @param stream a ReadableStream
 */
function read(stream): Promise<string> {

  return new Promise(function (resolve, reject) {
    let content = ''

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
  const cipher = createCipher(ALGO, password)

  let cryptoText = cipher.update(text, 'utf8', 'hex')
  cryptoText += cipher.final('hex');

  return cryptoText;
}

function decipher(stream, password) {
  const decipher = createDecipher(ALGO, password)
  let text = decipher.update(stream, 'hex', 'utf8')
  text += decipher.final('utf8');

  return text;
}

export interface CredentialItem {
  environment: string
  server: string
  database: string
  user: string
  password: string
}

/**
 * I'm not rolling my own crypto, don't panic. xD
 *
 * This is really just a simple way to keep your credentials safe.
 *
 * You can rotate the keys yourself from the console.
 */
export class CredentialStore {
  private modified: boolean;
  private credentials: Map<string, CredentialItem>
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
    this.credentials = new Map<string, CredentialItem>()

    // todo: we don't actually support encryption yet...
    if (this.encrypted) throw Error('Not Supported')

    if (!opt.location) {
      const store = join(process.env.DBM_HOME, FILE_NAME)
      if (existsSync(store)) {
        this.path = store;
      }
    } else {
      // they specified a path, but it doesn't exist.
      this.path = join(opt.location, FILE_NAME)

      if (!existsSync(this.path)) {
        writeFileSync(this.path, '')
      }
    }

    // otherwise create the file in the current directory.
    if (!this.path) {
      this.new = true

      const location = process.cwd()
      this.path = join(location, FILE_NAME)

      writeFileSync(this.path, '')
    }
  }

  open(phrase) {
    ok(phrase, 'passphrase is required')

    if (this.new) {
      this.isOpen = true
      this.passPhrase = phrase;
      return;
    }

    let text = readFileSync(this.path, 'utf8');

    if (this.encrypted) {
      text = decipher(text, phrase)
    }

    const lines = text.split(NEW_LINE)

    if (lines.length > 0) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const [path, password] = line.split(' ')
        const [env, server, db, user] = path.split(PATH_DELIMITER)

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
  }

  // this actually allows the passphrase to be updated once the file has been opened
  // so that's a nice benefit.
  close(phrase?: string): Promise<any> {
    ok(this.isOpen, 'Credential store not open!')

    // if this store hasn't been modified, then we don't need to flush to the file system.
    if (this.passPhrase === phrase && !this.modified) {
      this.isOpen = false;
      return Promise.resolve(true)
    }

    return new Promise((resolve, reject) => {
      const output = createWriteStream(this.path, 'utf8')

      output.on('error', (e) => { reject(e) })
      output.on('finish', () => { resolve() })

      const lines = []
      this.credentials.forEach(function (item) {
        const path = [
          item.environment,
          item.server,
          item.database,
          item.user
        ].join(PATH_DELIMITER)

        lines.push(path + ' ' + item.password)
      })

      const text = lines.join(NEW_LINE)

      // there's still something screwy about this
      if (this.encrypted) {
        const cipherText = encrypt(text, phrase || this.passPhrase)
        writeFileSync(this.path, cipherText)
      }
      else {
        writeFileSync(this.path, text)
      }

      this.isOpen = false
    })
  }

  // returns all paths and passwords
  getAll() {
    return this.credentials.entries()
  }

  /**
   * Gets a stored credential by env/server/db/user from the credential store.
   * This value should be transparently passed to the server connection when connecting to that db.
   * @param {String} path the path to fetch.
   */
  get(path) {
    ok(this.isOpen, 'Credential store not open!')

    return this.credentials.get(path)
  }

  /**
   * SETS the password for the given path to the new value.
   */
  set(path, password) {

    ok(this.isOpen, 'Credential store not open!')
    ok(path.indexOf(' ') === -1, 'path cannot contain spaces')
    ok(password.indexOf(' ') === -1, 'password cannot contain spaces')

    const parts = path.split(PATH_DELIMITER);

    ok(parts.length === 4, 'Malformed path!')

    const [env, server, db, user] = path

    this.credentials.set(path, {
      environment: env,
      server: server,
      database: db,
      user: user,
      password: password
    })

    this.modified = true
  }

  delete(path) {
    // todo: support removing a key
    this.modified = true
  }
}
