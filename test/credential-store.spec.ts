import { CredentialStore } from '../lib/credential-store'
import { expect } from 'chai'

describe('the credential store', () => {
  const phrase = 'thisisonlyatest'

  describe("#open", () => {
    let store;
    beforeEach(function() {
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

      it('requires a correct passphrase', () => {
        let store = new CredentialStore({
          encrypted: true,
          location: process.cwd()
        })
      })
    })
  })

  describe('#set', () => {

    let store;
    beforeEach(function() {
      store = new CredentialStore({
          location: process.cwd(),
          encrypted: false
        })
      
      store.open(phrase)
    })

    it('should support UPDATE', () => {

      
      store.set('/dev/marketing/ross/sql_pg', 'abc123');
      store.set('/dev/marketing/ross/sql_pg', 'LKJ#082=34mnsadf!')

      let item = store.get('/dev/marketing/ross/sql_pg')

      expect(item.password).to.equal('LKJ#082=34mnsadf!')

      store.close()
    })

    it('should support multiple puts', () => {
      // note these are different environments
      store.set('/dev/marketing/ross/sql_pg', 'abc123')
      store.set('/test/marketing/ross/sql_pg', 'anotherpassword')
      store.set('/prod/marketing/ross/sql_pg', 'zz1!*&^H#*@B')

      store.close();
    })
  })

  describe('#get', () => {

    let store;
    beforeEach(function() {
      store = new CredentialStore({
          location: process.cwd(),
          encrypted: false
        })
      
      store.open(phrase)
    })

    it('requires a valid path', () => {
      store.set("asdf-sadf-asdf-asdf", "foo")
    })

    it('should return the Item on success', () => {

      let item = store.get('/dev/marketing/ross/sql_pg')

      expect(item).not.to.be.undefined
      expect(item.password).to.equal('somepass')
    })

    describe('#round-trip', () => {
      // todo;
    })
  })
})
