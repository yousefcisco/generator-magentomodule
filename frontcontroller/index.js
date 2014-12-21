'use strict';

var generators = require('yeoman-generator');
var _ = require('lodash');

module.exports = generators.NamedBase.extend({

    initializing: function() {
        if (typeof this.options.config !== 'undefined') {
            this.config = this.options.config;
        } else {
            this.config = null;
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