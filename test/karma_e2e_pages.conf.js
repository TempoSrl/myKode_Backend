// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-02-06 using
// generator-karma 0.9.0

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        //autoWatch: true,
        usePolling: true,

        //dots  progress  junit  growl  coverage kjhtml spec
        reporters: ['spec'],


        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser

        files : [
             'client/bower_components/jquery/dist/jquery.js',  //necessary for eventManager
             'client/bower_components/lodash/lodash.js', //necessary for eventManager
             'client/components/metadata/jsDataQuery.js', // necessary for jsDataSet
             'client/bower_components/jasmine-jquery/lib/jasmine-jquery.js', //necessary for testHelper (getFixtures)
             'client/components/metadata/jsDataSet.js',  //necessary for eventManager
             'client/components/metadata/MetaApp.js',
             'client/components/metadata/LocalResource.js',
             'client/components/metadata/Logger.js', //necessary for mandate_default_Spec
             'client/components/metadata/EventManager.js',
             'client/components/metadata/utils.js',
             'client/components/metadata/Config.js', //necessary for testHelperPages
             'client/components/metadata/Routing.js', //necessary for testHelperPages
             'client/components/metadata/BootstrapModal.js', //necessary for testHelperPages ($().modal)
             'test/client/common/common.js',
             'test/client/common/TestHelperPages.js',
             'test/client/pages_e2e/**/*_Spec.js'
        ],

        // list of files / patterns to exclude
        exclude: [
        ],
        proxies:{
                "/":"http://localhost:54471/"
        },

        // web server port
        port: 9876,
        browserNoActivityTimeout: 60000, // timeout se Karma non riceve messaggi dal browser entro un certo tempo. aumentato in test ceh richeidono query pesanti
        browserDisconnectTimeout: 30000,
        captureTimeout: 60000,

        // Start these browsers, currently available:
        // Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), IE (only Windows),
        //  ChromeDebugging, ChromeHeadless
        browsers: [
            'ChromeDebugging'
        ],

        customLaunchers: {
            ChromeDebugging: {
                base: 'Chrome',
                flags: ['--remote-debugging-port=9333']
            }
        },

        // Which plugins to enable
        plugins: [
            'karma-jasmine',
            'karma-jasmine-html-reporter',
            'karma-chrome-launcher',
            'karma-junit-reporter',
            'karma-spec-reporter'
        ],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        //singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        urlRoot: 'main',

        // Allow remote debugging when using PhantomJS
        // uncomment to karma debug on:
        // http://localhost:9876/debug.html
        // , customLaunchers: {
        //     'PhantomJS_custom': {
        //         base: 'PhantomJS',
        //         debug: true,
        //     }
        // }

    });
};
