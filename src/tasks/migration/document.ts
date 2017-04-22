import * as yaml from 'js-yaml'
import { readFileSync } from "fs";

export interface IMigrationDocument {
  name: string
  path: string
  steps: any[]

  // optional bits
  db: string
  aliases: object[]
  disableStepSort: boolean
  disableBackups: boolean
  singleTransaction: boolean
}

export function testFileExtension(file) {
  let isJson = file.endsWith('.json')
  let isYaml = file.endsWith('.yml')

  return {
    isJson: isJson,
    isYaml: isYaml
  }
}

export class MigrationDocument implements IMigrationDocument {
  name: string
  path: string
  steps: any[]
  db: string
  aliases: object[]
  disableStepSort: boolean
  disableBackups: boolean
  singleTransaction: boolean

  constructor(file: string) {
    let test = testFileExtension(file)

    if (!test.isYaml && !test.isJson) {
      throw new Error("Invalid migration file= " + file)
    }

    let contents = readFileSync(file, 'utf8')
    let temp = test.isYaml
      ? yaml.safeLoad(contents)
      : JSON.parse(contents)

    Object.assign(this, temp)

    this.path = file
  }

  validate() {
    let messages = []

    if (!this.path) messages.push("Missing 'path' property")
    if (!this.name) messages.push("Missing 'name' property")
    if (!this.steps) messages.push("Missing 'steps' property")

    return messages
  }
}