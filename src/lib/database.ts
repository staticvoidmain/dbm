// todo: document this stuff
export interface IDatabaseSchema {
  tables: Array<any>
  procedures: Array<any>
  views: Array<any>
  keys: Array<any>
}

export interface IManagedDatabase {
  run: (statement: string) => void
  query: (statement: string) => Promise<any>
  getSchema: () => Promise<IDatabaseSchema>
  on: (event: string, cb: any) => void
}

export function create (vendor, options): IManagedDatabase {
  let Db = require('./vendors/' + vendor)

  return new Db(options)
}