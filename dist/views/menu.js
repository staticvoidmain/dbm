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
