import * as blessed from 'blessed'
import {CredentialStore} from '../lib/credential-store'
import {Environment} from '../lib/environment'

export function show (app) {
  var screen = app.screen()

  const listTableOptions = {
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
  }

  // var servers = blessed.listtable(listTableOptions)
  var credentials = blessed.listtable(listTableOptions)

  let store = new CredentialStore({
    location: process.cwd(),
    encrypted: false
  })

  // todo: apply passwords and such
  // todo: LISTBAR that controls what mini-view we see. pogchamp.
  store.open("not_the_final_password").then(() => {
    let all = store.getAll()
    let data = []
    
    data.push(['path', 'password'])

    for (let kvp of all) {
      let [ path, value ] = kvp;

      data.push([ path, value.password ])
    }
    
    credentials.setData(data)
    credentials.show()
    credentials.focus()  
    screen.render()
  })

  screen.render()
}