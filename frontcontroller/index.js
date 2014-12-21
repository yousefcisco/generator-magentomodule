'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

module.exports = generators.NamedBase.extend({

    initializing: function() {
        if (typeof this.options.config !== 'undefined') {
            this.config = this.options.config;
        } else {
            var namespace = path.basename(fs.realpathSync('../'));
            var moduleName = path.basename(fs.realpathSync('.'));

            this.config = {
                modulePath: '',
                fullModuleName: namespace + '_' + moduleName
            };
        }
    },

    writing: function() {
        this.fs.copyTpl(
            this.templatePath('_controller.php'),
            this.destinationPath(this.config.modulePath + '/controllers/' + this.name + '.php'),
            _.extend(this.config, {
                name: this.name
            })
        );
    }
    
});