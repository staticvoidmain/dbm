import * as blessed from 'blessed'
import {CredentialStore} from '../lib/credential-store'
import {Environment} from '../lib/environment'

export function show (app) {
  var screen = app.screen()

  var credentials = blessed.listtable({
    label: 'Objects',
    hidden: true,
    parent: screen,
    top: 'center',
    left: 'center',
    align: 'center',
    tags: true,
    keys: true,
    width: '70%',
    height: '70%',
    style: app.styles.listtable
  })

  let store = new CredentialStore({
    location: process.cwd(),
    encrypted: false
  })

  // todo: apply passwords
  store.open("").then(() => {
    let all = store.getAll()



    screen.render()
    
  })


  // todo: store credentials
  // manage the dbm path?
  // do other things

  screen.render()
}