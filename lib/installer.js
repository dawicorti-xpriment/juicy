var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
var path = require('path');
var uuid = require('node-uuid');
var ncp = require('ncp');
var ModuleReader= require('./modulereader');

function Installer() {}

Installer.prototype.gitExec = function (argv, callback) {
    exec("git " + argv.join(' '), callback);
};

Installer.prototype.clone = function (mod) {
    var clonePath = path.join(os.tmpdir(), uuid.v1());

    this.gitExec(['clone', mod.repository, clonePath], function (error) {
        if (!!error) {
            console.error('Failed to download : ', mod.repository);
        } else {
            mod.clonePath = clonePath;
            this.exportVersion(mod)
        }
    }.bind(this));
};

Installer.prototype.copyToJuicyFolder = function (mod) {
    ncp(mod.clonePath, path.join('.', 'juicy_modules', mod.name), this.installNext.bind(this));
};

Installer.prototype.readModule = function (mod) {
    var reader = new ModuleReader({name: mod.name, path: path.join(mod.clonePath, 'juicy.json')});
    reader.read(function (error) {
        if (!!error) {
            console.error();
            console.error(error);
            console.error();
        } else {
            this.copyToJuicyFolder(mod);
        }
    }.bind(this));
};

Installer.prototype.exportVersion = function (mod) {
    try {
        fs.mkdirSync(path.join('.', 'juicy_modules'));
    } catch(e) {}

    this.gitExec(['--git-dir=' + path.join(mod.clonePath, '.git'), 'checkout ' + mod.version], function (error) {
        if (!!error) {
            console.error('version "' + mod.version + '" does not exist for [' + mod.name + ']');
        } else {
            this.readModule(mod);
        }
    }.bind(this));
};

Installer.prototype.installModule = function (mod) {
    console.log('\t-> Downloading ' + mod.repository);

    this.clone(mod);
};

Installer.prototype.installNext = function () {
    if (this.modules.length > 0) {
        var mod = this.modules.pop();
        this.installModule(mod);
    }
};

Installer.prototype.installModulesList = function (modules) {
    var installer = this;

    console.log();
    console.log('Install modules :');
    console.log();

    this.modules = modules || [];
    this.installNext();
};


Installer.prototype.installFromJSONFile = function (jsonPath) {
    var reader = new ModuleReader({path: jsonPath});
    reader.read(function (error, settings) {
        if (!!error) {
            console.error();
            console.error(error);
            console.error();
        } else {
            this.installModulesList(reader.modules);
        }
    }.bind(this));
};

module.exports = Installer;
