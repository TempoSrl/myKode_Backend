/*globals sqlFun */
'use strict';
/**
 * @typedef  Deferred
 */
const Deferred = require("JQDeferred");
const _ = require('lodash');
const formatter = require('./jsOracleFormatter').jsOracleFormatter;
const CType = require("./../client/components/metadata/jsDataSet").CType;
const {tableName} = require("../config/anonymousPermissions");
const q = require("../client/components/metadata/jsDataQuery");
const EdgeConnection = require("./edge-sql").EdgeConnection;

/**
 * Interface to Oracle
 * @module oracleDriver
 */

/**
 * Maps Standard isolation levels to DBMS-level isolation levels.
 * @property allIsolationLevels
 * @type {{READONLY: string, READ_COMMITTED: string, SERIALIZABLE: string}}
 */

//TODO: check how it's used
const mapIsolationLevels = {
    //'READ_UNCOMMITTED': 'READ UNCOMMITTED',
    //'REPEATABLE_READ': 'REPEATABLE READ',
    //'SNAPSHOT': 'SNAPSHOT',
    'READ_ONLY': 'READ ONLY',
    'READ_COMMITTED': 'READ COMMITTED',
    'SERIALIZABLE': 'SERIALIZABLE'
};

const codedTypes ={
    'a':'DATE',
    'b':'CHAR(1)',
    'i':'NUMBER',
    'c':'VARCHAR2(255)',
    'n':'NUMBER(19,6)',
    'f':'FLOAT',
    'd':'DATE',
    'v':'NUMBER(23,2)',
    'default':'VARCHAR2(255)'
};


// https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/oracle-data-type-mappings
const mapping = {
    'CHAR':CType.String,
    'NCHAR':CType.String,
    'VARCHAR':CType.String,
    'VARCHAR2':CType.String,
    'NVARCHAR2':CType.String,
    'TINYTEXT':CType.String,
    "TEXT":CType.String,
    'MEDIUMTEXT':CType.String,
    'LONGTEXT':CType.String,
    'CBLOB':CType.String,
    'NBLOB':CType.String,
    'LONG':CType.String,

    //'UNIQUEIDENTIFIER':CType.string,

    /*
    'BINARY':CType.byteArray,
    'VARBINARY':CType.byteArray,
    'IMAGE':CType.byteArray,
    */
    'BLOB':CType.byteArray,
    'BFILE':CType.byteArray,
    'RAW':CType.byteArray,
    'LONG RAW':CType.byteArray,

    'INTEGER':CType.int,
    'SHORTINTEGER':CType.int,
    'LONGINTEGER':CType.int,

    'DECIMAL':CType.Decimal,
    'SHORTDECIMAL':CType.Decimal,
    'NUMBER':CType.number,
    'FLOAT':CType.Decimal,

    'DATE':CType.date,
    'DATETIME':CType.DateTime,

    'TIMESTAMP':CType.DateTime,
    'TIMESTAMP WITH TIME ZONE':CType.DateTime,
    'TIMESTAMP WITH LOCAL TIME ZONE':CType.DateTime,
    'INTERVAL YEAR TO MONTH':CType.DateTime,
    'INTERVAL DAY TO SECOND':CType.DateTime,

    'BOOLEAN':CType.bool,
};


/*jslint forin: false */


/**
 * @class SqlParameter
 * @param {object} paramValue
 * @param {string} paramName
 * @param {string} varName
 * @param {string} sqlType
 * @param {boolean} forOutput
 * @constructor
 */
function SqlParameter(paramValue,paramName, varName,sqlType, forOutput){

    /**
     * Optional parameter name
     * @type {string|undefined}
     */
    this.name=paramName;

    /**
     * Parameter value
     * @type {object|undefined}
     */
    this.value=paramValue;

    /**
     * Optional name for the variable that will store the result, in case of output variables. When not present, it is assumed to
     *  be equal to paramName.
     **/
    this.varName = varName || paramName;
    /**
     * Sql type declaration for output parameters
     * @type {string|undefined}
     */
    this.sqltype=sqlType;

    /**
     * Output flag , true when it is output parameter
     * @type {boolean|undefined}
     */
    this.out = forOutput;
}


/**
 * Provides function to interact with a Sql Server database
 * @class Connection
 */

/**
 * Create a connection
 * @method Connection
 * @param {object} options
 * {string} [options.driver='SQL Server Native Client 11.0'] Driver name
 * {string} [options.useTrustedConnection=true] is assumed true if no user name is provided
 * {string} [options.user] user name for connecting to db
 * {string} [options.pwd] user password for connecting to db
 * {string} [options.timeOut] time out to connect default 600
 * {string} [options.database] used to specify the SID or the service name for the connection
 * {string} [options.sqlCompiler] Edge Compiler
 * {string} [options.defaultSchema=options.user ||'DBO'] default schema associated with user name
 * {string} [options.serviceName || options.sid] service name to use for the connection, defaults to options.sid
 * {string} [options.sid] unique name of the istance/database
 * {string} [options.connectionString] connection string to connect (can be used instead of all previous listed)
 * @constructor
 */
function Connection(options) {
    /**
     * Stores the sql-connect options used for this connection
     * @property opt
     * @type {object}
     */
    this.opt = _.clone(options);
    this.sqlCompiler = this.opt.sqlCompiler || 'db';
    this.edgeConnection = null;
    this.driverName = "Oracle";

    /**
     * Indicates the open/closed state of the underlying connection
     * @property isOpen
     * @type {boolean}
     */
    this.isOpen = false;

    // The default schema has the same name as the user
    this.defaultSchema = this.opt.defaultSchema || this.opt.user;
    
    /**
     * Current schema in use for this connection
     * @property schema
     * @type {string}
     */
    this.schema = this.defaultSchema;

    this.timeOut = this.opt.timeOut || 600;

    /**
     * Current transaction annidation level
     * @private
     * @property transAnnidationLevel
     * @type {number}
     */
    this.transAnnidationLevel = 0;

    /**
     * Current transaction state, true if any rollback has been invoked
     * @propery transError
     * @type {boolean}
     */
    this.transError = false;

    /**
     * current isolation level
     * @property isolationLevel
     * @type {String}
     */
    this.isolationLevel = null;

    // this.adoString = 'Data Source=' + this.opt.server +
    //     (this.opt.database? ";Initial Catalog=" + this.opt.database : "")+
    //     (this.opt.useTrustedConnection ?
    //         ";Integrated Security=True" :
    //     ";User Id=" + this.opt.user + ";Password=" + this.opt.pwd + ";Integrated Security=no") +
    //     ";Pooling=false" +
    //     ";Connection Timeout="+this.timeOut+";";
    this.adoString = options.connectionString;
    if (!this.adoString){
        this.adoString =
            "Data Source=" + this.opt.server +
            (this.opt.port ? (":" + this.opt.port) : "") +
            "/" +
            this.opt.database +
            (this.opt.useTrustedConnection ?
                    ";Integrated Security=true" :
                    ";User Id=" + this.opt.user + ";Password=" + this.opt.pwd
            ) +
            (this.opt.dbaPrivilege ? ";DBA Privilege=SYSDBA" : "") +
            ";Pooling=False" +
            ";Connection Timeout=" + this.timeOut + ";";
    }
    /**
     *
     * @type {EdgeConnection}
     */
    this.edgeConnection = new EdgeConnection(this.adoString,'oracle');
}

Connection.prototype = {
    constructor: Connection
};

/**
 * Change current used schema for this connection
 * @method useSchema
 * @param {string} schema
 * @returns {*}
 */
Connection.prototype.useSchema = function (schema) {
    let cmd = 'ALTER SESSION SET CURRENT_SCHEMA=\'' + schema + '\'';  
   const res = this.edgeConnection.queryBatch(cmd),
        that = this;
    res.done(function () {
        that.schema = schema;
    });
    return res.promise();
};

/**
 * Destroy this connection and closes the underlying connection
 * @method destroy
 * @return {Deferred}
 */
Connection.prototype.destroy = function () {
    return this.close();
};

/**
 * Creates a duplicate of this connection
 * @method clone
 * @returns {Connection}
 */
Connection.prototype.clone = function () {
    return new Connection({connectionString: this.connectionString});
};

const lowerCaseKeywords = ["start", "audit", "size"];
/* tables and columns name must be quoted otherwise they are converted to uppercase */
function quoteStringIfNecessary(str){
    if (typeof str !== "string")  {
        return str;
    }


    if (/[a-z]/.test(str)|| lowerCaseKeywords.includes(str.toLowerCase())){
        //has lower cases
        return "\""+str.trim()+"\"";
    }
    return str.trim();
}

function quoteColumnList(col){
    if (typeof col !== "string")  {
        return col;
    }
    return col.split(",").map(s=>quoteStringIfNecessary(s)).join();
}

function quoteOrderBy(col){
    if (typeof col !== "string")  {
        return col;
    }
    return col.split(",").map(s=>{
        let ss = s.split(' ');
        ss[0]= quoteStringIfNecessary(ss[0]);
        return ss.join(' ');
        }
        ).join();
}

function quoteArrayIfLowerCase(arr){
    return arr.map(s=>quoteStringIfNecessary(s));
}

/**
 * Sets the Transaction isolation level for current connection
 * @method setTransactionIsolationLevel
 * @param {string} isolationLevel one of 'READ_COMMITTED','SERIALIZABLE','READ_ONLY' * @returns {promise}
 */
Connection.prototype.setTransactionIsolationLevel = function (isolationLevel) {
    const that = this;
    let res, qry;
    const mappedIsolationLevel = mapIsolationLevels[isolationLevel];
    if (this.isolationLevel === isolationLevel) {
        return Deferred().resolve().promise();
    }
    if (mappedIsolationLevel === undefined) {
        return Deferred().reject(isolationLevel + " is not an allowed isolation level").promise();
    }

    qry = isolationLevel === 'READ_ONLY' ? 'SET TRANSACTION ' : 'SET TRANSACTION ISOLATION LEVEL ';
    res = this.queryBatch(qry + mappedIsolationLevel + ";");
    res.done(function () {
        that.isolationLevel = isolationLevel;
    });
    res.fail(function(err){
        res.reject(err);
    });

    return res.promise();
};


/**
 * Check login/password, returns true if successful, false if user/password does not match
 * @param {string} login
 * @param {string} password
 * @returns {boolean}
 */
Connection.prototype.checkLogin = function (login, password) {
    const opt = _.assign({}, this.opt, {user: login, pwd: password}),
        def = Deferred(),
        testConn = new Connection(opt);
    testConn.open()
        .done(function (res) {
            def.resolve(true);
            testConn.destroy();
        })
        .fail(function (res) {
            def.resolve(false);
        });
    return def.promise();
};


/**
 * Opens the underlying connection and sets the current specified schema
 * @method open
 * @returns {Connection}
 */
Connection.prototype.open = function () {
    const connDef = Deferred(),
        that = this;
    if (this.isOpen) {
        return connDef.resolve(this).promise();
    }
    this.edgeConnection.open()
        .done(function () {
            that.isOpen = true;
            if (that.schema === that.defaultSchema) {
                connDef.resolve(that);
                return;
            }
            that.useSchema(that.schema)
                .done(function () {
                    connDef.resolve(that);
                })
                .fail(function (err) {
                    that.close();
                    connDef.reject('schema fail' + err);
                });
        })
        .fail(function (err) {
            connDef.reject(err);
        });
    return connDef.promise();
};

/**
 * Encloses the sql in a BEGIN - END block and adds the declaration of a cursor internalCur to return the record set/s
 *
 * @private
 * @method encloseInBegin
 * @param {string} query
 * @param {boolean} addCommit when true a COMMIT is put before END
 * @returns {string}
 */
Connection.prototype.encloseInBegin = function(query, addCommit) {
    return 'DECLARE internalCur SYS_REFCURSOR; '+
        'BEGIN '+
         query+
        (addCommit ? ' COMMIT;' : '')+
        ' END;';
}

/**
 * the "edgeQuery" function is written in c#, and executes a series of select.
 * If a callback is specified, data is returned separately as {meta} - {rows} - {meta} - {rows} .. notifications
 * in this case has sense the parameter packetSize to limit the length of rows returned in each {rows} packet
 * If a callback is not specified, data is returned as a series of {meta, rows} notifications
 * A field "set" is also attached to any packet in order to identify the result set
 * if raw==false and a table (array of plain objects) is returned, the "set" field is attached to that array
 */


/**
 * Gets data packets row at a time
 * @method queryPackets
 * @param {string} query
 * @param {boolean} [raw=false]
 * @param {number} [packSize=0]
 * @param {number} [timeout]
 * @returns {*}
 */
Connection.prototype.queryPackets = function (query, raw, packSize, timeout) {
    query = this.encloseInBegin(query, (this.transAnnidationLevel <= 0));
    return this.edgeConnection.queryPackets(query,raw,packSize,timeout);
};



/**
 * Closes the underlying connection
 * @method close
 * @returns {promise}
 */
Connection.prototype.close = function () {
    const def = Deferred(),
        that = this;
    if (this.edgeConnection !== null) {
        return this.edgeConnection.close();
    } else {
        console.log("closing a connection without edgeConnection");
        that.isOpen = false;
        def.resolve();
    }
    return def.promise();
};

/**
 * Begins a  transaction - equivalent to setTransactionIsolationLevel - the transaction is implicity opened in Oracle
 * @method beginTransaction
 * @param {string} isolationLevel 'READ_COMMITTED' or 'SERIALIZABLE'
 * @returns {*}
 */
Connection.prototype.beginTransaction = function (isolationLevel) {
    const that = this;
    if (!this.isOpen) {
        return Deferred().reject("Cannot beginTransaction on a closed connection").promise();
    }
    if (this.transAnnidationLevel > 0) {
        this.transAnnidationLevel += 1;
        return Deferred().resolve().promise();
    }

    return this.setTransactionIsolationLevel(isolationLevel).then(function () {
        that.transAnnidationLevel += 1;
        that.transError = false;
    });
};

/**
 * Commits a transaction
 * @method commit
 * @returns {*}
 */
Connection.prototype.commit = function () {
    const that = this;
    let res;
    if (!this.isOpen) {
        return Deferred().reject("Cannot commit on a closed connection").promise();
    }
    if (this.transAnnidationLevel > 1) {
        this.transAnnidationLevel -= 1;
        return Deferred().resolve().promise();
    }
    if (this.transAnnidationLevel===0){
        return Deferred().reject("Trying to commit but no transaction has been open").promise();
    }
    if (this.transError) {
        return this.rollBack();
    }
    res = this.queryBatch('COMMIT;');
    res.done(function () {
        that.transAnnidationLevel = 0;
        that.isolationLevel = null;
    });
    return res.promise();
};

/**
 * RollBacks a transaction
 * @method rollBack
 * @returns {*}
 */
Connection.prototype.rollBack = function () {
    const that = this;
    let res;
    if (!this.isOpen) {
        return Deferred().reject("Cannot rollback on a closed connection").promise();
    }
    if (this.transAnnidationLevel > 1) {
        this.transAnnidationLevel -= 1;
        this.transError = true;
        return Deferred().resolve().promise();
    }
    if (this.transAnnidationLevel===0){
        return Deferred().reject("Trting to rollBack but no transaction has been open").promise();
    }

    res = this.queryBatch('ROLLBACK;');
    res.done(function () {
        that.transAnnidationLevel = 0;
        that.isolationLevel = null;
    });
    return res.promise();
};

/**
 * Get the string representing a select command
 * @method getSelectCommand
 * @param {object} options
 * @param {string} options.tableName
 * @param {string} options.columns list of columns or expressions, this is taken "as is" to compose the command
 * @param {sqlFun} [options.filter] this is skipped if it is a constantly true condition
 * @param {string} [options.top]
 * @param {string} [options.orderBy]
 * @param {object} [options.environment]
 * @returns {string}
 */
Connection.prototype.getSelectCommand = function (options) {
    let selCmd = 'OPEN internalCur FOR ' +
        'SELECT ' + quoteColumnList(options.columns) + ' FROM ' + quoteStringIfNecessary(options.tableName);
    if (options.filter && !options.filter.isTrue) {
        selCmd += " WHERE " + formatter.conditionToSql(options.filter, options.environment);
    }
    if (options.orderBy) {
        selCmd += " ORDER BY " + quoteOrderBy(options.orderBy);
    }
    if (options.top) {
        selCmd += ' FETCH NEXT ' + options.top + ' ROWS ONLY';
        // Alternative (everything in a sub query): ) WHERE ROWNUM <= options.top
    }
    selCmd += '; DBMS_SQL.RETURN_RESULT(internalCur);';
    return selCmd;
};

/**
 * Get the string representing a select count(*) command
 * @method getSelectCount
 * @param {object} options
 * @param {string} options.tableName
 * @param {sqlFun} [options.filter]
 * @param {object} [options.environment]
 * @returns {string}
 */
Connection.prototype.getSelectCount = function (options) {
    let selCmd = 'OPEN internalCur FOR SELECT COUNT(*) FROM ' + options.tableName;
    if (options.filter) {
        selCmd += " WHERE " + formatter.conditionToSql(options.filter, options.environment);
    }
    selCmd += '; DBMS_SQL.RETURN_RESULT(internalCur);';
    return selCmd;
};

/**
 * Executes a series of sql update/insert/delete commands
 * @method updateBatch
 * @param {string} query
 * @param {number} [timeout]
 * @returns {*}
 */
Connection.prototype.updateBatch = function (query,timeout) {
    const that = this;
    query = this.encloseInBegin(query, (this.transAnnidationLevel <= 0));
    return this.edgeConnection.updateBatch(query, timeout);

};

/**
 * Get the string representing a delete command
 * @method getDeleteCommand
 * @param {object} options
 * @param {string} options.tableName
 * @param {sqlFun} [options.filter]
 * @param {object} [options.environment]
 * @param {int} [errNum]
 * @returns {string}
 */
Connection.prototype.getDeleteCommand = function (options) {
    let /*sqlFun|null*/ filter = options.filter;
    let cmd = 'DELETE FROM ' + quoteStringIfNecessary(options.tableName);
    if (options.filter) {
        cmd += ' WHERE ' + formatter.toSql(options.filter, options.environment);
        if (options.errNum!==undefined){
            cmd += ";"+this.giveErrorNumberDataWasNotWritten(options.errNum);
        }
    } else {
        cmd += ' this command is invalid';
    }
    cmd += ';';
    return cmd;
};

/**
 * Get the string representing an insert command
 * @method getInsertCommand
 * @param {string} table
 * @param {string[]} columns
 * @param {Object[]} values
 * @returns {string}
 */
Connection.prototype.getInsertCommand = function (table, columns, values) {
    return 'INSERT INTO ' + table + '(' + quoteArrayIfLowerCase(columns).join() + ')VALUES(' +
        _.map(values, function (val) {
            return formatter.quote(val, false);
        }).join(',') +
        ');';
};

/**
 * Get the string representing an update command
 * @method getUpdateCommand
 * @param {object} options
 * @param {string} options.table
 * @param {sqlFun} options.filter
 * @param {string[]} options.columns
 * @param {Object[]} options.values
 * @param {object} [options.environment]
 * @param {int} [errNum]
 * @returns {string}
 */
Connection.prototype.getUpdateCommand = function (options) {
    let cmd = 'UPDATE ' + options.table + ' SET ' +
        _.map(_.zip(quoteArrayIfLowerCase(options.columns),
                _.map(options.values, function (val) {
                    return formatter.quote(val, false);
                })),
            function (cv) {
                return cv[0] + '=' + cv[1];
            }).join();
    if (options.filter) {
        cmd += ' WHERE ' + formatter.conditionToSql(options.filter, options.environment);
        if (options.errNum!==undefined){
            cmd += ";"+this.giveErrorNumberDataWasNotWritten(options.errNum);
        }
    }
    cmd += ';';
    return cmd;
};


/**
 * evaluates the sql command to call aSP with a list of parameters each of which is an object having:
 *  value,
 *  optional 'sqltype' name compatible with the used db, necessary if is an output parameter
 *  optional out: true if it is an output parameter
 *  The SP eventually returns a collection of tables and at the end an object with a property for each output parameter
 *  of the SP
 *  declare @s1 smallint;
 *  set @s1=0;
 *  exec check_fin_u_pre @res=@s1 output,@sys_idflowchart=null,@OLD_flag='2',@NEW_flag='2',@NEW_ayear=2021,@NEW_printingorder='04',@NEW_idfin=19468,@sys_esercizio=2021;
 SELECT @s1 AS s1
 * @method callSPWithNamedParams
 * @param {object} options
 * @param {string} options.spName
 * @param {SqlParameter[]} options.paramList
 * @param {boolean} [options.skipSelect]    when true, the select of output parameter is omitted
 * @returns {String}
 */
Connection.prototype.getSqlCallSPWithNamedParams  = function(options){
    let cmd = '';
    const outList = _.map(
        _.filter(options.paramList, {out: true}),
        function (p) {
            return p.varName + ' ' + p.sqltype;
        }
    ).join(',');
    if (outList) {
        cmd = 'DECLARE ' + outList + '; ';
        if (options.skipSelect!==true) { //Declaring the cursor to return the value of the returned param/s
            cmd += 'c1 SYS_REFCURSOR; ';
        }
    }
    cmd += 'BEGIN ';
    cmd += options.spName + '(' +
        _.map(options.paramList, function (p) {
            if (p.name) {
                if (p.out) {
                    return p.name + '=>' + p.varName;
                }
                return p.name + ' => ' + formatter.quote(p.value);
            }
            return formatter.quote(p.value);
        }).join(',');

    cmd += '); ';
    let that=this;
    if (outList && options.skipSelect!==true) {
        cmd += 'OPEN c1 for SELECT ' +
            _.map(
                _.filter(options.paramList, {out: true}),
                function (p) {
                    return p.varName + ' AS "' + that.colNameFromVarName(p.varName)+'"';
                }
            ).join(',') + ' FROM DUAL CONNECT BY level <= 1; ';
        cmd += 'DBMS_SQL.RETURN_RESULT(c1); '; //Returning the param/s returned
    }
    cmd += 'END;';
    return cmd;
};

/**
 * call SP with a list of parameters each of which is an object having:
 *  value,
 *  optional 'sqltype' name compatible with the used db, necessary if is an output parameter
 *  optional out: true if it is an output parameter
 *  The SP eventually returns a collection of tables and at the end an object with a property for each output parameter
 *  of the SP
 * @method callSPWithNamedParams
 * @param {object} options
 * @param {string} options.spName
 * @param {SqlParameter[]} options.paramList
 * @param {boolean} [options.raw=false]
 * @param {number} [options.timeout]
 * @returns  {object[]}[] }
 */
Connection.prototype.callSPWithNamedParams = function (options) {
    const spDef = Deferred(),
        cmd = this.getSqlCallSPWithNamedParams(options);
    var that=this;
    //noinspection JSUnresolvedFunction
    let results=[];
    this.queryBatch(cmd, options.raw,options.timeout)
        .progress(function (result) {
            spDef.notify(result);
            results.push(result);
        })
        .done(function (result) {
            if (_.some(options.paramList,{out:true}) && options.skipSelect!==true) {
                //An object is needed for output row
                const allVar = options.raw ? objectify(result[0].meta, result[0].rows) : result[0];
                _.each(options.paramList, function (p) {
                    if (!p.out){
                        return;
                    }
                    p.outValue = allVar[that.colNameFromVarName(p.varName)];
                });
                //spDef.resolve(options.paramList);
            }
            else {
                results.push(result);
            }
            spDef.resolve(results);

        })
        .fail(function (err) {
            spDef.reject(err);
        });
    return spDef.promise();
};


/**
 * Transforms raw data into plain objects
 * This must be the same as the objectify existing in jsDataAccess
 * @method objectify
 * @param {Array} colNames
 * @param {Array} rows
 * @returns {Array}
 */
function objectify(colNames, rows) {
    //noinspection JSUnresolvedVariable
    if (colNames.meta) {
        //noinspection JSUnresolvedVariable
        return objectify(colNames.meta, colNames.rows);
    }
    return _.map(rows, function (el) {
        const obj = {};
        _.each(colNames, function (value, index) {
            obj[value] = el[index];
        });
        return obj;
    });
}

/**
 * @class TableDescriptor
 * The structure of a table is described with a TableDescriptor.
 * The definition of this structure must match that of dbDescriptor module
 * A TableDescriptor is an object having those properties:
 * {string} xtype:      T for  tables, V for Views
 * {string} name:       table or view name
 * {ColumnDescriptor[]} columns
 *
 */
/**
 * @class ColumnDescriptor
 * An object describing a column of a table. It is required to have the following fields:
 *  {string} name        - field name
 *  {string} type        - db type
 *  {number} max_length  - size of field in bytes
 *  {number} precision   - n. of integer digits managed
 *  {number} scale       - n. of decimal digits
 *  {int} is_nullable - true if it can be null  0/1
 *  {boolean} pk          - true if it is primary key
 */

/**
 * Gets information about a db table
 * @method tableDescriptor
 * @param {string} tableName
 * @returns {TableDescriptor}
 */
Connection.prototype.tableDescriptor = function (tableName) {
    const res = Deferred(),
        that = this;

    this.edgeConnection.queryBatch(
        `select
            1 as "dbo",
            'T' as "xtype",
            c.column_name as "name",
            c.data_type as "type",
            c.char_length as "max_length",
            c.data_precision as "precision",    
            nvl(c.data_scale,0) as "scale",
            decode(c.nullable, 'N', 1, 0) as "is_nullable",
            decode(c.identity_column, 'YES', 1, 0) as "pk"
        from user_tab_columns c, user_tables t
        WHERE c.table_name = t.table_name
            AND
        c.table_name = '${tableName}'
        UNION ALL
        select
            1 as "dbo",
           'V' as "xtype",
           c.column_name as "name",
           c.data_type as "type",
           c.char_length as "max_length",
           c.data_precision as "precision",    
           nvl(c.data_scale,0) as "scale",
           decode(c.nullable, 'N', 1, 0) as "is_nullable",
           decode(c.identity_column, 'YES', 1, 0) as "pk"
        from user_tab_columns c, sys.all_views t
        WHERE c.table_name = t.view_name
            AND
        c.table_name = '${tableName}'`
    ).then(function (result) {
            if (result.length === 0) {
                res.reject('Table named ' + tableName + ' does not exist in ' + that.server + ' - ' + that.database);
                return;
            }
            const isDbo = (result[0].dbo !== 0);
            let xtype = result[0].xtype.trim(); //The query already returns the value we expect: T = table, V = view


            result.forEach(c=>{
                c.ctype = mapping[c.type.toUpperCase()]||CType.unknown;
            });

            _.forEach(result, function (col) {
                delete col.dbo;
                delete col.xtype;
            });
            res.resolve({name: tableName, xtype: xtype, isDbo: isDbo, columns: result});
        },
        function (err) {
            res.reject(err);
        }
    );
    return res.promise();
};

/**
 * get a sql command given by a sequence of specified sql commands
 * N.B.: only adds the new line character in Oracle, the semicolon is expected after every command
 * @method appendCommands
 * @param {string[]} cmd
 * @returns {string}
 */
Connection.prototype.appendCommands = function (cmd) {
    return cmd.join('\r\n');
};


/**
 * Gets a table and returns each SINGLE row by notification. Could eventually return more than a table indeed
 * For each table read emits a {meta:[column descriptors]} notification, and for each row of data emits a
 *   if raw= false: {row:object read from db}
 *   if raw= true: {row: [array of values read from db]}

 * @method queryLines
 * @param {string} query
 * @param {boolean} [raw=false]
 * @param {number} [timeout]
 * @returns {*}
 */
Connection.prototype.queryLines = function (query, raw,timeout) {
    const that = this;
    query = this.encloseInBegin(query, (this.transAnnidationLevel <= 0));
    return this.edgeConnection.queryLines(query,raw,timeout);

};


/**
 * Executes a sql command and returns all sets of results. Each Results is given via a notify or resolve
 * @method queryBatch
 * @param {string} query
 * @param {boolean} [raw] if true, data are left in raw state and will be objectified by the client
 * @param {number} [timeout]
 * @returns {Promise}  a sequence of {[array of plain objects]} or {meta:[column names],rows:[arrays of raw data]}
 */
Connection.prototype.queryBatch = function (query, raw,timeout) {
    const that = this;
    query = this.encloseInBegin(query, (this.transAnnidationLevel <= 0));
    return this.edgeConnection.queryBatch(query,raw,timeout);

};


Connection.prototype.headerForBatches = function () {
    return null;
};
Connection.prototype.footerForBatches = function () {
    return this.giveErrorNumberDataWasNotWritten(-1);
};

/**
 * Returns a command that should return a number if last write operation did not have success
 * @public
 * @method giveErrorNumberDataWasNotWritten
 * @param {number} errNumber
 * @return string
 */
Connection.prototype.giveErrorNumberDataWasNotWritten = function (errNumber) {
    return `IF (COALESCE(SQL%rowcount,0) = 0) THEN
                OPEN internalCur for SELECT ${errNumber} FROM DUAL CONNECT BY level <= 1;
                DBMS_SQL.RETURN_RESULT(internalCur);
            END IF;`;
};

/**
 * get Sql type to contain n bits
 * @method sqlTypeForNBits
 * @param {int} nbits
 * @returns {string}
 */
// TODO: check
Connection.prototype.sqlTypeForNBits = function(nbits){
    if (nbits <= 14) {
        return "short";
    }
    if (nbits <= 30) {
        return "int";
    }
    if (nbits <= 62) {
        return "long";
    }

    return `VARCHAR2(${nbits})`;
};
//
//
// /**
//  * Returns the declaration for a variable that can contain n bits of information, and identified by a number
//  * @param {string} varname
//  * @param {int} nbits
//  */
// Connection.prototype.declareAndClearVariableForNBits = function(varname,nbits){
// /*
//                 string varprefix = EasyAudits.GetSqlParameterVarPrefixForResult(ntotalchecks);
//                 string varname = "@"+varprefix+num_audit.ToString();
//                 string res_type = EasyAudits.GetSqlParameterTypeNameForResult(ntotalchecks);
//                 string resetvar = EasyAudits.GetSqlResetVar(varname, ntotalchecks);
//
//                 string cmd = "declare " + varname + " " + res_type+";";
//                  cmd += resetvar;
//                  return cmd
//  */
//     if (nbits <= 14) {
//         return this.appendCommands(`declare ${varname} smallint`,`set ${varname}=0;`);
//     }
//     if (nbits <= 30) {
//         return this.appendCommands(`declare ${varname} int`,`set ${varname}=0;`);
//     }
//     if (nbits <= 62) {
//         return this.appendCommands(`declare ${varname} bigint`,`set ${varname}=0;`);
//     }
//     return this.appendCommands(`declare ${varname} varchar(${nbits})`,`set ${varname}='';`);
// };

Connection.prototype.namedParameterSupported = function(){
    return true;
};

/**
 * Returns a variable name identified by a number for a variable that can contain n bits of information
 *
 * @param {int} num
 * @param {int} nbits
 */
Connection.prototype.variableNameForNBits = function(num,nbits){
    if (nbits <= 14) {
        return "s"+num;
    }
    if (nbits <= 30) {
        return "i"+num;
    }
    if (nbits <= 62) {
        return "b"+num;
    }
    return "c"+num;
};


/**
 * Returns a command that should return a constant number
 * @public
 * @method giveConstant
 * @param {object} c
 * @return string
 */
Connection.prototype.giveConstant = function (c) {
    let selCmd = " OPEN internalCur FOR SELECT ";
    selCmd += formatter.quote(c);
    selCmd += ' FROM DUAL; '

    selCmd += 'DBMS_SQL.RETURN_RESULT(internalCur);';

    return selCmd;
};


/**
 * Gets the formatter for this kind of connection
 * @method getFormatter
 * @return {sqlFormatter}
 */
Connection.prototype.getFormatter = function () {
    //noinspection JSValidateTypes
    return formatter;
};


/**
 * Gives the column name for a variable name
 * @param {string} varName
 * @return {string}
 */
Connection.prototype.colNameFromVarName = function(varName) {
    return varName.substring(1);
};



/**
 * Get a command to convert a list of variables into a table with a column having a variable for each column
 * @param {Array.<{varName:string,colName:string}>}vars
 * @return {string}
 */
Connection.prototype.getSelectListOfVariables = function(vars) {
    if (vars.length===0){
        return  null;
    }
    let selCmd = " OPEN internalCur FOR SELECT ";
    selCmd += vars.map(c=>c.varName+" AS "+quoteStringIfNecessary(c.colName)).join(", ");
    selCmd += ' FROM DUAL; ';

    selCmd += 'DBMS_SQL.RETURN_RESULT(internalCur);';

    return selCmd;
};



/**
 * Get a command to select a bunch of rows
 * @param options.tableName {string}
 * @param options.columns {string} list of columns or expressions, this is taken "as is" to compose the command
 * @param options.top {int}
 * @param options.filter {sqlFun},
 * @param options.firstRow {int}
 * @param options.orderBy {string},
 * @param options.environment {Context}
 * @return {string}
 */
Connection.prototype.getPagedTableCommand = function(options) {
    if (!options.orderBy || !options.top){
        return Connection.prototype.getSelectCommand(options);
    }

    let internalWhere = '';
    if (options.filter){
        internalWhere = " WHERE "+formatter.conditionToSql(options.filter, options.environment);
    }
    let tabName = quoteStringIfNecessary(options.tableName);
    let cols = quoteColumnList(options.columns);
    return `OPEN internalCur FOR SELECT * FROM (
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY ${quoteOrderBy(options.orderBy)}) as "row_num",
                    ${cols}
                FROM ${tabName + internalWhere}
            ) x
            WHERE "row_num" >= ${options.firstRow} FETCH NEXT ${options.top} ROWS ONLY;
            DBMS_SQL.RETURN_RESULT(internalCur);`;

};




/**
 * Type of value depends on nbits
 * @param {object} value
 * @param {int} nbits
 * return {string}
 */
Connection.prototype.getBitArray = function(value,nbits){
    if (nbits>62){
        return value; //it is already in the desired form of [0|1] sequence
    }
    let result='';
    let n=nbits;
    while(n>0){
        result+=  ((value & 1)!==0)? "1":"0";
        value = value>>1;
        n--;
    }
    return result;
};

/**
* Create a sql parameter
* @param {object} paramValue
* @param {string} paramName
 * @param {string} varName
* @param {string} sqlType
* @param {boolean} forOutput
*/
Connection.prototype.createSqlParameter = function(paramValue,paramName, varName,sqlType, forOutput){
    return new  SqlParameter(paramValue,paramName,varName,sqlType, forOutput);
};




/**
 * Runs a sql script, eventually composed of multiple blocks separed by GO lines
 * @method run
 * @param {string} script
 * @param {number} [timeout]
 * @returns {*}
 */
Connection.prototype.run = function(script,timeout){
    const that = this;
    let result = this.edgeConnection.run(script,timeout);

    return result.then((res) => {
        if (this.transAnnidationLevel === 0){
            return that.edgeConnection.queryBatch('COMMIT');
        }
        else{
            return res;
        }
    });
};

Connection.prototype.mapping= mapping;
Connection.prototype.codedTypes= codedTypes;

module.exports = {
    Connection: Connection,
    cType: CType,
    codedTypes:codedTypes,
    IsolationLevels:mapIsolationLevels,
    objectify:objectify,
    SqlParameter:SqlParameter
};
