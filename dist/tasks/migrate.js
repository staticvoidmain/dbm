"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require('sql');
const events_1 = require("events");
const factory = require('../lib/database.js');
const path = require('path');
const assert = require('assert');
const steps_1 = require("./migration/steps");
var RunnerState;
(function (RunnerState) {
    RunnerState[RunnerState["none"] = 0] = "none";
    RunnerState[RunnerState["running"] = 1] = "running";
    RunnerState[RunnerState["paused"] = 2] = "paused";
    RunnerState[RunnerState["error"] = 3] = "error";
    RunnerState[RunnerState["terminated"] = 4] = "terminated";
    RunnerState[RunnerState["complete"] = 5] = "complete";
    RunnerState[RunnerState["stopping"] = 6] = "stopping";
    RunnerState[RunnerState["stopped"] = 7] = "stopped";
})(RunnerState || (RunnerState = {}));
class MigrationRunner extends events_1.EventEmitter {
    constructor(doc, env) {
        super();
        assert(doc, 'Must supply a valid document');
        assert(env, 'Must supply a valid environment config');
        this.name = doc.name;
        this.root = path.dirname(doc.path);
        this.sqlgen = sql.create(env.vendor, {});
        this.activeStep = null;
        this.stepIndex = 0;
        this.stepCount = doc.steps.length;
        this.steps = this.createSteps(doc);
        this.env = env;
        this.db = factory.create(env.vendor, env);
    }
    createSteps(doc) {
        let models;
        let steps = doc.steps;
        for (let i = 0; i < steps.length; i++) {
            let step = steps[i];
            step.root = this.root;
            for (let key in step) {
                models.push(steps_1.create(i, key, step));
            }
        }
        if (!doc.aliases) {
            models.forEach(function (m) {
                m.on = m.on || doc.db;
            });
        }
        return models;
    }
    log(message) {
        this.emit('log', message);
    }
    sortSteps() {
    }
    start() {
        if (this.state == RunnerState.none) {
            this.state = RunnerState.running;
            this.log('Migration Started: ' + this.name);
            this.log('Details: ' + JSON.stringify(this.env));
            this.next();
        }
    }
    next() {
        if (this.state == RunnerState.paused
            || this.state == RunnerState.terminated) {
            return;
        }
        if (this.stepIndex >= this.stepCount) {
            this.log('Migration Complete!');
            this.emit('done');
            return;
        }
        let step = this.steps[this.stepIndex];
        this.state = RunnerState.running;
        this.emit('step', step);
        this.log('running step: ' + step.toString());
        let query = step.render(this.sqlgen);
        this.log('query: \n' + query);
        if (step.as) {
            this.log('ERROR: step.as is not implemented yet.');
        }
        this.db.run(query).then((result) => {
            this.log('Step Completed');
            if (result.rowCount) {
                this.log('( ' + result.rowCount + ' ) rows affected');
            }
            step.status = steps_1.stepStatus.complete;
            this.emit('step', step);
            this.stepIndex++;
            this.next();
        }).catch(function (err) {
            this.status = steps_1.stepStatus.failed;
            this.emit('step', step);
            this.emit('error', err);
        });
    }
    retry() {
        this.state = RunnerState.running;
        this.next();
    }
    skip() {
        let step = this.steps[this.stepIndex];
        step.status = steps_1.stepStatus.skipped;
        this.stepIndex++;
        this.next();
    }
    stop() {
        this.state = RunnerState.stopped;
        while (this.stepIndex < this.stepCount) {
            let step = this.steps[this.stepIndex];
            step.status = steps_1.stepStatus.canceled;
            this.emit('step', step);
            this.stepIndex++;
        }
    }
    pause() {
        this.state = RunnerState.paused;
    }
    validate() {
        let self = this;
        self.steps.forEach(function (step) {
            try {
                self.emit('log', 'pre-rendering: ' + step.toString());
                step.render(self.sqlgen);
            }
            catch (err) {
                self.emit('error', err);
            }
        });
    }
}
