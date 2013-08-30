var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
var path = require('path');
var uuid = require('node-uuid');
var async = require('async');
var ModuleReader= require('./modulereader');

function Installer() {}

Installer.prototype.gitExec = function (argv, callback) {
    exec("git " + argv.join(' '), callback);
};

Installer.prototype.clone = function (url, callback) {
    var tmpPath = path.join(os.tmpdir(), uuid.v1());

    this.gitExec(['clone', url, tmpPath], function (error) {
        if (!!error) {
            console.error('Failed to download : ', url);
        } else {
            callback(path.join(tmpPath, '.git'));
        }
    });
};

Installer.prototype.exportVersion = function (mod, callback) {
    try {
        fs.mkdirSync(path.join('.', 'juicy_modules'));
    } catch(e) {}

    this.gitExec(['--git-dir=' + mod.clonePath, 'checkout ' + mod.version], function (error) {
        if (!!error) {
            console.error('version "' + mod.version + '" does not exist for [' + mod.name + ']');
            callback();
        } else {
            console.log(mod.clonePath);
            callback();
        }
    }.bind(this));
};

Installer.prototype.installPackage = function (mod, callback) {
    console.log('\t-> Downloading ' + mod.repository);

    this.clone(mod.repository, function (clonePath) {
        mod.clonePath = clonePath;
        this.exportVersion(mod, callback);
    }.bind(this));
};

Installer.prototype.installPackagesList = function (dependencies) {
    var installer = this;

    async.each(dependencies, function (mod, callback) {
        installer.installPackage(mod, callback);
    });
};


Installer.prototype.installFromJSONFile = function (jsonPath) {
    var reader = new ModuleReader({path: jsonPath});
    reader.read(function (error, settings) {
        if (!!error) {
            console.error();
            console.error(error);
            console.error();
        } else {
            this.installPackagesList(reader.dependencies);
        }
    }.bind(this));
};

module.exports = Installer;
