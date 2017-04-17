import { CredentialStore } from '../src/lib/credential-store'
import { expect } from 'chai'
import { } from 'mocha'

describe('the credential store', () => {
  const phrase = 'thisisonlyatest'

  describe("#open", () => {
    let store;
    beforeEach(function () {
      store = new CredentialStore({
        location: process.cwd(),
        encrypted: false
      })
    })

    describe('WHEN file does not exist', () => {
      it('should create a new store', () => {
        store.open(phrase);
      })
    })

    describe("when encrypted", () => {

      // TODO: this doesn't currently work
      xit('requires a correct passphrase', () => {
        let store = new CredentialStore({
          encrypted: true,
          location: process.cwd()
        })

        // open can't really tell if it worked or not.
        return store.open("THIS IS NOT THE PHRASE LUL")
      })

      describe('#round-trip', () => {

        it("can write/read to the same file.", function () {
          let store = new CredentialStore({
            location: process.cwd(),
            encrypted: true
          })

          store.open("anything")
          store.set('/dev/marketing/ross/sql_pg', "somepass")

          return store.close()
            .then(store.open)
            .then(() => {
              let item = store.get('/dev/marketing/ross/sql_pg')
              expect(item).not.to.be.undefined
              expect(item.password).to.equal('somepass')
            });
        })
      })
    })
  })

  describe("when unencrypted", function () {

    describe('#set', () => {
      let store;
      beforeEach(function () {
        store = new CredentialStore({
          location: process.cwd(),
          encrypted: false
        })

        return store.open(phrase)
      })

      afterEach(function () {
        store.close()
      })

      it('should support UPDATE', () => {
        store.set('/dev/marketing/ross/sql_pg', 'abc123');
        store.set('/dev/marketing/ross/sql_pg', 'LKJ#082=34mnsadf!')

        let item = store.get('/dev/marketing/ross/sql_pg')

        expect(item.password).to.equal('LKJ#082=34mnsadf!')
      })

      it('should support multiple puts', () => {
        // note these are different environments
        store.set('/dev/marketing/ross/sql_pg', 'abc123')
        store.set('/test/marketing/ross/sql_pg', 'anotherpassword')
        store.set('/prod/marketing/ross/sql_pg', 'zz1!*&^H#*@B')
      })
    })

    describe('#get', () => {

      let store;
      beforeEach(function () {
        store = new CredentialStore({
          location: process.cwd(),
          encrypted: false
        })

        return store.open(phrase)
      })

      afterEach(function () {
        store.close()
      })

      it('requires a valid path', () => {
        store.set("asdf-sadf-asdf-asdf", "foo")

        // todo: expect this to throw?
      })

      it('should return the Item on success', () => {
        store.set('/dev/marketing/ross/sql_pg', "somepass")
        let item = store.get('/dev/marketing/ross/sql_pg')

        expect(item).not.to.be.undefined
        expect(item.password).to.equal('somepass')
      })
    })

    describe('#round-trip', () => {

      it("can write/read to the same file.", function () {
        
        let store = new CredentialStore({
          location: process.cwd(),
          encrypted: false
        })

        store.set('/dev/marketing/ross/sql_pg', "somepass")

        return store.close()
          .then(store.open)
          .then(() => {

            let item = store.get('/dev/marketing/ross/sql_pg')
            expect(item).not.to.be.undefined
            expect(item.password).to.equal('somepass')
          });

      })
    })
  })

})
