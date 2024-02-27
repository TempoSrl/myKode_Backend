/*globals describe,beforeEach,it,expect,jasmine,spyOn,afterEach,xit,progress*/
'use strict';

const { v4: uuidv4 } = require('uuid');


const $dq = require('./../../client/components/metadata/jsDataQuery'),
    _ = require('lodash'),
    fs = require("fs"),
    path = require("path");


/**
 * *****************************************************************************************
 * VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT
 * *****************************************************************************************
 * It's necessary, before start running the test, to create a file templated like:
 *  { "server": "db server address",
 *    "dbName": "database name",  //this must be an EMPTY database
 *    "user": "db user",
 *    "pwd": "db password"
 *  }
 */
//PUT THE FILENAME OF YOUR FILE HERE:
const configName = 'test/dbOracle.json';

let dbConfig;
if (process.env.TRAVIS || !configName){
    dbConfig = { "server": "127.0.0.1",
        "dbName": "test",
        "user": "sa",
        "pwd": "YourStrong!Passw0rd"
    };
}
else {
    dbConfig = JSON.parse(fs.readFileSync(configName).toString());
}

const oracleDriver = require('../../src/jsOracleDriver'),
    IsolationLevel = {
        readCommitted: 'READ_COMMITTED',
        serializable: 'SERIALIZABLE',
        readOnly: 'READ_ONLY',
    };
const dbList = require("../../src/jsDbList");
const Deferred = require("JQDeferred");



let dbName = "sqldrv_"+ uuidv4().replace(/\-/g, '_');

describe('oracleDriver ', function () {
    let dbInfo = {
        good: {
            server: dbConfig.server,
            useTrustedConnection: false,
            user: dbConfig.user,
            pwd: dbConfig.pwd,
            port: dbConfig.port,
            database: dbConfig.dbName,
            dbaPrivilege : dbConfig.dbaPrivilege
        },
        bad: {
            server: dbConfig.server,
            useTrustedConnection: false,
            user: dbConfig.user,
            pwd: dbConfig.pwd + 'AA',
            port: dbConfig.port,
            database: dbConfig.dbName,
            dbaPrivilege : dbConfig.dbaPrivilege
        }
    };


    function getConnection(dbCode) {
        let options = _.extend({},dbInfo[dbCode]);
        if (options) {
            options.dbCode = dbCode;
            return new oracleDriver.Connection(options);
        }
        return undefined;
    }

    let masterConn;
    let sqlConn;

    beforeAll(function(done){
        //console.log("running beforeAll");
        masterConn= null;
        let masterConnTemp= null;
        sqlConn= null;
        canExecute=false;
        let sqlOpen = Deferred();
        let options =  _.extend({},dbInfo["good"]);
        if (options) {
            //options.database = null;
            options.dbCode = "good";
            masterConnTemp = new oracleDriver.Connection(options);
            masterConnTemp.open()
            .then(function(){
                sqlConn = getConnection('good');
                sqlConn.open()
                .then((rr)=> {
                    sqlOpen.resolve(rr);
                })
                .fail(rr=> {
                    sqlOpen.reject(rr);
                });
            })
            .fail((err)=>{
                console.log(err);
                sqlOpen.reject(err);
            });

            sqlOpen.then(()=>{
                sqlConn.run(fs.readFileSync(path.join('test', 'data', 'jsOracleDriver', 'setup.sql')).toString())
                .then(()=>{
                    return sqlConn.close();
                })
                .then(()=>{
                    masterConn = masterConnTemp;
                    done();
                })
                .fail(err=>{
                    console.log(err);
                });
            });
        }
    },60000);

    let canExecute=false;
    beforeEach(function (done) {
        //console.log("running beforeEach");
        canExecute=false;
        if (!masterConn){
            done();
            return;
        }
        sqlConn = getConnection('good');
        sqlConn.open().then(function () {
            //console.log("opened connection 2");
            canExecute=true;
            done();
        }).fail(function (err) {
            console.log('Error failing '+err);
            done();
        });
    }, 30000);

    afterEach(function (done) {
        //console.log("running afterEach");
        if (sqlConn) {
            sqlConn.destroy()
            .then(()=>{
                //console.log("closed connection 2");
                done();
            });
        }
        sqlConn = null;
    });



    describe('structure', function () {


        it('should be defined', function () {
            expect(canExecute).toBeTruthy();
            expect(oracleDriver).toEqual(jasmine.any(Object));
        });

        it('Connection should be a function', function () {
            expect(canExecute).toBeTruthy();
            expect(oracleDriver.Connection).toEqual(jasmine.any(Function));
        });

        it('Connection should be a Constructor function', function () {
            expect(canExecute).toBeTruthy();
            expect(oracleDriver.Connection.prototype.constructor).toEqual(oracleDriver.Connection);
        });

        it('Connection() should return an object', function (done) {
            expect(canExecute).toBeTruthy();
            expect(sqlConn).toEqual(jasmine.any(Object));
            done();
        });

        it('Connection.open should be a function', function (done) {
            expect(canExecute).toBeTruthy();
            expect(sqlConn.open).toEqual(jasmine.any(Function));
            done();
        });
    });

    describe('open', function () {


        it('open should return a deferred', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.open()
                .done(function () {
                    expect(true).toBe(true);
                    sqlConn.destroy();
                    done();
                })
                .fail(function () {
                    expect(true).toBe(true);
                    sqlConn.destroy();
                    done();
                });

        });

        it('open with  right credential should return a success', function (done) {
            expect(canExecute).toBeTruthy();
            let goodSqlConn = getConnection('good');
            goodSqlConn.open()
                .done(function () {
                    expect(true).toBe(true);
                    goodSqlConn.destroy();
                    done();
                })
                .fail(function (errMess) {
                    expect(errMess).toBeUndefined();
                    done();
                });

        });

        it('open with bad credential should return an error', function (done) {
            expect(canExecute).toBeTruthy();
            let badSqlConn;
            badSqlConn = getConnection('bad');
            badSqlConn.open()
                .done(function (res) {
                    expect(res).toBe(undefined);
                    expect(true).toBe(false);
                    done();
                })
                .fail(function (errMess) {
                    expect(errMess).toBeDefined();
                    done();
                });

        }, 30000);
    });

    describe('various', function () {

        it('select getdate() should give results', function (done) {
            expect(canExecute).toBeTruthy();
            let query = sqlConn.getSelectCommand({
                tableName : 'DUAL',
                columns: 'CURRENT_DATE'
            });
            //sqlConn.queryBatch('SELECT CURRENT_DATE as currtime FROM dual')
            sqlConn.queryBatch(query)
                .done(function (result) {
                    expect(result).toBeDefined();
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });


        it('select * from table should give results', function (done) {
            expect(canExecute).toBeTruthy();
            let query = sqlConn.getSelectCommand({
                tableName : 'customer',
                columns: '*'
            });
            //sqlConn.queryBatch('select * from "customer"')
            sqlConn.queryBatch(query)
                .done(function (result) {
                    expect(result).toBeDefined();
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('Date should be given as objects', function (done) {
            expect(canExecute).toBeTruthy();
            let query = sqlConn.getSelectCommand({
                tableName : 'customer',
                columns: '*'
            });
            //sqlConn.queryBatch('SELECT * from "customer"')
            sqlConn.queryBatch(query)
                .done(function (result) {
                    _(result).forEach(function (r) {
                        if (r.idcustomer) {
                            expect(r.idcustomer).toEqual(jasmine.any(Number));
                        }
                        if (r.stamp) {
                            expect(r.stamp).toEqual(jasmine.any(Date));
                        }
                    });
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('notify should be called from queryRaw when multiple result got (two select)', function (done) {
            expect(canExecute).toBeTruthy();
            let progressCalled, nResult = 0;
            sqlConn.queryBatch(
                'DECLARE c1 SYS_REFCURSOR;'+
                'c2 SYS_REFCURSOR;'+
                'BEGIN'+
                ' open c1 for select * from "customer" FETCH NEXT 5 ROWS ONLY;'+
                ' open c2 for select * from "seller" FETCH NEXT 10 ROWS ONLY;'+
                ' DBMS_SQL.RETURN_RESULT(c1);'+
                ' DBMS_SQL.RETURN_RESULT(c2);'+
                'END;'
            ).progress(function (result) {
                expect(result).toBeDefined();
                expect(result.length).toBe(5);
                nResult += 1;
                progressCalled = true;
            })
            .fail(function (err) {
                expect(err).toBeUndefined();
                done();
            })
            .done(function (result) {
                expect(result.length).toBe(10);
                expect(nResult).toBe(1);
                expect(progressCalled).toBeTruthy();
                done();
            });
        });

        it('notify should be called from queryRaw when multiple result got (three select)', function (done) {
            expect(canExecute).toBeTruthy();
            let len = [];
            sqlConn.queryBatch(
                'DECLARE c1 SYS_REFCURSOR;'+
                'c2 SYS_REFCURSOR;'+
                'c3 SYS_REFCURSOR;'+
                'c4 SYS_REFCURSOR;'+
                'c5 SYS_REFCURSOR;'+
                'BEGIN'+
                ' open c1 for select * from "seller" FETCH NEXT 1 ROWS ONLY;'+
                ' open c2 for select * from "seller" FETCH NEXT 3 ROWS ONLY;'+
                ' open c3 for select * from "customer" FETCH NEXT 5 ROWS ONLY;'+
                ' open c4 for select * from "seller" FETCH NEXT 10 ROWS ONLY;'+
                ' open c5 for select * from "customer" FETCH NEXT 2 ROWS ONLY;'+
                ' DBMS_SQL.RETURN_RESULT(c1);'+
                ' DBMS_SQL.RETURN_RESULT(c2);'+
                ' DBMS_SQL.RETURN_RESULT(c3);'+
                ' DBMS_SQL.RETURN_RESULT(c4);'+
                ' DBMS_SQL.RETURN_RESULT(c5);'+
                'END;'
            ).progress(function (result) {
                len.push(result.length);
                return true;
            })
            .fail(function (err) {
                expect(err).toBeUndefined();
                done();
            })
            .done(function (result) {
                len.push(result.length);
                expect(len).toEqual([1,3, 5, 10, 2]);
                done();
            });
        });
    },30000);


    describe("transactions", function () {


        it('set transaction isolation level should call queryBatch', function (done) {
            expect(canExecute).toBeTruthy();
            spyOn(sqlConn, 'queryBatch').and.callThrough();
            sqlConn.setTransactionIsolationLevel(IsolationLevel.readCommitted)
                .done(function () {
                    expect(sqlConn.queryBatch).toHaveBeenCalled();
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('consecutive set transaction with same isolation level should not call queryBatch', function (done) {
            expect(canExecute).toBeTruthy();
            spyOn(sqlConn, 'queryBatch').and.callThrough();
            expect(sqlConn.queryBatch.calls.count()).toEqual(0);
            sqlConn.setTransactionIsolationLevel(IsolationLevel.readCommitted)
                .then(function () {
                    expect(sqlConn.queryBatch.calls.count()).toEqual(1);
                    return sqlConn.setTransactionIsolationLevel(IsolationLevel.readCommitted);
                })
                .then(function () {
                    expect(sqlConn.queryBatch.calls.count()).toEqual(1);
                    return sqlConn.setTransactionIsolationLevel(IsolationLevel.readOnly);
                })
                .then(function () {
                    expect(sqlConn.queryBatch.calls.count()).toEqual(2);
                    return sqlConn.setTransactionIsolationLevel(IsolationLevel.readOnly);
                })
                .then(function () {
                    expect(sqlConn.queryBatch.calls.count()).toEqual(2);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                    //if(err && err.indexOf('ORA-08178'))
                        //console.error('\n\n'+ "Errore ORA-08178 : L'utente (INTERNAL) non supporta l'isolation level SERIALIZABLE , utilizzare un altro utente per eseguire il test\n\n");
                });
        });

        it('begin transaction should return success', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.beginTransaction(IsolationLevel.readCommitted)
                .done(function () {
                    expect(true).toBe(true);
                    sqlConn.rollBack();
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });


        it('rollback transaction should fail without open conn', function (done) {
            expect(canExecute).toBeTruthy();
            let closedSqlConn = getConnection('good');
            closedSqlConn.rollBack()
                .done(function () {
                    expect(true).toBe(false);
                    done();
                })
                .fail(function (err) {
                    expect(err).toContain('closed');
                    done();
                });
        });
        
        it('rollback transaction should fail without begin tran', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.open()
                .then(function () {
                    sqlConn.rollBack()
                        .done(function () {
                            expect(true).toBe(false);
                            sqlConn.destroy();
                            done();
                        })
                        .fail(function (err) {
                            expect(err).toBeDefined();
                            sqlConn.destroy();
                            done();
                        });
                });
        });
        
        it('commit transaction should success with a begin tran', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.beginTransaction(IsolationLevel.readCommitted)
                .then(function () {
                    sqlConn.commit()
                        .done(function () {
                            expect(true).toBe(true);
                            done();
                        })
                        .fail(function (err) {
                            expect(err).toBeUndefined();
                            done();
                        });
                });
        });

        it('rollback transaction should success with a begin tran', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.beginTransaction(IsolationLevel.readCommitted)
                .then(function () {
                    sqlConn.rollBack()
                        .done(function () {
                            expect(true).toBe(true);
                            done();
                        })
                        .fail(function (err) {
                            expect(err).toBeUndefined();
                            done();
                        });
                });
        });
    });

    describe('commands', function () {


        it('getDeleteCommand should compose a delete', function () {
            expect(canExecute).toBeTruthy();
            expect(sqlConn.getDeleteCommand(
                {
                    tableName: 'customer',
                    filter: $dq.eq('idcustomer', 2)
                }
            )).toEqual('DELETE FROM "customer" WHERE ("idcustomer"=2);');
        });

        it('getInsertCommand should compose an insert', function () {
            expect(canExecute).toBeTruthy();
            expect(sqlConn.getInsertCommand('ticket',
                ['col1', 'col2', 'col3'],
                ['a', 'b', 'c']
            )).toEqual('INSERT INTO ticket("col1","col2","col3")VALUES(\'a\',\'b\',\'c\');');
        });

        it('getUpdateCommand should compose an update', function () {
            expect(canExecute).toBeTruthy();
            expect(sqlConn.getUpdateCommand({
                    table: 'ticket',
                    filter: $dq.eq('idticket', 1),
                    columns: ['col1', 'col2', 'col3'],
                    values: ['a', 'b', 'c']
                }
            )).toEqual('UPDATE ticket SET "col1"=\'a\',"col2"=\'b\',"col3"=\'c\' WHERE ("idticket"=1);');
        });

        it('callSPWithNamedParams should have success', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.callSPWithNamedParams({
                    spName: 'testSP2',
                    paramList: [
                        {name: 'esercizio', value: 2013},
                        {name: 'meseinizio', value: 1},
                        {name: 'mess', value: 'ciao JS'},
                        {name: 'defparam', value: 10}
                    ]
                })
                .progress(function (x) {
                    expect(x).toBeUndefined();
                })
                .done(function (res) {
                    expect(_.isArray(res)).toBeTruthy();
                    expect(res.length).toBe(1);

                    let res0 = res[0];
                    expect(_.isArray(res0)).toBeTruthy();
                    expect(res0.length).toBe(1);

                    let o = res0[0];
                    //noinspection JSUnresolvedVariable
                    expect(o.colA).toBe('aa');
                    /*jshint camelcase: false */
                    //noinspection JSUnresolvedVariable
                    expect(o.original_esercizio).toBe(2013);
                    //noinspection JSUnresolvedVariable
                    expect(o.newparam).toEqual(20.0);
                    //noinspection JSUnresolvedVariable
                    expect(o.newmess).toBe('cizo JS');
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('callSPWithNamedParams with unsorted params should have success - param order does not matter', function (done) {
            expect(canExecute).toBeTruthy();
            let paramList=[
                {name: 'defparam', value: 10},
                {name: 'mess', value: 'ciao JS'},
                {name: 'esercizio', value: 2013},
                {name: 'meseinizio', value: 1}
            ];
            sqlConn.callSPWithNamedParams({
                    spName: 'testSP2',
                    paramList: paramList
                })
                .progress(function (x) {
                    expect(x).toBeUndefined();
                })
                .done(function (res) {
                    expect(_.isArray(res)).toBeTruthy();
                    expect(res.length).toBe(1);

                    var res0 = res[0];
                    expect(_.isArray(res0)).toBeTruthy();
                    expect(res0.length).toBe(1);

                    var o = res0[0];

                    //noinspection JSUnresolvedVariable
                    expect(o.colA).toBe('aa');
                    /*jshint camelcase: false */
                    //noinspection JSUnresolvedVariable
                    expect(o.original_esercizio).toBe(2013);
                    //noinspection JSUnresolvedVariable
                    expect(o.newparam).toEqual(20.0);
                    //noinspection JSUnresolvedVariable
                    expect(o.newmess).toBe('cizo JS');
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('callSPWithNamedParams with output params should have success', function (done) {
            expect(canExecute).toBeTruthy();
            var table;
            let paramList=[
                {name: 'esercizio', value: 2013},
                {name: 'meseinizio', value: 2},
                {name: 'mesefine', varName:'mese', out: true, sqltype: 'NUMBER(10)'},
                {name: 'mess', value: 'ciao JS'},
                {name: 'defparam', value: 10}
            ];

            sqlConn.callSPWithNamedParams({
                    spName: 'testSP1',
                    paramList:paramList
                })
                .progress(function (res) {
                    table = res;
                    expect(_.isArray(res)).toBeTruthy();
                    expect(res.length).toBe(1);
                    var o = res[0];
                    //noinspection JSUnresolvedVariable
                    expect(o.colA).toBe('a');
                    /*jshint camelcase: false */
                    //noinspection JSUnresolvedVariable
                    expect(o.original_esercizio).toBe(2013);
                    //noinspection JSUnresolvedVariable
                    expect(o.newparam).toEqual(20.0);
                    //noinspection JSUnresolvedVariable
                    expect(o.newmess).toBe('cizo JS');
                    expect(o.mese).toBe(undefined);
                })
                .done(function (o) {
                    expect(table).toBeDefined();
                    expect(_.isArray(o)).toBeTruthy();
                    expect(o.length).toBe(1);
                    expect(o[0]).toBe(table);

                    expect(paramList[2].value).toBeUndefined();
                    expect(paramList[2].outValue).toBe(12);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('callSPWithNamedParams should return multiple tables', function (done) {
            expect(canExecute).toBeTruthy();
            var table;
            let paramList=[
                {name: 'esercizio', value: 2013}
            ];
            let nProgress=0;
            sqlConn.callSPWithNamedParams({
                spName: 'testSP3',
                paramList:paramList
            })
                .progress(function (res) {
                    nProgress++;
                })
                .done(function (o) {
                    expect(nProgress).toBe(3);
                    expect(_.isArray(o)).toBeTruthy();
                    expect(o.length).toBe(4);
                    expect(o[0].length).toBe(100);
                    expect(o[1].length).toBe(100);
                    expect(o[2].length).toBe(10);
                    expect(o[3].length).toBe(10);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('getSelectListOfVariables should be able to select variables', function (done) {
            expect(canExecute).toBeTruthy();

            const sqlSet = 
                "DECLARE " +
                "name VARCHAR2(50) := 'john'; " +
                "surname VARCHAR2(50) := 'doe'; " +
                "year NUMBER(6) := 2023; " +
                "BEGIN ";

            const sqlSelect = sqlConn.getSelectListOfVariables([
                { varName: 'name', colName: 'nome'}, // N.B.: wrapped in double quotes ("") because Oracle implicity converts the alias to uppercase otherwise
                { varName: 'surname', colName: 'cognome'},
                { varName: 'year', colName: 'anno'}
            ]);
        
            let sql = sqlConn.appendCommands([sqlSet, sqlSelect, 'END;']);
        
            sqlConn.queryBatch(sql, false)
                .done(function (result){
                    expect(result.length).toBe(1);
                    expect(result[0]).toBeDefined();

                    expect(result[0].nome).toBe('john');
                    expect(result[0].cognome).toBe('doe');
                    expect(result[0].anno).toBe(2023);

                    done();
                }).fail(function (err){
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('getPagedTableCommand should be able to offset the first 5 rows and return the next 10', function (done) {
            expect(canExecute).toBeTruthy();

            const options = {
                tableName : 'customer',
                top : 10,
                columns : 'idcustomer,name,age',
                orderBy : 'idcustomer',
                firstRow : 5,
                filter : ''
            };
        
            let sql = sqlConn.getPagedTableCommand(options);
        
            sqlConn.queryBatch(sql, false)
                .done(function (result){
                    expect(result).toBeDefined();
                    expect(result.length).toBe(10); // Must return 10 rows

                    // Ordered by idcustomer (ASC)
                    expect(result[0].idcustomer).toBe(5); // Offset by 5
                    expect(result[result.length - 1].idcustomer).toBe(14);

                    done();
                }).fail(function (err){
                    expect(err).toBeUndefined();
                    done();
                });
        });

    });

    describe('querylines', function () {


        it('queryLines should return as many meta as read tables ', function (done) {
            expect(canExecute).toBeTruthy();
            let nResp = 0;
/*            
            let query = `DECLARE c1 SYS_REFCURSOR;
                        c2 SYS_REFCURSOR;
                        c3 SYS_REFCURSOR;
                    BEGIN
                        open c1 for select * from "customer";
                        open c2 for select * from "seller" FETCH NEXT 20 ROWS ONLY;
                        open c3 for select * from "customerkind" FETCH NEXT 2 ROWS ONLY;
                        DBMS_SQL.RETURN_RESULT(c1);
                        DBMS_SQL.RETURN_RESULT(c2);
                        DBMS_SQL.RETURN_RESULT(c3);
                    END;`
*/
            let query = 
                sqlConn.getSelectCommand({ tableName : 'customer', columns: '*' })+
               sqlConn.getSelectCommand({ tableName : 'seller', columns: '*', top: 20 })+
               sqlConn.getSelectCommand({ tableName : 'customerkind', columns: '*', top: 2 });
        
            sqlConn.queryLines(query, true)
                .progress(function (r) {
                    expect(r).toBeDefined();
                    if (r.meta) {
                        nResp += 1;
                    }
                })
                .done(function (result) {
                    expect(nResp).toBe(3);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });

        });

        it('meta returned from queryLines should be arrays ', function (done) {
            expect(canExecute).toBeTruthy();
            let query = 
                sqlConn.getSelectCommand({ tableName : 'sellerkind', columns: '*' })+
               sqlConn.getSelectCommand({ tableName : 'seller', columns: '*', top: 20 })+
               sqlConn.getSelectCommand({ tableName : 'customerkind', columns: '*', top: 2 });

            sqlConn.queryLines(query, true)
                .progress(function (r) {
                    if (r.meta) {
                        expect(r.meta).toEqual(jasmine.any(Array));
                    }
                })
                .done(function () {
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });

        });

        it('queryLines should return all rows one at a time', function (done) {
            expect(canExecute).toBeTruthy();
            var nResp = 0;
            //sqlConn.queryLines('select * from "seller" FETCH NEXT 5 ROWS ONLY', true)
            sqlConn.queryLines(sqlConn.getSelectCommand({ tableName : 'seller', columns: '*', top: 5 }), true)
                .progress(function (r) {
                    expect(r).toBeDefined();
                    if (r.row) {
                        nResp += 1;
                        let buff = Buffer.from(r.row[9],"base64");

                        fs.writeFileSync('decifraBase64.txt', buff);
                    }
                })
                .done(function () {
                    expect(nResp).toBe(5);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });

        });

        it('queryLines should return row as arrays ', function (done) {
            expect(canExecute).toBeTruthy();
            var nResp = 0;
            sqlConn.queryLines(sqlConn.getSelectCommand({ tableName : 'customerkind', columns: '*', top: 5 }), true)
                .progress(function (r) {
                    if (r.row) {
                        nResp += 1;
                        expect(r.row).toEqual(jasmine.any(Array));
                    }
                })
                .done(function () {
                    expect(nResp).toBe(5);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('queryLines should return row as objects when raw=false ', function (done) {
            expect(canExecute).toBeTruthy();
            var nResp = 0;
            sqlConn.queryLines(sqlConn.getSelectCommand({ tableName : 'customerkind', columns: '*', top: 5 }), false)
                .progress(function (r) {
                    if (r.row) {
                        nResp += 1;
                        expect(r.row).toEqual(jasmine.any(Object));
                        //noinspection JSUnresolvedVariable
                        
                        expect(r.row.idcustomerkind).toEqual(jasmine.any(Number));
                        //noinspection JSUnresolvedVariable
                        expect(r.row.name).toEqual(jasmine.any(String));
                    }
                })
                .done(function () {
                    expect(nResp).toBe(5);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('queryLines should work with multiple results ', function (done) {
            expect(canExecute).toBeTruthy();
            let nResp = 0;    
            let query = 
                    sqlConn.getSelectCommand({ tableName : 'customerkind', columns: '*', top: 5 })+
                   sqlConn.getSelectCommand({ tableName : 'customer', columns: '*', top: 10 });

            sqlConn.queryLines(query, false)
                .progress(function (r) {
                    if (r.row) {
                        nResp += 1;
                        expect(r.row).toEqual(jasmine.any(Object));
                        if (nResp <= 5) {
                            //noinspection JSUnresolvedVariable
                            expect(r.row.idcustomerkind).toEqual(jasmine.any(Number));
                            //noinspection JSUnresolvedVariable
                            expect(r.row.name).toEqual(jasmine.any(String));
                            //noinspection JSUnresolvedVariable
                            expect(r.row.surname).toBeUndefined();
                        }
                        else {
                            //noinspection JSUnresolvedVariable
                            expect(r.row.idcustomer).toEqual(jasmine.any(Number));
                            //noinspection JSUnresolvedVariable
                            expect(r.row.surname).toEqual(jasmine.any(String));
                            //noinspection JSUnresolvedVariable
                            expect(r.row.rnd).toBeUndefined();
                        }
                    }
                })
                .done(function () {
                    expect(nResp).toBe(15);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('giveErrorNumberDataWasNotWritten should return the provided value (3) if no row has been affected', function(done){
            expect(canExecute).toBeTruthy();
            const sqlCmd = 'UPDATE "customer" SET "random" = dbms_random.value()*1000 WHERE ROWNUM <= 0;',
                errCmd = sqlConn.giveErrorNumberDataWasNotWritten(3);
            let sql = sqlConn.appendCommands([sqlCmd, errCmd]);

            sqlConn.queryBatch(sql, false)
                .done(function (result) {
                    expect(result.length).toBeGreaterThan(0);

                    let res = result[0], i;
                    for (i in res) {
                        if (res.hasOwnProperty(i)) {
                            result = res[i];
                            break;
                        }
                    }
                    expect(result).toBe(3);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('giveErrorNumberDataWasNotWritten should NOT return anything if one or more rows have been affected', function(done){
            expect(canExecute).toBeTruthy();
            const sqlCmd = 'UPDATE "customer" SET "random" = dbms_random.value()*1000 WHERE ROWNUM <= 1;',
                errCmd = sqlConn.giveErrorNumberDataWasNotWritten(3);
            let sql = sqlConn.appendCommands([sqlCmd, errCmd]);

            sqlConn.queryBatch(sql, false)
                .done(function (result) {
                    expect(result.length).toBe(0);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });
    });


    describe('tableDescriptor',function (){
        it('should return a TableDescriptor',function(done){
            expect(canExecute).toBeTruthy();
            sqlConn.tableDescriptor('customer')
                .then(/*{TableDescriptor}*/t=>{
                    expect(t.xtype).toBe("T");
                    expect(t.name).toBe("customer");
                    expect(t.columns).toBeDefined();
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });


    });


    describe('clear dataBase', function () {
        it('should run the destroy script', function (done) {
            expect(canExecute).toBeTruthy();
            sqlConn.run(fs.readFileSync(path.join('test', 'data', 'jsOracleDriver', 'destroy.sql')).toString())
                .done(function () {
                    expect(true).toBeTruthy();
                    done();
                })
                .fail(function (res) {
                    expect(res).toBeUndefined();
                    done();
                });
        }, 30000);
    });
});
