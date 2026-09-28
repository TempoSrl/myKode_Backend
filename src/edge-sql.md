## Classes

<dl>
<dt><a href="#EdgeConnection">EdgeConnection</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#defer">defer</a> : <code>function</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#edgeClose">edgeClose()</a> ⇒ <code>*</code></dt>
<dd><p>Closes the phisical connection</p>
</dd>
<dt><a href="#queryBatch">queryBatch(query, [raw], [timeout])</a> ⇒ <code><a href="#defer">defer</a></code></dt>
<dd><p>Executes a sql command and returns all sets of results. Each Results is given via a notify or resolve</p>
</dd>
<dt><a href="#updateBatch">updateBatch(query, [timeout])</a> ⇒ <code>*</code></dt>
<dd><p>Executes a series of sql update/insert/delete commands</p>
</dd>
<dt><a href="#queryLines">queryLines(query, [raw], [timeout])</a> ⇒ <code>*</code></dt>
<dd><p>Gets a table and returns each SINGLE row by notification. Could eventually return more than a table indeed
For each table read emits a {meta:[column descriptors]} notification, and for each row of data emits a
  if raw= false: {row:object read from db}
  if raw= true: {row: [array of values read from db]}</p>
</dd>
<dt><a href="#queryPackets">queryPackets(query, [raw], [packSize], [timeout])</a> ⇒ <code>*</code></dt>
<dd><p>Gets data packets one row at a time</p>
</dd>
<dt><a href="#run">run(script, [timeout])</a> ⇒ <code>*</code></dt>
<dd><p>Runs a sql script, eventually composed of multiple blocks separated by GO lines</p>
</dd>
</dl>

<a name="EdgeConnection"></a>

## EdgeConnection
**Kind**: global class  

* [EdgeConnection](#EdgeConnection)
    * [new EdgeConnection(connectionString, driver)](#new_EdgeConnection_new)
    * [.open()](#EdgeConnection+open) ⇒ <code>promise</code>

<a name="new_EdgeConnection_new"></a>

### new EdgeConnection(connectionString, driver)
Gets a  database connection


| Param | Type | Description |
| --- | --- | --- |
| connectionString | <code>string</code> |  |
| driver | <code>string</code> | can be sqlServer or mySql |

<a name="EdgeConnection+open"></a>

### edgeConnection.open() ⇒ <code>promise</code>
Opens the physical connection

**Kind**: instance method of [<code>EdgeConnection</code>](#EdgeConnection)  
**Returns**: <code>promise</code> - Returns a promise that is resolved when connection is established  
**Access**: public  
**Methodo**: open  
<a name="defer"></a>

## defer : <code>function</code>
**Kind**: global constant  
**Properties**

| Name |
| --- |
| defer | 

<a name="edgeClose"></a>

## edgeClose() ⇒ <code>\*</code>
Closes the phisical connection

**Kind**: global function  
<a name="queryBatch"></a>

## queryBatch(query, [raw], [timeout]) ⇒ [<code>defer</code>](#defer)
Executes a sql command and returns all sets of results. Each Results is given via a notify or resolve

**Kind**: global function  
**Returns**: [<code>defer</code>](#defer) - a sequence of {[array of plain objects]} or {meta:[column names],rows:[arrays of raw data]}  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| query | <code>string</code> |  |  |
| [raw] | <code>boolean</code> |  | if true, data are left in raw state and will be objectified by the client |
| [timeout] | <code>int</code> | <code>this.defaultTimeout</code> |  |

<a name="updateBatch"></a>

## updateBatch(query, [timeout]) ⇒ <code>\*</code>
Executes a series of sql update/insert/delete commands

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| query | <code>string</code> |  | 
| [timeout] | <code>int</code> | <code>this.defaultTimeout</code> | 

<a name="queryLines"></a>

## queryLines(query, [raw], [timeout]) ⇒ <code>\*</code>
Gets a table and returns each SINGLE row by notification. Could eventually return more than a table indeedFor each table read emits a {meta:[column descriptors]} notification, and for each row of data emits a  if raw= false: {row:object read from db}  if raw= true: {row: [array of values read from db]}

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| query | <code>string</code> |  | 
| [raw] | <code>boolean</code> | <code>false</code> | 
| [timeout] | <code>number</code> | <code>this.defaultTimeout</code> | 

<a name="queryPackets"></a>

## queryPackets(query, [raw], [packSize], [timeout]) ⇒ <code>\*</code>
Gets data packets row at a time

**Kind**: global function  
**Access**: public  

| Param | Type | Default |
| --- | --- | --- |
| query | <code>string</code> |  | 
| [raw] | <code>boolean</code> | <code>false</code> | 
| [packSize] | <code>number</code> | <code>0</code> | 
| [timeout] | <code>number</code> | <code>this.defaultTimeout</code> | 

<a name="run"></a>

## run(script, [timeout]) ⇒ <code>\*</code>
Runs a sql script, eventually composed of multiple blocks separed by GO lines

**Kind**: global function  
**Access**: public  

| Param | Type | Default |
| --- | --- | --- |
| script | <code>string</code> |  | 
| [timeout] | <code>number</code> | <code>this.defaultTimeout</code> | 

