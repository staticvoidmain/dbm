/* global describe it */

import {* as Store} from '../lib/credential-store' 

describe('the credential store', () => {
  describe('WHEN file does not exist', () => {
    it('should create a new store', () => {
      let store = new Store({
        
      })

      store.set('/dev/marketing/pg_admin', '')
    })
  })
})
