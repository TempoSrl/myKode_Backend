const crypto = require('crypto');

const saltLen = 10;       // Numero di byte da generare per il "salt"
const passwordLen = 12;    // Numero di byte da generare per le password
const codeLen = 12;        // Numero di byte da generare per i codici di attivazione

/**
 * Manages password hashing
 * @module Password
 */


/**
 * Verifies the hash for a password
 * @param {string} password
 * @param {Buffer} salt
 * @param {Buffer} secureHash
 * @param {int} iterations
 * @return {boolean}
 */
async function verify(password,salt,secureHash, iterations,digest){
    if (!password) return  false;
    if (!salt) return  false;
    if (!secureHash) return  false;
    if (iterations<1)return  false;
    if (salt.length < 8) return false;
    if (!digest) digest = 'sha1';
    let pwdHash = generateHash(password, salt, iterations);
    if (!pwdHash) {
        return false;
    }
    if (pwdHash.compare(secureHash) === 0) {
        return true;
    }
    pwdHash = generateHash(password, salt, iterations,digest);
    if (!pwdHash) {
        return false;
    }
    return pwdHash.compare(secureHash) === 0;
}

/**
 * Generates an hash for a password
 * @param {string} password
 * @param {Buffer} salt
 * @param {int} iterations
 * @param {string} [digest]  sha1|sha256|sha512
 * @return {Buffer}
 */
function generateHash(password,salt,iterations, digest){
    if (!password) return null;
    if (!salt) return  null;
    if (iterations<1)return  null;
    if (salt.length < 8) return null;
    if (!digest) digest = "sha256";
    return crypto.pbkdf2Sync(Buffer.from(password), salt, iterations, 20, digest);
}

/**
 * Generates an array of random bytes of the specified size
 * @param {int} len
 * @return {Buffer}
 */
function generateRandomBytes(len){
    return crypto.randomBytes(len);
    // var key = new byte[length];
    //
    // using (RNGCryptoServiceProvider csprng = new RNGCryptoServiceProvider()) {
    //     csprng.GetBytes(key);
    // }
    //
    // return key;
}

/**
 * @return {Buffer}
 */
function generateSalt(){
    return generateRandomBytes(saltLen);
}

/**
 * @generates a random password
 * @return {string}
 */
function generatePassword(){
    return generateRandomBytes(passwordLen).toString("base64").slice(0, -1);
}


/**
 * Generates a random activation code
 * @return {string}
 */
function generateCode(){
    return generateRandomBytes(codeLen).toString("base64").slice(0, -1);
}




module.exports= {
    verify:verify,
    generateHash:generateHash,
    generateSalt:generateSalt,
    generatePassword:generatePassword,
    generateCode:generateCode
};
