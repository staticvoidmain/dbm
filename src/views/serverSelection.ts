import * as blessed from 'blessed'
import {
  MigrationDocument,
  testFileExtension
} from '../tasks/migration/document';

import {
  stat,
  readFileSync
} from 'fs'

import * as yaml from 'js-yaml'
import * as emphasize from 'emphasize'
import { join } from 'path';
import { EnvironmentConfig } from '../lib/environment';
import { CredentialStore } from "../lib/credential-store";

export function show(app, onServerSelected) {
  const screen = app.screen()

  const list = blessed.listtable({
    parent: screen,
    style: app.styles.listtable,
    label: 'Objects',
    top: 'center',
    left: 'center',
    align: 'center',
    tags: true,
    keys: true,
    width: '70%',
    height: '70%',
  })

  const home = process.env.DBM_HOME
  const config = new EnvironmentConfig(join(home, 'hosts.yml'))

  const data = [
    ['tier', 'name', 'vendor', 'host']
  ]

  for (const server of config.servers()) {
    data.push([
      server.tier,
      server.name,
      server.vendor,
      server.host
    ])
  }

  // tier, then by name
  data.sort(function (a: Array<any>, b: Array<any>) {
    const tier = a[0] - b[0]
    const name = a[1] - b[1]

    return tier * 2 + name
  })

  list.setData(data)
  list.focus()
  list.on('action', function (item, i) {
    const servers = config.servers()
    const server = servers[i - 1]

    const path = [server.tier, server.name].join('/')
    const store = new CredentialStore({ encrypted: false, open: true });
    const user = store.get(path)
    // this also needs the permissions... so...
    // any credential matching the server.tier/server.name?


    onServerSelected()
  })

  screen.render()
}