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
            'client/components/metadata/jsDataQuery.js',
            'client/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'client/components/metadata/jsDataSet.js',
            'client/bower_components/jstree/dist/jstree.js',
            'client/components/utility/select2.min.js',
            'client/components/metadata/MetaApp.js',
            'client/components/metadata/Enum.js',
            'client/components/metadata/Config.js',
            'client/components/metadata/ConfigDev.js',
            'client/components/metadata/LocalResource.js',
            'client/components/metadata/Logger.js',
            'client/components/metadata/EventManager.js',
            'client/components/metadata/Routing.js',
            'client/components/metadata/DbProcedureMessage.js',
            'client/components/metadata/ConnWebService.js',
            'client/components/metadata/ConnWebSocket.js',
            'client/components/metadata/Connection.js',
            'client/components/metadata/utils.js',
            'client/components/metadata/Security.js',
            'client/components/metadata/AuthManager.js',
            'client/components/metadata/TypedObject.js',
            'client/components/metadata/GetDataUtils.js',
            // 'client/components/metadata/GetDataUtilsNode.js',
            'client/components/metadata/MetaModel.js',
            'client/components/metadata/GetData.js',
            'client/components/metadata/PostData.js',
            'client/components/i18n/*.js',
            'client/Localization.js',
            'client/assets/i18n/*.js',

            'client/components/metadata/LoaderControl.js',
            'client/components/metadata/ModalLoaderControl.js',
            'client/components/metadata/MetaData.js',
            'client/components/metadata/CssDefault.js',
            'client/components/metadata/HelpForm.js',
            'client/components/metadata/MetaPageState.js',
            'client/components/metadata/BootstrapModal.js',
            'client/components/metadata/TreeNode.js',
            'client/components/metadata/TreeNode_Dispatcher.js',
            'client/components/metadata/TreeViewManager.js',
            'client/components/metadata/ModalForm.js',
            'client/components/metadata/GridControl.js',
            'client/components/metadata/GridControlX.js',
            'client/components/metadata/ListManager.js',
            'client/components/metadata/ListManagerCalendar.js',
            'client/components/metadata/MainToolBarManager.js',
            'client/components/metadata/MetaPage.js',
            'client/components/metadata/ComboManager.js',
            'client/components/metadata/FormProcedureMessages.js',
            'client/components/metadata/GridMultiSelectControl.js',
            'client/components/metadata/MultiSelectControl.js',
            'test/client/common/common.js',
            'test/client/common/TestHelper.js',
            'test/client/common/TestCase.js',
            'test/client/common/metadata/TestApp.js',
            //'test/client/common/*.js',
            'test/client/spec/fixtures/*.html',
            'client/components/template/*.html',
            'test/client/app/styles/app.css',
         	'client/bower_components/bootstrap/dist/css/bootstrap.css',
            'client/bower_components/bootstrap/dist/js/bootstrap.bundle.js',
            'test/client/spec_e2e_app/metadata/App1_E2E_Spec.js',
            'test/client/spec_e2e_app/metadata/App2_E2E_Spec.js',
            'test/client/spec_e2e_app/metadata/App3_E2E_Spec.js',
            'test/client/spec_e2e_app/metadata/App4_E2E_Spec.js',
            'test/client/spec_e2e_app/app3/registry/*.js',
            'test/client/spec_e2e_app/app3/registryreference/*.js',
            'test/client/spec_e2e_app/app4/upb/Upb_TreeNode.js',
            'test/client/spec_e2e_app/app4/upb/Upb_TreeNode_Dispatcher.js',
            'test/client/spec_e2e_app/app4/upb/Upb_TreeViewManager.js',
            'test/client/spec_e2e_app/app4/upb/meta_upb.js',
            { pattern: 'test/client/spec_e2e_app/**/*.js', included: false, served: true },
            { pattern: 'test/client/spec_e2e_app/**/*.html', included: false, served: true },
            //{ pattern: 'test/client/spec_e2e/**/*.json', included: false, served: true },
        ],

        // list of files / patterns to exclude
        exclude: [
        ],
        proxies: {
             '/base/bower_components/': 'http://localhost:54471/client/bower_components/',
             '/base/components/template/': '/base/client/components/template/',
             '/base/test_client/spec_e2e_app/app1/components/': '/base/client/components/',
             '/base/test_client/spec_e2e_app/app2/components/': '/base/client/components/',
             '/base/test_client/spec_e2e_app/app3/components/': '/base/client/components/',
             '/base/test_client/spec_e2e_app/app4/components/': '/base/client/components/',

            '/base/test_client/app/': '/base/test/client/app/',

            '/base/test_client/components/': '/base/client/components/',
            "/base/test_client/spec_e2e_app/app1/": "/base/test/client/spec_e2e_app/app1/",
            "/base/test_client/spec_e2e_app/app2/": '/base/test/client/spec_e2e_app/app2/',
            "/base/test_client/spec_e2e_app/app3/": '/base/test/client/spec_e2e_app/app3/',
            "/base/test_client/spec_e2e_app/app4/": '/base/test/client/spec_e2e_app/app4/',
            //'/base/test_client/auth/': 'http://localhost:54471/test_client/auth/',
            //'/base/test_client/data/': 'http://localhost:54471/test_client/data/',
            //'/base/test_client/spec_e2e/': 'http://localhost:54471/test_client/spec_e2e/',
            //'/test_client/auth/': 'http://localhost:54471/test_client/auth/',
            '/test_client/auth/': 'http://localhost:54471/test_client/auth/',
            '/test_client/data/': 'http://localhost:54471/test_client/data/',
            '/base/test_client/auth/': 'http://localhost:54471/test_client/auth/',
            '/base/test_client/data/': 'http://localhost:54471/test_client/data/',

            //'/base/test_client/': 'http://localhost:54471/test_client/',



        },

        // web server port
        port: 9876,
        browserNoActivityTimeout: 60000, // timeout se Karma non riceve messaggi dal browser entro un certo tempo. aumentato in test ceh richeidono query pesanti
        browserDisconnectTimeout: 30000,
        captureTimeout: 60000,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: [
            'Chrome' //'ChromeDebugging' // 'ChromeHeadless'  //
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
        logLevel: config.LOG_INFO

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'

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
