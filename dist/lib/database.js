"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function create(vendor, options) {
    let Db = require('./vendors/' + vendor);
    return new Db(options);
}
exports.create = create;
