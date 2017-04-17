import { show } from './views/app'
import * as chalk from 'chalk'
import {MigrationRunner} from './tasks/migrate'
import { BackupRunner } from './tasks/backup'
import { MigrationDocument } from "./tasks/migration/document";
import { readFileSync } from 'fs'

// todo: if this gets too complex then let's use yargs or something.
// import * as yargs from 'yargs'

const options = (args: Array<string>) => {
  // -f|--file
  return (f: string) => {
    let tokens = f.split('|')
    
  }
}

const backup = (args) => {
  // requires a path? // document or what?

}

const migrate = (args) => {
  if (!args.length || isHelp(args[0])) {
    console.log("dbm migrate <doc> <environment>")
    return;
  }

  let [docfile, env, ...rest] = args;
  // todo: search DBMHOME for the environment config.
  var contents = readFileSync(docfile, 'utf8')
  var doc = new MigrationDocument(contents)
  var runner = new MigrationRunner(doc, env)
  
  runner.on('', function() {
    
  })

  runner.start()
  
}

const commands = {
  backup: backup,
  migrate: migrate,
  analyze: null,
  optimize: null,
  config: null,
  show: (args) => {
    show()
  }
}

const isHelp = (arg) => {
  return arg === '-h'
    || arg === '/h' 
    || arg === '-?'
    || arg === '/?'
    || arg === 'help'
}

const init = (args) => {
  if (args.length === 0 || isHelp(args[0])) {
    console.log("Dbm - commands:")
    console.log("  migrate - execute scripts to update your application")
    console.log("  analyze - performs analysis on a specified server")
    console.log("  optimize - fix configuration, apply indexes, cleanup logs")
    console.log("  config - initialize core dbm settings")
    console.log("  show - starts a curses-style ui")

  } else {
    let handler = commands[args[0]];

    if (!handler) {
      console.log(chalk.red("Unrecognized command: " + args[0]))
    }

    handler(args.slice(1))
  }
}

init(process.argv.slice(2))