import * as chalk from 'chalk'
import * as readline from 'readline'
import * as cp from 'child_process'

import { 
  existsSync,
  readFileSync, 
  writeFileSync 
} from 'fs'

import { show } from './views/app'
import { MigrationRunner } from './tasks/migrate'
import { BackupRunner } from './tasks/backup'
import { MigrationDocument } from "./tasks/migration/document";

const version = "v0.1 (alpha)"

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

const log = function (message) {
  let d = new Date()
  let date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
  let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
  let ts = date + ' ' + time

  console.log(chalk.yellow(ts) + ": " + message)
}

const migrate = (args) => {
  if (!args.length || isHelp(args[0])) {
    console.log("dbm migrate <doc> <environment>")
    return;
  }

  function completer(line) {
    const completions = 'r retry s skip c cancel'.split(' ');
    const hits = completions.filter((c) => { return c.indexOf(line) === 0 });
    return [hits.length ? hits : completions, line];
  }

  let c: any = completer // ignore typechecking
  let rl = readline.createInterface(process.stdin, process.stdout, c)
  let [docfile, env, ...rest] = args;
  let contents = readFileSync(docfile, 'utf8')
  let doc = new MigrationDocument(contents)
  let runner = new MigrationRunner(doc, env)

  function prompt() {
    const failed = "Step failed! (r)etry, (s)kip, (c)ancel (default: r)"
    rl.question(failed, (line) => {
      switch (line.toLowerCase()) {
        case "r": 
        case "retry":
          runner.retry(); 
          break;
        
        case "s":
        case "skip": 
          runner.skip(); 
          break;
        
        case "c":
        case "cancel": 
          runner.stop(); 
          break;

        default: prompt()
      }
    })
  }
 
  runner.on('error', function(err) {
    console.log(chalk.red(err))
    
    prompt()
  })

  runner.on('log', function(msg) {
    log(msg)
  })

  runner.start()
}

const config = (args) => {
  // todo: open the config
  // set the shit.
}


const analyze = (args) => {

}


const optimize = (args) => {

}

const initialize = (args) => {
   let rl = readline.createInterface(process.stdin, process.stdout)

   rl.question("Where would you to save things? (default: $HOME)", function(answer) {
    if (existsSync(answer)) {
      // todo: export the DBM_PATH environment variable.

      
    } else {
      console.log("ENOENT: No directory.")
      process.exit(1)
    }
   })
}

// each of these commands 
const commands = {
  init: initialize,
  backup: backup,
  migrate: migrate,
  analyze: analyze,
  optimize: optimize,
  config: config,
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

let home = process.env.DBM_HOME

const init = (args) => {
  if (args.length === 0 || isHelp(args[0])) {
    console.log(` Dbm - ${version}`)
    console.log("commands:")
    console.log("   init - initializes a new dbm install")    
    console.log("   migrate - execute scripts to update your application")
    console.log("   analyze - performs analysis on a specified server")
    console.log("   optimize - fix configuration, apply indexes, cleanup logs")
    console.log("   config - initialize core dbm settings")
    console.log("   show - starts a curses-style ui")

  } else {

    if (!home) {
      console.log("Missing DBM_HOME environment variable.")
      process.exit(-1);
    }

    let handler = commands[args[0]];

    if (!handler) {
      console.log(chalk.red("Unrecognized command: " + args[0]))

      console.log("valid commands:")
      for (let key in commands) {
        console.log("  " + key)
      }
    }

    handler(args.slice(1))
  }
}

init(process.argv.slice(2))