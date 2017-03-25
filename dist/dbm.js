const sqlite = require('sqlite3');
const newline = (process.platform === 'win32' ? '\r\n' : '\n');
function SqliteDb(options) {
    this.db = new sqlite.Database(options.host);
    this.separator = ';' + newline;
    this.name = 'sqlite3';
}
SqliteDb.prototype.run = function (statement) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.db.run(statement, {}, function (err) {
            if (err)
                return reject(err);
            return resolve(this.changes);
        });
    });
};
module.exports = SqliteDb;
module.exports = {
    show: (app) => {
    }
};
const blessed = require('blessed');
const main = require('./menu.js');
module.exports = {
    show: function (app) {
        var screen = app.screen();
        var menu = blessed.form({
            parent: screen,
            label: 'login',
            left: 'center',
            top: 'center',
            keys: true,
            border: 'line',
            width: '50%',
            height: '50%'
        });
        blessed.text({
            left: 6,
            top: 4,
            width: 'half',
            parent: menu,
            tags: true,
            style: { fg: 'white' },
            content: '{bold}User Name:{/bold}'
        });
        var user = blessed.textbox({
            parent: menu,
            height: 1,
            name: 'username',
            style: { bg: 'white', fg: 'black' },
            width: 'half',
            left: 5,
            top: 5
        });
        blessed.text({
            left: 6,
            top: 6,
            tags: true,
            width: 'half',
            parent: menu,
            style: { fg: 'white' },
            content: '{bold}Password:{/bold}'
        });
        var password = blessed.textbox({
            parent: menu,
            height: 1,
            censor: true,
            width: 'half',
            left: 5,
            top: 7,
            style: { bg: 'white', fg: 'black' },
            name: 'password'
        });
        user.on('focus', function () { user.readInput(); });
        password.on('focus', function () { password.readInput(); });
        var submit = blessed.button({
            parent: menu,
            mouse: true,
            keys: true,
            shrink: true,
            padding: {
                left: 2,
                right: 2
            },
            left: 2,
            bottom: 0,
            name: 'next_button',
            content: '[ Login ]',
            style: app.styles.button
        });
        let showMenu = function () {
            main.show(app);
            screen.destroy();
        };
        password.on('enter', showMenu);
        submit.on('press', showMenu);
        user.focus();
        screen.render();
    }
};
'use strict';
const blessed = require('blessed');
const backupView = require('./backup.js');
const config = require('./config.js');
const selectMigration = require('./selectMigration.js');
module.exports = {
    show: function (app) {
        var screen = app.screen();
        var menu = blessed.list({
            parent: screen,
            label: 'Tasks',
            border: 'line',
            style: {
                selected: {
                    bg: 'blue'
                }
            },
            keys: true,
            height: 'half',
            width: 'half',
            top: 5,
            left: 5
        });
        menu.add('Backup:   export the schema and data to the file-system');
        menu.add('Migrate:  run a set of scripts against the database to create/update or remove db objects');
        menu.add('Analyze:  inspect your database for potential problems.');
        menu.add('Optimize: automatically fix common database performance issues.');
        menu.add('Config:   configure dbm');
        menu.on('action', function (item, i) {
            if (i === 0) {
                backupView.show(app);
            }
            else if (i === 1) {
                selectMigration.show(app);
            }
            else if (i === 2) {
            }
            else if (i === 3) {
            }
            else if (i === 4) {
                config.show(app);
            }
            screen.destroy();
        });
        menu.focus();
        screen.render();
    }
};
const blessed = require('blessed');
const MigrationRunner = require('../tasks/migrate.js');
const statusToColorMap = {
    'failed': 'red',
    'complete': 'green',
    'running': 'blue'
};
function formatStepString(step) {
    let stepString = step.toString();
    let color = statusToColorMap[step.status];
    var start = '';
    var end = '';
    if (color) {
        start = `{${color}-bg}`;
        end = `{/${color}-bg}`;
    }
    return start + `${step.status} | ${stepString}` + end;
}
module.exports = {
    show: function (app, doc) {
        var screen = app.screen({
            width: '95%',
            height: '95%',
            border: 'line'
        });
        var logger = blessed.log({
            parent: screen,
            width: '50%+1',
            height: '100%',
            left: '50%-1',
            top: 0,
            border: 'line',
            tags: true,
            keys: true,
            mouse: true,
            scrollback: 100,
            scrollbar: {
                ch: ' ',
                track: {
                    bg: 'yellow'
                },
                style: {
                    inverse: true
                }
            }
        });
        var log = function (message) {
            let d = new Date();
            let date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
            let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
            let ts = date + ' ' + time;
            logger.log('{yellow-fg}' + ts + '{/yellow-fg}: ' + message);
        };
        var runner = new MigrationRunner(doc, app.env);
        log('Loaded migration: ' + doc.path);
        runner.on('log', log);
        runner.on('error', function (err) {
            log('{red-fg}' + err + '{/red-fg}');
        });
        runner.validate();
        var steps = blessed.list({
            label: 'steps',
            parent: screen,
            width: '50%',
            height: '100%',
            border: 'line',
            tags: true,
            left: 0,
            top: 0,
            items: runner.steps.map(formatStepString)
        });
        runner.on('step', function (step) {
            let item = steps.items[step.i];
            steps.setItem(item, formatStepString(step));
            screen.render();
        });
        var bar = blessed.listbar({
            parent: screen,
            autoCommandKeys: true,
            width: 'shrink',
            height: 1,
            style: app.listbarStyle,
            heigth: 3,
            left: 5,
            bottom: 1,
            commands: {
                'start': function () { runner.start(); },
                'retry': function () { runner.retry(); },
                'skip': function () { runner.skip(); },
                'pause': function () { runner.pause(); },
                'stop': function () { runner.stop(); }
            }
        });
        bar.focus();
        screen.render();
    }
};
'use strict';
const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const migration = require('./migration.js');
const emphasize = require('emphasize');
function testFileExtension(file) {
    let isJson = file.endsWith('.json');
    let isYaml = file.endsWith('.yml') || file.endsWith('.yaml');
    return {
        isJson: isJson,
        isYaml: isYaml
    };
}
module.exports = {
    show: function (app) {
        var screen = app.screen();
        var input = blessed.textbox({
            parent: screen,
            top: 2,
            left: 0,
            height: 'shrink',
            width: '25%',
            border: 'line',
            label: 'Search: ',
            hidden: true
        });
        var msg = blessed.message({
            parent: screen,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            label: 'Info',
            tags: true,
            keys: true,
            hidden: true
        });
        var fm = blessed.filemanager({
            parent: screen,
            border: 'line',
            style: {
                selected: {
                    bg: 'blue'
                }
            },
            height: '100%-5',
            width: '50%-2',
            top: 5,
            left: 0,
            label: ' {blue-fg}%path{/blue-fg}',
            cwd: process.env.DBM_HOME,
            vi: true,
            keys: true,
            scrollbar: {
                bg: 'yellow',
                ch: ' '
            },
            search: function (callback) {
                input.show();
                input.readInput(function (err, value) {
                    input.hide();
                    screen.restoreFocus();
                    if (err)
                        return;
                    return callback(null, value);
                });
                screen.render();
            }
        });
        var preview = blessed.scrollablebox({
            parent: screen,
            tags: true,
            border: 'line',
            top: 5,
            left: '50%+1',
            width: '50%-2',
            height: '100%-5',
            scrollbar: {
                bg: 'yellow',
                ch: ' '
            },
            content: ''
        });
        function onSelectedItemChange(item) {
            let value = blessed.helpers.cleanTags(item.content);
            let file = path.resolve(fm.cwd, value);
            fs.stat(file, function (err, stat) {
                if (err) {
                    throw err;
                }
                if (!stat.isDirectory()) {
                    let test = testFileExtension(value);
                    if (test.isYaml || test.isJson) {
                        let content = fs.readFileSync(file, 'utf8');
                        let formatted = test.isYaml
                            ? emphasize.highlight('yaml', content)
                            : emphasize.highlight('json', content);
                        preview.setLabel(value);
                        preview.setContent(formatted.value);
                        screen.render();
                    }
                }
            });
        }
        fm.on('select item', onSelectedItemChange);
        fm.key('backspace', () => fm.select(0));
        fm.on('file', function (file) {
            let doc = null;
            let test = testFileExtension(file);
            if (test.isYaml || test.isJson) {
                let contents = fs.readFileSync(file);
                try {
                    if (test.isYaml) {
                        doc = yaml.safeLoad(contents);
                    }
                    else {
                        doc = JSON.parse(contents);
                    }
                    doc.path = file;
                }
                catch (ex) {
                    msg.error(ex);
                    return;
                }
                migration.show(app, doc);
            }
            screen.destroy();
        });
        fm.focus();
        fm.refresh();
        screen.render();
    }
};
