import { CredentialStore } from '../src/lib/credential-store'
import { expect } from 'chai'
import {
  existsSync,
  unlinkSync
} from 'fs'

// necessary to get ts to work nicely
import { } from 'mocha'

const isWindows = (process.platform === 'win32');

function temp() {
  if (isWindows) {
    return "c:/windows/temp/"
  } else { return "/usr/temp/" }
}

function cleanup() {
  let file = temp() + ".dbm-creds"

  if (existsSync(file)) {
    unlinkSync(file)
  }
}

describe("destructuring assignment", function () {
  it("should look like this", function () {
    let path = "one/two/three/four"
    let [env, server, db, user] = path.split('/')

    expect(env && server && db && user).to.be.ok
  })
})

describe('the credential store', () => {
  const phrase = 'thisisonlyatest'

  let store;
  beforeEach(function () {
    store = new CredentialStore({
      location: temp(),
      encrypted: false
    })
  })

  afterEach(cleanup)

  describe("#open", () => {

    describe('WHEN file does not exist', () => {
      it('should create a new store', () => {
        store.open(phrase);
        expect(existsSync(store.path)).to.equal(true)
      })
    })
  })

  describe("when unencrypted", function () {

    beforeEach(function () {
      store.open(phrase)
    })

    describe('#set', () => {

      it('should support UPDATE', () => {
        store.set('dev/marketing/ross/sql_pg', 'abc123');
        store.set('dev/marketing/ross/sql_pg', 'LKJ#082=34mnsadf!')

        let item = store.get('dev/marketing/ross/sql_pg')

        expect(item.password).to.equal('LKJ#082=34mnsadf!')
      })

      it('should support multiple puts', () => {
        // note these are different environments
        store.set('dev/marketing/ross/sql_pg', 'abc123')
        store.set('test/marketing/ross/sql_pg', 'anotherpassword')
        store.set('prod/marketing/ross/sql_pg', 'zz1!*&^H#*@B')
      })
    })

    describe('#get', () => {

      it('should return the Item on success', () => {
        store.set('dev/marketing/ross/sql_pg', "somepass")
        let item = store.get('dev/marketing/ross/sql_pg')

        expect(item).not.to.be.undefined
        expect(item.password).to.equal('somepass')
      })
    })

    describe('#round-trip', () => {

      it("can write/read to the same file", function () {

        store.set('dev/marketing/ross/sql_pg', "somepass")

        store.close()
        store.open(phrase)

        let item = store.get('dev/marketing/ross/sql_pg')
        expect(item).not.to.be.undefined
        expect(item.password).to.equal('somepass')
      })
    })
  })

  /*
    describe("when encrypted", () => {
      let store;
      beforeEach(function() {
        store = new CredentialStore({
          encrypted: true,
          location: temp()
        })
      })
  
      it('throws on incorrect passphrase', () => {
        return store.open("correct passphrase")
          .then(() => store.close())
          .then(function() {
            
            return store
              .open("THIS IS NOT THE PHRASE LUL")
              .catch((err) => {
                expect(err).to.be("Error")
              })
          })
      })
  
      it('decrypts on correct passphrase', () => {
        
        return store.open("correct passphrase")
          .then(() => { 
            store.set("foo/bar/baz/buzz", "test")
            store.close()
          })
          .then(function() {
            
            return store
              .open("correct passphrase")
              .then(() => {
                let res = store.get("foo/bar/baz/buzz")
  
                expect(res.password).to.equal('test')
              })
          })
      })
  
      describe('#round-trip', () => {
  
        it("can write/read to the same file", function () {
          let store = new CredentialStore({
            location: temp(),
            encrypted: true
          })
  
          store.open("anything")
          store.set('dev/marketing/ross/sql_pg', "somepass")
  
          return store.close()
            .then(() => store.open("anything"))
            .then(() => {
              let item = store.get('/dev/marketing/ross/sql_pg')
              expect(item).not.to.be.undefined
              expect(item.password).to.equal('somepass')
            });
        })
      })
    })
  */
})
