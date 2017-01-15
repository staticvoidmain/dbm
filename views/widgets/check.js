'use strict'

const inherits = require('util').inherits
const blessed = require('blessed')



function Check(options) {
  blessed.widget.Checkbox.call(this, [options])
}

inherits(Check, blessed.widget.Checkbox)

Check.prototype.render = function() {
  
}



module.exports = Check;