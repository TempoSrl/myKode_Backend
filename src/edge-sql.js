/*globals require */

/**
 * @property defer
 * @type {function}
 */
const defer     = require("JQDeferred");
const _         = require('lodash');
const edge = require("edge-js");
const os = require("os");
const isolationLevels=['READ_UNCOMMITTED','READ_COMMITTED','REPEATABLE_READ','SNAPSHOT','SERIALIZABLE'];


module.exports = {
	isolationLevels: isolationLevels,
	objectify: simpleObjectify,
	EdgeConnection: EdgeConnection
};

/**
 * Simplified objectifier having an array of column names for first argument
 * @private
 * @param {Array} colNames
 * @param {Array} rows
 * @returns {Array}
 */
function simpleObjectify(colNames, rows) {
	var colLength = colNames.length,
		rowLength = rows.length,
		result = [],
		rowIndex = rowLength,
		colIndex,
		value,
		row;
	while (--rowIndex >= 0) {
		value = {};
		row = rows[rowIndex];
		colIndex = colLength;
		while (--colIndex >= 0) {
			value[colNames[colIndex]] = row[colIndex];
		}
		result[rowIndex] = value;
	}
	return result;
}

/**
 * Gets a  database connection
 * @param {string} connectionString
 * @param {string} driver  can be sqlServer or mySql
 * @constructor
 */
function EdgeConnection(connectionString, driver) {
	this.sqlCompiler = 'db';
	this.edgeHandler = null;
	this.driver = driver||'mySql';
	this.connectionString = connectionString;
	this.defaultTimeout= 3000;
	//console.log("EdgeConnection.connectionString is "+connectionString);

	this.baseParams = {
		assemblyFile: require('path').join(require.resolve("edge-db"),"..",  'edge-db.dll'),
		typeName:'EdgeCompiler',
		methodName:'CompileFunc'
	};
	//console.log(this.baseParams);
		// {
		// 	assemblyFile: require('path').join(require.resolve("edge-db"),"..",  'QuickStart.Core.dll'),
		// 	typeName:'QuickStart.Core.EdgeCompiler',
		// 	methodName:'CompileFunc'
		// };

}



/**
 * transforms row data into plain objects
 * @method simpleObjectifier
 * @private
 * @param {string[]} colNames
 * @param {object[]}  row
 * @returns {object}
 */
function simpleObjectifier(colNames, row) {
	let obj = {};
	_.each(colNames, function (value, index) {
		obj[value] = row[index];
	});
	return obj;
}


/*


 */

/**
 * Evaluates parameter to connect to database depending on the open/closed state of the connection.
 * If a connection is open, the handle of the open connection is used. Otherwise, a connectionString is provided.
 * @private
 * @returns {*}
 */
EdgeConnection.prototype.getDbConn = function (obj) {
	if (this.edgeHandler !== null) {
		return _.assign(obj,{handler: this.edgeHandler, driver: this.driver});
	}
	return _.assign(obj,{connectionString: this.connectionString, driver: this.driver});
};


/**
 * Opens the physical connection
 * @public
 * @methodo open
 * @returns {promise}  Returns a promise that is resolved when connection is established
 */
EdgeConnection.prototype.open = function () {
	const def = defer(),
	that = this;
	/**
	 * Opens the physical connection
	 * @method edgeOpenInternal
	 * @private
	 * @returns {promise}
	 */
	let edgeOpenInternal= edge.func(this.baseParams);

	try{
		edgeOpenInternal({
			source: 'open',
			connectionString: this.connectionString,
			cmd: 'open',
			driver: this.driver
		}, function (error, result){
			if (error){
				//console.log(error);
				def.reject(error);
				return;
			}
			if (result){
				//console.log("got handler "+result+" for "+that.connectionString);
				that.edgeHandler = result;
				def.resolve();
				return;
			}
			console.log("shouldn't reach here");
			def.reject("shouldn't reach here");
		});
	}
	catch(e){
		def.reject(e);
	}
	return def.promise();
};

/**
 * Closes the phisical connection
 * @method edgeClose
 * @returns {*}
 */
EdgeConnection.prototype.close = function () {
	let def = defer(),
		that = this;

	if (this.edgeHandler===null) {
		def.resolve();
		return def;
	}
	//console.log("closing  handler "+this.edgeHandler+" for "+this.connectionString);
	let	edgeClose = edge.func(this.baseParams);

	edgeClose({
		handler: this.edgeHandler,
		source: 'close',
		cmd: 'close',
		driver: this.driver
	}, function (error) {
		if (error) {
			//console.log("error closing handler "+that.edgeHandler+" for "+that.connectionString+":"+error);
			def.reject(error);
			return;
		}
		//console.log("closed handler "+that.edgeHandler+" for "+that.connectionString);
		that.edgeHandler = null;
		def.resolve();
	});
	return def.promise();
};



let nCommand =0;
/**
 * Executes a sql command and returns all sets of results. Each Results is given via a notify or resolve
 * @method queryBatch
 * @param {string} query
 * @param {boolean} [raw] if true, data are left in raw state and will be objectified by the client
 * @param {int} [timeout=  this.defaultTimeout]
 * @returns {Promise}  a sequence of {[array of plain objects]} or {meta:[column names],rows:[arrays of raw data]}
 */
EdgeConnection.prototype.queryBatch = function (query, raw, timeout) {
	let edgeQuery = edge.func(this.baseParams),
		def = defer();
	//nextTick is necessary in order to run the sql function asynchronously, otherwise, cause of edge-js
	//  and mysql blocking nature, it starts notifying tables before the promise is actually returned
	//   causing data to be loss

	let that=this;
	process.nextTick(function () {
		//console.log("queryBatch "+query);
		nCommand++;
		let cc = nCommand;
		// if (that.edgeHandler === null) {
		// 	console.log("executing command  " + cc + "(" + that.edgeHandler + "):" + query);
		// }
		edgeQuery(that.getDbConn({source: query,
			timeout:timeout||that.defaultTimeout
			}), function (error, result) {
			// console.log("receiving result  "+cc+"("+that.edgeHandler+")");
			// console.log(result);
			if (error) {
				def.reject(error + ' running ' + query);
				return def.promise();
			}
			if (typeof result ==='object' && typeof  result.error === 'string'){
				def.reject(result.error + ' running ' + query);
				return def.promise();
			}
			let i;
			for (i = 0; i < result.length - 1; i++) {
				if (raw) {
					def.notify(result[i]);
				}
				else {
					def.notify(simpleObjectify(result[i].meta, result[i].rows));
				}
			}
			if (raw) {
				def.resolve(result[i]);
			}
			else {
				def.resolve(simpleObjectify(result[i].meta, result[i].rows));
			}
		});
	});

	return def.promise();
};



/**
 * Executes a series of sql update/insert/delete commands
 * @method updateBatch
 * @param {string} query
 * @param {int} [timeout=  this.defaultTimeout]
 * @returns {*}
 */
EdgeConnection.prototype.updateBatch = function (query,timeout) {
	let  edge      = require('edge-js'),
		edgeQuery = edge.func(this.baseParams),
		def = defer();
	edgeQuery(this.getDbConn({source: query,
		cmd: 'nonquery',
		timeout:timeout||this.defaultTimeout
	}), function (error, result) {
		if (error) {
			def.reject(error);
			return;
		}
		def.resolve(result);
	});
	return def.promise();
};




/**
 * Gets a table and returns each SINGLE row by notification. Could eventually return more than a table indeed
 * For each table read emits a {meta:[column descriptors]} notification, and for each row of data emits a
 *   if raw= false: {row:object read from db}
 *   if raw= true: {row: [array of values read from db]}

 * @method queryLines
 * @param {string} query
 * @param {boolean} [raw=false]
 * @param {number} [timeout=this.defaultTimeout]
 * @returns {*}
 */
EdgeConnection.prototype.queryLines = function (query, raw,timeout) {
	let def = defer(),
		lastMeta,
		callback = function (data, extCallback) {
			if (data.resolve) {
				def.resolve();
				return {};
			}
			if (data.meta){
				lastMeta = data.meta;
				if (!data.rows) def.notify(data);
			}
			if (data.error) {
				def.reject(data.error + ' running ' + query);
				return;
			}
			if (data.rows) {
				if (raw) {
					def.notify({row: data.rows[0]});
				} else {
					def.notify({row: simpleObjectifier(lastMeta, data.rows[0])});
				}
			}

			if (extCallback)extCallback();
			return {};
		},
		edgeQuery = edge.func(this.baseParams);
	let that = this;

	process.nextTick(function() {
		//console.log("queryLines "+query);
		edgeQuery(that.getDbConn({source: query,
			packetSize: 1,
			callback:callback,
			timeout:timeout||that.defaultTimeout}),

			function (error, result) {
				if (error) {
					def.reject(error + ' running ' + query);
					return;
				}
				return {};
			}

		);
	});
	return def.promise();
};



/**
 * the "edgeQuery" function is written in c#, and executes a series of select.
 * If a callback is specified, data is returned separately as {meta} - {rows} - {meta} - {rows} .. notifications
 * in this case has sense the parameter packetSize to limit the number of rows returned in each {rows} packet
 * If a callback is not specified, data is returned as a series of {meta, rows} notifications
 * A field "set" is also attached to any packet in order to identify the result set
 * if raw==false and a table (array of plain objects) is returned, the "set" field is attached to that array
 */


/**
 * Gets data packets row at a time
 * @public
 * @method queryPackets
 * @param {string} query
 * @param {boolean} [raw=false]
 * @param {number} [packSize=0]
 * @param {number} [timeout=this.defaultTimeout]
 * @returns {*}
 */
EdgeConnection.prototype.queryPackets = function (query, raw, packSize, timeout) {
	let def = defer(),
		packetSize = packSize || 0,
		lastMeta,
		currentSet = -1,
		callback = function (data, extCallback) {
			if (data.error) {
				//console.log("got error "+data.error+" running "+query);
				def.reject(new Error(data.error+" running "+query));
				return {};
			}
			if (data.resolve) {
				def.resolve();
				return {};
			}
			//meta is received for any new table, eventually with data
			if (data.meta) {
				currentSet += 1;
			}
			data.set = currentSet;
			if (raw) {
				def.notify(data);
			}
			else {
				if (data.meta) { //meta when present is a list of column names
					lastMeta = data.meta;

				}
				if (data.rows) {
					def.notify({rows: simpleObjectify(lastMeta, data.rows), set: currentSet});
				}
			}
			if (extCallback) extCallback();
			return {};
		};
	let that = this;
	//nextTick is necessary in order to run the sql function asynchronously, otherwise, cause of edge-js
	//  and mysql blocking nature, it starts notifying tables before the promise is actually returned
	//   causing data to be loss
	process.nextTick(function () {
		let edgeQuery = edge.func(that.baseParams);

		edgeQuery(that.getDbConn({source: query,
				callback: callback,
			timeout:timeout||that.defaultTimeout,
			packetSize: packetSize
		},
			function (error){
				if (error){
					//console.log("error "+error+" running "+query);
					def.reject(error + ' running ' + query);
					return def.promise();
				}
			}
			//def.resolve();
		));
	});
	return def.promise();
};



/**
 * Runs a sql script, eventually composed of multiple blocks separed by GO lines
 * @public
 * @method run
 * @param {string} script
 * @param {number} [timeout=this.defaultTimeout]
 * @returns {*}
 */
EdgeConnection.prototype.run = function (script,timeout) {
	//console.log("running script:\n"+script);
	let os = require('os'),
		//noinspection JSUnresolvedVariable
		lines = script.split(os.EOL),
		blocks = [],
		curr = '',
		first = true,
		that = this,
		i,
		s;
	for (i = 0; i < lines.length; i++) {
		s = lines[i];
		if (s.trim().toUpperCase() === 'GO') {
			blocks.push(curr);
			curr = '';
			first = true;
			continue;
		}
		if (!first) {
			//noinspection JSUnresolvedVariable
			curr += os.EOL;
		}
		curr += s;
		first = false;
	}
	if (curr.trim() !== '') {
		blocks.push(curr);
	}


	let def = defer(),
		index = 0;

	let lastBlock='none';
	function loopScript() {
		if (index === blocks.length) {
			def.resolve();
		} else {
			//console.log('running block:'+blocks[index]);
			lastBlock = blocks[index];
			that.updateBatch(blocks[index],timeout||that.defaultTimeout)
			.done(function () {
				index += 1;
				loopScript();
			})
			.fail(function (err) {
				console.log(err+" running "+lastBlock);
				def.reject(err);
			});
		}
	}


	loopScript();

	return def.promise();
};

