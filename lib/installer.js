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
            callback(tmpPath);
        }
    });
    return tmpPath;
};

Installer.prototype.installPackage = function (url, version) {
    this.clone(url, function (tmpPath) {
        version = version || 'HEAD';

        console.log(tmpPath);
    });
};

Installer.prototype.installPackagesList = function (packages) {
    Object.keys(packages).forEach(function (url) {
        var version = packages[url];
        this.installPackage(url, version);
    }, this);
};


Installer.prototype.installFromJSONFile = function (jsonPath) {
    var buffer = fs.readFileSync(jsonPath);
    var dataStr = buffer.toString();
    var data = JSON.parse(dataStr);
    var dependencies = data.dependencies || {};

    this.installPackagesList(dependencies);
};

module.exports = Installer;
