'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function identifier(id) {
    let parts = id.split('.');
    if (parts.length > 1) {
        return {
            schema: parts[0],
            name: parts[1]
        };
    }
    else {
        return { name: id, schema: null };
    }
}
var stepStatus;
(function (stepStatus) {
    stepStatus[stepStatus["pending"] = 0] = "pending";
    stepStatus[stepStatus["running"] = 1] = "running";
    stepStatus[stepStatus["complete"] = 2] = "complete";
    stepStatus[stepStatus["skipped"] = 3] = "skipped";
    stepStatus[stepStatus["canceled"] = 4] = "canceled";
    stepStatus[stepStatus["failed"] = 5] = "failed";
})(stepStatus = exports.stepStatus || (exports.stepStatus = {}));
class Step {
    constructor(i, action) {
        this.i = i;
        this.action = action;
        this.status = stepStatus.pending;
        this.query = null;
    }
    toString() {
        let action = this.action;
        let type = this.type;
        let name = this.name;
        let on = this.on;
        return `${action} ${type} ${name} on ${on}`;
    }
    getPath() {
        let convention = '/' + this.type + 's/' + this.name + '.sql';
        return path_1.join(this.root, (this.path || convention));
    }
}
exports.Step = Step;
class RunStep extends Step {
    constructor(i, key, step) {
        super(i, 'run');
        this.root = step.root;
        this.name = step['run'];
        this.on = step.on;
        this.type = 'script';
    }
    render() {
        if (!this.query) {
            let path = this.getPath();
            this.query = fs_1.readFileSync(path, 'utf8');
        }
        return this.query;
    }
}
class DropObject extends Step {
    constructor(i, key, step) {
        let parts = key.split('.');
        if (parts.length <= 1) {
            throw Error('malformed drop, missing type');
        }
        super(i, 'drop');
        this.type = parts[1];
        this.name = step[key];
        this.on = step.on;
    }
    render(sqlgen) {
        function isObjectMember(type) {
            return type === 'constraint' || type === 'index' || type === 'column';
        }
        if (!this.query) {
            var id = identifier(this.name);
            if (this.type === 'table') {
                let table = sqlgen.define({
                    name: id.name.toLowerCase(),
                    schema: id.schema.toLowerCase(),
                    columns: []
                });
                let cmd = table.drop();
                if (this.ifExists) {
                    cmd = cmd.ifExists();
                }
                this.query = cmd.toQuery().text + ';';
            }
            else {
                if (isObjectMember(this.type)) {
                    let container = sqlgen.define({
                        name: id.name.toLowerCase(),
                        schema: id.schema.toLowerCase(),
                        columns: []
                    });
                    if (this.type === 'index') {
                        container.index();
                    }
                }
                else {
                }
                this.query = `drop ${this.type} ${this.name};`;
            }
        }
        return this.query;
    }
}
class CreateObject extends Step {
    constructor(i, key, step) {
        let parts = key.split('.');
        if (parts.length <= 1) {
            throw Error('malformed create, missing type');
        }
        super(i, 'create');
        this.name = step[key];
        this.type = parts[1];
        this.root = step.root;
        this.path = step.from;
        this.on = step.on;
    }
    render() {
        if (!this.query) {
            let script = this.getPath();
            this.query = fs_1.readFileSync(script, 'utf8');
        }
        return this.query;
    }
}
class BeginTransaction extends Step {
    constructor(i, key, step) {
        let parts = key.split('.');
        if (parts.length <= 1) {
            throw Error('malformed step.');
        }
        super(i, 'BEGIN transaction');
        this.name = step[key];
        this.type = parts[1];
        this.root = step.root;
        this.path = step.from;
        this.on = step.on;
    }
    render(sqlgen) {
        this.query = 'BEGIN;';
        return this.query;
    }
}
class CommitTransaction extends Step {
    constructor(i, key, step) {
        super(i, 'COMMIT transaction');
        this.name = step[key];
        this.root = step.root;
        this.on = step.on;
    }
    render() {
        return "COMMIT;";
    }
}
class RollbackTransaction extends Step {
    constructor(i, key, step) {
        let parts = key.split('.');
        if (parts.length <= 1) {
            throw Error('malformed step.');
        }
        super(i, 'ROLLBACK transaction');
        this.name = step[key];
        this.type = parts[1];
        this.root = step.root;
        this.path = step.from;
        this.on = step.on;
    }
    render() {
        return "ROLLBACK;";
    }
}
function create(i, key, step) {
    if (key.startsWith('drop')) {
        return new DropObject(i, key, step);
    }
    if (key.startsWith('create')) {
        return new CreateObject(i, key, step);
    }
    if (key.endsWith('transaction')) {
        if (key.startsWith('begin')) {
            return new BeginTransaction(i, key, step);
        }
        if (key.startsWith('commit')) {
            return new CommitTransaction(i, key, step);
        }
        if (key.startsWith('rollback')) {
            return new RollbackTransaction(i, key, step);
        }
    }
    if (key === 'run') {
        return new RunStep(i, key, step);
    }
    return null;
}
exports.create = create;
