import { CredentialStore } from '../lib/credential-store'
import { expect } from 'chai'

describe('the credential store', () => {

  describe('WHEN file does not exist', () => {
    it('should create a new store', () => {
      let store = new CredentialStore()

      store.set('/dev/marketing/ross/sql_pg', 'abc123')
    })
  })

  describe('#set', () => {

    it('should support UPDATE', () => {
      let store = new CredentialStore()

      store.open('thisisonlyatest')

      store.set('/dev/marketing/ross/sql_pg', 'abc123');
      store.set('/dev/marketing/ross/sql_pg', 'LKJ#082=34mnsadf!')

      let item = store.get('/dev/marketing/ross/sql_pg')

      expect(item.password).to.equal('LKJ#082=34mnsadf!')

      store.close('thisisonlyatest')
    })

    it('should support multiple puts', () => {
      let store = new CredentialStore()

      store.set('/dev/marketing/ross/sql_pg', 'abc123')
      store.set('/dev/marketing/ross/sql_pg', 'abc123')
      store.set('/dev/marketing/ross/sql_pg', 'abc123')

      store.close('thisisonlyatest');
    })
  })

  describe('#get', () => {
    let store;
    beforeEach(() => {
      store = new CredentialStore()
      store.open('')
    })

    it('requires a valid path', () => {

    })

    it('should return the Item on success', () => {

      let item = store.get('')
    })

    describe('#round-trip', () => {
      // todo;
    })
  })
})
