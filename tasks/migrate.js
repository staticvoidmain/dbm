
// this is the migration runner.

/*
  THINK about shrinkwrapping to bake all the versions into the migration

// migration.json
{
  steps: [
    { "drop.table": "foo.bar" },
    { "create.view": "views/my_view.sql" },
    { "create.proc": "procs/my_proc.sql" }
  ]
}

// migration.yaml
---
dbs:
- captive: reporting.Captive
- vendor: originations.Vendor
steps:
- drop.table: foo.bar
  on: captive
- create.view: views/my_view.sql
  on: captive
- create.proc: procs/my_proc.sql
  on: vendor

TODO: multiple dbs in a single migration

*/

// I wonder if we could use that sql library...
// imma import it tonight
function DropObject (step) {
  this.type = 'table'
  // this.render = platform.drop('table').if.exists()
}

function CreateObject (key, step) { }

function createSteps (steps) {
  let models = []
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]

    for (let key in step) {
      if (key.startsWith('drop')) {
        models.push(new DropObject(key, step))
        break
      }

      if (key.startsWith('create')) {
        models.push(new CreateObject(key, step))
        break
      }

      // todo: alter etc etc etc
    }
  }

  // todo: stuff
  return models
}

function MigrationRunner (options) {
  // todo: should I do the thing where the step order isn't enforced?
  // I feel like I liked it better that way... less foot shooty
  // blah blah blah.
  // maybe this is good for some codegen things.
  // not sure if there is a safe way to do if exists drop $type $name
  this.platform = options.platform
  this.steps = createSteps(options.steps)
  if (!options.overrideOrder) {
    this.sortSteps()
  }
}

MigrationRunner.prototype.sortSteps = function () {
  // todo: sort into order
  //
}

MigrationRunner.prototype.getStepNames = function () {

}

MigrationRunner.prototype.start = function () {
  this.steps.forEach(function (step) {
    var task = factory(step)
  })
}

module.exports = MigrationRunner

