
import * as yaml from 'js-yaml'
import { readFileSync } from 'fs'

export class Server {
  tier: string
  vendor: string
  name: string
  host: string
}

/**
 * Environments can be configured using simple JSON / YML documents
 * defining a heirarchy of tier/name/host-definition
 */
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

  /**
   * finds a host in the list of servers
   *
   * @param name The tier/name of the server ex: dev/marketing
   */
  find(name): Server {
    return this.map.get(name)
  }

  /**
   * Gets a list of all servers contained in the environment config.
   */
  servers(): Array<Server> {
    const list = []
    for (const x of this.map.values()) {
      list.push(x)
    }

    return list
  }
}
