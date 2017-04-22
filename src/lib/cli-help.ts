
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

// should these all support including credentials in the commands?
export const commandHelp = {
  "init": new HelpItem("init", "Initializes your dbm install", [
    'dbm init'
  ]),
  
  "backup": new HelpItem("backup", "", [
    'dbm backup some/server',
    'dbm backup some/server --safe --script-per-object --backup-path=~/backups/myserver'
  ]),
  
  "migrate": new HelpItem("migrate", "Executes a migration script ", [
    'dbm migrate my/server migration.yml',    
    'dbm migrate my/server migration.yml --log=migration.log'
  ]),
  
  "analyze": new HelpItem("analyze", "", [
    'dbm analyze'
  ]),
  
  "optimize": new HelpItem("optimize", "", [
    // todo: optimize flags?
    // 
    // --indexes
    // --all
    // 
  ]),
  
  "config": new HelpItem("config", "", [])
}