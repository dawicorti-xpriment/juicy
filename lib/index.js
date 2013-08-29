var fs = require('fs');
var Installer = require('./installer');

var commands = {};

function usage() {
    console.log()
    console.log('Usage: juicy install [package]')
    console.log()
}

commands.install = function (argv) {
    var installer = new Installer();
    var jsonPath = './juicy.json';

    if (fs.existsSync(jsonPath)) {
        installer.installFromJSONFile(jsonPath);
    }
};

exports.run = function (argv) {
    var command = argv._.length > 0 ? argv._[0] : null;
    if (command === null && argv.help === true) {
        usage();
    } else if (command !== null || commands.hasOwnProperty(command)) {
        commands[command](argv);
    }
};