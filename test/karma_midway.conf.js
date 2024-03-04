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
        reporters: ['dots'],


        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        //https://www.npmjs.com/package/karma-jasmine
        client: {
            jasmine: {
                random:false,
                failFast: false,
                timeoutInterval: 5000
            }
        },

        // list of files / patterns to load in the browser
        files: [
            //'client/bower_components/es6-shim/es6-shim.js',
            'client/bower_components/jquery/dist/jquery.js',
            'client/bower_components/jquery-ui/jquery-ui.min.js',
            'node_modules/jasmine-collection-matchers/index.js',
            'client/bower_components/lodash/lodash.js',
            'client/bower_components/observe-js/src/observe.js',
            'client/components/metadata/jsDataQuery.js',
            'client/components/metadata/jsDataSet.js',
            'client/components/metadata/MetaApp.js',
            'test/client/common/metadata/TestApp.js',

            'client/components/metadata/LocalResource.js',
            'client/components/metadata/Enum.js',
            'client/components/metadata/Config.js',
            'client/components/metadata/Logger.js',
            'client/components/metadata/EventManager.js',
            'client/components/metadata/Routing.js',
            'client/components/metadata/CssDefault.js',
            'client/components/metadata/Utils.js',
            'client/components/metadata/ConnWebService.js',
            'client/components/metadata/ConnWebSocket.js',
            'client/components/metadata/Connection.js',
            'client/components/metadata/MetaModel.js',
            'client/components/metadata/GetDataUtils.js',
            // 'client/components/metadata/GetDataUtilsNode.js',
            'client/components/metadata/Security.js',
            'client/components/metadata/GetData.js',
            'client/components/metadata/PostData.js',
            'client/components/metadata/BootstrapModal.js',
            'client/components/metadata/ModalLoaderControl.js',
            'client/components/metadata/DbProcedureMessage.js',
            'client/components/metadata/TreeNode.js',
            'client/components/metadata/TreeNode_Dispatcher.js',
            'client/components/metadata/TreeViewManager.js',
            'client/components/metadata/TypedObject.js',
            'client/components/metadata/BootstrapContainerTab.js',
            'client/components/metadata/HelpForm.js',
            'client/components/metadata/MetaData.js',
            'client/components/metadata/MetaPage.js',
            'client/components/metadata/ModalForm.js',
            'client/components/metadata/FormProcedureMessages.js',
            'client/components/metadata/GridControl.js',
            'client/components/metadata/GridControlX.js',
            'client/components/metadata/CheckBoxListControl.js',
            'client/components/metadata/ComboManager.js',
            'client/components/metadata/MetaPageState.js',
            'client/components/metadata/LoaderControl.js',
            'client/components/metadata/ListManager.js',
            'client/components/metadata/MainToolBarManager.js',
            'client/components/metadata/GridMultiSelectControl.js',
            'client/components/metadata/MultiSelectControl.js',
            'client/components/metadata/SliderControl.js',

            'client/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'client/bower_components/jstree/dist/jstree.js',
            'client/components/styles/select2.min.css',
            'client/components/utility/select2.min.js',
            'client/components/styles/dragdrop/jquery.dragtable.js',
            //'client/components/metadata/MetaApp.js',

            'client/components/i18n/*.js',
            'client/Localization.js',
            'client/assets/i18n/*.js',
            'client/components/metadata/thirdpart/gauge.js',
            'client/components/metadata/tachimetro/TachimetroControl.js',
            'client/components/metadata/thirdpart/chart.min.js',
            'client/components/metadata/graph/GraphControl.js',
            'test/client/common/common.js',
            'test/client/spec_midway/metadata/*.js',

            'test/client/app/styles/fontawesome/fontawesome-all.js',
            'test/client/app/styles/app.css',
            'client/components/template/*.html',
            //'components/styles/bootstrap/css/bootstrap.css'  needed for components/template/*.html
            //'components/styles/app.css',    // needed for components/template/*.html

            'client/bower_components/bootstrap/dist/css/bootstrap.css',
            'client/bower_components/bootstrap/dist/js/bootstrap.bundle.js',
            //'test/app/styles/bootstrap/js/jquery-ui.min.js',
            'client/bower_components/jstree/dist/themes/default/style.css',
            'test/client/spec_midway/fixtures/*.html',

            { pattern: 'client/components/styles/bootstrap/css/*.css', included: false, served: true },
            { pattern:'client/components/styles/*.css', included: false, served: true },
            { pattern: 'test/client/spec_midway/**/*.js', included: false, served: true },
            { pattern: 'test/client/spec_midway/**/*.html', included: false, served: true },
            { pattern: 'test/client/spec_midway/**/*.json', included: false, served: true },
        ],

        // list of files / patterns to exclude
        exclude: [
        ],
        proxies: {
            '/styles/bootstrap/css/': '/base/client/components/styles/bootstrap/css/',
            // covers test/client/app/styles/app.css and others 2
            '/styles/': '/base/test/client/app/styles/',
            '/base/test/app/styles/': '/base/test/client/app/styles/',
            '/jstest/': '/base/test/client/spec_midway/jstest/',
            // '/base/test/styles/bootstrap/css/': '/base/test/client/app/styles/bootstrap/css/',
            // '/base/test/styles/bootstrap/js/': '/base/test/client/app/styles/bootstrap/js/',
            // '/base/test/client/app/styles/bootstrap/css/': '/base/test/client/app/styles/bootstrap/css/',
            // '/base/test/app/styles/bootstrap/js/': '/base/test/client/app/styles/bootstrap/js/',
            // '/base/test/app/styles/': '/base/test/client/app/styles/',
            '/base/bower_components/':'/base/client/bower_components/',
            '/base/components/':'/base/client/components/',
            '/base/test/':'/base/test/client/'
        },

        // web server port
        port: 9876,

        // Start these browsers, currently available:
        // - Chrome ChromeHeadless
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
            'karma-jasmine', 'karma-jasmine-html-reporter', 'karma-chrome-launcher',
            'karma-junit-reporter',
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
