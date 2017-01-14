
// various metadata related tasks are going to consume this info.
// load up the connection info from the vendors/folder, and
// this is actually just kinda bad... 
function Database (vendor) {
  this.vendor = require('./vendors/' + vendor);
}

Database.prototype.connect = function (creds) { 

  // promises? I guess.
  return vendor.connect(creds);
}

Database.prototype.getTables = function (schema) { 
  return vendor.getTables() // or all
}

Database.prototype.getSchemas = function () { }

Database.prototype.execute = function (sql) { 
  // just run it bitch.
}

// todo: create transactions and all that good shit.
module.exports = Database
