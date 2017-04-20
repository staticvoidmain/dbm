
import * as yaml from 'js-yaml'
import { readFileSync } from 'fs'
/*
---
hosts:
  dev:
    marketing:
      vehdor: postgres
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
  vendor: string
  name: string
  host: string
}

// this will be read from the hosts.yml/json file
export class Environment {
  name: string
  servers: Array<Server>
}

export class EnvironmentConfig {
  private map: Map<string, Server>

  constructor(file) {
    this.map = new Map<string, Server>()

    let contents = readFileSync(file, 'utf8')
    let temp = file.endsWith(".yml") 
      ? yaml.safeLoad(contents) 
      : JSON.parse(contents)

      for(let key in temp.hosts) {
        let servers = temp.hosts[key];

        for(let name in servers) {
          let host = servers[name]

          this.map.set(key + '/' + name, host)
        }
      }
  }

  // finds a host by a given "name"
  // dev/marketing
  // foo/bar
  find(name) {
    return this.map.get(name)
  }
}
