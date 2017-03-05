

function BeginTransaction (i, key, step) {
  let parts = key.split('.')
  if (parts.length <= 1) {
    throw Error('malformed create, missing type')
  }

  Step.call(this, i, 'begin transaction')

  this.name = step[key]
  this.type = parts[1]
  this.root = step.root
  this.path = step.from
  this.on = step.on
}

inherits(BeginTransaction, Step)