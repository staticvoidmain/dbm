import { IDatabaseSchema } from "./vendors/common";
import { Server } from "./environment";

/**
 * Represents a managed database controlled by DBM
 */
export interface IManagedDatabase {
  // todo: come up with a default args format for the app.
  run: (statement: string, args?: any) => Promise<any>
  query: (statement: string, args?: any) => Promise<any>
  getSchema: () => Promise<any> // todo: fix this to be a real schema object
  
  // defines the batch separator (required)
  separator: string
  on(event: string | symbol, listener: Function): this;
}

// factory function to lazy-load the vendors
export function create(server: Server): IManagedDatabase {
  let module = require('./vendors/' + server.vendor)
  let factory = module.create

  return factory(server)
}