// todo: document this stuff
export interface IDatabaseSchema {
  tables: Array<any>
  procedures: Array<any>
  views: Array<any>
  keys: Array<any>
}

/**
 * Represents a managed database controlled by DBM
 */
export interface IManagedDatabase {
  run: (statement: string, args: any) => Promise<any>
  query: (statement: string, args: any) => Promise<any>
  getSchema: () => Promise<IDatabaseSchema>
  
  /**
   * Handles events and such from the EventEmitter style thingo
   * 
   * This might need to be named something else.
   * 
   * message?
   */
  on: (event: string, cb: any) => void
}

// factory function to lazy-load the vendors
export function create (vendor, options): IManagedDatabase {
  let Db = require('./vendors/' + vendor)

  return new Db(options)
}