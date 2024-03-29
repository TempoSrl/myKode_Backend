/*globals Context,sqlFun,DataRelation,ObjectRow  */
const q = require('./../client/components/metadata/jsDataQuery');
const _ = require('lodash');

/**
 * notFound|constant|fieldName|operator|openPar|closedPar|endOfString|comma|openEnvironment|closeEnvironment
 * @enum TokenKind
 */
const TokenKind= {
    /**
     * unknown token
     */
    notFound:0,
    /**
     * numeric or string, for now we ignore date constants
     */
    constant:1,
    /**
     * Field name
     */
    fieldName:2,
    /**
     * Operator
     */
    operator:3,
    /**
     *
     */
    openPar:4,
    /**
     *
     */
    closedPar:5,
    /**
     *
     */
    endOfString:6,
    /**
     *
     */
    comma:7,
    /**
     *
     */
    openEnvironment:8,
    /**
     *
     */
    closeEnvironment:9
};

/**
 * Information on an operator
 * @constructor
 */
function OperatorDescriptor(){
    /**
     * Operator is unary prefixed
     * @type {boolean}
     */
    this.unaryPrefixed=false;

    /**
     * Operator  is unary postfixed
     * @type {boolean}
     */
    this.unaryPostfixed=false;

    /**
     * Operator is unary binary
     * @type {boolean}
     */
    this.binary=false;

    /**
     *  Operator is n-ary
     * @type {boolean}
     */
    this.nary=false;

    /**
     * Evaluation order of operator
     * @type {number}
     */
    this.evaluationOrder=0;
    this.name = "";

    /**
     * Operator precededs a list
     * @type {boolean}
     */
    this.precedesList = false;

}
OperatorDescriptor.prototype = {
    constructor: OperatorDescriptor
};

/**
 * Helper class to build jsDataQuery
 * @param {BuildingExpression} parent
 * @constructor
 */
function BuildingExpression(parent){
    /*BuildingExpression[]*/
    this.operands = [];

    /* OperatorDescriptor */
    this.op= null;

    /* BuildingExpression */
    this.parent = parent;

    this.lastWasOperator=false;
    this.lastWasOperand=false;
}



BuildingExpression.prototype = {
    constructor: BuildingExpression,
    evaluationOrder: function (){
        return this.op.evaluationOrder;
    },
    setLastAsOperand:function (){
        this.lastWasOperand=true;
        this.lastWasOperator=false;
    },
    setLastAsOperator:function (){
        this.lastWasOperand=false;
        this.lastWasOperator=true;
    },
    replaceOperand:function(oldOperand,newOperand){
        for(let i=0;i<this.operands.length;i++){
            if (this.operands[i]===oldOperand){
                this.operands[i]=newOperand;
                break;
            }
        }
    },
    /**
     *
     * @param {BuildingExpression} expr
     */
    addOperand:  function (expr){
      this.operands.push(expr);
      expr.parent = this;
      this.setLastAsOperand();
    },
    /**
     *  creates a new expression as a child of this one, so that the new expression is an operand of the current one.
     *  Useful if operator is we have  a+b+c+d   and then comes *, or we have a &lt; b   and then comes +
     *  i.e. if evaluation order of new operator is less than the current one
     *  The new expression has last operand as first operand, so the result is (a+b+c+(d*...
     *  Returns the new created child expression, in this example d*
     */
    createChildExpression: function (){
        let child = new BuildingExpression(this.parent);
        if (this.operands.length===0){
            this.addOperand(child);
        }
        else {
            let lastOperandIndex = this.operands.length-1;
            let lastOperand = this.operands[lastOperandIndex];
            child.addOperand(lastOperand);
            this.operands[lastOperandIndex]= child;
            child.parent = this;
        }
        return child;
    },

    createParentExpression: function () {
        let originalParent = this.parent;
        let newExpr= new BuildingExpression(originalParent);
        newExpr.addOperand(this);  //"this" becomes an operand of newExpr
        if (originalParent === null) {
            // A    >>          P ( A )      >>> returns P(A)
            //There is no current parent
            return newExpr;
        }
        // B (,... A )   >>     B (,.. P ( A ) )   >> returns P(A)
        originalParent.replaceOperand(this,newExpr);
        return newExpr;
    },
    /**
     *
     * @return {BuildingExpression}
     */
    outerExpression: function(){
        let curr=this;
        while (curr.parent){
            curr= curr.parent;
        }
        return curr;
    }

};
/* OperatorDescriptor */
BuildingExpression.prototype.listDescriptor = _.extend(
        new OperatorDescriptor(),
        {name:"list",evaluationOrder:1000,nary:true});

/**
 *
 * @return {sqlFun|null}
 */
BuildingExpression.prototype.build = function (){
    /* sqlFun[] */
    let metaOperands =  this.operands.map(o => o.build());
    if (this.op===null){
        if (metaOperands.length===0){
            return null;
        }
        if (metaOperands.length===1){
            return metaOperands[0];
        }
        return  q.list(metaOperands);
    }
    switch (this.op.name){
        case '&': return  q.bitwiseAnd(metaOperands);
        case '|': return  q.bitwiseOr(metaOperands);
        case '~': return  q.bitwiseNot(metaOperands[0]);
        case '^': return  q.bitwiseXor(metaOperands);
        case 'list': return  q.list(metaOperands);
        case 'like': return  q.like(metaOperands[0],metaOperands[1]);
        case 'between': return  q.between(metaOperands[0],metaOperands[1],metaOperands[2]);
        case 'par': return  q.doPar(metaOperands[0]);
        case 'and': return  q.and(metaOperands);
        case 'or': return  q.or(metaOperands);
        case 'not': return  q.not(metaOperands[0]);
        case 'not in': return  q.isNotIn(metaOperands[0],metaOperands[1]);
        //metaOperands[1] è un semplice array poiché è costante ed è stato già restituito come risultato
            // tuttavia per questo motivo non ha la proprietà paramList
        case 'in': return  q.isIn(metaOperands[0],metaOperands[1]);
        case 'is null': return  q.isNull(metaOperands[0]);
        case 'is not null': return  q.isNotNull(metaOperands[0]);
        case 'isnull': return  q.coalesce(metaOperands[0]);
        case '%': return  q.modulus(metaOperands[0],metaOperands[1]);
        case '-': return  q.minus(metaOperands[0],metaOperands[1]);
        case '/': return  q.div(metaOperands[0],metaOperands[1]);
        case '>=': return  q.ge(metaOperands[0],metaOperands[1]);
        case '<=': return  q.le(metaOperands[0],metaOperands[1]);
        case '>': return  q.gt(metaOperands[0],metaOperands[1]);
        case '<': return  q.lt(metaOperands[0],metaOperands[1]);
        case '=': return  q.eq(metaOperands[0],metaOperands[1]);
        case '<>': return  q.ne(metaOperands[0],metaOperands[1]);
        case '*': return  q.mul(metaOperands);
        case '+': return  q.add(metaOperands);
        default: return  null;





    }

};
/**
 * Creates an operation in parentheses into a parent expression
 * @param {BuildingExpression} child
 */
BuildingExpression.prototype.createParentesizedExpression = function(child){
    let newExpr = new BuildingExpression(null);
    newExpr.addOperator(_.extend(new OperatorDescriptor(),{name:"par",evaluationOrder:0}));
    newExpr.addOperand(child);
    return newExpr;
};


/**
 * Creates an operation into a parent expression
 * @param {BuildingExpression} parent
 */
BuildingExpression.prototype.createList = function(parent){
    let newExpr = new BuildingExpression(parent);
    newExpr.addOperator(this.listDescriptor);
    return newExpr;
};




/***
 * Adds an operator to current expression, setting it to opToAdd
 * @param {OperatorDescriptor} opToAdd
 * @return {BuildingExpression|*}
 */
BuildingExpression.prototype.addOperator= function(opToAdd) {
    if (this.op === null) {
        this.op = opToAdd; //opera sull'espressione corrente
        if (!opToAdd.unaryPostfixed) {
            this.setLastAsOperator();
        }
        return this;
    }

    if (this.op.nary && this.op.name===opToAdd.name) {
        this.setLastAsOperator();
        return this;
    }

    if (this.op.name==="between" && opToAdd.name==="and" && this.operands.length===2) {
        this.setLastAsOperator();
        return this;
    }

    let newExpr = this.appendExpression(opToAdd);
    newExpr.op = opToAdd;
    newExpr.setLastAsOperator();
    return newExpr;
};

/**
 *
 * @param {OperatorDescriptor} op
 * @return {BuildingExpression}
 */
BuildingExpression.prototype.appendExpression = function (op) {
    if (op.unaryPrefixed && this.operands.length > 0) {
        let newExpression = new BuildingExpression(this);
        this.operands.push(newExpression);
        return newExpression;
    }
    let opEvaluationOrder = op.evaluationOrder;
    if (this.evaluationOrder() < opEvaluationOrder) {
        //l'ordine di valutazione corrente è minore di quello nuovo: siamo nel caso a*b*c/d +
        // quindi va creata una nuova espressione in cui la precedente sia il primo operando
        let par = this.findSuitableParentForOperator(opEvaluationOrder);
        if (par.op !== null && par.op.name === op.name) {
            if (op.binary && par.operands.length === 1) {
                return par;
            }
            if (op.nary) {
                return par;
            }
        }
        return par.createParentExpression();
    }
    if (this.op.binary && this.operands.length===2 && this.evaluationOrder()===op.evaluationOrder){
        return this.createParentExpression();
    }
    //siamo nel caso a+b *
    // in questo caso creiamo una espressione in cui quello che segue prende come primo operando l'ultimo che c'era
    return this.createChildExpression();
};



/***
 * Searches the first parent having an evaluationOrder lower than the given operator
 * @param {int} opEvaluationOrder
 * @return {BuildingExpression|*}
 */
BuildingExpression.prototype.findSuitableParentForOperator = function(opEvaluationOrder) {
    //must search an expression with evaluationOrder lower than the given operator
    // for example A + B <
    // here < must be executed AFTER + so < becomes the root of the expression, >>    < ( A+B,...
    // while in  A < B *
    // another replacement should be applied

    let expr = this;
    while (expr.parent !== null && expr.evaluationOrder() < opEvaluationOrder) {
        expr = expr.parent;
    }

    if (expr.evaluationOrder() > opEvaluationOrder) {
        return expr.operands[expr.operands.length - 1];
    }
    return expr;
};


/**
 *  Gets the root expression
 */
BuildingExpression.prototype.nextParentList = function(){
    let curr=this;
    while (true) {
        if (curr.op === null) {
            return curr;
        }
        if (curr.op.name === "list") {
            return curr;
        }
        if (curr.parent === null) {
            //trasforma questa espressione in una lista di cui la vecchia espressione è il primo elemento
            let newExpr= new BuildingExpression(null);
            newExpr.addOperand(curr);
            newExpr.addOperator(BuildingExpression.prototype.listDescriptor);
            return newExpr;
        }
        curr = curr.parent;
    }
};






/**
 *
 * @param {BuildingExpression} parent
 * @param {string} value
 * @constructor
 */
function EnvironmentExpression(parent, value){
    BuildingExpression.apply(this,[parent]);
    /* {string} */
    this.value= value;

}

EnvironmentExpression.prototype =  _.extend(
    new BuildingExpression(),
    {
        constructor: EnvironmentExpression,
        superClass: BuildingExpression.prototype,
        evaluationOrder: function (){
            return -1;
        }
    }
);
/**
 *
 * @return {sqlFun}
 */
EnvironmentExpression.prototype.build= function (){
    if (this.value.startsWith("sys[")){
        let sysVar= this.value.substr(4,this.value.length-5);
        let fn= env=>{
            return env.sys(sysVar);
        };

        let f= q.context(/*Environment*/ fn);
        f.myName="context.sys";
        f.toString =  function() { return "context.sys["+sysVar+"]"; };
        return  f;
    }
    if (this.value.startsWith("usr[")){
        let usrVar= this.value.substr(4,this.value.length-5);
        let fn= env=>{
            return env.usr(usrVar);
        };

        let f= q.context(/*Environment*/ fn);
        f.myName="context.usr";
        f.toString =  function() { return "context.usr["+usrVar+"]";   };
        return  f;
    }
    return  q.context(this.value);
};


/**
 *
 * @param {BuildingExpression} parent
 * @param {string} value
 * @constructor
 */
function ConstantExpression(parent, value){
    BuildingExpression.apply(this,[parent]);
    /* {string} */
    this.value= value;

}

ConstantExpression.prototype =  _.extend(
    new BuildingExpression(),
    {
        constructor: ConstantExpression,
        superClass: BuildingExpression.prototype,
        evaluationOrder: function (){
            return -1;
        },
        /***
         *
         * @return {sqlFun}
         */
        build: function (){
            return q.constant(this.value);
        }
    }
);


/**
 *
 * @param {BuildingExpression} parent
 * @param {string} fieldName
 * @constructor
 */
function FieldExpression(parent, fieldName){
    BuildingExpression.apply(this,[parent]);
    /* {string} */
    this.value= fieldName;

}

FieldExpression.prototype =  _.extend(
    new BuildingExpression(),
    {
        constructor: FieldExpression,
        superClass: BuildingExpression.prototype,
        evaluationOrder: function (){
            return -1;
        },
        /**
         *
         * @return {sqlFun}
         */
        build: function (){
            return q.field(this.value);
        }
    }
);

/**
 *
 * @param {TokenKind} kind
 * @param {object} value
 * @constructor
 */
function Token(kind,value){
    this.kind=kind;
    this.value = value;
}

Token.prototype = {
    constructor: Token,
    /**
     * @static
     * @param {string} prefix
     * @param {{OperatorDescriptor}}descriptors
     * @return {boolean}
     */
    anyKeyStartsWith: function (prefix, descriptors) {
        return _.some(_.keys(descriptors),
            v=> {
                return v.startsWith(prefix);
            });
    },
    /**
     *
     * @param {char} c
     */
    isOperator: function (c){
        const ops= "+-/*=<>&|";
        return ops.indexOf(c)>=0;
    },
    /**
     *
     * @param {char} c
     */
    isAlfaNum: function (c){
        return (/^[0-9a-zA-Z_]+$/).test(c);
    },
    /**
     *
     * @param {char} c
     */
    isAlfa: function (c){
        return (/^[a-zA-Z_]+$/).test(c);
    },
    isNumeric: function (c){
        return (/^[0-9.]+$/).test(c);
    },
    /**
     * Rimuove tutti i spazi consecutivi tranne che nelle stringhe
     * @static
     * @param sqlCmd
     * @return {string}
     */
    normalize: function(sqlCmd){
        if (sqlCmd===null) {
            return "";
        }
        let prevwasidentifier=false;
        let spaceToAdd=false;
        let res="";
        let index=0;
        //sqlcmd = StripComments(sqlcmd);
        let len = sqlCmd.length;
        while (index< len){
            let c = sqlCmd[index];

            if ((c!==' ')&&(c!=='\n')&&(c!=='\r')&&(c!=='\t')){
                if (Token.prototype.isAlfaNum(c)) {
                    if (spaceToAdd) {
                        res+=" ";
                    }
                    spaceToAdd=false;

                    prevwasidentifier=true;
                }
                else {
                    prevwasidentifier=false;
                    spaceToAdd=false;

                }
                res+=c;

                if (c==='\''){
                    //skips  the string constant
                    index++;
                    //skips the string
                    while (index<len){
                        if (sqlCmd[index]!=='\'') {
                            res+= sqlCmd[index];
                            index++;
                            continue;
                        }
                        //it could be an end-string character
                        if (((index+1)<len)&&(sqlCmd[index+1]==='\'')){
                            //it isn't
                            res+= sqlCmd[index];
                            index++;
                            res+= sqlCmd[index];
                            index++;
                            continue;
                        }
                        res+= sqlCmd[index];
                        break;
                    }
                }

            }
            else {//Converte tutti gli spazi precedenti in uno spazio
                if (prevwasidentifier) {
                    spaceToAdd =true;
                }
                prevwasidentifier=false;
            }
            index++;
        }
        return res;
    },
    /**
     *
     * @param c
     * @return {boolean}
     */
    isSpace: function (c){
        return (c === ' ') || (c === '\n') || (c === '\r') || (c === '\t');
    },

    /**
     * Salta tutti gli spazi a partire dalla posizione corrente
     * @param {string} s
     * @param {int} currPos
     * @return {int}
     */
    skipSpaces:function(s,  currPos){
        while (currPos < s.length) {
            let c = s[currPos];
            if (!Token.prototype.isSpace(c)) {
                return currPos;
            }
            currPos++;
        }
        return  currPos;
    },

    getDescriptor: function(name) {
        return Token.prototype.getDescriptor(this.value);
    },

    /**
     *
     * @return {null|OperatorDescriptor}
     */
    getDescriptorOf: function(name){
        if (Token.prototype.Operators[name]) {
            return Token.prototype.Operators[name];
        }
        if (Token.prototype.AlfaOperators[name]) {
            return Token.prototype.AlfaOperators[name];
        }
        if (Token.prototype.functions[name]){
            return Token.prototype.functions[name];
        }
        return null;
        //return Token.prototype.getDescriptor();
    },

    /**
     * @typedef {Object} stringPos
     * @property {string|null} res
     * @property {int} currPos
     */

    /**
     * get next alfanumeric sequene
     * @param {string} s
     * @param {int} currPos
     * @return {stringPos}
     * */
    getAlfaSequence: function  (s,currPos) {
        let currValue = "";
        let checkAlfaNum = false;
        while (currPos < s.length &&
            ((checkAlfaNum === false && Token.prototype.isAlfa(s[currPos])) ||
                (checkAlfaNum === true && Token.prototype.isAlfaNum(s[currPos]))
            )
            ) {
            currValue += s[currPos];
            checkAlfaNum = true;
            currPos++;
        }
        return {res:currValue, currPos:currPos};
    },
    /**
     *
     * @param {string} s
     * @param {int }currPos
     * @return {{res:Token, currPos:int}}
     */
    getOperator:function (s, currPos) {
        let found = Token.prototype.getTokenOfClass(s, currPos, this.Operators, this.isOperator )       ;
        if (found.res === "<%") {
            let t= new Token(TokenKind.openEnvironment,found.res);
            return  {res:t, currPos:found.currPos};
        }
        if (found.res === "%>") {
            let t= new Token(TokenKind.closeEnvironment,found.res);
            return  {res:t, currPos:found.currPos};
        }
        if (found.res === null) {
            return {res:this.prototype.NoToken, currPos:found.currPos};
        }
        let t= new Token(TokenKind.operator,found.res);
        return  {res:t, currPos:found.currPos};
    },

    /// <summary>
    /// Gets an alfa operator or a field name. Note that an alfa operator may contain spaces, while an identifier does not.
    /// </summary>
    /// <param name="s"></param>
    /// <param name="currPos"></param>
    /// <returns></returns>


    /**
     * Gets an alfa operator or a field name. Note that an alfa operator may contain spaces, while an identifier does not.
     * @param {string} s
     * @param {int} currPos
     * @return {{res:Token, currPos:int}}
     */
    getAlfaToken: function(s,currPos) {
        if (!Token.prototype.isAlfa(s[currPos])) {
            return {res: Token.prototype.NoToken, currPos: currPos};
        }
        let myPos = currPos;
        let alfaSeq = Token.prototype.getAlfaSequence(s, myPos);
        myPos = alfaSeq.currPos;
        if (Token.prototype.AlfaOperators[alfaSeq.res.toLowerCase()]) {
            //restart all again
            let opFound = this.getTokenOfClass(s, currPos, Token.prototype.AlfaOperators, this.isAlfaNum);
            let t = new Token(TokenKind.operator,opFound.res);
            return {res: t, currPos: opFound.currPos};
        }

        if (Token.prototype.functions[alfaSeq.res.toLowerCase()]) {
            let t = new Token(TokenKind.operator,alfaSeq.res.toLowerCase());
            return {res: t, currPos: myPos};
        }

        if (Token.prototype.anyKeyStartsWith(alfaSeq.res.toLowerCase(), Token.prototype.AlfaOperators)) {
            let opFound = Token.prototype.getTokenOfClass(s, currPos, Token.prototype.AlfaOperators, this.isAlfaNum);
            if (opFound.res !== null) {
                let t = new Token(TokenKind.operator,opFound.res);
                return {res: t, currPos: opFound.currPos};
            }
        }
        let t = new Token(TokenKind.fieldName, alfaSeq.res);
        return {res: t, currPos: alfaSeq.currPos};
    },


    /**
     *
     * @param {string} s
     * @param {int} currPos
     * @param {{OperatorDescriptor}} classElements
     * @param {function} testFun
     * @return {{res:string, currPos:int}}
     */
    getTokenOfClass: function (s, currPos, classElements, testFun) {
        let myPos = currPos;
        myPos = Token.prototype.skipSpaces(s, myPos);
        if (myPos >= s.length) {
            return {res: null, currPos: currPos};
        }

        let foundNextPos = currPos;
        let foundValue = null;

        let currValue = s[myPos];
        while (Token.prototype.anyKeyStartsWith(currValue.toLowerCase(), classElements)) {
            //si ferma sul primo carattere che rende currValue non associabile ad un operatore
            myPos++;
            if (classElements[currValue.toLowerCase()]) {
                if (myPos === s.length || !testFun(s[myPos])) {
                    //solo se la stringa è finita o non seguono altri alfanumerici è possibile effettuare il confronto
                    foundNextPos = myPos;
                    foundValue = currValue.toLowerCase();
                }
            }
            if (myPos >= s.length) {
                break;
            }
            currValue += s[myPos].toLowerCase();//aggiunge massimo uno spazio tra pezzi distinti di un token
            if (Token.prototype.isSpace(s[myPos])) {
                myPos = Token.prototype.skipSpaces(s, myPos);
                if (!Token.prototype.isSpace(s[myPos])) {
                    myPos--;//torna indietro altrimenti si perde un carattere
                }
            }
        }

        if (foundValue !== null) {
            return {res: foundValue, currPos: foundNextPos};
        }
        return {res: null, currPos: currPos};
    },

    /**
     *
     * @param {string} s
     * @param {int} currPos
     * @return {{res:Token, currPos:int}}
     */
    getConstantNumeric: function( s, currPos) {
        if (currPos >= s.length) {
            return {res: Token.prototype.NoToken, currPos: currPos};
        }
        if (!this.isNumeric(s[currPos])) {
            return {res: Token.prototype.NoToken, currPos: currPos};
        }
        let curr = "";
        let myPos = currPos;
        while (myPos < s.length && Token.prototype.isNumeric(s[myPos])) {
            curr += s[myPos];
            myPos++;
        }

        let res = Number.parseFloat(curr);
        if (isNaN(res)) {
            return {res: Token.prototype.NoToken, currPos: currPos};
        }
        let t = new Token(TokenKind.constant, res);
        return {res: t, currPos: myPos};
    },

    /**
     *
     * @param {string} s
     * @param {int} currPos
     * @return {{res: Token, currPos:int}}
     */
    getConstantString( s, currPos) {
        if (currPos >= s.length) {
            return {res: Token.prototype.NoToken, currPos: currPos};
        }
        if (s[currPos] !== '\''){
            return {res: Token.prototype.NoToken, currPos: currPos};
        }
        let len = s.length;
        let index = currPos+1;
        let res = "";
        //skips the string
        while (index<len){
            if (s[index]!=="'") {
                res+= s[index];
                index++;
                continue;
            }
            //it could be an end-string character
            if (((index+1)<len)&&(s[index+1]==="'")){
                //it isn't
                res+= s[index]; //prende l'apice e lo mette nel risultato, saltando l'apice successivo
                index++;
                //res+= s[index]; Questo secondo apice non fa veramente parte della stringa equivalente
                index++;
                continue;
            }
            //res+= s[index]; //l'apice finale NON fa parte della stringa equivalente
            return {res: new Token(TokenKind.constant,res), currPos: index+1};
        }
        return {res: new Token(TokenKind.constant,res), currPos: index};
    },

    /**
     * Read a token from a string
     * @param {string} s
     * @param {int} currPos
     * @return {{res: Token, currPos:int}}
     */
    getToken( s, currPos) {
        currPos = Token.prototype.skipSpaces(s,currPos);
        if (currPos >= s.length){
            return {res: Token.prototype.EndOfString, currPos: currPos};
        }
        let c = s[currPos];
        if (Token.prototype.isAlfa(c)) {
            return  Token.prototype.getAlfaToken(s, currPos);
        }
        if (c === '(') {
            return {res: Token.prototype.OpenPar, currPos: currPos+1};
        }

        if (c === ')') {
            return {res: Token.prototype.ClosePar, currPos: currPos+1};
        }
        if (c === '\'') {
            return Token.prototype.getConstantString(s, currPos);
        }

        if (c === ',') {
            return {res: new Token(TokenKind.comma,null), currPos: currPos+1};
        }

        if (Token.prototype.anyKeyStartsWith(c, Token.prototype.Operators)){
            return Token.prototype.getOperator(s, currPos);
        }
        if (Token.prototype.isNumeric(c)) {
            return Token.prototype.getConstantNumeric(s, currPos);
        }
        return {res: Token.prototype.NoToken, currPos: currPos};
    }

};

Token.prototype.EndOfString = new Token(TokenKind.endOfString,undefined);
Token.prototype.NoToken = new Token(TokenKind.notFound,undefined);
Token.prototype.OpenPar = new Token(TokenKind.openPar,undefined);
Token.prototype.ClosePar = new Token(TokenKind.closedPar,undefined);

Token.prototype.AlfaOperators = {
    "and":_.extend(new OperatorDescriptor(),{nary:true,evaluationOrder:100,name:"and"}),
    "between":_.extend(new OperatorDescriptor(),{nary:true,evaluationOrder:70,name:"between"}),
    "or":_.extend(new OperatorDescriptor(),{nary:true,evaluationOrder:120,name:"or"}),
    "not":_.extend(new OperatorDescriptor(),{unaryPrefixed:true,evaluationOrder:110,name:"not"}),
    "not in":_.extend(new OperatorDescriptor(),{binary:true,evaluationOrder:70,name:"not in",precedesList:true}),
    "in":_.extend(new OperatorDescriptor(),{binary:true,evaluationOrder:70,name:"in",precedesList:true}),
    "like":_.extend(new OperatorDescriptor(),{binary:true,evaluationOrder:70,name:"like"}),
    "is null":_.extend(new OperatorDescriptor(),{unaryPostfixed:true,evaluationOrder:70,name:"is null"}),
    "is not null":_.extend(new OperatorDescriptor(),{unaryPostfixed:true,evaluationOrder:70,name:"is not null"})
};


Token.prototype.functions = {
    "isnull": _.extend(new OperatorDescriptor(), {unaryPrefixed: true, evaluationOrder: 1, name: "isnull",precedesList:true})
};


Token.prototype.Operators = {
    "%": _.extend(new OperatorDescriptor(), {nary: true, evaluationOrder: 25, name: "%"}),
    "+": _.extend(new OperatorDescriptor(), {nary: true, evaluationOrder: 20, name: "+"}),
    "-": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 20, name: "-"}),
    "/": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 10, name: "/"}),
    "*": _.extend(new OperatorDescriptor(), {nary: true, evaluationOrder: 10, name: "*"}),
    "&": _.extend(new OperatorDescriptor(), {nary: true, evaluationOrder: 10, name: "&"}),
    "^": _.extend(new OperatorDescriptor(), {nary: true, evaluationOrder: 10, name: "^"}),
    "~": _.extend(new OperatorDescriptor(), {unaryPrefixed: true, evaluationOrder: 5, name: "~"}),
    "|": _.extend(new OperatorDescriptor(), {nary: true, evaluationOrder: 10, name: "|"}),
    "<": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 50, name: "<"}),
    "<%": _.extend(new OperatorDescriptor(), {unaryPrefixed: true, evaluationOrder: 10, name: "openEnvironment"}),
    ">": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 50, name: ">"}),
    "%>": _.extend(new OperatorDescriptor(), {unaryPostfixed: true, evaluationOrder: 25, name: "closeEnvironment"}),
    "=": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 50, name: "="}),
    "<=": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 50, name: "<="}),
    ">=": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 50, name: ">="}),
    "<>": _.extend(new OperatorDescriptor(), {binary: true, evaluationOrder: 50, name: "<>"})
};

/**
 * Class able to transform a string into a jsDataQuery
 */
function JsDataQueryParser(){

}

JsDataQueryParser.prototype = {
    constructor: JsDataQueryParser,
    /**
     *
     * @param {string|null} s
     * @return {sqlFun|null}
     * @constructor
     */
    from: function(s){
        if (s==="" || s===null){
            return null;
        }
        if (s==="AND(1=1)"){
            null;
        }
        s = Token.prototype.normalize(s);
        let resExt = JsDataQueryParser.prototype.getExpression(s,0,false);

        let res= resExt.res;
        if (res) {
            res= res.build();
        }
        if (res===null){
            return  null;
        }
        if (res.isTrue){
            return  null;
        }
        return  res;
    },

    /**
     * @static
     * @param {string} s
     * @param {int} currPos
     * @param {boolean}wantsList
     * @return {{res:?BuildingExpression,currPos:int}}
     */
    getExpression: function(s, currPos, wantsList) {
        currPos = Token.prototype.skipSpaces(s, currPos);
        if (currPos >= s.length) {
            return {res: null, currPos: currPos};
        }
        let expr = wantsList ? BuildingExpression.prototype.createList(null) : new BuildingExpression(null);

        let resT = Token.prototype.getToken(s, currPos);
        currPos = resT.currPos;
        let t = resT.res;
        let internalWantsList = false;
        while (t.kind !== TokenKind.endOfString && t.kind !== TokenKind.notFound) {
            switch (t.kind) {
                case TokenKind.openPar:
                    let internalExprRes = JsDataQueryParser.prototype.getExpression(s, currPos, internalWantsList);
                    currPos = internalExprRes.currPos;
                    expr.addOperand(internalExprRes.res);
                    internalWantsList = false;
                    break;
                case TokenKind.closedPar:
                    if (wantsList) {
                        if (expr) {
                            return {res: expr.nextParentList(), currPos: currPos};
                        }
                        return {res: null, currPos: currPos};
                    }
                    return {
                        res: BuildingExpression.prototype.createParentesizedExpression(expr.outerExpression() ),//
                        currPos: currPos
                    };
                case TokenKind.comma:
                    expr = expr.nextParentList();
                    break;
                case TokenKind.constant:
                    let k = new ConstantExpression(expr, t.value);
                    if (expr !== null) {
                        expr.addOperand(k);
                    }
                    else {//this can never happen
                        expr = k;
                    }
                    break;
                case TokenKind.fieldName:
                    let field = new FieldExpression(expr, t.value);
                    if (expr !== null) {
                        expr.addOperand(field);
                    }
                    else { //this can never happen
                        expr = field;
                    }
                    break;
                case TokenKind.operator:
                    let opDescr = Token.prototype.getDescriptorOf(t.value);
                    if (opDescr.precedesList) {
                        internalWantsList = true;
                    }
                    expr = expr.addOperator(opDescr);
                    break;
                case TokenKind.openEnvironment:
                    let closePosition = s.indexOf("%>", currPos);
                    if (closePosition < 0) {
                        return {res: null, currPos: currPos};
                    }
                    let envName = s.substr(currPos, closePosition - currPos);
                    currPos = closePosition + 2;
                    expr.addOperand(new EnvironmentExpression(expr, envName));
                    break;
            }

            let resT = Token.prototype.getToken(s, currPos);
            t = resT.res;
            currPos = resT.currPos;
        }
        return {res: expr.outerExpression(), currPos: currPos};
    }
}




module.exports = {
    JsDataQueryParser:JsDataQueryParser,
    EnvironmentExpression:EnvironmentExpression,
    BuildingExpression:BuildingExpression,
    Token:Token,
    TokenKind:TokenKind
};