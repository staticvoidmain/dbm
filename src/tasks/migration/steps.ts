'use strict'

import { readFileSync } from 'fs'
import { join } from 'path'

export interface IObjectIdentifier {
  schema: string
  name: string

  // if this is an index then it will have an object part.
  // not currently supported.
  object?: string
}

// todo: support  things.
// schema_name.obj_name.ix_some_name
function identifier(id: string): IObjectIdentifier {
  let parts = id.split('.')

  if (parts.length > 1) {
    return {
      schema: parts[0],
      name: parts[1]
    }
  } else {
    return { name: id, schema: null }
  }
}

export enum stepStatus {
  pending,
  running,
  complete,
  skipped,
  canceled,
  failed
}

export abstract class Step {
  i: number
  action: string
  type: string
  name: string
  status: stepStatus
  query: string

  // optional: invoke the step on a different database
  on: string

  // optional: invoke the step using a different user
  as: string

  // what was this for again?
  root: string
  path: string

  constructor(i: number, action: string) {
    this.i = i
    this.action = action
    this.status = stepStatus.pending
    this.query = null
  }

  toString() {
    let action = this.action
    let type = this.type
    let name = this.name
    let on = this.on

    return `${action} ${type} ${name} on ${on}`
  }

  /**
   * if the path is not set explicitly, this function automatically resolves
   * steps of the form
   *  drop.table: Foo.Bar
   *  to <root>/tables/Foo.bar.sql
   */
  getPath() {
    let convention = '/' + this.type + 's/' + this.name + '.sql'
    return join(this.root, (this.path || convention))
  }

  abstract render(any): string;
}

// TODO: support capturing the 'as' attribute
class RunStep extends Step {
  constructor(i: number, key: string, step) {
    super(i, 'run')
    this.root = step.root
    this.name = step['run']
    this.on = step.on
    this.type = 'script'
  }

  render() {
    if (!this.query) {
      let path = this.getPath()
      this.query = readFileSync(path, 'utf8')
    }

    return this.query
  }
}

/**
 * This step kind allows us to completely drop ALL existing entities, keys, 
 * without deleting the containing database.
 */
// class ResetDatabase extends Step {
//   // except this doesn't work...

    // the IDEA is that we can query each FK, drop it, then drop each table
    // not sure why we don't just delete the whole database and recreate it...
// }

/**
 * TODO: This isn't done yet but I'm kinda bored with it right now.
 * usage:
 *   drop.view: Foo.vw_Stuff
 *   drop.procedure: Foo.pr_Stuff
 *   drop.index: Foo.Bar.ix_Bazopple
 *   drop.constraint: Foo.Bar.c_Bar_default
 */
class DropObject extends Step {
  ifExists: boolean

  constructor(i: number, key: string, step: any) {
    let parts = key.split('.')
    if (parts.length <= 1) {
      throw Error('malformed drop, missing type')
    }

    super(i, 'drop')

    this.type = parts[1]
    this.name = step[key]
    this.on = step.on
  }

  render(sqlgen) {
    function isObjectMember(type) {
      return type === 'constraint' || type === 'index' || type === 'column'
    }

    if (!this.query) {
      var id = identifier(this.name)

      if (this.type === 'table') {
        let table = sqlgen.define({
          name: id.name.toLowerCase(),
          schema: id.schema.toLowerCase(),
          columns: []
        })

        let cmd = table.drop()

        if (this.ifExists) {
          cmd = cmd.ifExists()
        }

        this.query = cmd.toQuery().text + ';'
      } else {
        // todo: not cross-vendor, or even very good.
        // the sqlgen instance should be able to do this...
        if (isObjectMember(this.type)) {
          let container = sqlgen.define({
            name: id.name.toLowerCase(),
            schema: id.schema.toLowerCase(),
            columns: []
          })

          if (this.type === 'index') {
            container.index()
          }
        } else {

        }

        this.query = `drop ${this.type} ${this.name};`
      }
    }

    return this.query
  }
}

class CreateObject extends Step {
  constructor(i, key, step) {
    let parts = key.split('.')
    if (parts.length <= 1) {
      throw Error('malformed create, missing type')
    }

    super(i, 'create')

    this.name = step[key]
    this.type = parts[1]
    this.root = step.root
    this.path = step.from
    this.on = step.on
  }

  render() {
    if (!this.query) {
      // convention-based file resolution, woo
      let script = this.getPath()

      this.query = readFileSync(script, 'utf8')
    }

    return this.query
  }
}

// disable a user account to lock the database during migration.
class DisableAccount extends Step {
  user: string

  constructor(i, key, step) {
    super(i, 'DISABLE account');

    this.user = step[key]
  }

  render(any: any): string {
    throw new Error('Method not implemented.');
  }
}

class EnableAccount extends Step {
  user: string

  constructor(i, key, step) {
    super(i, 'ENABLE account');

    this.user = step[key]
  }

  render(any: any): string {
    throw new Error('Method not implemented.');
  }
}


class BeginTransaction extends Step {
  // TODO: support named transactions for 
  // fine-grained control over the migration.
  name: string

  constructor(i, key, step) {
    let parts = key.split('.')
    if (parts.length <= 1) {
      throw Error('malformed step.')
    }

    super(i, 'BEGIN transaction')

    this.name = step[key]
    this.type = parts[1]
    this.on = step.on
  }

  render(sqlgen) {
    // todo: we can get the... vendor out and do our own thing.
    // postgres is just BEGIN;
    // mssql requires BEGIN TRAN;

    this.query = 'BEGIN;'

    if (sqlgen.vendor) {

    }

    return this.query
  }
}

class CommitTransaction extends Step {
  constructor(i, key, step) {
    super(i, 'COMMIT transaction')

    this.name = step[key]
    this.on = step.on
  }

  render() {
    return "COMMIT;"
  }
}

class RollbackTransaction extends Step {
  constructor(i, key, step) {
    let parts = key.split('.')
    if (parts.length <= 1) {
      throw Error('malformed step.')
    }

    super(i, 'ROLLBACK transaction')

    this.name = step[key]
    this.type = parts[1]
    this.root = step.root
    this.path = step.from
    this.on = step.on
  }

  render() {
    return "ROLLBACK;"
  }
}

export function create(i, step) {

  let result: Step = null;
  for (let key in step) {
    if (key.startsWith('drop')) {
      return new DropObject(i, key, step)
    }

    if (key.startsWith('create')) {
      return new CreateObject(i, key, step)
    }

    // this one is odd because these verbs don't make sense
    // for all the other step types.
    // begin/commit/rollback verbs
    if (key.endsWith('transaction')) {
      if (key.startsWith('begin')) {
        return new BeginTransaction(i, key, step)
      }

      if (key.startsWith('commit')) {
        return new CommitTransaction(i, key, step)
      }

      if (key.startsWith('rollback')) {
        return new RollbackTransaction(i, key, step)
      }
    }

    if (key === 'run') {
      return new RunStep(i, key, step)
    }
  }

  throw new Error(`Unrecognized step! ${step}`)
}
