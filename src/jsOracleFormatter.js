/*global Environment,global,define,sqlFun */
/*jslint nomen: true*/
const _ = require('lodash');


/**
 * Class to be used with jsDataQuery in order to format expression for Oracle database
 */

        /**
         * provides formatting facilities for Oracle query creation
         * @module sqlFormatter
         */

        /**
         * provides formatting facilities for Oracle query creation
         * @class sqlFormatter
         */
        var $sqlf = {};


        /**
         * Check if obj is null or undefined
         * @private
         * @method isNullOrUndefined
         * @param obj
         * @returns {boolean}
         */
        function isNullOrUndefined(obj) {
            return _.isUndefined(obj) || _.isNull(obj);
        }

        /**
         * Check if obj is not a real condition, giving true if it is null, undefined or empty string
         * @method isEmptyCondition
         * @param {string|sqlFun} cond
         * @returns {boolean}
         */
        function isEmptyCondition(cond) {
            return _.isUndefined(cond) || _.isNull(cond) || cond === '';
        }


        function leftPad(s, n, filler) {
            var o = s.toString();
            while (o.length < n) {
                o = filler + o;
            }
            return o;
        }

        /**
         * Gives the sql string representation of an object
         * @method quote
         * @public
         * @param v {object} literal constant
         * @param [noSurroundQuotes] if true strings are not surrounded with quotes
         * @returns {string}
         */
        function quote(v, noSurroundQuotes) {
            //should differentiate basing on v type (string / number / date /boolean)
            if (_.isString(v)) {
                if (noSurroundQuotes) {
                    return v.replace(/'/g, "''");
                }
                return "'" + v.replace(/'/g, "''") + "'";
            }
            if (_.isNumber(v)) {
                return v.toString();
            }
            if (_.isBoolean(v)) {
                return v.toString();
            }
            if (_.isDate(v)) {
                if (v.getHours() === 0 && v.getMinutes() === 0 && v.getSeconds() === 0 && v.getMilliseconds() === 0) {
                    return "TO_DATE('" +
                        leftPad(v.getDate(), 2, '0') + '-' +
                        leftPad(v.getMonth() + 1, 2, '0') + '-' + //javascripts counts months starting from 0!!!
                        leftPad(v.getFullYear(), 4, '0')
                        + "', 'DD-MM-YYYY')";
                }

                return "TO_TIMESTAMP('" +
                    leftPad(v.getDate(), 2, '0') + '-' +
                    leftPad(v.getMonth() + 1, 2, '0') + '-' + //javascripts counts months starting from 0!!!
                    leftPad(v.getFullYear(), 4, '0') + '-' +
                    leftPad(v.getHours(), 2, '0') + ':' +
                    leftPad(v.getMinutes(), 2, '0') + ':' +
                    leftPad(v.getSeconds(), 2, '0') +
                    leftPad(v.getMilliseconds(), 3, '0')+
                    "', 'DD-MM-YYYY HH24:MI:SSFF3')";
            }
            if (isNullOrUndefined(v)) {
                return 'null';
            }
            return v.toString();
        }

        /**
         * Converts a function into a sql expression. The result is meant to be used as conditional expression in
         *  sql WHERE clauses. Usually you will not use this function, but instead you will use the toSql method of
         *  dataquery objects. This can be used to manage slightly more generic objects like null values,
         *  undefined, arrays. Arrays are converted into lists.
         * @method toSql
         * @public
         * @param {sqlFun|Array|object|null|undefined} v  function to be converted
         * @param {Environment} context  context into which the expression has to be evaluated
         * @return {string}
         * @example eq('a',1) is converted into 'a=1'
         *  eq('a','1') is converted into 'a=\'1\'' i.e. strings are quoted when evaluated
         *  [1,2,3] is converted into (1,2,3)
         */
        function toSql(v, context) {
            if (isNullOrUndefined(v)) {
                return 'null';
            }
            if (v.toSql) {
                return v.toSql($sqlf, context);
            }
            if (_.isArray(v)) {
                return '(' +
                    _.map(v, function (el) {
                        return toSql(el, context);
                    }).join(',') + ')';
            }
            return quote(v);
        }

        /**
         * Get the string filter from a sqlFunction
         * @method conditionToSql
         * @public
         * @param {sqlFun|string|null|undefined} cond
         * @param {Environment} context
         * @return {string}
         */
        function conditionToSql(cond, context) {
            if (isEmptyCondition(cond)) {
                return null;
            }
            if (cond.toSql) {
                return cond.toSql($sqlf, context);
            }
            if (_.isString(cond)) {
                return cond;
            }
            throw 'Illegal parameter passed to conditionToSql:' + JSON.stringify(cond);
        }

        /**
         * Surround expression in parenthesis
         * @method doPar
         * @public
         * @param {string} expr
         * @returns {string}
         */
        function doPar(expr) {
            return "(" + expr + ")";
        }
        $sqlf.doPar = doPar;

        /**
         * get the 'is null' condition over object o
         * @method isNull
         * @public
         * @param {sqlFun|Array|object|null|undefined} o
         * @param {Environment} context
         * @returns {string}
         * @example isnull('f') would be converted as 'f is null'
         */
        $sqlf.isNull = function (o, context) {
            return doPar(toSql(o, context) + " IS NULL");
        };

        /**
         * get the 'is not null' condition over object o
         * @method isNotNull
         * @public
         * @param {sqlFun|Array|object|null|undefined} o
         * @param {Environment} context
         * @returns {string}
         * @example isNotnull('f') would be converted as 'f is not null'
         */
        $sqlf.isNotNull = function (o, context) {
            return doPar(toSql(o, context) + " IS NOT NULL");
        };

        /**
         * gets the field name eventually prefixed by an alias table name
         * @param {string} field
         * @param {string} [alias]
         * @returns {string}
         * @example field('id','customer') would be converted into 'customer.id',
         *  while field('id') would be converted into 'id'
         */
        $sqlf.field = function (field, alias) {
            if (alias) {
                return alias + '.' + quoteStringIfLowerCase(field);
            }
            return quoteStringIfLowerCase(field);
        };

        /* tables and columns name must be quoted otherwise they are converted to uppercase */
        function quoteStringIfLowerCase(str){
            if (typeof str !== "string")  {
                return str;
            }
            if (/[a-z]/.test(str)){
                //has lower cases
                return "\""+str.trim()+"\"";
            }
            return str.trim();
        }
        /**
         * gets the 'object are equal' representation for the db
         * @method eq
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.eq = function (a, b, context) {
            return doPar(toSql(a, context) + "=" + toSql(b, context));
        };


        /**
         * gets the 'object are not equal' representation for the db
         * @method ne
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.ne = function (a, b, context) {
            return doPar(toSql(a, context) + "<>" + toSql(b, context));
        };

        /**
         * gets the 'a > b' representation for the db
         * @method gt
         * @public
         * @param {sqlFun|object|null|undefined} a
         * @param {sqlFun|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         * @example gt('a','b') would be converted into 'a>b'
         */
        $sqlf.gt = function (a, b, context) {
            return doPar(toSql(a, context) + ">" + toSql(b, context));
        };

        /**
         * gets the aggregates of mimimum value
         * @method min
         * @public
         * @param {sqlFun|Array|object|null|undefined} expr
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.min = function (expr, context) {
            return 'MIN' + doPar(toSql(expr, context));
        };

        /**
         * gets the aggregates of max value
         * @method max
         * @public
         * @param {sqlFun|Array|object|null|undefined} expr
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.max = function (expr, context) {
            return 'MAX' + doPar(toSql(expr, context));
        };

//see http://msdn.microsoft.com/it-it/library/ms187748.aspx for details
        /**
         * gets a substring from the expression
         * @method substring
         * @public
         * @param {sqlFun|Array|object|null|undefined} expr
         * @param {number} start
         * @param {number} len
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.substring = function (expr, start, len, context) {
            return 'SUBSTR' + doPar(toSql([expr, start, len], context));
        };
        /**
         * returns the  first object of the array that is not null
         * @public
         * @param {object[]} arr
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.coalesce = function (arr,context) {
            return 'COALESCE' + doPar(toSql(arr, context));
        };

        /**
         * Convert an expression into integer
         * @method convertToInt
         * @public
         * @param {sqlFun|Array|object|null|undefined} expr
         * @param {Environment} context
         * @return {string}
         */
        $sqlf.convertToInt = function (expr, context) {
            return 'CONVERT(int,' + toSql(expr, context) + ')';
        };

        /**
         * Convert an expression into integer
         * @method convertToString
         * @param {sqlFun|string|null|undefined} expr
         * @param {number} maxLen
         * @param {Environment} context
         * @return {string}
         */
        $sqlf.convertToString = function (expr, maxLen, context) {
            return 'CONVERT(varchar(' + maxLen + '),' + toSql(expr, context) + ')';
        };

        /**
         * gets the 'a >= b' representation for the db
         * @method ge
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         * @example ge('a','b') would be converted into 'a>=b'
         */
        $sqlf.ge = function (a, b, context) {
            return doPar(toSql(a, context) + ">=" + toSql(b, context));
        };

        /**
         * gets the 'a < b' representation for the db
         * @method lt
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         * @example lt('a','b') would be converted into 'a<b'
         */
        $sqlf.lt = function (a, b, context) {
            return doPar(toSql(a, context) + "<" + toSql(b, context));
        };

        /**
         * gets the 'a <= b' representation for the db
         * @method le
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         * @example le('a','b') would be converted into 'a<=b'
         */
        $sqlf.le = function (a, b, context) {
            return doPar(toSql(a, context) + "<=" + toSql(b, context));
        };


        /**
         * gets the 'test if Nth bit is set' representation for the db
         * @method bitSet
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         * @example bitSet('a','3') would be converted into '(a&(1<<3))<>0'
         */
        $sqlf.bitSet = function (a, b, context) {
            return "((" + toSql(a, context) + "&(1<<" + toSql(b, context) + "))<>0";
        };


        /**
         * gets the 'test if Nth bit is not set' representation for the db
         * @method bitClear
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {sqlFun|Array|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         * @example bitClear('a','3') would be converted into '(a&(1<<3))=0'
         */
        $sqlf.bitClear = function (a, b, context) {
            return "((" + toSql(a, context) + "&(1<<" + toSql(b, context) + "))=0";
        };


        /**
         * gets the 'not expression' representation for the db
         * @method not
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {Environment} context
         * @returns {string}
         * @example not('a') would be converted into 'not(a)'
         */
        $sqlf.not = function (a, context) {
            return "NOT" + doPar(toSql(a, context));
        };


        /**
         * gets the 'minus expression' representation for the db
         * @method minus
         * @param {sqlFun|Array|object|null|undefined} a
         * @param {Environment} context
         * @returns {string}
         * @example -('a') would be converted into '-a'
         */
        $sqlf.minus = function (a, context) {
            return "-" + doPar(toSql(a, context));
        };


        /**
         * gets the result of boolean "and" between an array of condition
         * @method joinAnd
         * @param {string[]} arr
         * @returns {string}
         * @example joinAnd(['a','b','c']) would give 'a and b and c'
         */
        $sqlf.joinAnd = function (arr) {
            return doPar(_.filter(arr, function (cond) {
                return !isEmptyCondition(cond);
            }).
                join(" AND "));
        };

        /**
         * gets the result of boolean "or" between an array of condition
         * @method joinOr
         * @param {string[]} arr
         * @returns {string}
         * @example joinOr(['a','b','c']) would give 'a or b or c'
         */
        $sqlf.joinOr = function (arr) {
            return doPar(_.filter(arr, function (cond) {
                return !isEmptyCondition(cond);
            })
                .join(" OR "));
        };


        /**
         * gets the result of the sum of an array of expression
         * @method add
         * @param {Array.<sqlFun|Array|object|null|undefined>} arr
         * @param {Environment} context
         * @returns {string}
         * @example add(['a','b','c']) would give 'a+b+c'
         */
        $sqlf.add = function (arr, context) {
            return doPar(_.map(arr, function (a) {
                return toSql(a, context);
            }).join("+"));
        };

        /**
         * gets the result of the multiply of an array of expression
         * @method mul
         * @param {Array.<sqlFun|Array|object|null|undefined> } arr
         * @param {Environment} context
         * @returns {string}
         * @example mul(['a','b','c']) would give 'a*b*c'
         */
        $sqlf.mul = function (arr, context) {
            return doPar(_.map(arr, function (a) {
                return toSql(a, context);
            }).join("*"));
        };

        /**
         * gets the result of the sum of an array of expression
         * @method concat
         * @param {Array.<sqlFun|Array|object|null|undefined>} arr
         * @param {Environment} context
         * @returns {string}
         * @example add(['a','b','c']) would give 'a+b+c'
         */
        $sqlf.concat = function (arr, context) {
            return doPar(_.map(arr, function (a) {
                return toSql(a, context);
            }).join("+"));
        };

        /**
         * gets the expression a-b
         * @method sub
         * @param {sqlFun|object|null|undefined} a
         * @param {sqlFun|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.sub = function (a, b, context) {
            return doPar([toSql(a, context), toSql(b, context)].join("-"));
        };


        /**
         * gets the expression a/b
         * @method div
         * @param {sqlFun|object|null|undefined} a
         * @param {sqlFun|object|null|undefined} b
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.div = function (a, b, context) {
            return doPar([toSql(a, context), toSql(b, context)].join("/"));
        };

        /**
         * gets the expression sum(expr)
         * @method sum
         * @param {sqlFun|object|null|undefined} expr
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.sum = function (expr, context) {
            return 'SUM' + doPar(toSql(expr, context));
        };

        /**
         * gets the expression distinct expr1, expr2,..
         * @method sum
         * @param {Array.<sqlFun|object|null|undefined>} exprList
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.distinct = function (exprList, context) {
            return 'DISTINCT ' + _.map(exprList, function (expr) {
                    return toSql(expr, context);
                }).join(',');
        };

        /**
         * gets the 'elements belongs to list' sql condition
         * @method isIn
         * @param {sqlFun|object|null|undefined} expr
         * @param {Array.<sqlFun|object|null|undefined>} list
         * @param {Environment} context
         * @returns {string}
         * @example isIn('el',[1,2,3,4]) would be compiled into 'el in (1,2,3,4)'
         */
        $sqlf.isIn = function (expr, list, context) {
            return doPar(toSql(expr, context) + " IN " + toSql(list, context));
        };


        /**
         * get the '(expr (bitwise and) testMask) equal to val ' sql condition
         * @method testMask
         * @public
         * @param {sqlFun|object|null|undefined} expr
         * @param {sqlFun|object|null|undefined} mask
         * @param {sqlFun|object|null|undefined} val
         * @param {Environment} context
         * @returns {string}
         * @example testMask('a',5,1) would give '(a &  5) = 1'
         */
        $sqlf.testMask = function (expr, mask, val, context) {
            return doPar(doPar(toSql(expr, context) + ' & ' + toSql(mask, context)) + '=' + toSql(val, context));
        };

        /**
         * get the 'expr between min and max' sql condition
         * @method between
         * @public
         * @param {sqlFun|object|null|undefined} expr
         * @param {sqlFun|object|null|undefined} min
         * @param {sqlFun|object|null|undefined} max
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.between = function (expr, min, max, context) {
            return doPar(toSql(expr, context) + ' BETWEEN ' + toSql(min, context) + ' AND ' + toSql(max, context));
        };

        /**
         * gets the 'expression like mask' sql condition
         * @method like
         * @param {sqlFun|object|null|undefined} expr
         * @param {sqlFun|object|null|undefined} mask
         * @param {Environment} context
         * @returns {string}
         */
        $sqlf.like = function (expr, mask, context) {
            return doPar(toSql(expr, context) + ' LIKE ' + toSql(mask, context));
        };

        $sqlf.toSql = toSql;
        $sqlf.quote = quote;
        $sqlf.conditionToSql = conditionToSql;
        $sqlf.isEmptyCondition = isEmptyCondition;

        const charTypes = { 
            'text': true,
            'ntext': true,
            'varchar': true,
            'char': true,
            'nvarchar': true,
            'nchar': true,
            'sysname': true
        };

        const intTypes = {
            'tinyint': true,
            'smallint': true,
            'int': true,
            'bigint': true
        };

        const floatTypes = {
            'real': true,
            'money': true,
            'float': true,
            'decimal': true,
            'numeric': true,
            'smallmoney': true
        };


        /**
         * Get object from a string, assuming that the strings represents a given sql type
         * @method getObject
         * @param {string} s
         * @param {string} sqlType, one of the db specific allowed
         * @return {object}
         **/
        function getObject(s, sqlType) {
            if (charTypes[sqlType]) {
                return s;
            }
            if (intTypes[sqlType]) {
                return parseInt(s, 10);
            }
            if (floatTypes[sqlType]) {
                return parseFloat(s);
            }
            //TODO : date time management
            return s;
        }

        $sqlf.getObject = getObject;


module.exports = {
    jsOracleFormatter: $sqlf
};
