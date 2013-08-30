var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
var path = require('path');
var uuid = require('node-uuid');

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

Installer.prototype.exportVersion = function (name, url, clonePath, version) {
    version = version || 'HEAD';
    var that = this;

    try {
        fs.mkdirSync(path.join('.', 'juicy_modules'));
    } catch(e) {}
    this.gitExec(['--git-dir=' + clonePath, 'checkout ' + version], function (error) {
        if (!!error) {
            console.error('version "' + version + '" does not exist for [' + url + ']')
        } else {
        }
    });
};

Installer.prototype.installPackage = function (name, version) {
    var that = this;
    /* TODO : use a list of repositories */
    var url = "https://github.com/" + name + '.git';

    console.log('\t-> Downloading ' + url);

    this.clone(url, function (clonePath) {
        that.exportVersion(name, url, clonePath, version);
    });
};

Installer.prototype.installPackagesList = function (packages) {
    Object.keys(packages).forEach(function (name) {
        var version = packages[name];
        this.installPackage(name, version);
    }, this);
};


Installer.prototype.installFromJSONFile = function (jsonPath) {
    var buffer = fs.readFileSync(jsonPath);
    var dataStr = buffer.toString();
    var data = JSON.parse(dataStr);
    var dependencies = data.dependencies || {};

    console.log();
    console.log('Dependencies installation :');
    console.log();
    this.installPackagesList(dependencies);
};

module.exports = Installer;
