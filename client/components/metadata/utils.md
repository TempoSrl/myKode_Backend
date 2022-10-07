<a name="module_Utils"></a>

## Utils
Collection of utility functions


* [Utils](#module_Utils)
    * [~callOptAsync(fn)](#module_Utils..callOptAsync) ⇒ <code>Deferred</code>
    * [~optionalDeferred(condition, func, defaultValue)](#module_Utils..optionalDeferred) ⇒ <code>Deferred</code>
    * [~skipRun(func)](#module_Utils..skipRun) ⇒ <code>Deferred</code>
    * [~optBind(fun, obj, args)](#module_Utils..optBind) ⇒ <code>function</code>
    * [~fConst(k)](#module_Utils..fConst)
    * [~sequence(thisObject, funArgs)](#module_Utils..sequence) ⇒ <code>function</code>
    * [~_if(condition)](#module_Utils.._if) ⇒ <code>IfThenElse</code>
    * [~_then(then_clause)](#module_Utils.._then) ⇒ <code>IfThenElse</code>
    * [~_else(else_clause)](#module_Utils.._else) ⇒ <code>Deferred</code>
    * [~run()](#module_Utils..run) ⇒ <code>Deferred</code>
    * [~thenSequence()](#module_Utils..thenSequence) ⇒ <code>Deferred</code>
    * [~filterArrayOnField(arr, field)](#module_Utils..filterArrayOnField) ⇒ <code>Array.&lt;object&gt;</code>
    * [~asDeferred(expression)](#module_Utils..asDeferred) ⇒ <code>Deferred</code>

<a name="module_Utils..callOptAsync"></a>

### Utils~callOptAsync(fn) ⇒ <code>Deferred</code>
ASYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

<a name="module_Utils..optionalDeferred"></a>

### Utils~optionalDeferred(condition, func, defaultValue) ⇒ <code>Deferred</code>
ASYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| condition | <code>boolean</code> | 
| func | <code>function</code> | 
| defaultValue | <code>object</code> | 

<a name="module_Utils..skipRun"></a>

### Utils~skipRun(func) ⇒ <code>Deferred</code>
ASYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| func | <code>function</code> | 

<a name="module_Utils..optBind"></a>

### Utils~optBind(fun, obj, args) ⇒ <code>function</code>
SYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fun | <code>function</code> | function to bind |
| obj | <code>object</code> | object to use as "this" |
| args | <code>object</code> | optional arguments |

<a name="module_Utils..fConst"></a>

### Utils~fConst(k)
SYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| k | <code>type</code> | 

<a name="module_Utils..sequence"></a>

### Utils~sequence(thisObject, funArgs) ⇒ <code>function</code>
SYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| thisObject | <code>object</code> | 
| funArgs | <code>Array.&lt;object&gt;</code> | 

<a name="module_Utils.._if"></a>

### Utils~\_if(condition) ⇒ <code>IfThenElse</code>
ASYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>IfThenElse</code> - {_if: function, _then:function, _else:function,run:function  }  
**Access**: public  

| Param | Type |
| --- | --- |
| condition | <code>boolean</code> | 

<a name="module_Utils.._then"></a>

### Utils~\_then(then_clause) ⇒ <code>IfThenElse</code>
**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| then_clause | <code>function</code> | 

<a name="module_Utils.._else"></a>

### Utils~\_else(else_clause) ⇒ <code>Deferred</code>
**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| else_clause | <code>function</code> | 

<a name="module_Utils..run"></a>

### Utils~run() ⇒ <code>Deferred</code>
**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
<a name="module_Utils..thenSequence"></a>

### Utils~thenSequence() ⇒ <code>Deferred</code>
ASYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| allDeferred.It | <code>Array.&lt;function()&gt;</code> | is an array of function that must be return a deferred |

<a name="module_Utils..filterArrayOnField"></a>

### Utils~filterArrayOnField(arr, field) ⇒ <code>Array.&lt;object&gt;</code>
SYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| arr | <code>Array.&lt;object&gt;</code> | 
| field | <code>string</code> | 

<a name="module_Utils..asDeferred"></a>

### Utils~asDeferred(expression) ⇒ <code>Deferred</code>
ASYNC

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Access**: public  

| Param | Type |
| --- | --- |
| expression | <code>function</code> | 
