import { IDatabaseSchema } from "./vendors/common";

/**
 * Represents a managed database controlled by DBM
 */
export interface IManagedDatabase {
  run: (statement: string, args?: any) => Promise<any>
  query: (statement: string, args?: any) => Promise<any>
  getSchema: () => Promise<any> // todo: fix this

  on(event: string | symbol, listener: Function): this;
}

// factory function to lazy-load the vendors
export function create(vendor, options): IManagedDatabase {
  let module = require('./vendors/' + vendor)
  let factory = module.create

  return factory(options)
}