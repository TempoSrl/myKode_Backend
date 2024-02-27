// Rivisto da Nino 04/01/2023
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
/*globals initConfig, appPath */
/*jshint camelcase: false */
const path = require("path");
const readline = require('readline');
const chalk = import('chalk');
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

module.exports = function (grunt){

    // Load grunt tasks automatically (including grunt.loadNpmTasks('grunt-contrib-jasmine');
    require('load-grunt-tasks')(grunt);
    const fs = require('fs');

    const path = require("path");


    const os = require('os');

    const platform = os.platform();
    console.log('Sistema operativo:', platform);

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
        let edgeAppRoot = path.join(__dirname,'node_modules','edge-db','lib');
        let edgeBootstrapDir = path.join(__dirname,'node_modules','edge-js','lib','bootstrap','bin','Release','net7.0');
        //let setCmd = win32?"set":'export';
        //let nodeconfig  =
          //  setCmd+" DOTNET_ROOT='C:\\Program Files\\dotnet'\n "+
            //"EDGE_BOOTSTRAP_DIR__='"+edgeBootstrapDir+"' "+

        env.CORECLR_VERSION = '7.0.4';
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
        connect: {
            server: { // <-- This is a Target named 'server'.
                options: {
                    // <-- Your connect options go here.
                    //     https://github.com/gruntjs/grunt-contrib-connect#options
                }
            }
        },

        open: {
            doc: {
                path: 'D:/progetti/jsMetaBackend/docs/index.md',
                app: 'Google Chrome'  //also FireFox
            },
        },


        shell: {
            clientTest: {
                command: 'npx jasmine test/client/*Spec.js'
            },
            jsdoc: {
                command: 'jsdoc src'
            },
            jsdocToMD: {
                command: 'jsdoc2md src/*.js'
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        jsdoc: {
            dist: {
                plugins: ["markdown", "jsdoc-summarize2"],
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
            files: ['src/*.js', 'client/components/metadata/*.js',
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
        },

        jasmine: {
            common_server: {
                spec_dir: "",
                spec_files: ["./test/client/*Spec.js", "./test/spec/*Spec.js"],
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
                reporters:["spec"],
                reporterOptions:{
                    "spec":{
                        displayStacktrace: "all",
                        "displaySuccesses":true
                    }
                },
                env: jasmineEnv
            },
            midway: {
                spec_dir: './test/midway/',
                spec_files: ["*Spec.js"],
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

    function setTestE2e(dbCode, value){
        let dbInfo = DBList.getDbInfo(dbCode);
        dbInfo.createTestSession = value;
        DBList.setDbInfo(dbCode, dbInfo);
    }

    function setTestE2eOn(){
        setTestE2e("main", true);
    }

    function setTestE2eOff(){
        setTestE2e("main", false);
    }

    grunt.registerTask("loginON", "set test ON", setTestE2eOn);
    grunt.registerTask("loginOFF", "set test OFF", setTestE2eOff);

    gruntConfig.jasmine["all_e2e_app"] = {
        spec_dir: './test/spec_e2e_app/',
        spec_files: ["*Spec.js"],
        autotest: false
    };

    //Cerca i test sui moduli in  src
    fs.readdirSync(path.join(__dirname, 'src')).forEach(file => {
        let className = file.replace(".js", "");
        if (fs.existsSync(path.join(__dirname, 'test', 'spec', className + 'Spec.js'))){
            classes.push(className);
        }
        if (fs.existsSync(path.join(__dirname, 'test', 'midway', className + 'Spec.js'))){
            classesMidway.push(className);
        }
    });

    //Cerca i test sulle classi  client/components/metadata
    fs.readdirSync(path.join(__dirname, 'client', 'components', 'metadata')).forEach(file => {
        let className = file.replace(".js", "");
        if (fs.existsSync(path.join(__dirname, 'test', 'spec', className + 'Spec.js'))){
            classes.push(className);
        }
        if (fs.existsSync(path.join(__dirname, 'test', 'midway', className + 'Spec.js'))){
            classesMidway.push(className);
        }
        if (fs.existsSync(path.join(__dirname, 'test', 'client', className + 'Spec.js'))){
            classesClient.push(className);
        }
    });
    let allJasmineConfig = {};

    //crea gli unit test con jasmine (sia quelli sotto src che quelli sotto client/components/metadata
    // questi saranno visibili sotto il task "jasmine"
    classes.forEach(function (className){
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
    classesMidway.forEach(function (className){
        allJasmineConfig[className + "Midway"] = {
            spec_dir: './test/midway/',
            spec_files: [className + "Spec.js"],
            env: jasmineEnv
        };
    });

    //Configura i test client
    classesClient.forEach(function (className){
        allJasmineConfig[className + "Client"] = {
            spec_dir: 'test/client',
            spec_files: [className + "Spec.js"],
            env: jasmineEnv
        };
    });

    // Set the configuration for all the tasks
    grunt.initConfig(gruntConfig);

    // Convert to MD every file under the
    grunt.registerTask("jsDocMD", "jsdoc to MD", async function (cfgName){
        let folders = gruntConfig.jsdoc[cfgName].src;
        let done = this.async();
        let processed = 0;
        folders.forEach(folder => {
            let folderComplete = path.join(__dirname, folder);

            glob(folder, {}, (err, files) => {
                if (err){
                    console.log(err);
                    return;
                }
                //console.log(files);
                files.forEach(file => {
                    if (path.basename(file)[0] === '_') return;
                    try{
                        let md = jsdoc2md.renderSync({files: file});
                        const basename = path.basename(file, path.extname(file));
                        const newName = path.join(path.dirname(file), basename + ".md");
                        fs.writeFileSync(newName, md);
                    } catch (e){
                        console.log(e);
                    }
                });
                processed += 1;
                if (processed === folders.length) done();
            });


        });
    });

    grunt.registerTask("jasmine", "jasmine runner", async function (configName){
        let done = this.async();
        jasmineObj.loadConfig(gruntConfig.jasmine[configName]);

        let result = await jasmineObj.execute();

        if (result.overallStatus !== "failed"){
            grunt.log.writeln('No specs has failed');
        }
        else{
            grunt.log.writeln('At least one spec has failed');
        }
        done();
    });
    grunt.registerTask('common unit', ['jasmine:common']);
    grunt.registerTask('server unit', ['jasmine:server']);
    grunt.registerTask("server midway", ["NodeStart", "jasmine:midway", "NodeStop"]); // , "NodeStop"
    grunt.registerTask("server e2e", ["createSqlDB","addUserE2e",
                    "NodeStart", "karma:server_e2e", "destroySqlDB", "NodeStop"]);

    grunt.registerTask("client unit", ["karma:spec"]);
    grunt.registerTask("client midway", ["createSqlDB", "NodeStart", "karma:midway", "destroySqlDB", "NodeStop"]);
    grunt.registerTask("client e2e", ["createSqlDB", "addUserE2e",
        "NodeStart",
        "karma:client_e2e", "karma:client_e2e_app",
        "destroySqlDB", "NodeStop"]);
    grunt.registerTask("client e2e_app", ["createSqlDB","addUserE2e", "NodeStart",
        "karma:client_e2e_app",
        "destroySqlDB", "NodeStop"]);

    grunt.registerTask('all server',
        ['jasmine:common_server', "createSqlDB", "addUserE2e", "NodeStart",
            "karma:server_e2e",
            "destroySqlDB",
            "jasmine:midway", //jasmine:midway crea e distrugge il db
            "NodeStop"
        ]);
    grunt.registerTask('all client', ['client unit',
        "createSqlDB", "addUserE2e", "NodeStart",
        "karma:midway", "karma:client_e2e", "karma:client_e2e_app",
        "destroySqlDB", "NodeStop"]);
    grunt.registerTask("all",
        ['jasmine:common_server', "karma:spec",
            "createSqlDB", "addUserE2e", "NodeStart",
            "karma:server_e2e",
            "karma:midway", "karma:client_e2e", "karma:client_e2e_app",
            "destroySqlDB",
            "jasmine:midway", "NodeStop",
        ]);

    grunt.registerTask('client pages e2e', [
        "loginOFF",
        "NodeStart",
        "karma:client_e2e_pages",
        "NodeStop",
        "loginON"
    ]);

    grunt.registerTask('docMD', ['jsDocMD:dist']);

    grunt.registerTask('doc', ['jsdoc', 'shell:jsdoc', 'open:doc']);




    grunt.registerTask("NodeStart", "start Node server.js", function () {
        var done = this.async();
        enrichEnv(process.env);
        asyncCmd(
            "node",
            [inspectParameter, "server.js"],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    grunt.log.writeln("NodeStart error");
                    grunt.log.writeln(err, code);
                    done();
                    return;
                }
                grunt.log.writeln("Node server running (not err)");
                console.log(res, code, buffer);
                done();
            }
        );
        setTimeout(function () {
            grunt.log.writeln("Node server running (timeout)");
            done();
        }, 5000);
    });

    grunt.registerTask("test Client", "test client", async function () {
        let done = this.async();
        enrichEnv(process.env);
        asyncCmd(
            "npx",
            ["jasmine", "test/client/jsDataSetSpec.js"],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    grunt.log.writeln("Node Version error");
                    grunt.log.writeln(err, code);
                    done();
                    return;
                }
                grunt.log.writeln("Node Version stopped");
                grunt.log.writeln(res, code, buffer);
                //done();
            }
        );
        setTimeout(function () {
            grunt.log.writeln("Node Version stopped (timeout)");
            done();
        }, 10000);

    });


    grunt.registerTask("NodeStop", "stop Node", function () {
        var done = this.async();
        asyncCmd(
            "taskkill",
            ["/F", "/IM", "node.exe"],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    grunt.log.writeln("NodeStop error");
                    grunt.log.writeln(err, code);
                    done();
                    return;
                }
                grunt.log.writeln("Node server stopped");
                grunt.log.writeln(res, code, buffer);
            }
        );
        setTimeout(function () {
            grunt.log.writeln("Node server stopped (timeout)");
            done();
        }, 5000);
    });

    function writeOutput(err, res, code, buffer){
        //if (err) grunt.log.writeln(chalk.red('Error: ') + err);

        chalk.then((c)=> {
            c = new c.Chalk();
            if (res) grunt.log.writeln(c.green('Output:\n') + res);
            if (code) grunt.log.writeln(c.yellow('Exit Code:\n') + code);
            //if (buffer) grunt.log.writeln(c.blue('Buffer: ') + buffer);
        });
    }

    //grunt.registerTask('serverStart', ['shell:startNode']);
    //grunt.registerTask('serverStop', ['shell:stopNode']);

    grunt.registerTask("createSqlDB","Create Sql DB",function(){
        var done = this.async();
        let doneFired = false;
        enrichEnv(process.env);
        asyncCmd(
            "node",
            ["test/runSql",
                "config\\dbList.json",
                "test\\data\\jsApplication\\setup.sql",
                "test_sqlServer"
            ],
            function (err, res, code, buffer) {
                writeOutput(err,res,code,buffer);

                if (err) {
                    grunt.log.writeln("createSqlDB error");
                    grunt.log.writeln(err, code);
                    doneFired=true;
                    done();
                    return;
                }
                grunt.log.writeln("createSqlDB ok");
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
            ["test/runSql",
                "config\\dbList.json",
                "test\\data\\jsApplication\\Destroy.sql",
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
                grunt.log.writeln("destroySqlDB ok");
                done();
            }
        );
        setTimeout(function () {
            grunt.log.writeln("destroySqlDB timeout");
            if (!doneFired){
                doneFired=true;
                done();
            }

        }, 5000);
    });

    function registerUser(DA, idflowchart, userName,  password){
        let AA = new Date().getFullYear().toString().slice(-2);
        idflowchart = AA+idflowchart;
        let idcustomuser;
        let existed = false;
        return DA.open().then(()=>{
            return DA.selectCount(
                {tableName:"flowchart",
                    filter:$dq.eq("idflowchart",AA+idflowchart)
                });
        }).then(
            (n)=>{
                if (n>0)return Deferred().resolve(true);
                return DA.doSingleInsert("flowchart",
                    ["idflowchart","ayear","codeflowchart","ct","cu","lt","lu",
                        "nlevel","paridflowchart","printingorder","title"],
                    [idflowchart,new Date().getFullYear(),idflowchart,new Date(),'setup',new Date(),'setup',
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
            //grunt.log.writeln("adding customusergroup");
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
            //grunt.log.writeln("adding flowchartuser");
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
            grunt.log.writeln("adding user to registryreference with idregistryreference = "+idregistryreference);
            return DA.doSingleInsert("registryreference",
                ["idreg","idregistryreference", "referencename", "ct","cu","lt","lu",
                    "userweb","passwordweb","saltweb","iterweb"],
                [1,idregistryreference, userName, new Date(),'setup',new Date(),'setup',
                    userName,
                    hash.toString("hex").toUpperCase(),
                    salt.toString("hex").toUpperCase(),
                    iterations
                ]);
        }).fail(err=>grunt.log.writeln(err));
    }

    function _addUser(dbCode,idFlowChart,userName,password, done){
        DBList.getDataAccess(dbCode).then((DA) => {
            return registerUser(DA, idFlowChart, userName, password);
        }).then(()=>{
            grunt.log.writeln("User "+userName+" added to db "+dbCode) ;
            done();
        }).fail((err) => {
            grunt.log.writeln('Error connecting to db.' + err);
            done();
        });
    }

    grunt.registerTask("addUserE2e","Add user for e2e tests ",function(){
        let done = this.async();
        _addUser('test_sqlServer', '0001', 'user1', 'user1user1',done);
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
