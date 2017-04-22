import * as blessed from 'blessed'
import { MigrationDocument, testFileExtension } from "../tasks/migration/document";

import {
  stat,
  readFileSync
} from 'fs'

import * as yaml from 'js-yaml'
import * as emphasize from 'emphasize'
import { join } from "path";
import { EnvironmentConfig } from "../lib/environment";

export function show(app, onServerSelected) {
  let screen = app.screen()

  let list = blessed.listtable({
    parent: screen,
    style: app.styles.listtable,
    label: 'Objects',
    hidden: true,
    top: 'center',
    left: 'center',
    align: 'center',
    tags: true,
    keys: true,
    width: '70%',
    height: '70%',
  })

  let home = process.env.DBM_HOME
  let config = new EnvironmentConfig(join(home, 'hosts.yml'))

  let data = [
    ['tier', 'name', 'vendor', 'host']
  ]
  
  for (let server of config.servers()) {
    data.push([
      server.tier,
      server.name,
      server.vendor,
      server.host
    ])
  }

  // tier, then by name
  data.sort(function(a: Array<any>, b: Array<any>) {
    let tier = a[0] - b[0]
    let name = a[1] - b[1]

    return tier * 2 + name
  })

  list.setData(data)

  // todo: read the hosts file.
  // todo: show a listtable item for each element
  // todo: on user selection invoke callback

  screen.show()
}