import { show } from './views/app'
import * as chalk from 'chalk'

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
  let opt = options(args);
  let doc = opt("-d|--document")

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

const init = (args) => {
  if (args.length === 0) {

  } else {
    let handler = commands[args[0]];

    if (!handler) {
      console.log(chalk.red("Unrecognized command: " + args[0]))
    }
  }


}

init(process.argv.slice(2))