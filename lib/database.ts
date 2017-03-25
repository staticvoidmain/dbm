export function create (vendor, options) {
  let Db = require('./vendors/' + vendor)

  return new Db(options)
}