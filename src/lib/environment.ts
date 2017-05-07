
import * as yaml from 'js-yaml'
import { readFileSync } from 'fs'
/*
---
hosts:
  dev:
    marketing:
      vendor: postgres
      host: localhost

    sales:
      vendor: sqlite3
      host: c:/dev/projects/dbm/test/sqlite.db

  test:
    marketing:
      vendor: mssql
      host: localhost

  prod:
    marketing:
      vendor: postgres
      host: localhost
 */

export class Server {
  tier: string
  vendor: string
  name: string
  host: string
}

export class EnvironmentConfig {
  private map: Map<string, Server>

  constructor(file) {
    this.map = new Map<string, Server>()

    const contents = readFileSync(file, 'utf8')
    const temp = file.endsWith('.yml')
      ? yaml.safeLoad(contents)
      : JSON.parse(contents)

    for (const key in temp.hosts) {
      const servers = temp.hosts[key];

      for (const name in servers) {
        const host = servers[name]
        host.name = name
        host.tier = key

        this.map.set(key + '/' + name, host)
      }
    }
  }

  // finds a host by a given "name"
  // dev/marketing
  // foo/bar
  find(name): Server {
    return this.map.get(name)
  }

  servers(): Array<Server> {
    const list = []
    for (const x of this.map.values()) {
      list.push(x)
    }

    return list
  }
}
