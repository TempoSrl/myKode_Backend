/*global sqlFun,ObjectRow */

/**
 * @module GetDataInvoke
 * @description
 * Fakes client web service invocation of GetDataServices, in order to share metadata classes.
 * This is mean to be used in backend execution of code shared between client and server
 */


const Deferred = require("./EventManager").Deferred;
/*jsDataQuery*/
const q = require('./jsDataQuery').jsDataQuery;
const getDataUtils = require("./GetDataUtils");
const logger =  require('./Logger').logger ;
const logType = require('./Logger').logTypeEnum;
const model = require('./MetaModel').metaModel;
const _ = require('lodash');
const utils = require("./utils").utils;
const mSel = require('./../../../src/jsMultiSelect');
const Select = mSel.Select;

const GetDataSet = require("./GetDataSet");
const GetData = require("./../../../src/jsGetData");
const {orderBy} = require("lodash");
const jsDataSet = require("./jsDataSet");
const {readFile} = require("fs/promises");
const path = require("path");

function SelectBuilder(){
        /*DataTable*/ this.table = null;
        /*string*/ this.top = null;
        /*string*/ this.tableName = null;
        /*sqlFun*/ this.filter = null;
    }

SelectBuilder.prototype = {
        constructor: SelectBuilder
};


    /**
     * Exposes server web services as local functions so that code can use them seemingly
     * @constructor GetDataInvoke
     * @param {Context} ctx
     */
    function GetDataInvoke(ctx) {
        /*Context*/ this.ctx = ctx;
        /*DataAccess*/ this.conn= ctx.dataAccess;
        /*Environment*/ this.env=ctx.environment;
        /*DbDescriptor*/ this.dbDescriptor = ctx.dbDescriptor;
        this.getMeta = ctx.getMeta;
    }

    GetDataInvoke.prototype = {
        constructor: GetDataInvoke,

        /**
         * @method readCached
         * @public
         * @description ASYNC
         * Reads all cached tables
         * @param {DataSet} d
         * @returns {Deferred}
         */
        readCached: function (d) {
            /* {filter:sqlFun, top:string, table:DataTable}[] */
            let selectList = [];
            let that = this;
            const allPromises = [];
            _.forEach(d.tables,
                function (t) {
                    if (!model.cachedTable(t)) return;
                    if (!model.canRead(t)) return;
                    allPromises.push(that.doGetTable(t, null, true, null, selectList));
                });
            return Deferred("readCached").from(
                Deferred.when(allPromises)
                    .then(function () {
                        if (selectList.length === 0) return false;
                        return that.multiRunSelect(selectList)
                            .then(function () {
                                _.forEach(selectList,
                                    function (sel) {
                                        model.getTemporaryValues(sel.table);
                                    });
                                return true;
                            });
                    }));

        },

        /**
         * @method doGetTable
         * @public
         * @description ASYNC
         * Gets a DataTable with an optional set of Select. If a list of select is given, adds a select in selectList
         * @param {DataTable} t DataTable to Get from DataBase
         * @param {sqlFun} filter
         * @param {boolean} clear  if true table is cleared before reading
         * @param {string} top  parameter for "top" clause of select
         * @param {Array.<filter:sqlFun, top:string, table:DataTable>} selectList
         * @returns {Deferred}
         */
        doGetTable: function (t, filter, clear, top, selectList) {
            let def = Deferred("doGetTable");
            // log per controllo se il filtro di tipo mcmp non è su colonne presenti sulla tabella.
            let columnFilterInTable = function (t, f) {
                if (!t || !f) return true;
                if (f.myName === "mcmp") {
                    return _.every(f.myArguments[0], function (c) {
                        return !!t.columns[c];
                    });
                }
                return true;
            };
            if (!columnFilterInTable(t, filter)) {
                // console.warn("warning: doGetTable: Table t " + t.name + " misses some filtered columns", filter);
                return def.resolve(false);
            }

            if (!model.canRead(t)) return def.resolve(false);
            let that = this;
            if (clear) {
                t.clear();
            }

            let mergedFilter = t.staticFilter();

            if (filter && mergedFilter) {
                mergedFilter = q.and(filter, mergedFilter);
                mergedFilter.isTrue = filter.isTrue;
            }
            else {
                mergedFilter = filter ? filter : mergedFilter;
            }

            let mySel = null;
            let doGetResult = true;

            return def.from(
                utils._if(selectList !== undefined)
                    ._then(function () {
                        mySel = {
                            filter: mergedFilter,
                            top: top,
                            table: t
                        };
                        selectList.push(mySel);
                        doGetResult = mySel;
                        return true; //new Deferred("doGetTable").resolve().promise();
                    })
                    ._else(function () {
                        return that.runSelectIntoTable(t, mergedFilter, top);
                    })
                    .then(function () {
                        if (mergedFilter === null || mergedFilter === undefined || mergedFilter.isTrue) {
                            model.setAsRead(t); //table has been read fully
                        }
                        if (!selectList) model.getTemporaryValues(t);
                        return doGetResult;
                    })).promise();
        },

        /**
         * @method getRowsByFilter
         * @public
         * @description ASYNC
         * Returns the Rows from the DataTable "table" based on the clause "filter"
         * @param {sqlFun} filter
         * @param {boolean} multiCompare
         * @param {DataTable} table
         * @param {string} top
         * @param {boolean} prepare
         * @param {Array.<filter:sqlFun, top:string, table:DataTable>} [selList]
         * @returns {Deferred}
         */
        getRowsByFilter: function (filter, multiCompare, table, top, prepare, selList) {
            let def = Deferred('getRowsByFilter');
            if (!model.canRead(table)) return def.resolve().promise();

            let mergedFilter = table.staticFilter();

            if (filter !== null && filter !== undefined) {
                if (mergedFilter) {
                    mergedFilter = q.and(filter, mergedFilter);
                }
                else {
                    mergedFilter = filter;
                }
            }
            let that = this;
            let res = utils._if(selList !== undefined)
                ._then(function () {
                    selList.push({filter: mergedFilter, top: top, table: table});
                })
                ._else(function () {
                    return that.runSelectIntoTable(table, mergedFilter, top);
                })
                .then(function () {
                    model.setAsRead(table);
                    return true;
                });

            return def.from(res).promise();
        },

        /**
         * @method selectCount
         * @public
         * @description ASYNC
         * Gets the rows count of the "tableName" filtered on "filter"
         * @param {string} tableName
         * @param {sqlFun} filter
         * @returns {Deferred}
         */
        selectCount: function (tableName, filter) {
            return this.conn.selectCount({tableName: tableName, filter: filter, environment: this.env});
        },

        /**
         * @method runSelect
         * @public
         * @description ASYNC
         * Returns a deferred DataTable where the rows are select on "tableName" filtered on "filter". If "columnList" is "*" it returns all columns,
         * otherwise only those specified in "columnList".
         * If top is specified it returns only a max of "top" rows, otherwise it returns all the rows.
         * @param {string} tableName
         * @param {string} columnList
         * @param {sqlFun} filter
         * @param {string} [top]
         * @returns {Deferred<DataTable>}
         */
        runSelect: function (tableName, columnList, filter, top) {
            let def = Deferred('runSelect');
            let res = this.conn.select({
                tableName: tableName,
                columns: columnList,
                top: top,
                filter: filter,
                environment: this.env,
            });
            return def.from(res).promise();
        },

        /**
         * @method addRowToTable
         * @public
         * @description SYNC
         * Adds a copy of the row "r" to the DataTable "t", and returns the linked DataRow
         * @param {DataTable} t
         * @param {ObjectRow} r
         * @returns {ObjectRow}
         */
        addRowToTable: function (t, r) {
            let newRow = t.newRow();
            let oldTable = r.getRow().table;
            _.forEach(t.columns, function (c) {
                if (oldTable.columns[c.name]) {
                    newRow[c.name] = r[c.name];
                }
            });

            t.add(newRow);
            newRow.getRow().acceptChanges();
            return newRow;
        },


        /**
         * Executes a bunch of select, based on "selectList". Not much different from a multiple runSelectIntoTable
         * @method multiRunSelect
         * @public
         * @param {Array.<filter:sqlFun, top:string, table:DataTable>} selectList
         * @returns {Deferred}
         */
        multiRunSelect: function (selectList) {

            if (selectList.length === 0) {
                logger.log(logType.WARNING, "You are calling multiRunSelect with selectList empty");
                return Deferred("multiRunSelect").resolve().promise();
            }
            let adaptedList = selectList.map(sel =>
                new Select(model.columnNameList(sel.table))
                    .from(sel.table.tableForReading())
                    .where(sel.filter)
                    .top(sel.top)
            );
            return this.conn.multiSelect({selectList: adaptedList, environment: this.env})
                .progress(
                    /**
                     * @param {{tableName: string, set: number, rows : object[]}} data
                     */
                    function (data) {
                        //data is an object:
                        // data mi aspetto sia un DataTable

                        // recupero il dataTable da riempire dalla lista di input
                        let destTableArr = _.filter(selectList, sel => sel.table.tableForReading() === data.tableName);
                        if (destTableArr.length > 0) {
                            /*DataTable*/
                            let destTable = destTableArr[0].table;
                            let tableWasEmpty = (destTable.rows.length === 0);
                            destTable.mergeArray(data.rows, !tableWasEmpty);
                            //getDataUtils.mergeRowsIntoTable(destTable, data.rows, !tableWasEmpty);
                        }
                    })
                .then(
                    function () {
                        // vanno serializzate le chiamate alle sel.onRead(), ove siano definite
                        let allDeferredOnRead = utils.filterArrayOnField(selectList, 'onRead');
                        return utils.thenSequence(allDeferredOnRead);
                    });
        },

        /**
         * @method runSelectIntoTable
         * @public
         * @description ASYNC
         * Reads a set of rows in a given DataTable "t" based on clause "filter"
         * @param {DataTable} t
         * @param {sqlFun} filter. The filter to apply to the select
         * @param {string} top. Max num of rows to read
         * @returns {DataTable} The table with the rows read
         */
        runSelectIntoTable: function (t, filter, top) {
            let def = Deferred("runSelectIntoTable");
            let res = this.runSelect(t.tableForReading(), model.columnNameList(t), filter, top)
                .then(function (rows) {
                    //merges rows into t
                    t.mergeArray(rows, t.rows.length !== 0);
                    //getDataUtils.mergeRowsIntoTable(t, dt.rows, t.rows.length !== 0);
                    return def.resolve(t);
                });
            return def.from(res).promise();
        },

        /**
         * @method createTableByName
         * @public
         * @description ASYNC
         * Creates and returns a DataTable "tableName" with the specified columns
         * @param {string} tableName
         * @param {string} columnList
         * @returns {Deferred<DataTable>}
         */
        createTableByName: function (tableName, columnList) {
            let def = Deferred('createTableByName');
            let res = this.dbDescriptor.createTable(tableName);
            return def.from(res).promise();
        },

        /// <summary>
        ///
        /// </summary>
        /// <param name="tableName">string</param>
        /// <param name="listType">string</param>
        /// <returns>string[]</returns> an array of 2 strings. At the first position the new tableName, at the second the new listType


        /**
         * Executes the mapping of tableName and listType on "web_listredir" table taking a new tableName
         *  (usually a custom view) and a new listType
         * @param {string} tableName
         * @param {string} listType
         * @return {Deferred<string[]>}
         */
        getMappingWebListRedir: function (tableName, listType) {
            let def = Deferred('getMappingWebListRedir');
            /*string[]*/
            let standardMap = [tableName, listType];
            this.conn.select({
                tableName: tableName,
                filter: q.and(q.eq("tablename", tableName), q.eq("listtype", listType)),
                environment: this.env,
                columns: "newtablename,newlisttype"
            })
                .then(rows => {
                    if (rows.length === 0) {
                        def.resolve(standardMap);
                        return;
                    }
                    let map = rows[0];
                    def.resolve([map["newtablename"], map["newlisttype"]]);
                })
                .fail(err => {
                    def.resolve(standardMap);
                });
            return def.promise();
        },


        /**
         * @method getPagedTable
         * @public
         * @description ASYNC
         * Returns the rows paginated of the DataTable "tableName".
         * The rows are filtered based on clause "filter"
         * @param {string} tableName
         * @param {number} nPage
         * @param {number} nRowPerPage
         * @param {sqlFun} filter
         * @param {string} listType
         * @param {string} sortBy
         * @returns {Deferred<DataTable>}
         */
        getPagedTable: function (tableName, nPage, nRowPerPage, filter, listType, sortBy) {
            let def = Deferred('getPagedTable');
            let newTableName;
            let newListType;
            let dtOriginal;
            let meta;
            let aborted = false;
            let totPages;
            let totalRows;

            let res = this.getMappingWebListRedir(tableName, listType)
                .then(map => {
                    newTableName = map[0];
                    newListType = map[1];
                    return this.dbDescriptor.createTable(newTableName);
                })
                .then(table => {
                    if (aborted) return;
                    dtOriginal = table;
                    if (_.keys(dtOriginal.columns).length === 0) {
                        def.reject("Table/view " + tableName + " is not configured in columntypes");
                        aborted = true;
                        return;
                    }
                    meta = this.getMeta(newTableName);
                    if (!sortBy) {
                        let sortMeta = meta.getSorting(newListType);
                        if (sortMeta) {
                            sortBy = sortMeta;
                        }
                        else {
                            if (table.columns.title) {
                                sortBy = "title";
                            }
                            else {
                                sortBy = _.keys(table.columns)[0];
                            }
                        }
                    }
                    let staticFilter = meta.getStaticFilter(newListType);
                    if (staticFilter) {
                        filter = q.and(filter, staticFilter);
                    }
                    return this.conn.selectCount({tableName: newTableName, filter: filter, environment: this.env});
                })
                .then(totRows => {
                    if (aborted) return;
                    totalRows = totRows;
                    totPages = Math.ceil(totRows / nRowPerPage);
                    let sql;
                    if (totPages < 2 || !sortBy) {
                        sql = this.conn.getSelectCommand({
                            tableName: newTableName,
                            columns: "*",
                            filter: filter,
                            environment: this.env
                        });
                    }
                    else {
                        let firstRow = (nPage - 1) * nRowPerPage + 1;
                        sql = this.conn.sqlConn.getPagedTableCommand(
                            {tableName:newTableName,
                                top:nRowPerPage,
                                filter:filter,
                                firstRow:firstRow,
                                orderBy:sortBy
                            });
                    }
                    return this.conn.runSql(sql);
                })
                .then(data => {
                    if (aborted) return;
                    if (!data) {
                        aborted = true;
                        def.reject("Query error:" + filter.toString());
                        return;
                    }

                    if (dtOriginal.key().length === 0) {
                        dtOriginal.key(meta.primaryKey());
                    }

                    dtOriginal.loadArray(data.rows, false);
                    def.resolve(dtOriginal, totPages, totalRows);
                })
                .fail(err => {
                    def.reject(err);
                });

            return def.promise();
        },


        /**
         * @method getDsByRowKey
         * @public
         * @description ASYNC
         * Fills the dataSet starting from a table
         * @param {DataRow} dataRow
         * @param {DataTable} table primaryTable
         * @param {string} [editType] used to retrieve a DataSet. If not specified, table.dataset is used
         * @returns {Deferred<DataSet>}
         */
        getDsByRowKey: function (dataRow, table, editType) {

            let def = Deferred('getDsByRowKey');
            if (!model.canRead(table)) return def.resolve(null);

            if (_.some(table.key(), cname => dataRow.current[cname] === undefined)) {
                def.reject("Table view " + dataRow.table.name + " has different column key name respect to " + table.name);
            }

            let filter = table.keyFilter(dataRow.current);

            let ds = table.dataset;
            if (editType) {
                ds = this.createEmptyDataSet( table.name, editType);
            }

            if (filter !== null && table.staticFilter()) {
                filter = q.and(filter, table.staticFilter());
            }

            GetData.fillDataSetByFilter(this.ctx, ds.tables[table.name], filter)
                .then(result => {
                        def.resolve(ds);
                    },
                    err => {
                        def.reject(err);
                    }
                );
            return def.promise();
        },

        /**
         * @method getByKey
         * @public
         * @description ASYNC
         * Returns a deferred with the DataRow of the table, filtered based on the keys of the DataTable "table", where the values are those of "row"
         * @param {DataTable} table
         * @param {DataRow} row
         * @returns {Deferred<DataRow>}
         */
        getByKey: function (table, row) {
            let def = Deferred('getByKey');

            let filter = table.keyFilter(row.current);

            let res = this.runSelect(table.name, "*", filter)
                .then(function (dt) {
                    if (!dt) return def.resolve(null);
                    if (dt.rows.length === 0) return def.resolve(null);
                    model.getTemporaryValues(table);
                    return def.resolve(dt.rows[0].getRow());
                });

            return def.from(res).promise();
        },


        /**
         * @method getDataSet
         * @public
         * @description ASYNC
         * Returns a deferred resolved with jsDataSet based on "tableName" and "editType" keys
         * @param {string} tableName
         * @param {string} editType
         * @param {Context} ctx
         * @returns {Promise<DataSet>}
         */
        getDataSet: function (tableName, editType,ctx) {
            return Deferred().resolve(GetDataSet.getDataSet(tableName, editType,ctx));
        },

        /**
         * @method createEmptyDataSet
         * @public
         * @description ASYNC
         * Returns a deferred resolved with jsDataSet based on "tableName" and "editType" keys
         * @param {string} tableName
         * @param {string} editType
         * @returns Promise<DataSet>
         */
        createEmptyDataSet: function (tableName, editType) {
            return GetDataSet.createEmptyDataSet(this.ctx, tableName, editType);
        },

        /**
         * @method prefillDataSet
         * @public
         * @description ASYNC
         * Returns a deferred resolved with the DataSet. It loads data from cached DataTable, based on "staticfilter" property
         * @param {jsDataSet} dsTarget
         * @param {string} tableName
         * @param {string} editType
         * @returns {Deferred<DataSet>})
         */
        prefillDataSet: function (dsTarget, tableName, editType) {
            let def = Deferred("prefillDataSet");


            // costruisco coppie chiave valore, poi lo serializzo facendo un json
            /* {filter:sqlFun, top:string, table:DataTable}[] */
            let selectTable = [];

            _.forEach(dsTarget.tables,
                t => {
                    if (model.cachedTable(t)) {
                        selectTable.push({filter: t.staticFilter(), top: null, table: t});
                    }
                });

            return this.multiRunSelect(selectTable)
                .then(()=>{
                    return dsTarget;
                });
        },

        /**
         * @method fillDataSet
         * @public
         * @description ASYNC
         * Reads and fills from the server the DatSet with tableName.editType, filters it on "filter" and merges it into dsTarget.
         * Returns a deferred resolved with the DataSet merged.
         * @param {DataSet} dsTarget
         * @param {string} tableName
         * @param {string} editType
         * @param {sqlFun} filter
         * @returns {Deferred<DataSet|string>}
         */
        fillDataSet: function (dsTarget, tableName, editType, filter) {
            let def = Deferred("fillDataSet");
            let res = GetData.fillDataSetByFilter(this.ctx, dsTarget.tables[tableName],filter);
            return  def.from(res).promise();
        },

        /**
         * @method doGet
         * @public
         * @description ASYNC
         * Returns a deferred resolved with a DataSet. The dataSet is the "ds" merged with the dataset filtered on the datarow values.
         * @param {DataSet} ds
         * @param {DataRow} dataRow
         * @param {string} primaryTableName
         * @param {boolean} onlyPeripherals
         * @returns {Deferred}
         */
        doGet: function (ds, dataRow, primaryTableName, onlyPeripherals) {
            let def = Deferred("doGet");
            let /*DataTable*/ primaryTable = ds.tables[primaryTableName];
            let res =  GetData.doGet(this.ctx, primaryTable, onlyPeripherals, dataRow);
            return  def.from(res).promise();
        },


        /**
         * @method doGetTableRoots
         * @public
         * @description ASYNC
         * Gets some row from a datatable, with all child rows in the same table
         * @remarks it was DO_GET_TABLE_ROOTS() in TreViewDataAccess
         *
         * @param {DataTable} table
         * @param {jsDataQuery} filter
         * @param {boolean} clear
         */
        doGetTableRoots: function (table, filter, clear) {
            let def = Deferred('doGetTableRoots');
            if (!model.canRead(table)) return def.resolve(false);
            let res = this.doGetTable(table, filter, clear, null);
            return def.from(res).promise();
        },

        /**
         * @method describeColumns
         * @public
         * @description ASYNC
         * @param {DataTable} table
         * @param {string} listType
         * Calls the describeColumns server side method on "tableName" and "listType"
         * @returns {Deferred<DataTable>}
         */
        describeColumns: function (table, listType) {
            let def = Deferred('describeColumns');
            let meta = this.getMeta(table.name);
            let res=  meta.describeColumns(table,listType)
                .then(t=>{
                    def.resolve();
                });

            return def.from(res).promise();
        },

        /**
         * @method describeTree
         * @public
         * @description ASYNC
         * @param {DataTable} table
         * @param {string} listType
         * Calls the describeTree server side method on "tableName" and "listType"
         * @returns {Deferred<DataTable>}
         */
        describeTree: function (table, listType) {
            let def = Deferred('describeTree');
            let meta = this.getMeta(table.name);
            let res=  meta.describeTree(table,listType);

            return def.from(res).promise();
        },

        /**
         * @method getSpecificChild
         * @public
         * @description ASYNC
         * Gets a row from a table T taking the first row by the filter
         * startCondition AND (startfield like startval%)
         * If more than one row is found, the one with the smallest startfield is
         * returned. Used for AutoManage functions. and treevewmanger
         * @param {DataTable} table
         * @param {sqlFun} startCondition
         * @param {string} startValueWanted
         * @param {string} startFieldWanted
         * @returns {Deferred<ObjectRow>}
         */
        getSpecificChild: function (table, startCondition, startValueWanted, startFieldWanted) {
            let def = Deferred("getSpecificChild");

            let filter = q.and(startCondition, q.like(startFieldWanted, startValueWanted));
            let res = this.getData.getByFilter(this.ctx, table, filter, orderBy)
                .then(/*DataRow[]*/ rows=>{
                    if (rows.length === 0){
                        return null;
                    }
                    if (rows.length === 1){
                        return rows[0];
                    }
                    return  null;
                });
            return def.from(res).promise();
        },

        /**
         * @method launchCustomServerMethod
         * @public
         * @description ASYNC
         * Launches a post call to the server with eventName that is the method custom to call, and with custom "prms"
         * @param {string} method
         * @param {object} prms
         * @returns {Deferred}
         */
        launchCustomServerMethod: function (method, prms) {
            let def = Deferred('launchCustomServerMethod');

            switch (method){
                default: def.reject(method + "is not a supported custom server method")
            }

            return def.promise();
        },

        /**
         * @method doReadValue
         * @public
         * @description ASYNC
         * Returns a single value from a table based on filter. "select value from tableName where filter"
         * @param {string} tableName
         * @param {sqlFun} filter
         * @param {sqlFun} expr
         * @param {string} orderBy
         * @returns {Deferred}
         */
        doReadValue: function (tableName, filter, expr, orderBy) {
            let def = Deferred('doReadValue');

            let res = this.conn.readSingleValue({
                tableName:tableName,
                expr:expr,      //attenzione che qui è cambiata la convenzione, ora è sqlFun prima era string
                filter:filter,
                environment:this.environment,
                orderBy:orderBy
            });

            return def.from(res).promise();
        },

    };

    module.exports = GetDataInvoke;
