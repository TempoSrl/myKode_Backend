
function isABlock(s){
    if (!s.startsWith("(")){
        return false;
    }
    if (!s.endsWith(")")){
        return false;
    }
    return closeBlock(s,1,'(',')')===s.length;
}


/**
 *
 * @param S
 * @param start
 * @param BEGIN
 * @param END
 * @returns {number|*}
 */
function closeBlock(S, start, BEGIN,END){
    let index = start;
    let level = 1;
    while ((index >= 0) && (index < S.length)){
        index = nextNonComment(S, index);
        if (index < 0){
            return -1;
        }
        let C = S[index];
        if (C === '"'){
            index = closedString(S, index + 1, '"');
            continue;
        }
        if (C === '\''){
            index = closedString(S, index + 1, '\'');
            continue;
        }
        if (C === BEGIN){
            level++;
            index++;
            continue;
        }
        if (C === END){
            level--;
            index++;
            if (level === 0){
                return index;
            }
            continue;
        }
        index++;
    }
    return -1;
}


/**
 * Searches for the closing of a multiline comment C or sql-style
 * @param {string} S
 * @param {int}start
 * @returns {number|*}
 */
function closedComment(S, start) {
    let index = S.indexOf("*/", start);
    if (index < 0) {
        return -1;
    }
    return index + 2;
}


/**
 * Searches for the end of a string
 * @param {string} S
 * @param {int} start
 * @param {string} stop  stop character
 * @returns {number|*}
 */
function closedString(S, start, stop) {
    let num = start;
    while (num < S.length) {
        if (S[num] === '\\') {// carattere di escape
            num += 2; // Salta due caratteri dopo il backslash
            continue;
        }
        if (S[num] === stop) {
            return num + 1;
        }
        num++;
    }

    return -1;
}


function nextNonComment(S, start){
    let index = start;
    while ((index < S.length) && (index >= 0)){
        let C = S[index];

        //Salta i commenti normali
        if (C === '/'){
            try{
                //vede se è un commento normale ossia /* asas */
                if (S[index + 1] === '*'){
                    index = closedComment(S, index + 2);
                    continue;
                }
                if (S[index + 1] === '/'){
                    let next1 = S.indexOf("\n", index);
                    let next2 = S.indexOf("\r", index);
                    if ((next1 === -1) && (next2 === -1)){
                        return S.length;
                    }
                    if (next1 === -1){
                        index = next2 + 1;
                        continue;
                    }
                    if (next2 === -1){
                        index = next1 + 1;
                        continue;
                    }
                    if (next1 < next2){
                        index = next1 + 1;
                    }
                    else{
                        index = next2 + 1;
                    }
                    continue;

                }
            } catch (e){
                return -1;
            }
        }
        if ((C === ' ') || (C === '\n') || (C === '\r') || (C === '\t')){
            index++;
            continue;
        }
        return index;
    }

    return -1;
}


/**
 *
 * @param {string}S
 * @param start
 * @param pos
 * @returns {boolean}
 */
function isInsideComment(S, start, pos) {
    let num = start;
    while (num < S.length && num >= 0) {
        let c = S[num];

        try {
            if (c === '/') {
                if (S[num + 1] === '*') {
                    num = closedComment(num + 2);
                    if (pos < num) return true;
                    continue;
                }

                if (S[num + 1] === '/') {
                    let num2 = S.indexOf("\n", num);
                    let num3 = S.indexOf("\r", num);
                    let newLineIndex = (num2 === -1) ? num3 : ((num3 === -1) ? num2 : Math.min(num2, num3));
                    if (newLineIndex === -1) {
                        return true;  // No newline found after //
                    }
                    num = newLineIndex + 1;
                    if (pos < num) return true;
                    continue;
                }
            }
            num++;
            if (num > pos) return false;
        } catch (error) {
            return true;
        }
    }

    return false;
}

/**
 *
 * @param {string} S
 * @param {string} C
 * @param {int} start
 * @return int
 * @constructor
 */
function getNextUncommentedString( S,  C, start){
    try {
        let pos = S.indexOf(C,start);
        while (pos>=0 && isInsideComment(S,start,pos))
            pos= S.indexOf(C,pos+1);
        return pos;
    }
    catch {
        return -1;
    }

}


function getNextNonStringConst(S, C, start) {
    let pos = S.indexOf(C, start);
    if (pos === -1) return -1;

    let nextOpenStr = S.indexOf("'", start);

    try {
        while (nextOpenStr !== -1 && pos >= nextOpenStr) {
            let nextCloseStr = S.indexOf("'", nextOpenStr + 1);

            while (nextCloseStr !== -1 && nextCloseStr < S.length - 1) {
                if (S[nextCloseStr + 1] === "'") {
                    nextCloseStr = S.indexOf("'", nextCloseStr + 2);
                    continue;
                }
                break;
            }

            if (nextCloseStr === -1) {
                return -1;
            }

            if (pos < nextCloseStr) {
                if (nextCloseStr === S.length - 1) {
                    return -1;
                }
                pos = S.indexOf(C, nextCloseStr);
            }

            start = nextCloseStr + 1;
            nextOpenStr = S.indexOf("'", start);
        }
    } catch (error) {
        return -1;
    }

    return pos;
}


/**
 *  Searches the end of a string
 * @param {string} S
 * @param {int} start
 * @returns {*}
 */
function getNextIdentifier(S, start) {
    let i;
    for (i = start; (S[i].match(/[a-zA-Z0-9]/) || S[i] === '_') && i < S.length; i++) {
    }

    return S.substring(start, i);
}



module.exports = {
    isABlock: isABlock,
    closeBlock:closeBlock,
    nextNonComment:nextNonComment,
    closedString:closedString,
    closedComment:closedComment,
    getNextUncommentedString:getNextUncommentedString,
    isInsideComment:isInsideComment,
    getNextIdentifier:getNextIdentifier,
    getNextNonStringConst:getNextNonStringConst
}