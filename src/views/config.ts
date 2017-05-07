import * as blessed from 'blessed'
import { CredentialStore } from '../lib/credential-store'
import { EnvironmentConfig } from '../lib/environment'
import { join } from 'path';

export function show (app) {
  const screen = app.screen()

  const listTableOptions = {
    parent: screen,
    tags: true,
    keys: true,
    height: '80%',
    border: 'line',
    style: app.styles.listtable
  }

  const servers = blessed.listtable(Object.assign({
    label: 'Environments',
    top: 5,
    left: '50%+1',
    width: '50%-2'
  }, listTableOptions))

  const config = new EnvironmentConfig(join(process.env.DBM_HOME, 'hosts.yml'))

  const serverList = [
    ['tier', 'name', 'host', 'vendor']
  ]

  for (const server of config.servers()) {
    serverList.push([
      server.tier,
      server.name,
      server.host,
      server.vendor
    ])
  }

  servers.setData(serverList)

  const credentials = blessed.listtable(Object.assign({
    label: 'Credentials',
    top: 5,
    left: 0,
    width: '50%-2'
  }, listTableOptions))

  const store = new CredentialStore({
    location: process.cwd(),
    encrypted: false
  })

  // todo: apply passwords and such
  // todo: LISTBAR that controls what mini-view we see. pogchamp.
  store.open('not_the_final_password')

  const all = store.getAll()
  const data = []

  data.push(['path', 'password'])

  for (const kvp of all) {
    const [ path, value ] = kvp;

    data.push([ path, value.password ])
  }

  credentials.setData(data)
  credentials.show()
  credentials.focus()

  screen.render()
}