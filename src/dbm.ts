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
import { MigrationDocument } from './tasks/migration/document';
import { EnvironmentConfig } from './lib/environment';
import { create } from './lib/database';
import { join } from 'path';

import {
  commandHelp,
  showSimpleHelp,
  detailedHelp
} from './lib/cli-help'

import { CredentialStore } from './lib/credential-store';

// todo: read some things
const version = 'v0.1 (alpha)'

const flag = (args, text) => {
  return args.indexOf(text) > -1
}

// one of the few mutable things in the file.
let hosts

/**
 * Extracts arg values of the form --arg-name=value
 * @param args argv from the process, but scoped to the specific sub-command
 * @param text the option flag to match
 */
const option = (args, text) => {
  const token = text + '=';

  for (let i = 0; i < args.length; i++) {
    const e = args[i];

    if (e.startsWith(token)) {
      const [_, val] = e.split('=')

      return val
    }
  }
}

const backup = (args) => {

  const [server, ...rest] = args
  const target = hosts.find(server)

  if (!target) {
    die(`Unknown server: ${server}, add to your hosts.yml file and run again`)
  }

  const options = {
    scriptPerObject: true,
    safe: true
  }

  if (rest) {
    options.scriptPerObject = flag(rest, '--script-per-object')
    options.safe = flag(rest, '--safe')
  }

  const db = create(target)

  db.getSchema()
    .then((schema) => {
      const runner = new BackupRunner(target)
      runner.on('log', (msg) => console.log(msg))
      runner.on('done', () => process.exit(0))

      runner.run(schema, options)
    })
}

const die = (message) => {
  console.log(chalk.red(message));
  process.exit(1)
}

const log = function (message) {
  const d = new Date()
  const date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
  const time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
  const ts = date + ' ' + time

  console.log(chalk.yellow(ts) + ': ' + message)
}

const migrate = (args) => {
  if (!args.length || args[0] === 'help') {
    die('dbm migrate <doc> <environment>')
  }

  function completer(line) {
    const completions = 'r retry s skip c cancel'.split(' ');
    const hits = completions.filter((c) => { return c.indexOf(line) === 0 });
    return [hits.length ? hits : completions, line];
  }

  const c: any = completer // ignore typechecking
  const rl = readline.createInterface(process.stdin, process.stdout, c)
  const [docfile, envName, ...rest] = args;

  const server = hosts.find(envName)
  const doc = new MigrationDocument(docfile)
  const runner = new MigrationRunner(doc, server)

  function prompt() {
    const failed = 'Step failed! (r)etry, (s)kip, (c)ancel (default: r)'
    rl.question(failed, (line) => {
      switch (line.toLowerCase()) {
        case 'r':
        case 'retry':
          runner.retry();
          break;

        case 's':
        case 'skip':
          runner.skip();
          break;

        case 'c':
        case 'cancel':
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

  // todo: explain steps.
  rl.question('Start migration?', function (answer) {
      answer === 'y' && runner.start()
      answer === 'n' && process.exit(0)
  })
}

const config = (args) => {
  const action = args.unshift()

  if (!action) {
    die('Unrecognized sub-action.')
  }

  const rl = readline.createInterface(process.stdin, process.stdout)

  console.log('DBM_HOME: ' + home)
  console.log('hosts: ')
  console.log(JSON.stringify(hosts.servers(), undefined, ' '));

  rl.question('enter passphrase: ', function (phrase) {

    // todo: if phrase is falsy, try non-encrypted
    const store = new CredentialStore({ encrypted: false })
    console.log('credentials: ')

    try {
      store.open(phrase)
      console.log(store.getAll())

      store.close();
    } catch (e) {
      console.log(chalk.red(e))
    }

    rl.close()
  })
}

const analyze = (args) => {
  if (!args.length || args[0] === 'help') {
    die('dbm analyze some/server/db --config=analysis.yml --verbose')
  }
}

const compare = (args) => {
  if (!args.length || args[0] === 'help') {
    die('dbm compare dev/foo test/foo')
  }
}


const optimize = (args) => {
  if (!args.length || args[0] === 'help') {
    die('dbm optimize some/data/path --config=basic_optimizations.yml --verbose')
  }
}

const help = (args) => {
  if (args.length === 0) showDefaultHelp();

  const command = args.shift();
  const help = commandHelp[command]

  if (help) {
    console.log(chalk.bold(help.command))
    console.log(help.description)

    for (const example of help.examples) {
      console.log(chalk.italic(example))
    }
  }

  // else, unshift and see if we have command specific help
}

const initialize = (args) => {
  const rl = readline.createInterface(process.stdin, process.stdout)

  rl.question('Where would you to save things? (default: $HOME)', function (answer) {
    if (existsSync(answer)) {

      if (process.platform === 'win32') {
        exec(`setx DBM_HOME ${answer}`)
      } else {
        exec(`echo "export DBM_HOME=${answer}" >> ~/.bashrc`)
      }
    } else {
      die('No such directory.')
    }
  })
}

const showDefaultHelp = () => {
  console.log(` Dbm - ${version}`)
  console.log('commands:')

  showSimpleHelp((l) => console.log(l))

  process.exit(0)
}

// each of these commands needs some help info
const commands = {
  init: initialize,
  backup: backup,
  migrate: migrate,
  analyze: analyze,
  optimize: optimize,
  config: config,
  compare: compare,
  help: help,
  show: (args) => {
    show()
  }
}

const home = process.env.DBM_HOME

const init = (args) => {
  const handler = commands[args[0]];

  if (!handler) {
    console.log(chalk.red('Unrecognized command: ' + args[0]))

    console.log('valid commands:')
    for (const key in commands) {
      console.log('  ' + key)
    }

    die('run "dbm help <command>" for usage info.')
  }

  console.log(args)
  handler(args.slice(1))
}

if (process.argv.length <= 2) {
  showDefaultHelp()
} else {
  if (!home) {
    die('Missing DBM_HOME environment variable.')
  }

  hosts = new EnvironmentConfig(join(home, 'hosts.yml'))

  // todo: keep track of any of our promises outstanding.
  const unhandledRejections = new Map();

  process.on('unhandledRejection', (reason, p) => {
    // todo: maybe a timestamp.
    unhandledRejections.set(p, reason);
  });

  process.on('rejectionHandled', (p) => {
    unhandledRejections.delete(p);
  });
}

init(process.argv.slice(2))