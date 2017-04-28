
export class HelpItem {
  command: any;
  description: string
  examples: Array<string>

  constructor(command, description, examples?: Array<string>) {
    this.command = command
    this.description = description
    this.examples = examples
  }
}

// not sure if this breaks the notion of a common set of credentials.
// also I think mssql has integrated login... maybe take a look at
// the mssql package for more info.
const commonFlags = '-u|--user-name <user> -p|--password <password>'

export const commandHelp = {
  'init': new HelpItem('init', 'Initializes your dbm install', [
    'dbm init'
  ]),

  'backup': new HelpItem('backup', '', [
    'dbm backup some/server',
    'dbm backup some/server --safe --script-per-object --backup-path ~/backups/myserver'
  ]),

  'migrate': new HelpItem('migrate', 'Executes a migration script ', [
    'dbm migrate my/server migration.yml',
    'dbm migrate my/server migration.yml --log=migration.log'
  ]),

  'analyze': new HelpItem('analyze <db> [...options]', '', [
    'dbm analyze dev/sales --all'
  ]),

  'compare': new HelpItem('compare <db1> <db2>', '', [
    'dbm compare dev/sales prod/sales --diff-rowcount'
  ]),

  'show': new HelpItem('show', '', [
  ]),

  'optimize': new HelpItem('optimize', '', [
    // todo: optimize flags?
    //
    // --indexes
    // --all
    //
  ]),

  'config': new HelpItem('config', '', [])
}

export function showSimpleHelp(log: Function) {
  for (const key in commandHelp) {
    if (commandHelp.hasOwnProperty(key)) {
      const element: HelpItem = commandHelp[key];
      log(`${key} - ${element.description}`)
    }
  }

  // log('   init - initializes a new dbm install')
  // log('   migrate - execute scripts to update your application')
  // log('   analyze - performs analysis on a specified server')
  // log('   optimize - fix configuration, apply indexes, cleanup logs')
  // log('   compare - fix configuration, apply indexes, cleanup logs')
  // log('   config - initialize core dbm settings')
  // log('   show - ')
}

// show detailed help...
export function detailedHelp(cmd: string, logfn: Function) {
  for (const key in commandHelp) {
    if (commandHelp.hasOwnProperty(key)) {
      const element: HelpItem = commandHelp[key];
      
      element.command
    }
  }
}