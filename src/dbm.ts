import * as chalk from 'chalk'
import * as readline from 'readline'
import { exec } from 'child_process'

import {
  existsSync,
  readFileSync,
  writeFileSync
} from 'fs'

import { show } from './views/app'
import { MigrationRunner } from './tasks/migrate'
import { BackupRunner } from './tasks/backup'
import { MigrationDocument } from "./tasks/migration/document";
import { EnvironmentConfig } from "./lib/environment";
import { join } from "path";

const version = "v0.1 (alpha)"

// todo: if this gets too complex then let's use yargs or something.
// import * as yargs from 'yargs'

const backup = (args) => {
  // todo: what options are these?
}

const die = (message) => {
  console.log(chalk.red(message));
  process.exit(1)
}

const log = function (message) {
  let d = new Date()
  let date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
  let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
  let ts = date + ' ' + time

  console.log(chalk.yellow(ts) + ": " + message)
}

const migrate = (args) => {
  if (!args.length || args[0] === 'help') {
    die("dbm migrate <doc> <environment>")
  }

  function completer(line) {
    const completions = 'r retry s skip c cancel'.split(' ');
    const hits = completions.filter((c) => { return c.indexOf(line) === 0 });
    return [hits.length ? hits : completions, line];
  }

  let c: any = completer // ignore typechecking
  let rl = readline.createInterface(process.stdin, process.stdout, c)
  let [docfile, envName, ...rest] = args;

  let host = hosts.find(envName)

  let doc = new MigrationDocument(docfile)
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

  runner.on('error', function (err) {
    console.log(chalk.red(err))

    prompt()
  })

  runner.on('log', function (msg) {
    log(msg)
  })

  runner.on('done', function (msg) {
    rl.close()
  })

  // todo: explain the steps?
  runner.start()
}

const config = (args) => {
  let action = args.unshift()

  if (!action) {
    die("Unrecognized sub-action.")
  }

  if (action === 'dump') {
    console.log("DBM_HOME: " + home)

    let string = JSON.stringify(config);

    console.log("hosts: ")
    console.log(string);
  }
}

const analyze = (args) => {
  if (!args.length || args[0] === 'help') {
    die("dbm analyze some/server/db --config=analysis.yml --verbose")
  }
}


const optimize = (args) => {
  if (!args.length || args[0] === 'help') {
    die("dbm optimize some/data/path --config=basic_optimizations.yml --verbose")
  }
}

const help = (args) => {
  if (args.length === 0) showDefaultHelp();

  // else, unshift and see if we have command specific help
}


const initialize = (args) => {
  let rl = readline.createInterface(process.stdin, process.stdout)

  rl.question("Where would you to save things? (default: $HOME)", function (answer) {
    if (existsSync(answer)) {
      // todo: export the DBM_PATH environment variable to... setx

      if (process.platform === 'win32') {
        exec("setx DBM_HOME " + answer)
      } else {
        // does this work for us?
        exec("echo 'export DBM_HOME=" + answer + "' >> ~/.bashrc")
      }
    } else {
      die("No such directory.")
    }
  })
}

const showDefaultHelp = () => {
  console.log(` Dbm - ${version}`)
  console.log("commands:")
  console.log("   init - initializes a new dbm install")
  console.log("   migrate - execute scripts to update your application")
  console.log("   analyze - performs analysis on a specified server")
  console.log("   optimize - fix configuration, apply indexes, cleanup logs")
  console.log("   config - initialize core dbm settings")
  console.log("   show - starts a curses-style ui")
  process.exit(1)
}

// each of these commands 
const commands = {
  init: initialize,
  backup: backup,
  migrate: migrate,
  analyze: analyze,
  optimize: optimize,
  config: config,
  help: help,
  show: (args) => {
    show()
  }
}

let home = process.env.DBM_HOME

const init = (args) => {
  let handler = commands[args[0]];

  if (!handler) {
    console.log(chalk.red("Unrecognized command: " + args[0]))

    console.log("valid commands:")
    for (let key in commands) {
      console.log("  " + key)
    }

    die("run 'dbm help' for usage.")
  }

  handler(args.slice(1))
}

if (process.argv.length <= 2) {
  showDefaultHelp()
} else {
  if (!home) {
    die("Missing DBM_HOME environment variable.")
  }

  var configPath = join(home, "hosts.yml")
  var hosts = new EnvironmentConfig(configPath)
}

init(process.argv.slice(2))