/*globals BigInt */

const q = require('./../client/components/metadata/jsDataQuery').jsDataQuery;
const BusinessLogic = require("./jsBusinessLogic").BusinessLogic;
const jsDataSet = require('./../client/components/metadata/jsDataSet'),
    DataTable = jsDataSet.DataTable,
    DataSet = jsDataSet.DataSet,
    Parser = require("./jsStringParser"),
    PostData = require("./jsPostData").PostData,
    Deferred = require("JQDeferred"),
    rowState = jsDataSet.dataRowState; //detached, deleted, added, unchanged, modified



/**
 * Removes select part of the query
 * @param {string} expr
 * @returns {string}
 */
function normalizeSelect(expr) {
    if (expr.startsWith("(select")) { // Rimuove (select ...)
        expr = expr.substring(7, expr.length - 1);
        let lastClosePar = expr.lastIndexOf(")");
        if (lastClosePar >= 0) expr = expr.slice(0, lastClosePar) + expr.slice(lastClosePar + 1);
    }
    if (expr.startsWith("select")) { // Rimuove select ...
        expr = expr.substring(6);
    }
    return expr;
}


class AuditCheck{
    /**
     *
     * @param {int} auditindex
     * @param {string}idaudit
     * @param {string}idcheck
     * @param {string}message
     * @param {string}sql
     * @param {string} driver
     */
    constructor(auditindex, idaudit, idcheck, message, sql,driver){
        this.auditIndex = auditindex;
        this.idaudit = idaudit;
        this.idcheck = idcheck;
        this.message = message;
        this.sql = sql.toLowerCase();
        this.Segments = [];
        this.calculateSegments();
        this.driver = driver;
    }

    /**
     *
     * @param {string} sql
     * @param {int} start
     * @returns {number|*}
     */
    findNextOR(sql, start){
        if (start >= sql.length) return -1;
        let nextOR = sql.indexOf("or", start);
        while (nextOR > 0){
            const C = sql[nextOR - 1];
            if (isIdentifier(C)){
                nextOR = sql.indexOf("or", nextOR + 1);
                continue;
            }
            break;
        }
        return nextOR;
    }


    calculateSegments(){
        let start = 0;
        let startSearch = start;

        while (true){
            const nextOR = this.findNextOR(this.sql, startSearch);

            if (nextOR < 0){
                // Non ci sono più OR --> prende tutto il rimanente
                const segmento = this.sql.substring(start);
                this.Segments.push(new AuditSegment(segmento));
                return;
            }

            let nextOpenPar = this.sql.indexOf('(', startSearch);
            let nextClosePar = -1;

            if (nextOpenPar >= 0){
                nextClosePar = Parser.closeBlock(this.sql, nextOpenPar + 1, '(', ')');
            }

            // se la par. si chiude prima dell'OR, cerca la successiva aperta e la relativa chiusura
            // fino a trovare l'ultima chiusura di par. prima dell'OR
            while (nextOpenPar >= 0 && nextOpenPar < nextOR &&
            nextClosePar >= 0 && nextClosePar < nextOR){
                nextOpenPar = this.sql.indexOf('(', nextClosePar + 1);

                if (nextOpenPar >= 0){
                    nextClosePar = Parser.closeBlock(this.sql, nextOpenPar + 1, '(', ')');
                }
            }

            if ((nextOpenPar < 0 || nextOpenPar > nextOR) ||
                (nextClosePar <= nextOR)){
                // L'OR è prima della "(" o non vi sono "(" --> prende fino all'OR
                const segmento = this.sql.substring(start, nextOR - start);
                this.Segments.push(new AuditSegment(segmento));
                start = nextOR + 2;
                startSearch = start;
                continue;
            }

            // Altrimenti vuol dire che l'OR trovato è tra parentesi!
            // Quindi cerca il prossimo OR fuori dalle parentesi.
            startSearch = nextClosePar + 1;
        }
    }


    getHeader(){
        let header = "";
        header += '\n';
        header += '\n';
        // header += "----------------------------------------------------------------" + anewline;
        header += "-- idcheck: " + this.stripNewLines(this.idcheck) + '\n';
        header += "-- idaudit: " + this.stripNewLines(this.idaudit) + '\n';
        header += "-- Message: " + this.stripNewLines(this.message) + '\n';
        // header += "----------------------------------------------------------------" + anewline;
        return header;
    }


    /**
     * Per Oracle
     * check_4: LOOP
     *     -- corpo del ciclo
     *
     *     EXIT check_4 WHEN condition; -- condizione di uscita
     *
     *     -- altre istruzioni
     *   END LOOP check_4;
     */

    /**
     * GetStatement
     * @param {Expression[]}Expr
     * @param {int} totChecks Numero totale di controlli
     * @returns {string}
     */
    getStatement(Expr, totChecks){
        let SB = [];

        SB.push(this.getHeader());
        const labelAudit = "end_check_" + this.auditIndex.toString();
        const nSeg = this.Segments.length;
        if (this.driver ==="Oracle" && nSeg>1){
            SB.push(labelAudit+": LOOP");
        }

        for (let i = 0; i < nSeg; i++){
            const A = this.Segments[i];
            // SB.push("-- Segment " + (i + 1) + " (Weight " + A.Weight + ")\n");

            // Emette le variabili del segmento
            for (const nVar of A.vars){
                const E = Expr[nVar];
                SB.push(E.getSelection(Expr, this.auditIndex));
            }

            // if (expr. segmento) GOTO dopo_audit
            if (i < nSeg - 1){
                if (this.driver === "SqlServer"){
                    SB.push("if (" + A.sql + ") GOTO " + labelAudit );
                }
                if (this.driver === "Oracle"){
                    SB.push("if (" + A.sql + ") THEN\nEXIT " + labelAudit + ";\nEND IF;");
                }
                if (this.driver === "MySql"){
                    SB.push("if (" + A.sql + ") THEN\nLEAVE " + labelAudit + ";\nEND IF;");
                }
            }
            else{
                let vSet=getVariableSet(this.auditIndex - 1, totChecks, this.driver);
                if (this.driver==="SqlServer"){
                    SB.push("if not(" + A.sql + ") "+vSet);
                }
                else {
                    SB.push("if not(" + A.sql + ") THEN\n  "+vSet+";\nEND IF;\n");
                }


            }
        }

        // dopo_audit: SET
        if (nSeg > 1){
            if (this.driver==="SqlServer" || this.driver==="MySql"){
                SB.push(labelAudit + ":");
            }
            if (this.driver==="Oracle"){
                SB.push("EXIT "+labelAudit+"\nEND LOOP "+labelAudit + ";");
            }

        }

        return SB.join("\n")+"\n";
    }


}

/**
 * getVariableSet
 * @param {number} index - Indice a base zero
 * @param {number} nChecks - Numero totale di controlli
 * @param {string} driver
 * @returns {string} A string setting the result variable
 */
function getVariableSet(index, nChecks,driver){
    if (nChecks <= 62) {
        const X = BigInt(1) << BigInt(index);
        const XX = X.toString(16);
        switch (driver){
            case "SqlServer":{
                return "SET @res=@res + 0x" + XX + '\n';
            }
            case "MySql":{
                return "SET res=res + 0x" + XX + '\n';
            }
            case "Oracle":{
                return "res := TO_NUMBER('"+XX+"', 'XXXX');";
            }
        }
        return "SET @res=@res + 0x" + XX + '\n';
    }

    if (index === 0) {
        switch (driver){
            case "SqlServer":{
                return "SET @res = '1' + substring(@res, 2, " + (nChecks - 1) + ")\n";
            }
            case "MySql":{
                return "SET res = CONCAT('1', SUBSTRING(res, 2, "+(nChecks - 1) +");\n";
            }
            case "Oracle":{
                return "res := '1' || SUBSTR(res, 2, "+(nChecks - 1)+";\n";
            }
        }


    } else {
        const prev = index; // Equivalent to index - 1 since prev is zero-based
        const next = index + 2; // Equivalent to index + 1 since next is zero-based
        const rest = (nChecks - index - 1);
        switch (driver){
            case "SqlServer":{
                return "SET @res = substring(@res, 1, " + prev + ") + '1' + substring(@res, " +
                    next.toString() + ", " +rest + ")\n";
            }
            case "MySql":{
                return "SET res = CONCAT(SUBSTRING(res, 1, "+prev+"), '1',"+
                    "SUBSTRING(res, "+next+","+rest+"));\n";

            }
            case "Oracle":{
                return "res := SUBSTR(res, 1,"+prev+") || '1' || SUBSTR(res, "+next+","+rest+");\n";

            }
        }
    }
}

class AuditSegment {
    constructor(sql, driver){
        this.Weight = 0;
        this.sql = sql;
        this.vars = [];
        this.calculateVars(driver);
    }

    calculateVars(driver){
        let varPrefix = '_';
        if (driver==="SqlServer"){
            varPrefix='@';
        }
        let nextVar = this.sql.indexOf(varPrefix+"v");
        while (nextVar >= 0){
            let varLen = 2;
            let nVar = this.sql.substring(nextVar + 2, nextVar + 2 + varLen);
            if (this.sql.length > nextVar + 2 + varLen && /\d/.test(this.sql[nextVar + 2 + varLen])){
                nVar += this.sql[nextVar + 2 + varLen];
                varLen = 3;
            }
            const N = parseInt(nVar, 10);
            if (!this.vars.includes(N)){
                this.vars.push(N);
            }
            nextVar = this.sql.indexOf(varPrefix+"v", nextVar + 2);
        }
    }
}

class ExprAggregation{
    /**
     *
     * @param {string} fromCondition
     * @param {bool} simple
     * @param {bool} grouped
     * @param {string} driver
     */
    constructor(fromCondition, simple, grouped, driver){
        this.simple = true;
        this.grouped = false;
        this.forced = false;
        this.SelectionEmitted = false;
        this.mincheck = 1000;
        this.maxcheck = -2;
        this.AggregationNumber = 0;
        this.fromCondition = fromCondition;
        this.simple = simple;
        this.grouped = grouped;
        this.expressions = [];
        this.declEmitted = false;
        this.nAuditEmitted = -10;
        this.driver = driver;
        this.varPrefix = driver === 'SqlServer'? '@':'_';
    }

    /**
     *
     * @param {Expression} E
     */
    addExpression(E){
        this.expressions.push(E);
    }

    /**
     *
     * @param {AuditCheck} A
     */
    addCheck(A){
        // Aggiorna min/max check
        if (this.mincheck > A.auditindex){
            this.mincheck = A.auditindex;
        }
        if (this.maxcheck < A.auditindex){
            this.maxcheck = A.auditindex;
        }
    }

    setForced(ExprList){
        if (this.forced){
            return;
        }

        this.forced = true;
        for (const E of this.expressions){
            E.setForced(ExprList);
        }
    }

    /**
     *
     * @returns {string}
     */
    emitDeclaration(){
        let res = "";
        if (this.declEmitted){
            return res;
        }

        if (this.mincheck !== this.maxcheck && !this.forced){
            let flagName = ` ${this.varPrefix}f${this.AggregationNumber.toString().padStart(2, '0')}`;
            if (this.driver ==='Oracle'){
                res += `DECLARE ${flagName} char(1) := 'N';\n`;
            }
            if (this.driver ==='MySql'){
                res += `DECLARE ${flagName} char(1) DEFAULT 'N';\n`;
            }
            if (this.driver ==='SqlServer'){
                res += `DECLARE ${flagName} char(1) ='N';\n`;
            }
        }

        this.declEmitted = true;
        return res;
    }


    /**
     * Emette la selezione di un gruppo di espressioni (semplici - non raggruppate), con condizione comune
     * @param {Expression []}Expr
     * @param {int} nAudit
     * @returns {string}
     */
    getSelection(Expr, nAudit){
        if (this.nAuditEmitted === nAudit){
            return "";
        }

        if (this.forced && this.SelectionEmitted){
            return "";
        }

        this.nAuditEmitted = nAudit;

        let res = "";

        /**
         * Seleziona eventuali dipendenze
         */
        for (const E of this.expressions){
            for (const nVar of E.VarsLinked){
                const EE = Expr[nVar];
                res += EE.getSelection(Expr, nAudit);
            }
        }

        const flagName = ` ${this.varPrefix}f${this.AggregationNumber.toString().padStart(2, '0')}`;
        let pref = "";
        let BEGINEMESSO = false;

        if (!this.forced && nAudit > this.mincheck && this.maxcheck > this.mincheck){
            res += `IF (${flagName}='N') `;

            if (!this.forced && nAudit < this.maxcheck && this.maxcheck > this.mincheck){
                if (this.driver ==='SqlServer'){
                    res += "BEGIN ";
                }
                else {
                    res += "THEN ";
                }

                BEGINEMESSO = true;
            }

            res += `\n`;
            pref = "\t";
        }

        for (const E0 of this.expressions){
            if (!E0.declEmitted){
                res += E0.getDeclaration();
            }
        }

        if (!this.simple){
            const E3 = this.expressions[0];
            const expr2 = E3.expr;

            res += pref;

            // was (expr2.startsWith("execute ") || expr2.startsWith("execute("))
            if (expr2.indexOf("@outvar")>=0){ //Euristica per stabilire se è chiamata a funzione

                /*
                    SqlServer
                    execute get_itinerationrefundrule @new_itinerationrefund_iditineration,
                                ...,@outvar output che diventa, ad esempio, @v07 output
                 */
                res += `${expr2.replace("@outvar", E3.varname)}\n`;
            }
            else{

                /**
                 * MySql e Oracle
                 *     SELECT idflowchart, ndetail
                 *         INTO _idflowchart, _ndetail
                 *         FROM flowchart F ....
                 *

                 * SqlServer
                 *  SELECT   @v02 = max(adate)
                 *          FROM  assetload
                 */
                if (this.driver ==='SqlServer'){
                    res += `SELECT ${E3.varname} = ${expr2}\n`;
                }
                else {
                    res += `SELECT ${expr2} INTO ${E3.varname}\n`;
                }
            }
        }
        else{
            res += "SELECT ";
            let lastWasMember = false;
            let selList=[];
            let intoList=[];

            for (const E2 of this.expressions){
                if (E2.maxcheck < nAudit){
                    continue;
                }
                selList.push(E2.varname);
                intoList.push(E2.selexpr);
            }
            if (this.driver==='SqlServer'){
                res += selList.map((a, index) => `${a}=${intoList[index]}`).join(',\n\t')+'\n';
            }
            else {
                res+= selList.join(',\n')+'\n';
                res+= ' INTO '+  intoList.join(',')+'\n';
            }

            res += ` FROM ${this.fromCondition}\n`;
        }

        if (!this.forced && nAudit < this.maxcheck && this.maxcheck > this.mincheck){
            if (this.driver ==='Oracle'){
                res += `${pref} ${flagName} :='S';\n`;
            }
            else {
                res += `${pref}SET ${flagName} ='S';\n`;
            }
        }

        if (BEGINEMESSO){
            if (this.driver ==='SqlServer'){
                res += "END\n";
            }
            else {
                res += "END IF;\n";
            }

        }

        this.SelectionEmitted = true;
        return res;
    }





    stripNewLines(str){
        // Rimuove caratteri di nuova linea dalla stringa
        return str.replace(/\r?\n/g, "");  //\n|\r
    }





}


function getSqlResetVar(varName, nCheck, driver) {
    switch (driver) {
        case "SqlServer":
            return (nCheck <= 62) ? `SET ${varName} = 0;` : `SET ${varName} = '';`;
        case "MySql":
            return `SET ${varName} = ${nCheck <= 62 ? '0' : "''"};`;
        case "Oracle":
            return `SET ${varName} := ${nCheck <= 62 ? '0' : "''"};`;
        default:
            throw new Error("Driver non supportato: " + driver);
    }
}

function getSqlParameterVarPrefixForResult(NCheck) {
    if (NCheck <= 14) {
        return "s";
    }
    if (NCheck <= 30) {
        return "i";
    }
    if (NCheck <= 62) {
        return "b";
    }
    return "c";
}

function getSqlParameterTypeNameForResult(nCheck, driver) {
    if (nCheck <= 14) {
        if (driver === "Oracle") {
            return "NUMBER(5,0)";
        }
        return "smallint";
    }
    if (nCheck <= 30) {
        if (driver === "Oracle") {
            return "NUMBER(10,0)";
        }
        return "int";
    }
    if (nCheck <= 62) {
        if (driver === "Oracle") {
            return "NUMBER(19,0)";
        }
        return "bigint";
    }
    return "VARCHAR2(" + nCheck.toString() + ")";
}


class Expression{

    /**
     *
     * @param {string} expr
     * @param {ExprAggregation []}aggregations
     * @param {string} kind  (CHAR)
     * @param {int} Number
     * @param {string} driverName
     */
    constructor(expr, aggregations, kind, Number, driverName){
        this.driver = driverName;
        this.prefixChar = (driverName==='SqlServer')?'@':'_';
        this.expr = normalizeSelect(expr.trim().toLowerCase());
        this.kind = kind;
        this.Number = Number;
        this.VarsLinked = [];
        this.varname = this.prefixChar+`v${Number.toString().padStart(2, '0')}`;
        this.varRecall = kind.toLowerCase() === 'b' ? `(${this.varname}='S')` : this.varname;


        this.calculateNestedVars();
        this.calculateDefaultWeight();
        this.CheckLinked = [];
        this.mincheck = 1000;
        this.maxcheck = -10;
        this.searchAggregation(aggregations);
    }

    setNewAggregation(Aggregations, fromCondition, simple){
        this.Aggregation = new ExprAggregation(fromCondition, simple, this.grouped, this.driver);
        Aggregations.push(this.Aggregation);
        this.Aggregation.addExpression(this);
        this.Aggregation.AggregationNumber = Aggregations.length;
    }

    searchAggregation(Aggregations){
        if (!this.simple){
            this.setNewAggregation(Aggregations, "", false);
            return;
        }

        // Cerca il primo "from"
        const FROM = "from";
        const fromPos = this.expr.indexOf(FROM);

        if (fromPos < 0){
            this.setNewAggregation(Aggregations, "", false);
            return;
        }

        this.selexpr = this.expr.substring(0, fromPos);
        const fromCond = this.expr.substring(fromPos + FROM.length);

        for (const EG of Aggregations){
            if (!EG.simple) continue;
            if (EG.grouped !== this.grouped) continue;
            if (EG.fromCondition === fromCond){
                this.Aggregation = EG;
                EG.addExpression(this);
                return;
            }
        }

        this.setNewAggregation(Aggregations, fromCond, true);
    }

    setForced(ExpList){
        if (this.forced) return;

        this.forced = true;
        this.Aggregation.setForced(ExpList);
        this.Weight = 0;

        for (const i of this.VarsLinked){
            ExpList[i].setForced(ExpList);
        }
    }

    /**
     *
     * @param {Expression []}Expr
     * @param {AuditCheck} A
     */
    addCheck(Expr, A){
        if (this.CheckLinked.includes(A)) return;

        this.CheckLinked.push(A);
        this.Aggregation.addCheck(A);

        // Aggiorna min/max check
        if (this.mincheck > A.auditIndex) this.mincheck = A.auditIndex;
        if (this.maxcheck < A.auditIndex) this.maxcheck = A.auditIndex;

        for (const i of this.VarsLinked){
            Expr[i].addCheck(Expr, A);
        }
    }

    calculateDefaultWeight(){
        let ex = this.expr;
        this.Weight = 0;
        let nextFrom = ex.indexOf("from");

        while (nextFrom >= 0){
            this.Weight += 10000;
            nextFrom = ex.indexOf("from", nextFrom + 1);
        }

        let nextIsNull = ex.indexOf("isnull");
        while (nextIsNull >= 0){
            this.Weight += 10;
            nextIsNull = ex.indexOf("isnull", nextIsNull + 1);
        }

        let nextJoin = ex.indexOf("join");
        while (nextJoin >= 0){
            this.Weight += 12000;
            nextJoin = ex.indexOf("join", nextJoin + 1);
        }

        let nextSum = ex.indexOf("sum(");
        while (nextSum >= 0){
            this.Weight += 8000;
            this.grouped = true;
            nextSum = ex.indexOf("sum(", nextSum + 1);
        }

        let nextMin = ex.indexOf("min(");
        while (nextMin >= 0){
            this.Weight += 8000;
            this.grouped = true;
            nextMin = ex.indexOf("min(", nextMin + 1);
        }

        let nextMax = ex.indexOf("max(");
        while (nextMax >= 0){
            this.Weight += 8000;
            this.grouped = true;
            nextMax = ex.indexOf("max(", nextMax + 1);
        }

        let nextCount = ex.indexOf("count(");
        while (nextCount >= 0){
            this.Weight += 6000;
            this.grouped = true;
            nextCount = ex.indexOf("count(", nextCount + 1);
        }

        let nextExecute = ex.indexOf("execute");
        while (nextExecute >= 0){
            this.Weight += 15000;
            this.simple = false;
            nextExecute = ex.indexOf("execute", nextExecute + 1);
        }

        let nextExists = ex.indexOf("exists");
        while (nextExists >= 0){
            this.Weight += 12000;
            this.simple = false;
            nextExists = ex.indexOf("exists", nextExists + 1);
        }

        let nextGt = ex.indexOf('>');
        while (nextGt >= 0){
            this.Weight += 400;
            nextGt = ex.indexOf('>', nextGt + 1);
        }

        let nextLt = ex.indexOf('<');
        while (nextLt >= 0){
            this.Weight += 400;
            nextLt = ex.indexOf('<', nextLt + 1);
        }
    }

    calculateNestedVars(){
        let nextVar = this.expr.indexOf(this.prefixChar+"v");

        while (nextVar >= 0){
            let varNumLen = 2;
            let nVar = this.expr.substring(nextVar + 2, varNumLen);

            if (this.expr.length > nextVar + varNumLen + 2 && !isNaN(this.expr[nextVar + 2 + varNumLen])){
                nVar += this.expr[nextVar + 2 + varNumLen];
                varNumLen++;
            }

            let N = parseInt(nVar, 10);
            if (this.VarsLinked.indexOf(N) < 0){
                this.VarsLinked.push(N);
            }

            nextVar = this.expr.indexOf(this.prefixChar+"v", nextVar + varNumLen);
        }
    }

    /**
     * Sql server declare @v39 int -- W62800
     * Oracle   v_idflowchart VARCHAR2(34);  nella sezione prima del BEGIN
     * MySql DECLARE codeflowchart VARCHAR(100); subito dopo il BEGIN
     */


    getAllForcedSelection(connection){

    }


    getDeclarationAndSet(varName, varType, value, driver){
        if (driver ==='Oracle'){
            return `DECLARE ${varName} ${varType} := ${value};`;
        }
        if (driver ==='MySql'){
            return `DECLARE ${varName} ${varType} DEFAULT ${value};`;
        }
        if (driver ==='SqlServer'){
            return `DECLARE ${varName} ${varType} = ${value};`;
        }
    }

    /**
     *
     * @param {Connection} connection
     * @returns {string}
     */
    getDeclaration(connection) {
        if (this.declEmitted) return "";
        this.declEmitted = true;
        let decl = "declare " + this.varname + " ";
        let xx = " -- W" + this.Weight;

        if (this.CheckLinked.length > 1) {
            xx += " (" + this.CheckLinked.length + ")";
        }
        let driver = connection.driverName;
        let k =this.kind.toLowerCase();
        switch (k) {
            case 'a':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],'null',driver);
                break;
            case 'b':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"'N'",driver);
                break;
            case 'i':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"0",driver);
                break;
            case 'c':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"''",driver);
                break;
            case 'n':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"0.0",driver);
                break;
            case 'f':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"0.0",driver);
                break;
            case 'd':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"null",driver);
                break;
            case 'v':
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes[k],"0.0",driver);
                break;
            default:
                decl += this.getDeclarationAndSet(this.varname, connection.codedTypes['default'],"''",driver);
                break;
        }
        decl +=  xx + ";\n";

        decl += this.Aggregation.emitDeclaration();
        return decl;
    }

    getSelection(Expr, NAudit) {
        return this.Aggregation.getSelection(Expr, NAudit);
    }



}




/** StringParser **/






/**
 * Gets all parameters (old values and new values) still present in sqlcmd
 * @param {string} sqlCmd
 * @returns string[]
 */
function getNewKeys(sqlcmd){

    let res = [];
    //Add old value parameters
    let start =0;
    while (start < sqlcmd.length){
        let next= Parser.getNextUncommentedString(sqlcmd,"&<", start);
        if (next===-1) break;
        let afterParam= Parser.getNextUncommentedString(sqlcmd,">&", next+1);
        if (afterParam===-1) break;
        start=afterParam+2;
        let key= sqlcmd.substring(next, start-next);
        res.push(key);
    }
    //Add old value parameters
    start =0;
    while (start < sqlcmd.length){
        let next= Parser.getNextUncommentedString(sqlcmd,"%<", start);
        if (next===-1) break;
        let afterParam= Parser.getNextUncommentedString(sqlcmd,">%", next+1);
        if (afterParam===-1) break;
        start=afterParam+2;
        let key= sqlcmd.substring(next, start-next);
        res.push(key);
    }

    return res;
}


///  Individuazione dei parametri presenti in un elenco di check (la tabella auditchecks)

/// <summary>
/// Given the table auditcheck evaluates the table parameter and the Hashtable Substitutions
/// </summary>
/// <param name="CR"></param>

/**
 * @param {Environment} environment
 * @param {DataAccess} conn
 * @param {DataSet} CR
 * @param {string} tableName
 * @param {string} opKind  I|U|D
 * @param {bool} preCheck
 * @returns {Dictionary}
 */
function evaluateParameters(environment, conn, CR,
    tableName, opKind,   preCheck){
    let totParameters=0;
    let possibleSubstitutions = {};
    environment.enumSys().forEach(k=>{
            possibleSubstitutions["%<sys_"+k+">%"]="@sys_"+k;
        });

    let substitutions = {};
    //Substitutions["%<esercizio>%"]="@AccountingYear";
    CR.tables["auditcheckview"].rows.forEach(audit=>{
        let sqlcmd= audit["sqlcmd"];
        sqlcmd= sqlcmd.replace("%<esercizio>%","%<sys_esercizio>%");
        Object.keys(substitutions).forEach(key => {
            sqlcmd = sqlcmd.replace(key, substitutions[key]);
        });
        Object.keys(possibleSubstitutions).forEach(key => {
            if (substitutions[key]!==undefined) return; //substitution already added (should not happen!)
            if (sqlcmd.indexOf(key)>=0){
                substitutions[key]=possibleSubstitutions[key];
                sqlcmd = sqlcmd.replace(key,substitutions[key]);
                totParameters++;
                let filter= q.and(q.eq("tablename",tableName), q.eq("opkind",opKind),
                                                q.eq("parameterid", totParameters));
                let parfound= CR.table["auditparameter"].select(filter);
                let newPar;
                if (parfound.length>0){
                    newPar= parfound[0];
                }
                else {
                    newPar= CR.auditparameter.newRow({tablename:tableName,opkind:opKind });
                }
                newPar["isprecheck"]= preCheck?"S":"N";
                newPar["parameterid"]= totParameters;
                newPar["flagoldvalue"]="-";
                newPar["paramtable"]= "sys";
                newPar["paramcolumn"]= key.replace("%<","").replace(">%","");
            }
        });

        let newKeys = getNewKeys(sqlcmd);
        Object.keys(newKeys).forEach( key =>{
            if (substitutions[key]!==undefined) {
                return;
            }

            totParameters++;
            let newPar;
            let filter2= q.and(q.eq("tablename",tableName), q.eq("opkind",opKind),
                q.eq("parameterid", totParameters));

            let parFound= CR.tables["auditparameter"].select(filter2);
            if (parFound.length>0){
                newPar= parFound[0];
            }
            else {
                newPar= CR.tables["auditparameter"].newRow({tablename:tableName, opkind:opKind,
                        parameterid:totParameters});
            }
            newPar["isprecheck"]= preCheck?"S":"N";
            let subst="";
            if (key.startsWith("&<")){
                subst = "@OLD";
                newPar["flagoldvalue"]="S";
            }
            else {
                subst = "@NEW";
                newPar["flagoldvalue"]="N";
            }

            let tableField = key.substring(2,key.length-4).trim();
            let fields = tableField.split('.');
            if(fields.length>0){
                if (fields.length>1){
                    let tableFound=fields[0].trim().toLowerCase();
                    newPar["paramtable"]=tableFound;
                    if (tableFound!==tableName) subst+= "_"+tableFound;
                    newPar["paramcolumn"]=fields[1].trim().toLowerCase();
                }
                else {
                    newPar["paramtable"]=tableName;
                    newPar["paramcolumn"]=fields[0].trim().toLowerCase();
                }
            }
            subst+= "_"+newPar["paramcolumn"];
            substitutions[key]=subst;
            sqlcmd = sqlcmd.replace(key, subst);
        });

        audit["sqlcmd"]=sqlcmd;
    });

    //int newparameterid2=oparameters+nparameters;
    let filter3= q.and(q.eq("tablename",tableName), q.eq("opkind",opKind),
                         q.eq("parameterid", totParameters));
    let toDelete= CR.tables["auditparameter"].select(filter3);
    toDelete.forEach(r=>r.del());
}

/**
 * Checks if a stored procedure exists in the database
 * @param {DataAccess}  conn
 * @param {string} spName
 * @returns {Promise<Object|undefined>}
 */
async function storedProcedureExists(conn, spName){
    let existSP;
    if (conn.sqlConn.driverName==="SqlServer"){
        existSP =  await conn.runCmd(
            "select count(*) from sysobjects where id = object_id("+
            "'"+spName+"') and OBJECTPROPERTY(id, 'IsProcedure') = 1 and uid=user_id()");
    }
    if (conn.sqlConn.driverName === "MySql") {
        existSP = await conn.runCmd(
            "SELECT COUNT(*) FROM information_schema.routines " +
            "WHERE routine_name = '" + spName + "' AND routine_type = 'PROCEDURE' " +
            "AND routine_schema = DATABASE()"
        );
    }

    if (conn.sqlConn.driverName === "Oracle") {
        existSP = await conn.runCmd(
            "SELECT COUNT(*) FROM all_procedures " +
            "WHERE object_name = '" + spName + "' AND procedure_name = '" + spName + "' " +
            "AND owner = user"
        );
    }
    if ((existSP===undefined)||(existSP===null)) existSP=0;
    return (existSP===1) ;
}

/**
 * Returns the sp Name for a specified combination of tableName, opKind and pre/post check
 * @param {string} tableName
 * @param {string}opKind I|U|D
 * @param {boolean} preCheck
 * @returns string
 */
function spCheckName(tableName, opKind, preCheck){
  return 'check_'+ tableName + "_" + opKind.toLowerCase() + preCheck ?"_pre":"_post";
}

/**
 *
 * @param {DataAccess} conn
 * @param {string} tableName
 * @param {string}opKind I|U|D
 * @param {boolean} preCheck
 */
async function dropSPCommand(conn, tableName, opKind, preCheck){
    let spName= spCheckName(tableName, opKind,preCheck);
    let existSP = await  storedProcedureExists(conn,spName);
    return existSP ? "DROP PROCEDURE "+spName : null;

}

/**
 *
 * @param {int} nCheck
 * @param {string} driver Oracle|MySql|SqlServer
 */
function getOutputTypeDeclaration(nCheck,driverName){
    switch (driverName){
        case "Oracle":{
            if (nCheck<=14) return "@res SMALLINT";
            if (nCheck<=30) return "@res INT OUT";
            if (nCheck<=62) return "@res BIGINT OUT";
            return "@res OUT VARCHAR2("+nCheck+")";
        }
        case "MySql":{
            if (nCheck<=14) return "OUT @res SMALLINT";
            if (nCheck<=30) return "OUT @res INT";
            if (nCheck<=62) return "OUT @res BIGINT";
            return "@res OUT VARCHAR2("+nCheck+")";
        }
        case "SqlServer":{
            if (nCheck<=14) return "@res SMALLINT OUT";
            if (nCheck<=30) return "@res INT OUT";
            if (nCheck<=62) return "@res BIGINT OUT";
            return "@res VARCHAR("+nCheck+") OUT";
        }
    }

}

/**
 *
 * @param {string} sys
 * @param {string} driverName Oracle|MySql|SqlServer
 * @returns {string}
 */
function getTypeForSysVar(sys,driverName){
    if (sys === "sys_esercizio") return "int";
    if (sys === "sys_datacontabile") return "date";
    let varchar = driverName==="Oracle"?"varchar2":"varchar";
    if (sys === "sys_userdb") return varchar+"(30)";
    if (sys === "sys_idcustomuser") return varchar+"(30)";
    if (sys === "sys_idflowchart") return varchar+"(34)";
    return varchar+"(100)";
    //return "UNKNOWN!!";
}


/**
 * @param {DbDescriptor} dbDescriptor
 * @param {DataAccess} conn
 * @param {string} tableName
 * @param {string}opKind I|U|D
 * @param {DataTable} parameters
 * @param {boolean} preCheck
 * @param {int} nCheck
 * @returns {Promise<string>}
 */
async function getSPHeader(dbDescriptor, conn, tableName, opKind, parameters, preCheck, nCheck){
    let spName= spCheckName(tableName, opKind,preCheck);
    let driver = conn.sqlConn.driverName;
    let res='';
    let varPrefix='';

//Sql server
//    CREATE/ALTER PROCEDURE spName @res SMALLINT OUT, @sys_xx smallint, @NEW_nlevel char(1)=null,
//              @OLD_flagaccountusage int=null, @NEW_ayear smallint=null, @NEW_paridacc varchar(38)=null AS
// BEGIN
// ...
// END
    if (driver==="SqlServer"){
        let spExists = await  storedProcedureExists(conn, spName);
        if (spExists)
            res="CREATE PROCEDURE ";
        else
            res="ALTER PROCEDURE ";

        res +=	spName+" @res "+conn.sqlConn.sqlTypeForNBits(nCheck)+" OUT";
        varPrefix='@';
    }


// MySQL
    /*
        DROP PROCEDURE IF EXISTS spName;

        DELIMITER //
        CREATE PROCEDURE spName(
            OUT res INT,
            IN idcustomuser VARCHAR(50)
    )
        BEGIN
         ...
        END //
        DELIMITER ;
     */
    if (driver==="MySql"){
        res+="DROP PROCEDURE IF EXISTS "+spName+";\n";
        res+=`DELIMITER //
               CREATE PROCEDURE spName(OUT res `+conn.sqlConn.sqlTypeForNBits(nCheck);
    }


// Oracle
/*
 CREATE OR REPLACE FUNCTION spName (
  res OUT  NUMBER,
  p_ayear  IN NUMBER
)
IS
 BEGIN
  -- Dichiarazione della variabile di tipo tabella
  v_outtable compute_allowform_table := compute_allowform_table();


 */
    if (driver==="Oracle"){
        res+="CREATE OR REPLACE FUNCTION  "+spName+"( \n";
        res+=`res OUT `+conn.sqlConn.sqlTypeForNBits(nCheck);
    }

    //Adds parameter list
    //Adds newvalue parameter declaration
    let nnew=0;
    let nold=0;

    let pars =parameters.rows.slice().sort(
        (a,b)=>a.parameterid - b.parameterid);

    for (const par of parameters){
        let parcol=par["paramcolumn"];
        let partab=par["paramtable"].toLowerCase();

        if (partab==="sys"){
            let svar = varPrefix;
            if (!parcol.startsWith("sys_")) svar+="sys_";
            svar+=parcol;
            res+=", "+svar+" ";
            res+= getTypeForSysVar(parcol,driver);
            continue;
        }

        let descrTable= await dbDescriptor.table(partab);

        if (par["flagoldvalue"].toUpperCase()==='N'){
            let newVar= varPrefix+'NEW';
            if (partab!==tableName) newVar+="_"+partab;
            newVar+= "_"+parcol;
            let foundCol = descrTable.column( parcol);
            if (!foundCol){ //should never happen
                res+=", "+foundCol.name+ (driver==='Oracle'? ' varchar2(255)':' varchar(255)');
            }
            else {
                res+=", "+newVar+" "+foundCol["type"];
            }
            nnew++;
        }
        else {
            let oldVar= varPrefix+"OLD";
            if (partab!==tableName) oldVar+="_"+partab;
            oldVar+= "_"+parcol;
            let foundCol = descrTable.column( parcol);
            if (!foundCol){
                res+=", "+foundCol.name+ (driver==='Oracle'? ' varchar2(255)':' varchar(255)');
                //markEvent("Undefined field type ("+ partab.ToString()+parcol.ToString()+").");
            }
            else {
                res+=", "+oldVar+" "+foundCol["type"];
            }
            nold++;
        }
        if (driver==="SqlServer"){
            res+="=null";
        }

    }
    if(driver==='SqlServer'){
        res+="\n AS \n";
    }
    if (driver==="MySql"){
        res+="\n)\n";
    }
    if (driver==="Oracle"){
        res+="\n)\nAS";
    }
    return res;

}

/**
 *
 * @param {string} driver driver name (SqlServer | MySql | Oracle)
 * @param {int} nCheck  N. of total checks in the stored procedure
 * @returns {string}
 */
function getBeginFragment(driver, nCheck){
    let res='';
    if(driver==='SqlServer'){
        res+="\nBEGIN\nSET NO COUNT ON\n";
    }
    if (driver==="MySql"){
        res+="\nBEGIN\n";
    }
    if (driver==="Oracle"){
        res+="\nBEGIN\n";
    }

    res+='-- LAST MODIFIED: '+new Date().toLocaleString()+'\n';

    //RESULT VAR INITIALIZATION
    if(driver==='SqlServer'|| driver==='MySql'){
        if (nCheck<=62) {
            res+= "SET @res=0;\n";
        }
        else {
            res+= "SET @res='"+"0".padEnd(nCheck, '0')+"';\n";
        }
    }
    if(driver==='Oracle'){
        if (nCheck <= 62){
            res += "res :=0;\n";
        }
        else{
            res += "res :='" + "0".padEnd(nCheck, '0') + "';\n";
        }
    }

    return res;
}

/// <summary>
/// Compiles sqlcmd contained in square brackets [ ] with variables @varN reusing
///  eventually existing variables
/// </summary>
/// <param name="Expr">list of compiled variables</param>
/// <param name="storedproc">instructions to add to stored procedure</param>
/// <param name="sqlcmd">sqlcmd to compile</param>
/// <param name="start">start position from which start the compilation</param>
/// <returns>compiled sqlcmd</returns>

function isIdentifier(C) {
    if (C.match(/[a-zA-Z0-9]/)) return true;
    return C === '@' || C === '_';

}

function remove(str, position, count) {
    return str.slice(0, position) + str.slice(position + count);
}
function insertString(original, position, toInsert) {
    return original.slice(0, position) + toInsert + original.slice(position);
}

/**
 * Compiles sqlcmd contained in square brackets [ ] with variables @varN reusing
 *     eventually existing variables
 * @param {string} prefixChar
 * @param {Dictionary<Expression,string>}expr
 * @param {ExprAggregation[]} aggregates
 * @param {string} sqlCmd
 * @param {int} start  start position from which start the compilation
 * @returns {string} compiled sqlCmd
 */
function compileExpressions(prefixChar, expr, aggregates,sqlCmd, start){
    //Compiles nested expressions

    //Checks for internal square brackets
    let nextCloseBracket =Parser.getNextNonStringConst(sqlCmd,']',start);

    if (nextCloseBracket===-1) {
        //MarkEvent("Unclosed [ in sqlcmd "+sqlcmd);
        return sqlCmd.substring(start);
    }
    let nextOpenBracket = Parser.getNextNonStringConst(sqlCmd,'[',start);//sqlcmd.IndexOf('[',start);
    //GetNextUncommentedChar(sqlcmd,'[',start);
    while ((nextOpenBracket>=0) && (nextOpenBracket< nextCloseBracket)){
        sqlCmd= compileExpressions(prefixChar, expr, aggregates, sqlCmd, nextOpenBracket+1).trim();
        //Elimina la [ stando attento a non concatenare con un AND o un OR
        if (nextOpenBracket>0){
            if (isIdentifier(sqlCmd[nextOpenBracket-1])){
                sqlCmd = sqlCmd.slice(0, nextOpenBracket) + ' ' + sqlCmd.slice(nextOpenBracket + 1);
            }
            else {
                sqlCmd = sqlCmd.slice(0, nextOpenBracket) + sqlCmd.slice(nextOpenBracket + 1);
            }
        }
        else {
            sqlCmd = sqlCmd.slice(0, nextOpenBracket) + sqlCmd.slice(nextOpenBracket + 1);
        }
        nextCloseBracket = Parser.getNextNonStringConst(sqlCmd,']',start);//sqlcmd.IndexOf(']',start);
        //GetNextUncommentedChar(sqlcmd,']',start);
        if (nextCloseBracket===-1) {
            //MarkEvent("Unclosed [ in sqlcmd "+sqlcmd);
            return sqlCmd.substring(start);
        }
        nextOpenBracket = Parser.getNextNonStringConst(sqlCmd,'[',start);//sqlcmd.IndexOf('[',start);
        //GetNextUncommentedChar(sqlcmd,'[',start);
    }
    //expression = string between brackets
    let expression = sqlCmd.substring(start, nextCloseBracket - start);
    let nextGraph = -1;
    let lenToRemove = 4;
    let kind = 'c';

    while (true) {
        let pos = nextCloseBracket + 1;

        while (pos < sqlCmd.length) {
            if (sqlCmd[pos] === ' ') {
                pos++;
                lenToRemove++;
            } else {
                break;
            }
        }

        if (pos >= sqlCmd.length) break;

        if (sqlCmd[pos] !== '{') break;

        pos = pos + 1;

        while (pos < sqlCmd.length) {
            if (sqlCmd[pos] === ' ') {
                pos++;
                lenToRemove++;
            } else {
                break;
            }
        }

        if (pos >= sqlCmd.length) break;

        kind = sqlCmd[pos].toLowerCase();

        pos = pos + 1;

        while (pos < sqlCmd.length) {
            if (sqlCmd[pos] === ' ') {
                pos++;
                lenToRemove++;
            } else {
                break;
            }
        }

        if (pos >= sqlCmd.length) break;

        if (sqlCmd[pos] !== '}') break;

        nextGraph = 1;
        break;
    }


    //check if after the close bracket there is an open graph bracket
    if (nextGraph>0) {
        //A variable must be declared to replace this expression
        //string kind= sqlcmd[nextclosebracket+2].ToString().ToLower(); //C/N/D

        //string normalized = NormalizeExpression(expression);
        //string normupper= normalized.ToUpper();

        let normUpper= expression;
        normUpper= normalizeSelect(normUpper.trim());

        let E= expr[normUpper];
        if (!E){
            //Adds declaration and evaluation of expression to sp code
            let nVar= Object.keys(E).length+1;
            E = new Expression(normUpper, aggregates, kind,nVar, prefixChar);
            expr[normUpper]=E;
        } //if (Expr[normalized]==null)
        sqlCmd = remove(sqlCmd,start, expression.length+lenToRemove);
        if (start< sqlCmd.length){
            if (isIdentifier(sqlCmd[start])){
                sqlCmd = insertString(sqlCmd,start, ' '+E.varRecall);
            }
            else {
                sqlCmd = insertString(sqlCmd,start,E.varRecall);
            }
        }
        else {
            sqlCmd = insertString(sqlCmd,start,E.varRecall);
        }

    }
    else {
        sqlCmd = remove(sqlCmd,start, expression.length+1);
        if (start< sqlCmd.length){
            if (isIdentifier(sqlCmd[start])){
                sqlCmd = insertString(sqlCmd,start, ' '+expression);
            }
            else {
                sqlCmd = insertString(sqlCmd,start,expression);
            }
        }
        else {
            sqlCmd = insertString(sqlCmd,start,expression);
        }
    }
    return sqlCmd;
}

function getSpFooter(){
    return "END\n";
}

/**
 * Combine StripComments and NormalizeExpression
 * @param {string} sqlcmd
 * @returns {string}
 */
function compact(sqlcmd) {
    let prevWasIdentifier = false;
    let spaceToAdd = false;
    let res = "";
    let index = 0;
    let len = sqlcmd.length;

    while (index < len) {
        // Salta i commenti --
        if (sqlcmd.substring(index).startsWith("--")) {
            let next1 = sqlcmd.indexOf("\n", index);
            let next2 = sqlcmd.indexOf("\r", index);

            if ((next1 === -1) && (next2 === -1)) {
                return res;
            }

            // A comment is equivalent to a space
            if (prevWasIdentifier) spaceToAdd = true;
            prevWasIdentifier = false;

            if (next1 === -1) {
                index = next2 + 1;
                continue;
            }

            if (next2 === -1) {
                index = next1 + 1;
                continue;
            }

            if (next1 < next2)
                index = next1 + 1;
            else
                index = next2 + 1;

            continue;
        }

        // Salta i commenti del tipo /* .. */
        if (sqlcmd.substring(index).startsWith("/*")) {
            let next = sqlcmd.indexOf("*/", index);
            if (next === -1) {
                return res;
            }

            // Aver trovato un commento equivale ad aver trovato uno spazio
            if (prevWasIdentifier) spaceToAdd = true;
            prevWasIdentifier = false;
            index = next + 2;
            continue;
        }

        let C = sqlcmd[index];

        if ((C !== ' ') && (C !== '\n') && (C !== '\r') && (C !== '\t')) {
            if (isIdentifier(C) || (C === '[') || (C === ']') || (C === '{') || (C === '}')) {
                if (spaceToAdd) res += " ";
                spaceToAdd = false;

                prevWasIdentifier = true;
            } else {
                prevWasIdentifier = false;
                spaceToAdd = false;
            }

            res += C;

            if (C === '\'') {
                // Salta la costante di stringa
                index++;
                // Salta la stringa
                while (index < len) {
                    if (sqlcmd[index] !== '\'') {
                        res += sqlcmd[index];
                        index++;
                        continue;
                    }

                    // Potrebbe essere un carattere di fine stringa
                    if (((index + 1) < len) && (sqlcmd[index + 1] === '\'')) {
                        // Non lo è
                        res += sqlcmd[index];
                        index++;
                        res += sqlcmd[index];
                        index++;
                        continue;
                    }

                    res += sqlcmd[index];
                    break;
                }
            }
        } else {
            // Converte tutti gli spazi precedenti in uno spazio
            if (prevWasIdentifier) spaceToAdd = true;
            prevWasIdentifier = false;
        }
        index++;
    }

    return res;
}

/**
 *
 * @param {Expression[]} Expr
 * @param {int} num
 */
function setForced(Expr, num){
    let E = Expr[num];
    E.setForced(Expr);
}


/**
 *
 * @param {AuditCheck[]} Audits
 * @param {Map<int,Expression> } Vars
 * @param {string} driver
 * @returns {string}
 */
function getOptimizedSp(Audits, Vars, driver) {
    let SB = [];

    // Ottiene un array di variabili a partire dall'hashtable, per una migliore accessibilità.
    let nVars = Vars.size;
    let Expr = Array(nVars + 1); // Elenco delle espressioni

    Vars.forEach((value,key) => {
        let E = value;
        Expr[E.Number] = E;
    });

    // Come prima cosa, se un audit è fatto da un solo segmento, le variabili di quel segmento sono
    // necessariamente da calcolare. Infatti non è possibile alcuna ottimizzazione in questo caso.
    // Dunque, il peso di tali variabili e di quelle dipendenti è assegnato a 0.
    Audits.forEach((A) => {
        if (A.Segments.length === 1) {
            let AS = A.Segments[0];
            AS.vars.forEach((nExpr) => setForced(Expr, nExpr));
        }
    });

    // Calcola i pesi delle variabili sommando ad ognuna i pesi delle var. collegate.
    for (let i = 1; i <= nVars; i++) {
        let E = Expr[i];
        if (E.forced) continue;
        let weight = E.Weight;
        E.VarsLinked.forEach((j) => {
            weight += Expr[j].Weight;
        });
        E.Weight = weight;
    }

    // Calcola ora i pesi di ogni segmento come somma dei pesi delle var. collegate
    Audits.forEach((A) => {
        if (A.Segments.length === 1) {
            let A1 = A.Segments[0];
            A1.vars.forEach((i) => {
                let E = Expr[i];
                E.addCheck(Expr, A);
            });
            A1.Weight = 0;
            return; // il peso di tali segmenti è minimo per definizione (un solo elem.!)
        }
        A.Segments.forEach((AU) => {
            if (AU.vars.length === 0) {
                AU.Weight = AU.sql.length;
            } else {
                let weight = 0;
                AU.vars.forEach((i) => {
                    let E = Expr[i];
                    weight += E.Weight;
                    E.addCheck(Expr, A);
                });
                AU.Weight = weight;
            }
        });

        // Ordina i segmenti in base al peso e lo mette in L
        let L = [];
        A.Segments.forEach((AS) => {
            let i = 0;
            while (i < L.length && L[i].Weight < AS.Weight) i++;
            L.splice(i, 0, AS);
        });
        A.Segments = L;
        let First = A.Segments[0];
        // Le espressioni dei primi segmenti sono comunque da considerarsi forced
        First.vars.forEach((i) => setForced(Expr, i));
    });

    // Inizia a emettere la lettura di tutte le espressioni con peso 0, ossia quelle forzate
    // e la dichiarazione di quelle non forzate
    // EMETTE solo le dichiarazioni prima, per compatibilità con ORACLE
    Expr.forEach((E) => {
        if (!E) return;
        SB.push(E.getDeclaration());
    });

    if (driver==='Oracle'){
        SB.push("BEGIN");
    }
    //EMETTE le select per le espressioni obbligate
    Expr.forEach((E) => {
        if (!E) return;
        if (E.forced) {
            SB.push(E.getSelection(Expr, -1));
        }
    });


    Audits.forEach((AU) => {
        SB.push(AU.getStatement(Expr, Audits.length));
    });
    SB.push("");

    return SB.join("\n");
}


/**
 * @param {Environment} environment
 * @param {DbDescriptor} dbDescriptor
 * @param {DataAccess} conn
 * @param {string} tableName
 * @param {string} opKind I|U|D
 * @param {boolean} preCheck
 * @param {jsDataQuery} filterCheck
 * @returns Promise<[string|null, DataTable]>
 */
async function getAuditForOperation(environment, dbDescriptor, conn, tableName, opKind,
                                        preCheck,filterCheck){
    let CR = BusinessLogic.prototype.createAuditDataSet();
    let Parameters= CR.tables["auditparameter"];
    let auditcheck = CR.tables["auditcheckview"];

    //Ottiene la lista dei controlli da includere nella regola in auditcheck

    //Non filtra più la configurazione annuale >> ora filtra di nuovo in base al flag
    //if (FILTRA_CFG_ANNUALE) filter= GetData.MergeFilters(filter,filtercheck);

    await conn.selectIntoTable({table: auditcheck, orderBy:"idaudit ASC, idcheck ASC",
        filter: q.and(q.eq("tablename",tableName),q.eq("opkind",opKind),
            q.isNotNull("sqlcmd"), q.ne("severity","I"),
            q.eq("precheck", preCheck?"S":"N"))});

    await conn.selectIntoTable({table: auditcheck,
        filter: q.and(q.eq("tablename",tableName),q.eq("opkind",opKind),
            q.eq("precheck", preCheck?"S":"N"))});

    //Calcola la lista dei parametri di input della stored procedure risultante
    // e compila i messaggi con i nomi dei parametri
    // Nota: questi non dipendono, stranamente, dalla cfg. annuale
    let substitutions = evaluateParameters(environment, conn, CR, tableName, opKind, preCheck);

    let NChecks=auditcheck.rows.length;
    if (NChecks===0){
        return [await dropSPCommand(conn,tableName,opKind, preCheck),Parameters];
    }
    let prefixChar = conn.sqlConn.driverName==='SqlServer'?'@':'_';

    let storedProc = await getSPHeader(dbDescriptor,conn,tableName,opKind, Parameters,preCheck,NChecks);
    let beginSection = getBeginFragment(conn.sqlConn.driverName, NChecks);


    let Expr = {};
    let AuditChecks= [];
    let Aggregates = [];
    let driverName = conn.sqlConn.driverName;

    for(let auditIndex=0; auditIndex<auditIndex; auditIndex++){
        let audit=auditcheck.rows[auditIndex];
        let sqlcmd= audit["sqlcmd"];
        if (sqlcmd.toLowerCase().startsWith("--skip")){
            continue;
        }
        sqlcmd= compact(sqlcmd).toLowerCase();
        //sqlcmd= StripComments(sqlcmd);
        //sqlcmd= sqlcmd.Replace("%<esercizio>%","%<sys_esercizio>%");
        //sqlcmd= sqlcmd.Replace("!=","<>");
        let sql= compileExpressions(prefixChar, Expr, Aggregates, sqlcmd, 0);

        AuditChecks[auditIndex]= new AuditCheck(auditIndex + 1,
            audit["idaudit"], audit["idcheck"],
            audit["message"], sqlcmd, driverName);

        //storedproc.Append(AC.GetHeader());
        //storedproc.Append( MainAuditSqlCmd(sql, auditindex,NChecks));
        //auditindex++;
    }
    //Devo suddivider in dichiarazioni, assegnazioni, corpo per gestire le differenze
    //  tra i vari db
    if (driverName !== 'Oracle'){
        storedProc+="BEGIN\n";
    }
    storedProc+=getOptimizedSp(AuditChecks, Expr, driverName);

    CR.tables["auditcheckview"].acceptChanges();
    CR.tables["audit"].acceptChanges();
    CR.tables["tableop"].acceptChanges();
    storedProc+=getSpFooter();
    return [storedProc, Parameters];
}
/**
 * @param {Context} ctx
 * @param {DataAccess} conn
 * @param {string} tableName
 * @param {string} opName
 * @param {jsDataQuery} filterCheck
 * @return {string}
 */
async function recalcAudit(ctx, tableName, opName,filterCheck){
    //Non filtrare i controlli in base alla con
    //filtercheck = Conn.GetSys("filterrule").ToString();
    let environment  = ctx.environment;
    let dbDescriptor = ctx.dbDescriptor;
    let DA = ctx.dataAccess;
    let resMsg="Error recompiling rules";
    try{
        for (const preCheck of [true, false]){
            const [sqlCmd, parameters] = await getAuditForOperation(environment, dbDescriptor, DA,
                tableName, opName, preCheck, filterCheck);
            if (!parameters.dataset.hasChanges()){
                if (sqlCmd !== null){
                    try{
                        let r = await DA.runSql(sqlCmd);

                    } catch (e){
                        return e;
                    }

                }
            }
            else{
                //Easy_PostData CP = new Easy_PostData();
                let myDelegate = function (conn, ds, result){
                    let def = Deferred();
                    conn.runSql(sqlCmd).then(
                        (r) => {
                        def.resolve(true);
                        },
                        err => {
                            result.addError(err, true);
                            def.resolve(false);
                        });
                    return def.promise();
                };
                let p = new PostData();
                await p.init(parameters.dataset, ctx, myDelegate);
                let mc = p.createBusinessLogicResult();
                /**
                 * @type {{canIgnore: boolean, checks: BasicMessage[], data: DataSet}}
                 */
                let postResult = await p.doPost({previousRules: mc});
                if (postResult.checks && postResult.checks.length > 0){
                    return resMsg;
                }

            }
        }
    }
    catch(e){
        return e;
    }
    return null;

}


module.exports= recalcAudit;