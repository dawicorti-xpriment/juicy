var fs = require('fs');
var path = require('path');

function ModuleReader(options) {
    this.path = options.path || './juicy.json';
    this.name = options.name || null;
    this.settings = {};
}

ModuleReader.prototype.readDependencies = function () {
    var dependencies = this.data.dependencies || {};
    var repositories = this.data.repositories || {};
    var status = true;

    this.dependencies = [];

    for (name in dependencies) {
        if (!(repositories.hasOwnProperty(name))) {
            this.callback('No repository found for "' + name + '"');
            status = false;
            break;
        } else {
            this.dependencies.push({
                name: name,
                version: dependencies[name],
                repository: repositories[name]
            });
        }
    }

    if (status) {
        this.callback(null, this);
    }
};

ModuleReader.prototype.readBasics = function () {
    if (!!this.data.name && this.data.name !== this.name) {
        this.callback('Repository of "' + this.name + '" seems to be wrong : no module with this name found there');
    } else {
        this.readDependencies();
    }
};

ModuleReader.prototype.parseBuffer = function (buffer) {
    try {
        this.data = JSON.parse(buffer.toString());
        this.readBasics();
    } catch (error) {
        this.callback('Failed to parse JSON data from the juicy.json file of ' + (this.name || 'the current module'))
    }
};

ModuleReader.prototype.read = function (callback) {
    this.callback = function (error, result) {
        setTimeout(function (error, result) {
            callback(error, result);
        }, 0)
    };

    fs.readFile(this.path, function (error, buffer) {
        if (!!error) {
            this.callback('Failed to read the juicy.json file of ' + (this.name || 'the current module'));
        } else {
            this.parseBuffer(buffer);
        }
    }.bind(this));
};

module.exports = ModuleReader;