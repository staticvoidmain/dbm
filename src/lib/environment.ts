
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

    let contents = readFileSync(file, 'utf8')
    let temp = file.endsWith(".yml")
      ? yaml.safeLoad(contents)
      : JSON.parse(contents)

    for (let key in temp.hosts) {
      let servers = temp.hosts[key];

      for (let name in servers) {
        let host = servers[name]
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
    let list = []
    for (let x of this.map.values()) {
      list.push(x)
    }

    return list
  }
}
