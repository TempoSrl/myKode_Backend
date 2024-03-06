const dbModel = "main";
const os = require('os');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
/*globals initConfig, appPath */
/*jshint camelcase: false */
const path = require("path");
const readline = require('readline');
const chalkModule = import('chalk');
const platform = os.platform();



process.env.CHROME_BIN = require('puppeteer').executablePath();

let chalk;
chalkModule.then((c)=> {
    chalk = new c.Chalk();

});

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

let inspectParameter = '--inspect';
let inspectArg = process.execArgv.find(arg => arg.startsWith('--inspect-brk='));
if (false) {
    // Estrai il numero di porta dal parametro --inspect-brk
    let port = inspectArg.split('=')[1];

    // Ora puoi utilizzare la porta per la nuova istanza di Node

    inspectParameter = '--inspect-brk='+port;
    console.log('inspectParameter is:', port);
}
else {
    console.log("Grunt running without debug");
}


const Deferred = require("JQDeferred");

const jasmineEnv=  {
    // Whether to fail a spec that ran no expectations
    failSpecWithNoExpectations: true,

    // Stop execution of a spec after the first expectation failure in it
    stopSpecOnExpectationFailure: true,

    // Stop execution of the suite after the first spec failure
    stopOnSpecFailure: true,

    stopOnFailure: true,

    // Run specs in semi-random order
    random: false
};

let secret = require('./config/secret');
const DBList = require("./src/jsDbList");

const getDescriptor= require("./src/jsDbList").getDescriptor;

DBList.init({
    encrypt: false,
    decrypt: false,
    fileName:path.join('config','dbList.json'), //rimuovere e cancellare in produzione
    //encryptedFileName: path.join('config','dbList.bin'), //questa è l'unica che deve rimanere
    secret:secret
});


let glob = require('glob');
let jsdoc2md = require('jsdoc-to-markdown');
let Password = require("./src/jsPassword");
let $dq= require("./client/components/metadata/jsDataQuery");

const asyncCmd = require("async-exec-cmd");

const JasmineClass = require('jasmine');
const jasmineObj = new JasmineClass();
jasmineObj.exitOnCompletion = false;

jasmineObj.jasmine.getEnv().clearReporters(); // remove default reporter logs

const JasmineConsoleReporter = require('jasmine-console-reporter');



//const rep = JasmineClass.ConsoleReporter;  //require("jasmine.console_reporter.js");
// new JasmineConsoleReporter
const reporter = new JasmineConsoleReporter({
    colors: 1,           // (0|false)|(1|true)|2
    cleanStack: 3,       // Rimuovi la parte iniziale dei percorsi delle tracce stack (di default 2)
    verbosity: 5, //{ pending: false, disabled: false, specs: true, summary: false },// (0|false)|1|2|(3|true)|4|Object
    //timeThreshold: { ok: 500, warn: 1000, ouch: 3000 }, // Object|Number
    listStyle: 'indent',
    activity: true,     // boolean or string ("dots"|"star"|"flip"|"bouncingBar"|...)
    includeSkipped:false,
    emoji: false,
    showSpecTiming:true,
    beep: true
});

jasmine.getEnv().addReporter(new SpecReporter({  // add jasmine-spec-reporter
    spec: {
        displayPending: false,
        displayDuration:true,
        displayErrorMessages:true,
        displayFailed:true
    }
}));

//jasmineObj.jasmine.getEnv().addReporter(reporter);



const exec  = require("child_process").execFileSync;


//const {type} = require("JQDeferred/lib/jquery");


//https://www.npmjs.com/package/grunt-contrib-jasmine
//grunt.loadNpmTasks('grunt-contrib-jasmine');

module.exports = function (grunt) {

    // Load grunt tasks automatically (including grunt.loadNpmTasks('grunt-contrib-jasmine');
    require('load-grunt-tasks')(grunt);
    const fs = require('fs');

    const path = require("path");


    grunt.log.writeln('Current OS is '+ platform);

    function enrichEnv(env){
        let win32 = false;
        let ios = false;
        let linux= false;
        if (platform === 'win32') {
            win32=true;
        } else if (platform === 'darwin') {
            ios=true;
        } else if (platform === 'linux') {
            linux=true;
        }
        let edgeAppRoot = path.join(__dirname,'node_modules','edge-db-core','lib',platform);
        let edgeBootstrapDir = path.join(__dirname,'node_modules','edge-js','lib','bootstrap','bin','Release','net7.0');
        //let setCmd = win32?"set":'export';
        //let nodeconfig  =
        //  setCmd+" DOTNET_ROOT='C:\\Program Files\\dotnet'\n "+
        //"EDGE_BOOTSTRAP_DIR__='"+edgeBootstrapDir+"' "+

        //env.CORECLR_VERSION = '7.0.4';
        env.EDGE_BOOTSTRAP_DIR__ = edgeBootstrapDir;
        env.EDGE_APP_ROOT = edgeAppRoot;
        env.EDGE_USE_CORECLR = 1;
    }
    enrichEnv(process.env);



    let asyncCmd = require("async-exec-cmd");

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);


    //this is used with grunt.initConfig(gruntConfig), that is equivalent to grunt.config.init
    let gruntConfig = {
        wiredep: {

            task: {

                // Point to the files that should be updated when
                // you run `grunt wiredep`
                src: ['client/index.html','client/indexDebug.html'],

                options: {
                    cwd: 'client',
                    // See wiredep's configuration documentation for the options
                    // you may pass:
                    //bowerJson: "client/bower.json"
                    // https://github.com/taptapship/wiredep#configuration

                    "overrides": {
                        "bootstrap":{
                            "main": "dist/js/bootstrap.bundle.js"
                        },
                        "jquery-ui":{
                            "main": ["jquery-ui.min.js","themes/base/jquery-ui.min.css"]
                        },
                        "moment":{
                            "main": "min/moment.min.js"
                        },
                        "jstree":{
                            "main":["dist/jstree.js","dist/themes/default/style.min.css"]
                        },
                        "fullcalendar":{
                            "main":["dist/fullcalendar.js",
                                "dist/locale-all.js",
                                "dist/fullcalendar.min.css"]
                        },
                        "font-awesome": {
                            "main": "js/all.min.js"
                        },
                        "jqueryui-timepicker-addon":{
                            "main":["dist/jquery-ui-timepicker-addon.js",
                                "dist/i18n/jquery-ui-timepicker-addon-i18n.js",
                                "dist/jquery-ui-timepicker-addon.css"]
                        }
                    }
                }
            }
        },
        connect: {
            server: { // <-- This is a Target named 'server'.
                options: {
                    // <-- Your connect options go here.
                    //     https://github.com/gruntjs/grunt-contrib-connect#options
                }
            }
        },


        shell: {
            clientTest: {
                command: 'npx jasmine test/client/*Spec.js'
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        jsdoc : {
            dist : {
                plugins: ["markdown","jsdoc-summarize2"],
                src: ['src/*.js',
                    'client/components/*/*.js',
                    //'client/components/i18n/*.js',
                    'routes/*/*.js'
                ],
                options: {
                    destination: 'docs'
                }
            }
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: ['./src'],
                    outdir: 'docs'
                }
            }
        },

        watch_common: {
            files: ['src/*.js','client/components/metadata/*.js',
                'client/components/i18n/*.js'],
            tasks: ['jasmine:common'],
            options: {
                livereload: true
            }
        },

        karma: {
            spec: {
                configFile: "test/karma.conf.js",
                autoWatch: true,
                singleRun: true,
                reporters: ["spec"], //dots  progress  junit  growl  coverage kjhtml spec
                specReporter: {
                    maxLogLines: 5, // limit number of lines logged per test
                    suppressErrorSummary: false, // do not print error summary
                    suppressFailed: false, // do not print information about failed tests
                    suppressPassed: false, // do not print information about passed tests
                    suppressSkipped: true, // do not print information about skipped tests
                    showSpecTiming: true, // print the time elapsed for each spec
                    failFast: false // test would finish with error when a first fail occurs.
                }
            },

            midway: {
                configFile: "test/karma_midway.conf.js",
                autoWatch: true,
                singleRun: true,
                reporters: ["spec"],
                specReporter: {
                    maxLogLines: 5, // limit number of lines logged per test
                    parallel: false,
                    suppressErrorSummary: false, // do not print error summary
                    suppressFailed: false, // do not print information about failed tests
                    suppressPassed: false, // do not print information about passed tests
                    suppressSkipped: true, // do not print information about skipped tests
                    showSpecTiming: true, // print the time elapsed for each spec
                    failFast: true // test would finish with error when a first fail occurs.
                }
            },

            server_e2e: {
                configFile: "test/karma_node_server_e2e.conf.js",
                autoWatch: true,
                singleRun: true,
                reporters: ["spec"],
                specReporter: {
                    maxLogLines: 5, // limit number of lines logged per test
                    suppressErrorSummary: false, // do not print error summary
                    suppressFailed: false, // do not print information about failed tests
                    suppressPassed: false, // do not print information about passed tests
                    suppressSkipped: false, // do not print information about skipped tests
                    showSpecTiming: true, // print the time elapsed for each spec
                    failFast: false // test would finish with error when a first fail occurs.
                }
            },

            client_e2e_app: {
                configFile: "test/karma_e2e_app.conf.js",
                autoWatch: true,
                singleRun: true,
                reporters: ["spec"],
                specReporter: {
                    maxLogLines: 5, // limit number of lines logged per test
                    suppressErrorSummary: false, // do not print error summary
                    suppressFailed: false, // do not print information about failed tests
                    suppressPassed: false, // do not print information about passed tests
                    suppressSkipped: true, // do not print information about skipped tests
                    showSpecTiming: true, // print the time elapsed for each spec
                    failFast: true // test would finish with error when a first fail occurs.
                }
            },
            client_e2e: {
                configFile: "test/karma_e2e.conf.js",
                autoWatch: true,
                singleRun: true,
                reporters: ["spec"],
                specReporter: {
                    maxLogLines: 5, // limit number of lines logged per test
                    suppressErrorSummary: false, // do not print error summary
                    suppressFailed: false, // do not print information about failed tests
                    suppressPassed: false, // do not print information about passed tests
                    suppressSkipped: true, // do not print information about skipped tests
                    showSpecTiming: true, // print the time elapsed for each spec
                    failFast: true // test would finish with error when a first fail occurs.
                }
            },
            client_e2e_pages: {
                configFile: "test/karma_e2e_pages.conf.js",
                autoWatch: true,
                singleRun: true,
                reporters: ["spec"],
                specReporter: {
                    maxLogLines: 5, // limit number of lines logged per test
                    parallel: false,
                    suppressErrorSummary: false, // do not print error summary
                    suppressFailed: false, // do not print information about failed tests
                    suppressPassed: false, // do not print information about passed tests
                    suppressSkipped: true, // do not print information about skipped tests
                    showSpecTiming: true, // print the time elapsed for each spec
                    failFast: true // test would finish with error when a first fail occurs.
                }
            },
        },

        jasmine: {
            common_server:{
                spec_dir: "",
                spec_files: ["./test/client/*Spec.js","./test/spec/*Spec.js"],
                env: jasmineEnv
            },
            common: {
                spec_dir: "./test/client",
                spec_files: ["*Spec.js"],
                env: jasmineEnv
            },

            server: {
                spec_dir: "./test/spec",
                spec_files: ["*Spec.js"],
                env: jasmineEnv
            },
            midway: {
                spec_dir: './test/midway/',
                spec_files: ["*Spec.js"],
                reporters:["spec"],
                reporterOptions:{
                    "spec":{
                        displayStacktrace: "all",
                        "displaySuccesses":true
                    }
                },
                env: jasmineEnv

            },
            auto: {
                options: {
                    autotest: true,
                    forceExit: false
                }
            }

        }
    };
    let classes = [];
    let classesClient = [];
    let classesMidway = [];

    function setTestE2e(dbCode,value){
        let dbInfo = DBList.getDbInfo(dbCode);
        dbInfo.createTestSession=value;
        DBList.setDbInfo(dbCode,dbInfo);
    }

    function setTestE2eOn(){
        setTestE2e("main",true);
    }

    function setTestE2eOff(){
        setTestE2e("main",false);
    }

    grunt.registerTask("loginON", "set test ON", setTestE2eOn);
    grunt.registerTask("loginOFF","set test OFF", setTestE2eOff);

    gruntConfig.jasmine["all_e2e_app"] = {
        spec_dir: './test/spec_e2e_app/',
        spec_files: ["*Spec.js"],
        autotest: false
    };

    //Cerca i test sui moduli in  src
    fs.readdirSync(path.join(__dirname, 'src')).forEach(file => {
        let className = file.replace(".js", "");
        if (fs.existsSync(path.join(__dirname, 'test', 'spec', className + 'Spec.js'))) {
            classes.push(className);
        }
        if (fs.existsSync(path.join(__dirname, 'test', 'midway', className + 'Spec.js'))) {
            classesMidway.push(className);
        }
    });

    //Cerca i test sulle classi  client/components/metadata
    fs.readdirSync(path.join(__dirname, 'client', 'components', 'metadata')).forEach(file => {
        let className = file.replace(".js", "");
        if (fs.existsSync(path.join(__dirname, 'test', 'spec', className + 'Spec.js'))) {
            classes.push(className);
        }
        if (fs.existsSync(path.join(__dirname, 'test', 'midway', className + 'Spec.js'))) {
            classesMidway.push(className);
        }
        if (fs.existsSync(path.join(__dirname, 'test', 'client', className + 'Spec.js'))) {
            classesClient.push(className);
        }
    });
    let allJasmineConfig={};

    //crea gli unit test con jasmine (sia quelli sotto src che quelli sotto client/components/metadata
    // questi saranno visibili sotto il task "jasmine"
    classes.forEach(function (className) {
        //console.log("registering "+className+"Spec");
        //Aggiunge la configurazione sotto "jasmine"
        allJasmineConfig[className + "Spec"] = {
            spec_dir: './test/spec/',
            spec_files: [className + "Spec.js"],
            env: jasmineEnv
        };
    });

    classesMidway.push('jsApplicationAnonymous');

    //Crea la configurazione per tutti i test Midway
    classesMidway.forEach(function (className) {
        allJasmineConfig[className + "Midway"] = {
            spec_dir: './test/midway/',
            spec_files: [className + "Spec.js"],
            env: jasmineEnv
        };
    });

    //Configura i test client
    classesClient.forEach(function (className) {
        allJasmineConfig[className + "Client"] = {
            spec_dir: 'test/client',
            spec_files: [className + "Spec.js"],
            env: jasmineEnv
        };
    });

    // Set the configuration for all the tasks
    grunt.initConfig(gruntConfig);

    function createDatasets(){
        let dbInfo = getDescriptor(dbModel);

        const mainInfo = grunt.file.readJSON(path.join('config', 'appList.json'));
        let appInfo;
        mainInfo.forEach(i=> {if (i.dbCode === dbModel)  {appInfo=i; }});
        if(appInfo===undefined){
            grunt.log.writeln("File appList.json does not have an entry for database code "+dbModel);
            return Deferred().resolve();
        }
        let dsPath = appInfo.dsPath;

        const directoryPath = path.join(__dirname, dsPath);

        const allFiles = fs.readdirSync(directoryPath);

        const jsFiles = allFiles.filter(file => path.extname(file) === '.js');

        let allTask = [];
        jsFiles.forEach(file => {
            let jsName = path.join(__dirname, dsPath, file);
            if (!fs.lstatSync(jsName).isFile()){
                return;
            }
            const baseName = path.basename(file, path.extname(file));
            let jsonBaseName = baseName+'.json';
            let jsonName = path.join(__dirname, dsPath, jsonBaseName);
            if (fs.existsSync(jsonName)){
                // Ottieni i timestamp di creazione o modifica
                const jsStamp = fs.statSync(jsName).mtime; // o .ctime per il timestamp di creazione
                const jsonStamp = fs.statSync(jsonName).mtime;
                if (jsStamp <= jsonStamp) {
                    return;
                }
            }
            let modDS = require(path.join(__dirname,dsPath,file));
            allTask.push(modDS(dbInfo).then(ds=>{
                ds.name= baseName;
                let jsonData= ds.serialize(true);
                const json = JSON.stringify(jsonData,null,2);
                fs.writeFileSync(jsonName, json);
                console.log("File "+jsonName+" has been updated.");
            }));

        });
        return Deferred.when.apply(null,allTask);

    }


    function publish(){
        let  files = glob.sync("client/metadata/Meta*.js");
        files.forEach(file => {
            fs.copyFileSync(file,
                path.join("client","meta",path.basename(file)));
        });

        fs.readdirSync(path.join(__dirname, 'client',"metadata")).forEach(folder => {
            if (!fs.lstatSync(path.join(__dirname, 'client',"metadata", folder) ).isDirectory()) {
                return;
            }
            //console.log("copying folder:",folder);

            fs.cpSync(path.join(__dirname, 'client',"metadata",folder),
                path.join(__dirname,"client", "meta"),
                {recursive: true,
                    preserveTimestamps:true,
                    filter: function filterMeta(f){
                        if (fs.lstatSync(f ).isDirectory()) {
                            return true;
                        }
                        return path.basename(f).startsWith("meta_");
                    },
                    force:true
                },
                (err) => {if (err) {console.error(err);}
                });

            fs.cpSync(path.join(__dirname, 'client',"metadata",folder),
                path.join(__dirname,"client", "pages"),
                {recursive: true,
                    preserveTimestamps:true,
                    filter: function filterMeta(f){
                        if (fs.lstatSync(f ).isDirectory()) {
                            return true;
                        }
                        return !path.basename(f).startsWith("meta_");
                    },
                    force:true
                },
                (err) => {if (err) {console.error(err);}
                });
        });
    }


    let metaComponents = [
        "jsDataQuery","jsDataSet","MetaApp","Enum","LocalResource",
        "Config","Logger","DbProcedureMessage","Routing","EventManager",
        "utils","GetDataUtils","ConnWebService","ConnWebSocket",
        "Connection","MetaModel",
        "GetData","Security","AuthManager","PostData","BootstrapContainerTab",
        "FormProcedureMessages",
        "LoaderControl","ModalLoaderControl","ListManager","ListManagerCalendar",
        "CssDefault","TypedObject","MetaPageState","HelpForm",
        "CheckBoxListControl","GridControl","GridControlX","GridControlXMultiSelect",
        "ListManagerMultiSelect","GridControlXChild","GridControlXEdit",
        "CalendarControl","SliderControl","MetaData","MetaPage",
        "ComboManager","MainToolBarManager","DropDownGridControl", "GridControlXScrollable",
        "ListManagerScrollable","TreeNode","TreeNode_Dispatcher","TreeViewManager",
        "TreeNodeUnLeveled","TreeNodeLeveled", "TreeNodeUnLeveled_Dispatcher",
        "TreeNodeLeveled_Dispatcher",
        "tree/SimpleUnLeveled_TreeNode","tree/SimpleUnLeveled_TreeNode_Dispatcher",
        "tree/SimpleUnLeveled_TreeViewManager","tree/TreeControl",
        "Attachment","BootstrapModal",
        "ConfigDev","GridMultiSelectControl","ModalForm",
        "MultiSelectControl","PdfExport","UploadControl","UploadControlWin",
        "tachimetro/TachimetroControl","graph/GraphControl"
    ].map(x=>{
        return 'components/metadata/'+x+'.js';
    });


    function expandDir(path, cwd, matchPath, tag){
        let startTag = "\t<!-- expand:"+tag+" -->";
        let stopTag = "\t<!-- endexpand:"+tag+" -->";
        const contents = fs.readFileSync(path, 'utf-8');
        const arrSource = contents.split(/\r?\n/);
        let arrDest = [];
        let index=0;
        while (index < arrSource.length){
            arrDest.push(arrSource[index]);
            if (arrSource[index].trim()!==startTag.trim()){
                index++;
                continue;
            }
            index++;
            break; //tag found
        }


        if (index === arrSource.length) {
            //console.log(startTag+" not found");
            return; //startTag not found
        }

        while (index < arrSource.length){
            if (arrSource[index].trim()!==stopTag.trim()){
                index++;
                continue;
            }
            index++;
            break; //stopTag found
        }
        let fileToExpand;

        if (tag==="metacomponents"){
            fileToExpand = metaComponents;
        }
        else {
            fileToExpand = grunt.file.expand({
                filter:"isFile",
                nonull:true,
                matchBase:true,
                cwd:cwd
            },matchPath);
        }




        fileToExpand.forEach(f => {
            arrDest.push("\t<script src=\""+f+"\"></script>");
        });
        arrDest.push(stopTag);

        while (index < arrSource.length){
            arrDest.push(arrSource[index]);
            index++;
        }
        const buffer = new Buffer.from(
            arrDest.join("\n"),"utf-8");

        fs.writeFileSync(path, buffer,'utf-8');

    }

    function fixFileIncludes(fName){
        expandDir(fName,"client",
            ["components/metadata/thirdpart/*.js"],
            "metadata_thirdpart");

        expandDir(fName,"client",
            ["components/utility/*.js"],
            "utility");
        expandDir(fName,"client",
            ["components/metadata/tree/*.js"],
            "metadata_tree");
        expandDir(fName,"client",
            [],
            "metacomponents");
        expandDir(fName,"client",
            [
                "meta/*/*.js"],
            "tables");
        expandDir(fName,"client",
            [
                "meta/meta_*.js"],
            "metadata");
        expandDir(fName,"client",
            [
                "pages/*.js"],
            "pages");
        expandDir(fName,"client",
            [
                "assets/**/*.js"],
            "assets");
    }



    grunt.registerTask("publish","Publish meta", async function (){
        //This must be done before compiling index*.html
        let done = this.async();
        publish();
        let d = createDatasets();

        d.then(()=>{
            fs.copyFileSync(path.join("client","indexTemplate.html"),
                path.join("client","index.html")
            );
            fs.copyFileSync(path.join("client","indexDebugTemplate.html"),
                path.join("client","indexDebug.html")
            );

            fixFileIncludes("client/index.html");
            fixFileIncludes("client/indexDebug.html");
            grunt.task.run('wiredep');
            done();
        });

    });

    // Convert to MD every file under the
    grunt.registerTask("jsDocMD","jsdoc to MD",async function(cfgName){
        let folders = gruntConfig.jsdoc[cfgName].src;
        let done = this.async();
        let processed=0;
        folders.forEach(folder=>{
            let folderComplete = path.join(__dirname,folder);

            glob(folder, {}, (err, files)=>{
                if (err){
                    console.log(err);
                    return;
                }
                //console.log(files);
                files.forEach(file => {
                    if (path.basename(file)[0]==='_') return;
                    try {
                        let md = jsdoc2md.renderSync({files: file});
                        const basename = path.basename(file, path.extname(file));
                        const newName = path.join(path.dirname(file), basename + ".md");
                        fs.writeFileSync(newName, md);
                    }
                    catch (e){
                        console.log(e);
                    }
                });
                processed+=1;
                if (processed===folders.length) done();
            });


        });
    });

    grunt.registerTask("jasmine", "jasmine runner", async function (configName) {
        let done = this.async();
        jasmineObj.loadConfig(gruntConfig.jasmine[configName]);

        let result = await jasmineObj.execute();

        if (result.overallStatus!=="failed") {
            gruntLog('No spec has failed');
        } else {
            gruntError('At least one spec has failed');
        }
        done();
    });
    grunt.registerTask('common unit', ['jasmine:common']);
    grunt.registerTask('server unit', ['jasmine:server']);
    grunt.registerTask("server midway",["NodeStart","jasmine:midway","NodeStop"]); // , "NodeStop"
    grunt.registerTask("server e2e", ["createSqlDB","addUserE2e",
        "NodeStart", "karma:server_e2e", "destroySqlDB", "NodeStop"]);

    grunt.registerTask("client unit", ["karma:spec"]);
    grunt.registerTask("client midway", ["createSqlDB","NodeStart","karma:midway","destroySqlDB","NodeStop"]);
    grunt.registerTask("client e2e", ["createSqlDB", "addUserE2e",
        "NodeStart",
        "karma:client_e2e", "karma:client_e2e_app",
        "destroySqlDB", "NodeStop"]);
    grunt.registerTask("client e2e_app", ["createSqlDB", "addUserE2e", "NodeStart",
        "karma:client_e2e_app",
        "destroySqlDB", "NodeStop"]);

    grunt.registerTask('all server',
        ['jasmine:common_server', "createSqlDB", "addUserE2e", "NodeStart",
            "karma:server_e2e",
            "destroySqlDB",
            "jasmine:midway", //jasmine:midway crea e distrugge il db
            "NodeStop"
        ]);
    grunt.registerTask('all client',['client unit',
        "createSqlDB", "addUserE2e", "NodeStart",
        "karma:midway","karma:client_e2e","karma:client_e2e_app",
        "destroySqlDB", "NodeStop"]);
    grunt.registerTask("all",
        ['jasmine:common_server',"karma:spec",
            "createSqlDB", "addUserE2e", "NodeStart",
            "karma:server_e2e",
            "karma:midway","karma:client_e2e","karma:client_e2e_app",
            "destroySqlDB",
            "jasmine:midway","NodeStop",
        ]);

    grunt.registerTask('client pages e2e',[
        "createE2eDB",
        "addUserE2e",
        "loginOFF",
        "NodeStart" ,
        "karma:client_e2e_pages",
        "destroyE2eDB",
        "NodeStop",
        "loginON"
    ]);

    grunt.registerTask('docMD', ['jsDocMD:dist']);

    grunt.registerTask('doc', ['jsdoc','shell:jsdoc', 'open:doc']);


    let nodeProcess = 0;
    let launched = false;
    let terminated = false;


    grunt.registerTask("NodeStart", "start Node server.js", function () {
        var done = this.async();
        enrichEnv(process.env);
        launched=false;
        terminated = false;
        nodeProcess=asyncCmd(
            "node",
            [inspectParameter, "server.js"],
            function (err, res, code, buffer) {
                if (!launched) return;
                if (terminated)return;
                if (err) {
                    gruntError("NodeStart error");
                    grunt.log.writeln(err, code);
                    terminated=true;
                    done();
                    return;
                }
                writeOutput(res,code,buffer);

                if (code===0){
                    grunt.log.writeln("NodeStart: Node server running (not err), process:",process.pid);
                    //done();
                }
                else {
                    grunt.log.writeln("NodeStart error code, process:",process.pid);
                    process.exit(1);
                }

            }
        );
        //console.log(nodeProcess);
        setTimeout(function () {
            if (!nodeProcess.kill(0)) {
            	gruntError("Node server failed to start within the specified time.");
            	return;
            }
            launched=true;
            saveNodePID(nodeProcess.pid);
            gruntYellow(`Node server started`);
            //gruntYellow(`Node server running, current process:${process.pid}, child process: ${nodeProcess.pid}`);
            done();
        }, 10000);
    });

    function getNodePID() {
        var nodePID=0;
        if (nodeProcess) {
            return nodeProcess.pid;
        }
        try {
            nodePID = fs.readFileSync(path.join(os.tmpdir(), 'EDGEnodePID'), 'utf8');
        } catch (error) {
            //console.error('Errore durante la lettura del file EDGEnodePID.txt:', error);
        }
        return nodePID;
    }

    function saveNodePID(pid) {
        fs.writeFileSync(path.join(os.tmpdir(), 'EDGEnodePID'), pid? pid.toString():0);
    }




    grunt.registerTask("NodeStop", "stop Node", function () {
        let done = this.async();
        let nodePID = getNodePID();
        gruntLog("Killing process "+nodePID);
        if (!nodePID || !launched) {
            grunt.log.writeln("Node server not running");
            done();
            return;
        }

        var cmd = "kill";
        var args = ["-TERM",nodePID];
        var env = process.env;

        if (process.platform === "win32") {
            // Windows
            cmd = "taskkill";
            args = ["/F", "/T", "/PID", nodePID];
        }

        terminated = true;
        asyncCmd(
            cmd,
            args,
            function (err, res, code, buffer) {
                //writeOutput(err,res,code,buffer);

                if (err) {
                    gruntError("Node Stop Error:"+err+":"+ code);
                    done();
                    return;
                }
                gruntYellow("Node server stopped");
                done();
                //grunt.log.writeln(res, code, buffer);
            }
        );
        /*setTimeout(function () {
            if(terminated)return;
            grunt.log.writeln("Node server stopped, process:",process.pid,nodeProcess.pid);
            terminated = true;
            done();
        }, 10000);*/
    });





    function gruntWhite(str){
        chalkModule.then(()=>{
            grunt.log.write(chalk.white(str));
        });

    }

    function gruntYellow(str){
        chalkModule.then(()=>{
            grunt.log.writeln(chalk.yellow(str));
        });
    }

    function gruntLog(str){
        chalkModule.then(()=>{
            grunt.log.writeln(chalk.green(str));
        });
    }

    function gruntError(str){
        chalkModule.then(()=>{
            grunt.log.error(chalk.red(str));
        });

    }

    function writeOutput(err, res, code, buffer){
        if (err) gruntError(err);
        if (res) gruntLog(res);
        if (code) gruntYellow('Exit Code:\n' + code);
        //if (buffer) grunt.log.writeln(c.blue('Buffer: ') + buffer);
    }
    //grunt.registerTask('serverStart', ['shell:startNode']);
    //grunt.registerTask('serverStop', ['shell:stopNode']);


    grunt.registerTask("createSqlDB","Create Sql DB",function(){
        var done = this.async();
        let doneFired = false;
        enrichEnv(process.env);
        asyncCmd(
            "node",
            [ path.join("test","runSql"),
                path.join("config","dbList.json"),
                path.join("test","data","jsApplication","setup.sql"),
                "test_sqlServer"
            ],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    gruntError("createSqlDB error");
                    gruntError(err +":"+ code);
                    doneFired=true;
                    done();
                    return;
                }
                //grunt.log.writeln("createSqlDB ok","err:",err,"res:",res,"code:",code,"buffer:",buffer);
                doneFired=true;
                done();
            }
        );
        setTimeout(function () {
            if (!doneFired){
                doneFired=true;
                grunt.log.writeln("createSqlDB timeout");
                done();
            }
        }, 60000);
    });

    grunt.registerTask("destroySqlDB","Destroy Sql DB",function(){
        var done = this.async();
        let doneFired = false;
        enrichEnv(process.env);
        asyncCmd(
            "node",
            [path.join("test","runSql"),
                path.join("config","dbList.json"),
                path.join("test","data","jsApplication","Destroy.sql"),
                "test_sqlServer"
            ],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);
                if (err) {
                    grunt.log.writeln("destroySqlDB error");
                    grunt.log.writeln(err, code);
                    doneFired = true;
                    done();
                    return;
                }
                doneFired=true;
                done();
            }
        );
        setTimeout(function () {
            if (!doneFired){
                grunt.log.writeln("destroySqlDB timeout");
                doneFired=true;
                done();
            }

        }, 5000);
    });

    grunt.registerTask("createE2eDB","Create E2e tables",function(){
        var done = this.async();
        enrichEnv(process.env);

        const mainInfo = grunt.file.readJSON(path.join('config', 'appList.json'));
        let appInfo;
        mainInfo.forEach(i=> {if (i.e2e)  {appInfo=i; }});
        if(appInfo===undefined){
            grunt.log.writeln("File appList.json does not have an entry for an e2e test "+dbModel);
            done();
            return;
        }

        let dbInfo = DBList.getDbInfo(appInfo.dbCode);
        let scriptName;
        if (dbInfo.sqlModule==='jsSqlServerDriver'){
            scriptName="setup_sqlserver.sql";
        }
        if (dbInfo.sqlModule==='jsMySqlDriver'){
            scriptName="setup_mysql.sql";
        }
        if (scriptName===undefined){
            grunt.log.writeln("A setup for e2e is not available for "+dbInfo.sqlModule);
            done();
            return;
        }
        let doneFired = false;
        console.log( path.join("node_modules","generator-mykode","demo",scriptName));
        asyncCmd(
            "node",
            ["test/runSql",
                path.join("config","dbList.json"),
                path.join("node_modules","generator-mykode","demo",scriptName),
                appInfo.dbCode
            ],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    grunt.log.writeln("createE2eDB error");
                    grunt.log.writeln(err, code);
                    doneFired=true;
                    done();
                    return;
                }
                grunt.log.writeln("createE2eDB ok");
                doneFired=true;
                done();
            }
        );
        setTimeout(function () {
            if (!doneFired){
                doneFired=true;
                grunt.log.writeln("createE2eDB timeout");
                done();
            }
        }, 60000);
    });

    grunt.registerTask("destroyE2eDB","Destroy E2e tables",function(){
        var done = this.async();

        const mainInfo = grunt.file.readJSON(path.join('config', 'appList.json'));
        let appInfo;
        mainInfo.forEach(i=> {if (i.e2e)  {appInfo=i; }});
        if(appInfo===undefined){
            grunt.log.writeln("File appList.json does not have an entry for an e2e test "+dbModel);
            done();
            return;
        }

        let dbInfo = DBList.getDbInfo(appInfo.dbCode);
        let scriptName;
        if (dbInfo.sqlModule==='jsSqlServerDriver'){
            scriptName="destroy_sqlserver.sql";
        }
        if (dbInfo.sqlModule==='jsMySqlDriver'){
            scriptName="destroy_mysql.sql";
        }
        if (scriptName===undefined){
            grunt.log.writeln("A destroy for e2e is not available for "+dbInfo.sqlModule);
            done();
            return;
        }
        let doneFired = false;
        console.log( path.join("node_modules","generator-mykode","demo",scriptName));
        asyncCmd(
            "node",
            ["test/runSql",
                path.join("config","dbList.json"),
                path.join("node_modules","generator-mykode","demo",scriptName),
                appInfo.dbCode
            ],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    grunt.log.writeln("destroyE2eDB error");
                    grunt.log.writeln(err, code);
                    doneFired=true;
                    done();
                    return;
                }
                grunt.log.writeln("destroyE2eDB ok");
                doneFired=true;
                done();
            }
        );
        setTimeout(function () {
            if (!doneFired){
                doneFired=true;
                grunt.log.writeln("destroyE2eDB timeout");
                done();
            }
        }, 60000);
    });

    function registerUser(DA, idflowchart, userName,  password){
        let AA = new Date().getFullYear().toString().slice(-2);
        idflowchart = AA+idflowchart;
        let idcustomuser;
        let existed = false;
        return DA.open().then(()=>{
            return DA.selectCount(
                {tableName:"flowchart",
                    filter:$dq.eq("idflowchart",idflowchart)
                });
        }).then(
            (n)=>{
                if (n>0)return Deferred().resolve(true);
                return DA.doSingleInsert("flowchart",
                    ["idflowchart","ayear","codeflowchart","ct","cu","lt","lu",
                        "nlevel","paridflowchart","printingorder","title"],
                    [idflowchart,new Date().getFullYear(),'00'+idflowchart,new Date(),'setup',new Date(),'setup',
                        1,'0',idflowchart, 'node']
                );
            }
        ).then( ()=> {
            return DA.readSingleValue({tableName:"customuser",
                expr:"idcustomuser",
                filter: $dq.eq("username", userName)});
        }).then( (_idcustomuser) =>{
            idcustomuser = _idcustomuser;
            if (idcustomuser){
                existed = true;
                return  true;
            }
            idcustomuser = userName;
            //Aggiungiamo un utente virtuale al database
            return DA.doSingleInsert("customuser",
                ["idcustomuser","ct","cu","lt","lu","username"],
                [userName,new Date(),'setup',new Date(),'setup',userName]);
        }).then (()=>{
            return DA.readSingleValue({tableName:"customusergroup",expr:"idcustomuser",
                filter: $dq.mcmpEq({idcustomgroup:"ORGANIGRAMMA", idcustomuser:idcustomuser})});
        }).then ((_idcustomuser)=>{

            if (_idcustomuser) {
                grunt.log.writeln("idcustomuser "+ _idcustomuser+" found in table customusergroup");
                return true;
            }
            //Associamo l'utente virtuale al gruppo di sicurezza
            return DA.doSingleInsert("customusergroup",
                ["idcustomgroup","idcustomuser", "ct","cu","lt","lu"],
                ["ORGANIGRAMMA",idcustomuser, new Date(),'setup',new Date(),'setup']);
        }).then (()=>{
            return DA.readSingleValue({tableName:"flowchartuser",expr:"idcustomuser",
                filter: $dq.mcmpEq({"idcustomuser": idcustomuser, idflowchart:idflowchart})});
        }).then ((_idcustomuser)=>{
            if (_idcustomuser) {
                grunt.log.writeln("idcustomuser "+ _idcustomuser+" found in table flowchartuser");
                return true;
            }
            //Associamo l'utente alla voce di organigramma
            return DA.doSingleInsert("flowchartuser",
                ["idcustomuser","idflowchart","ndetail", "flagdefault", "ct","cu","lt","lu"],
                [idcustomuser,idflowchart, 1, "S",  new Date(),'setup',new Date(),'setup']);
        }).then (()=> {
            //Aggiungiamo tutte le password allo stesso utente di codice 1
            return DA.readSingleValue(
                {tableName:"registryreference",
                    expr: $dq.add($dq.max("idregistryreference"),1),
                    filter: $dq.eq("idreg",1)
                });
        }).then ((idregistryreference)=>{
            //grunt.log.writeln("idregistryreference in table registryreference was "+idregistryreference);
            //Ed infine associamo una password all'utente
            let salt = Password.generateSalt();
            let now = new Date();
            const iterations = now.getMilliseconds() * now.getSeconds() + 10;
            var hash = Password.generateHash(password, salt, iterations);
            if (!idregistryreference){
                idregistryreference=1;
            }
            gruntLog("adding user to registryreference with idregistryreference = "+idregistryreference);
            return DA.doSingleInsert("registryreference",
                ["idreg","idregistryreference", "referencename", "ct","cu","lt","lu",
                    "userweb","passwordweb","saltweb","iterweb"],
                [1,idregistryreference, userName, new Date(),'setup',new Date(),'setup',
                    userName,
                    hash.toString("hex").toUpperCase(),
                    salt.toString("hex").toUpperCase(),
                    iterations
                ]);
        }).fail(err=>gruntError(err));
    }

    function _addUser(dbCode,idFlowChart,userName,password, done){
        DBList.getDataAccess(dbCode).then((DA) => {
            return registerUser(DA, idFlowChart, userName, password);
        }).then(()=>{
            gruntLog("User "+userName+" added to db "+dbCode) ;
            done();
        }).fail((err) => {
            gruntError('Error connecting to db.' + err);
            done();
        });
    }

    // grunt.registerTask("addUserE2e","Add user for e2e tests ",function(){
    //     let done = this.async();
    //     _addUser('test_sqlServer', '0001', 'user1', 'user1user1',done);
    // });

    grunt.registerTask("addUserE2e","Aggiungi utente per test e2e",function(){
        let done = this.async();
        enrichEnv(process.env);
        const mainInfo = grunt.file.readJSON(path.join('config', 'appList.json'));
        let appInfo;
        mainInfo.forEach(i=> {if (i.e2e)  {appInfo=i; }});
        if(appInfo===undefined){
            gruntLog("File appList.json does not have an entry for an e2e test "+dbModel);
            done();
            return;
        }
        let AA = new Date().getFullYear().toString().slice(-2);
        appInfo.idflowchart_e2e = AA + "0001";
        if (!appInfo.user_e2e) {
            appInfo.user_e2e="user1";
        }
        if (!appInfo.pwd_e2e) {
            appInfo.pwd_e2e="user1user1";
        }
        fs.writeFileSync(path.join('config', 'appList.json'),
            JSON.stringify(mainInfo, null, 2));
        DBList.getDataAccess(appInfo.dbCode).then((DA)=> {
            return registerUser(DA, appInfo.idflowchart_e2e,
                "user1", //appInfo.user_e2e,
                "user1user1" //appInfo.pwd_e2e
            ).then(()=>{
                gruntLog("User user1 added to db "+appInfo.dbCode) ;
                done();
            });
        })
        .fail((err) => {
            gruntError('Error connecting to db.' + err);
            done();
        });;

    });
    grunt.registerTask("addUser","Aggiungi utente a db",function(){
        let done= this.async();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const domande = [
            'Inserire codice del database da usare',
            'Inserire codice organigramma',
            'Inserire nome utente',
            'Inserire password',
            'Ripetere password'
        ];
        const risposte = [];
        let dbListJsonFile = fs.readFileSync (path.join('config','dbList.json'), 'utf8');
        const dbListJson = JSON.parse(dbListJsonFile);
        const dbCodes = Object.keys(dbListJson);


        function askQuestion(index) {
            if (index <= domande.length){
                if (index === 0){
                    // verifica se dbCode possibile
                    rl.question(` ${domande[index]} (${dbCodes.join(', ')}): `, function (risposta){
                        if (dbCodes.includes(risposta)){
                            risposte.push(risposta);
                            askQuestion(index + 1);
                        }
                        else{
                            console.log('Invalid db Code.');
                            askQuestion(index); // Richiedi la stessa domanda
                        }
                    });
                    return;
                }
                if (index === domande.length) {
                    // Se siamo alla domanda sulla ripetizione della password
                    const passwordInserita = risposte[risposte.length - 2];
                    const ripetiPassword = risposte[risposte.length - 1];

                    if (passwordInserita !== ripetiPassword) {
                        // Le password non corrispondono, rimuovi le ultime due risposte
                        risposte.pop(); // Rimuovi l'ultima risposta (ripetiPassword)
                        risposte.pop(); // Rimuovi la penultima risposta (passwordInserita)

                        grunt.log.writeln('Le password non corrispondono. Inseriscile di nuovo.');
                        askQuestion(index - 2); // Richiedi di nuovo la domanda precedente
                        return;
                    }
                    else {
                        //grunt.log.writeln('Le password corrispondono.');
                        askQuestion(index+1); //go to else section
                    }
                }
                else{
                    //domanda normale
                    rl.question(`${domande[index]}: `, function (risposta){
                        risposte.push(risposta);
                        askQuestion(index + 1);
                    });
                    return;
                }
            } else {
                DBList.getDataAccess(risposte[0]).then((DA)=> {
                    return registerUser(DA, risposte[1], risposte[2], risposte[3]);
                }).then(()=>{
                    rl.close();
                    //grunt.log.writeln('Risposte inserite:', risposte);
                    done();
                })
                .fail((err)=>{
                    grunt.log.writeln('Error connecting to db.'+err);
                });

            }
        }
        askQuestion(0);
    });


};