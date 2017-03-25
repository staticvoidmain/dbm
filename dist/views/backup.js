"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blessed = require("blessed");
const backup_js_1 = require("../tasks/backup.js");
const database_js_1 = require("../lib/database.js");
const check = 'Y';
module.exports = {
    show: function (app) {
        let self = this;
        let flags = [];
        let screen = app.screen({
            height: '100%',
            width: '100%'
        });
        let objects = blessed.listtable({
            label: 'Objects',
            hidden: true,
            parent: screen,
            top: 'center',
            left: 'center',
            align: 'center',
            tags: true,
            keys: true,
            width: '70%',
            height: '70%',
            border: {
                fg: 'cyan',
                type: 'line'
            },
            style: app.styles.listtable
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
        var db = database_js_1.create(app.env.vendor, app.env);
        db.on('error', function (err) {
            msg.error(err);
        });
        objects.on('action', function (item) {
            let i = objects.getItemIndex(item);
            let line = self.data[i];
            if (line[1] === check) {
                line[0] = line[1] = 'N';
            }
            else if (line[0] === check) {
                line[1] = check;
            }
            else {
                line[0] = check;
            }
            var selected = objects.selected;
            objects.setData(self.data);
            objects.select(selected);
            screen.render();
        });
        var backup = new backup_js_1.BackupRunner(app.env);
        backup.on('log', function () {
        });
        backup.on('error', (err) => msg.error(err));
        backup.on('done', () => msg.log('backup complete!'));
        let configuration = blessed.form({
            shadow: true,
            label: 'Backup Config',
            keys: true,
            hidden: true,
            parent: screen,
            top: 'center',
            left: 'center',
            width: 'shrink',
            height: '50%',
            border: 'line',
            style: {
                bg: 'black'
            }
        });
        blessed.text({
            width: 'half',
            parent: configuration,
            tags: true,
            style: { fg: 'white' },
            content: '{bold}Backup Path:{/bold}',
            top: 1,
            left: 4,
            right: 4
        });
        var backupPath = blessed.textbox({
            parent: configuration,
            height: 1,
            name: 'backupPath',
            style: { bg: 'white', fg: 'black' },
            top: 2,
            left: 4,
            right: 4
        });
        blessed.text({
            tags: true,
            parent: configuration,
            style: { fg: 'white' },
            content: '{bold}Backup Name:{/bold}',
            top: 4,
            left: 4,
            right: 4
        });
        var backupName = blessed.textbox({
            parent: configuration,
            height: 1,
            style: { bg: 'white', fg: 'black' },
            name: 'backupName',
            top: 5,
            left: 4,
            right: 4
        });
        let scriptPerObject = blessed.checkbox({
            tags: true,
            keys: true,
            height: 1,
            shrink: true,
            name: 'scriptPerObject',
            parent: configuration,
            content: '{bold}Split Scripts{/bold}',
            top: 7,
            left: 4
        });
        let safe = blessed.checkbox({
            tags: true,
            keys: true,
            height: 1,
            shrink: true,
            name: 'safe',
            parent: configuration,
            content: '{bold}if not exists{/bold}',
            top: 7,
            left: 25
        });
        let tip = blessed.box({
            padding: 2,
            left: 4,
            right: 4,
            top: 12,
            bottom: 3,
            tags: true,
            keys: false,
            style: {
                fg: 'white'
            },
            content: 'what is happening? Why is this not showing up. I really wish I picked a different schreen drawing tool...',
            border: 'line',
            label: 'about',
            parent: configuration
        });
        backupPath.value = process.env.DBM_HOME || process.cwd();
        backupName.value = 'backup.sql';
        let lastFocusedElement = null;
        let settingInfo = {
            'safe': 'Render the create script with an "IF EXISTS"',
            'scriptPerObject': 'Saves a separate file per object backed up, to the specified backup path.\nOverrides backup name.',
            'backupPath': 'Folder when saving the backup.',
            'backupName': 'File name if using single file backup.'
        };
        blessed.listbar({
            parent: screen,
            bottom: 0,
            height: 'shrink',
            left: 5,
            right: 5,
            autoCommandKeys: true,
            style: app.styles.listbar,
            commands: {
                'start backup': function () {
                    let data = self.data.slice(1);
                    if (flags.length) {
                        for (let i = 0; i < data.length; data++) {
                            let row = data[i];
                            if (row[0] === 'Y') {
                                flags[i].include = true;
                                if (row[1] === 'Y') {
                                    flags[i].data = true;
                                }
                            }
                        }
                        backup.run(self.schema, {
                            scriptPerObject: scriptPerObject.checked,
                            backupPath: backupPath.getValue(),
                            backupName: backupName.getValue(),
                            safe: safe.checked
                        });
                    }
                },
                'configure backup': function () {
                    configuration.show();
                    configuration.focusFirst();
                    screen.render();
                }
            }
        });
        db.getSchema().then(function (schema) {
            self.schema = schema;
            let rows = [
                ['include', 'data', 'type', 'schema', 'name']
            ];
            if (schema.tables) {
                schema.tables.forEach(function (table) {
                    rows.push([check, ' ', 'table', table.schema, table.name]);
                    flags.push(table);
                });
            }
            else {
                msg.log("You ain't got no tables fool!");
            }
            self.data = rows;
            objects.setData(self.data);
            objects.show();
            objects.focus();
            screen.render();
        }).catch(function (err) {
            msg.error(err.stack, 10);
        });
        screen.render();
    }
};
