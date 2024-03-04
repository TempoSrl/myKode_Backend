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
        files: [
            'client/bower_components/jquery/dist/jquery.js',
            'client/bower_components/jquery-ui/jquery-ui.min.js',
            'node_modules/jasmine-collection-matchers/index.js',
            'client/bower_components/lodash/lodash.js',
            'client/bower_components/observe-js/src/observe.js',
            'client/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'client/components/styles/select2.min.css',
            'client/components/utility/select2.min.js',
            'client/components/styles/dragdrop/jquery.dragtable.js',
            'client/components/metadata/MetaApp.js',
            'test/client/common/metadata/TestApp.js',
            'client/components/metadata/jsDataQuery.js',
            'client/components/metadata/Enum.js',
            'client/components/metadata/Config.js',
            'client/components/metadata/Logger.js',
            'client/components/metadata/EventManager.js',
            'client/components/metadata/Routing.js',
            'client/components/metadata/ConnWebService.js',
            'client/components/metadata/ConnWebSocket.js',
            'client/components/metadata/Connection.js',
            'client/components/metadata/jsDataSet.js',
            'client/components/metadata/GetDataUtils.js',
            //'client/components/metadata/GetDataUtilsNode.js',
            'client/components/metadata/MetaModel.js',
            'client/components/metadata/GetData.js',
            'client/components/metadata/Security.js',
            'client/components/metadata/LocalResource.js',
            'client/components/i18n/LocalResourceIt.js',
            'client/components/metadata/BootstrapModal.js',
            'client/components/metadata/ModalLoaderControl.js',
            'client/components/metadata/ListManager.js',
            'client/components/metadata/TypedObject.js',
            'client/components/metadata/CssDefault.js',
            'client/components/metadata/utils.js',
            'client/components/metadata/BootstrapContainerTab.js',
            'client/components/metadata/HelpForm.js',
            'client/components/metadata/MetaData.js',
            'client/components/metadata/MetaPage.js',
            'client/components/metadata/GridControlX.js',
            'client/components/metadata/ComboManager.js',
            'client/components/metadata/MetaPageState.js',
            'client/components/metadata/LoaderControl.js',
            'client/components/metadata/MainToolBarManager.js',
            'client/components/utility/CodiceFiscale.js',
            'client/Localization.js',
            'client/assets/i18n/LocalResourceIt.js',
            'test/client/common/common.js',
            'test/client/spec/*.js',
            'test/client/spec/metadata/*.js',
            'test/client/spec/fixtures/*.html',
            'test/client/app/styles/fontawesome/fontawesome-all.js',
            'test/client/app/styles/app.css',
            'client/components/template/*.html',
            'client/bower_components/bootstrap/dist/css/bootstrap.css',
            'client/bower_components/bootstrap/dist/js/bootstrap.bundle.js',
            { pattern: 'test/client/spec_midway/**/*.json', included: false, served: true },
        ],

        //https://www.npmjs.com/package/karma-jasmine
        client: {
            jasmine: {
                random:false,
                failFast: false,
                timeoutInterval: 5000
            }
        },
        // list of files / patterns to exclude
        exclude: [
        ],
        proxies: {
            '/test/styles/bootstrap/css/': '/base/test/client/app/styles/bootstrap/css/',
            '/test/styles/': '/base/test/client/app/styles/',
            '/base/bower_components/':'/base/client/bower_components/',
            '/base/components/':'/base/client/components/',
            '/base/test/':'/base/test/client/'
        },

        // web server port
        port: 9876,

        // Start these browsers, currently available:
        // - ChromeHeadless
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: [
            'ChromeHeadless'
        ],

        // Which plugins to enable
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-jasmine-html-reporter',
            'karma-spec-reporter'
        ],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        //singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_ERROR

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};
