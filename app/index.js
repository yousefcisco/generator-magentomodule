'use strict';

var generators = require('yeoman-generator');

module.exports = generators.Base.extend({

    initializing: function () {
        this.pkg = require('../package.json');
    },

    prompting: function() {
        var done = this.async();

        // have Yeoman greet the user.
        console.log(this.yeoman);

        this.prompt(this._getPrompts(), function(config) {

            this.userConfig = config;

            done();
        }.bind(this));
    },

    configuring: function() {
        this.config = {};

        this.config.namespace = this.userConfig.namespace;
        this.config.moduleName = this.userConfig.moduleName;
        this.config.codePool = this.userConfig.codePool;

        this.config.fullModuleName = this.fullModuleName = this.config.namespace + '_' + this.config.moduleName;
        this.config.moduleIdentifier = this.moduleIdentifier = this.config.fullModuleName.toLowerCase();

        var path = [
            'app',
            'code',
            this.config.codePool,
            this.config.namespace,
            this.config.moduleName
        ];

        this.config.modulePath = this.modulePath = path.join('/');

        if (this.userConfig.global.length) {
            this.config.global = {
                helper: this._has(this.userConfig.global, 'helper'),
                model: this._has(this.userConfig.global, 'model'),
                block: this._has(this.userConfig.global, 'block'),
            };
        } else {
            this.config.global = false;
        }

        if (this.userConfig.frontend.length) {
            this.config.frontend = {
                layout: this._has(this.userConfig.frontend, 'layout'),
                controller: this._has(this.userConfig.frontend, 'controller'),
                widget: this._has(this.userConfig.frontend, 'widget'),
            };
        } else {
            this.config.frontend = false;
        }

        if (this.userConfig.adminhtml.length) {
            this.config.adminhtml = {
                controller: this._has(this.userConfig.adminhtml, 'controller'),
                layout: this._has(this.userConfig.adminhtml, 'layout'),
            };
        } else {
            this.config.adminhtml = false;
        }

        this.config.setup = this.userConfig.setup;
    },

    writing: {
        global: function() {
            // Global
            if (this.config.global) {
                // Helper
                if (this.config.global.helper) {
                    this.fs.copyTpl(
                        this.templatePath('_helper.php'),
                        this.destinationPath(this.modulePath + '/Helper/Data.php'),
                        this.config
                    );
                }
                // Model
                if (this.config.global.model) {
                    this.fs.copyTpl(
                        this.templatePath('_model.php'),
                        this.destinationPath(this.modulePath + '/Model/Mymodel.php'),
                        this.config
                    );
                }
                // Block
                if (this.config.global.block) {
                    this.fs.copyTpl(
                        this.templatePath('_block.php'),
                        this.destinationPath(this.modulePath + '/Block/Myblock.php'),
                        this.config
                    );
                }
            }
        },

        frontend: function() {
            // Frontend
            if (this.config.frontend) {
                // Layout file
                if (this.config.frontend.layout) {
                    var layoutPath = 'app/design/frontend/base/default/layout/';

                    this.fs.copyTpl(
                        this.templatePath('_frontlayout.xml'),
                        this.destinationPath(layoutPath + this.moduleIdentifier + '.xml'),
                        this.config
                    );
                }

                // Frontend Controller
                if (this.config.frontend.controller) {
                    this.composeWith('magentomodule:frontcontroller', {
                        args: [
                            'IndexController'
                        ], 
                        options: {
                            config: this.config
                        }
                    });
                }

                // Add widget via sub generator if selected
                // if (this.config.frontend.widget) {
                //     this.composeWith('magentomodule:widget', {
                //         args: [{
                //             name: 'Mywidget',
                //             codePool: this.codePool,
                //             namespace: this.namespace,
                //             moduleName: this.moduleName,
                //             modulePath: this.modulePath
                //         }]
                //     });
                // }
            }
        },

        adminhtml: function() {
            // Admin
            if (this.config.adminhtml) {
                // Controller
                if (this.config.adminhtml.controller) {
                    this.fs.copyTpl(
                        this.templatePath('_adminhtmlcontroller.php'),
                        this.destinationPath(this.modulePath + '/controllers/adminhtml/IndexController.php'),
                        this.config
                    );
                }
                // Layout
                if (this.config.adminhtml.layout) {
                    var adminLayoutPath = 'app/design/adminhtml/default/default/layout/';

                    this.fs.copyTpl(
                        this.templatePath('_adminhtmllayout.xml'),
                        this.destinationPath(adminLayoutPath + this.moduleIdentifier + '.xml'),
                        this.config
                    );
                }
            }
        },

        setup: function() {
            // Setup script
            if (this.config.setup) {
                var setupPath = this.modulePath + '/sql/' + this.moduleIdentifier + '_setup';

                this.fs.copyTpl(
                    this.templatePath('_setup.php'),
                    this.destinationPath(setupPath + '/mysql4-install-0.1.0.php'),
                    this.config
                );

                this.fs.copyTpl(
                    this.templatePath('_setupresource.php'),
                    this.destinationPath(this.modulePath + '/Model/Resource/Setup.php'),
                    this.config
                );
            }
        },

        default: function() {
            // Config XML
            this.fs.copyTpl(
                this.templatePath('_etcmodules.xml'),
                this.destinationPath('app/etc/modules/' + this.fullModuleName + '.xml'),
                this.config
            );

            this.fs.copyTpl(
                this.templatePath('_config.xml'),
                this.destinationPath(this.modulePath + '/etc/config.xml'),
                this.config
            );

            this.fs.copy(
                this.templatePath('_package.json'),
                this.destinationPath('package.json')
            );
        }
    },

    end: function() {
        this.installDependencies({
            skipInstall: this.options['skip-install']
        });
    },

    _getPrompts: function() {
        return [
            {
                type: 'input',
                name: 'namespace',
                message: 'What is your namespace?',
                default: 'MyNamespace'
            },
            {
                type: 'input',
                name: 'moduleName',
                message: 'What is the name of your Magento module?',
                default: 'MyModule'
            },
            {
                type: 'list',
                name: 'codePool',
                message: 'Which code pool are you going to stick your module in?',
                choices: [
                {
                    name: 'Local',
                    value: 'local'
                },
                {
                    name: 'Community',
                    value: 'community'
                }
                ],
                default: 'community'
            },
            {
                type: 'checkbox',
                name: 'global',
                message: 'Need any templates for the general stuff?',
                choices: [
                    {
                        name: 'Model',
                        value: 'model'
                    },
                    {
                        name: 'Block',
                        value: 'block'
                    },
                    {
                        name: 'Helper',
                        value: 'helper'
                    }
                ],
                default: false
            },
            {
                type: 'checkbox',
                name: 'frontend',
                message: 'What frontend gadgets do you require good sir?',
                choices: [
                    {
                        name: 'Layout file',
                        value: 'layout'
                    },
                    {
                        name: 'Controller',
                        value: 'controller'
                    },
                    {
                        name: 'Widget',
                        value: 'widget'
                    }
                ],
                default: false
            },
            {
                type: 'checkbox',
                name: 'adminhtml',
                message: 'What admin shizzle do you want?',
                choices: [
                {
                    name: 'Layout file',
                    value: 'layout'
                },
                {
                    name: 'Controller',
                    value: 'controller'
                }
                ],
                default: false
            },
            {
                type: 'confirm',
                name: 'setup',
                message: 'Need a setup script?',
                default: false
            },
        ];
    },

    _has: function(array, value) {
        return array.indexOf(value) !== -1;
    }

});