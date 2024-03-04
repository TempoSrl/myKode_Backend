// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-02-06 using
// generator-karma 0.9.0

module.exports = function(config) {
 
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

        // list of files / patterns to load in the browser
        files: [
            'client/bower_components/font-awesome/js/all.min.js',
            //'bower_components/font-awesome/svg-with-js/js/fontawesome-all.min.js',
            'client/bower_components/jquery/dist/jquery.js',
            'client/bower_components/jquery-ui/jquery-ui.min.js',
            'node_modules/jasmine-collection-matchers/index.js',
            'client/bower_components/lodash/lodash.js',
            'client/bower_components/observe-js/src/observe.js',
            'client/components/metadata/jsDataQuery.js',
            'client/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'client/components/metadata/jsDataSet.js',
            'client/bower_components/jstree/dist/jstree.js',
            'client/components/metadata/MetaApp.js',
            'test/client/common/metadata/TestApp.js',
            'client/components/metadata/Enum.js',
            'client/components/metadata/Config.js',
            'client/components/metadata/ConfigDev.js',
            'client/components/metadata/Logger.js',
            'client/components/metadata/EventManager.js',
            'client/components/metadata/LocalResource.js',
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
            'client/components/metadata/MetaModel.js',
            'client/components/metadata/GetData.js',
            'client/components/metadata/MetaData.js',
            'client/components/metadata/PostData.js',
            'client/components/i18n/*.js',
            'client/components/metadata/LoaderControl.js',
            'client/components/metadata/ModalLoaderControl.js',
            'client/Localization.js',
            'client/assets/i18n/*.js',

            'client/components/metadata/CssDefault.js', //deve precedere HelpForm
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
            'client/components/metadata/MainToolBarManager.js',
            'client/components/metadata/MetaPage.js',
            'client/components/metadata/ComboManager.js',
            'client/components/metadata/GridMultiSelectControl.js',
            'client/components/metadata/MultiSelectControl.js',
            'client/components/utility/select2.min.js',
            'client/components/styles/select2.min.css',
            'test/client/common/common.js',
            'test/client/spec/fixtures/*.html',
            'client/components/template/*.html',
            'test/client/app/styles/app.css',
            'client/bower_components/bootstrap/dist/css/bootstrap.css',
            'client/bower_components/bootstrap/dist/js/bootstrap.bundle.js',
            'test/client/spec_e2e/metadata/AuthManager_E2E_Spec.js',
            'test/client/spec_e2e/metadata/ConnectionWebService_E2E_Spec.js',
            'test/client/spec_e2e/metadata/ConnectionWebServiceNoAuth_E2E_Spec.js',
            'test/client/spec_e2e/metadata/Data_E2E_Spec.js',
            'test/client/spec_e2e/metadata/DataQuery_E2E_Spec.js',
            'test/client/spec_e2e/metadata/GetData_E2E_Spec.js',
            'test/client/spec_e2e/metadata/MetaData_E2E_Spec.js',
            'test/client/spec_e2e/metadata/MetaPage_E2E_Spec.js',
            'test/client/spec_e2e/metadata/HelpForm_E2E_Spec.js',
            'test/client/spec_e2e/metadata/MultiSelectControl_E2E_Spec.js',
            'test/client/spec_e2e/metadata/PostData_E2E_Spec.js',
            'test/client/spec_e2e/metadata/SecurityE2E_Spec.js',
            'test/client/spec_e2e/metadata/TreeViewManager_E2E_Spec.js',
            'test/client/spec_e2e/meta/*.js',
            //{pattern: 'test/spec_midway/jstest/*.json', included: false, served: true },            
            //{ pattern: 'test/spec_midway/**/*.html', included: false, served: true },
            //{ pattern: 'test/spec_midway/**/*.js', included: false, served: true },
            { pattern: 'test/client/spec_midway/**/*.json', included: false, served: true },
            //{ pattern: 'test/spec_e2e/**/*.js', included: false, served: true },
            // { pattern: 'test/spec_e2e/**/*.html', included: false, served: true },
            // { pattern: 'test/spec_e2e/**/*.json', included: false, served: true },
        ],

        // list of files / patterns to exclude
        exclude: [],
        proxies: {
            //'/base/test_client/components/': '/base/test/client/components/',
            '/styles/': '/base/test/client/app/styles/',
            '/base/bower_components/': '/base/client/bower_components/',
            '/base/components/': '/base/client/components/',
            '/base/test/app/styles/': '/base/test/client/app/styles/',
            //'/base/bower_components/': 'http://localhost:54471/client/bower_components/',
            //'/base/components/': 'http://localhost:54471/client/components/',
            '/test_client/auth/': 'http://localhost:54471/test_client/auth/',
            '/test_client/data/': 'http://localhost:54471/test_client/data/',
            '/test_client/static/': 'http://localhost:54471/test_client/static/',
            '/base/test_client/auth/': 'http://localhost:54471/test_client/auth/',
            '/base/test_client/data/': 'http://localhost:54471/test_client/data/',
            //'/base/test_client/': 'http://localhost:54471/test_client/',
            '/base/test/spec_midway/jstest/': '/base/test/client/spec_midway/jstest/'
        },

        // web server port
        port: 9876,
        browserNoActivityTimeout: 300000, // timeout se Karma non riceve messaggi dal browser entro un certo tempo. aumentato in test ceh richeidono query pesanti
        browserDisconnectTimeout: 300000,
        captureTimeout: 300000,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // - ChromeHeadless
        browsers: [
            'Chrome'
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
