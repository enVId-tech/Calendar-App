"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = generateRandomNumber;
exports.encryptPassword = encryptPassword;
exports.comparePassword = comparePassword;
exports.encryptData = encryptData;
exports.decryptData = decryptData;
exports.encryptIP = encryptIP;
exports.decryptIP = decryptIP;
exports.permanentEncryptPassword = permanentEncryptPassword;
var crypto_1 = require("crypto");
var bcrypt_1 = require("bcrypt");
var encryptionKey = crypto_1.default.scryptSync('passphrase', 'salt', 32); // Deriving a secure encryption key using scrypt
var iv = crypto_1.default.randomBytes(16); // 16 bytes for AES-256-GCM
function getRandomIndex(max) {
    return Math.floor(Math.random() * max);
}
/**
 * Generates a random number of specified digits and type
 * @param {number} numberOfDigits - Number of digits to be generated
 * @param {GenerationType} type - Type of generation (number, string, alphanumeric, both)
 * @returns {string} - The generated random value
 */
function generateRandomNumber(numberOfDigits, type) {
    try {
        var digits = '0123456789';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var alphanumeric = digits + characters;
        var validCharacters = '';
        switch (type) {
            case 'number':
                validCharacters = digits;
                break;
            case 'string':
                validCharacters = characters;
                break;
            case 'alphanumeric':
                validCharacters = alphanumeric;
                break;
            case 'both':
                validCharacters = digits + characters;
                break;
            default:
                console.error("\x1b[31m", 'Invalid type of generation, valid types are: number, string, alphanumeric, both');
        }
        var randomNumber = '';
        for (var i = 0; i < numberOfDigits; i++) {
            var randomIndex = getRandomIndex(validCharacters.length);
            randomNumber += validCharacters[randomIndex];
        }
        return randomNumber;
    }
    catch (error) {
        console.error("\x1b[31m", "Error generating random number: ".concat(error));
        throw new Error(error);
    }
}
/**
 * Encrypts the given plaintext password using bcrypt
 * @param {string} myPlaintextPassword - Text to be encrypted
 * @param {number} saltRounds - Number of rounds of encryption (more rounds = more secure, but slower to compute), recommended: 10 (default), max: 31
 * @returns {Promise<string>} - A one-way encryption of the password
 */
function encryptPassword(myPlaintextPassword_1) {
    return __awaiter(this, arguments, void 0, function (myPlaintextPassword, saltRounds) {
        var hash, error_1;
        if (saltRounds === void 0) { saltRounds = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bcrypt_1.default.hash(myPlaintextPassword, saltRounds)];
                case 1:
                    hash = _a.sent();
                    return [2 /*return*/, hash];
                case 2:
                    error_1 = _a.sent();
                    console.error("\x1b[31m", error_1);
                    throw new Error(error_1);
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Encrypts the given plaintext password using SHA-256
 * @param {string} myPlaintextPassword - Text to be encrypted
 * @returns {string} - The hashed password
 */
function permanentEncryptPassword(myPlaintextPassword) {
    try {
        var hash = crypto_1.default.createHash('sha256');
        var data = hash.update(myPlaintextPassword, 'utf-8');
        var digest = data.digest('hex');
        return digest;
    }
    catch (error) {
        console.error("\x1b[31m", error);
        throw new Error(error);
    }
}
/**
 * Compares a password with its hashed version
 * @param {string} password - Text to be compared
 * @param {string} hashedPassword - Text to be compared to
 * @returns {Promise<boolean>} - Whether the passwords match or not
 */
function comparePassword(password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var match, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, permanentEncryptPassword(password)];
                case 1:
                    match = _a.sent();
                    if (match === hashedPassword) {
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("\x1b[31m", error_2);
                    throw new Error(error_2);
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Encrypts data using AES-256-GCM
 * @param {string} newData - Data to be encrypted
 * @param {string} encryptionAlg - ONLY USE IF YOU KNOW WHAT YOU ARE DOING - Encryption algorithm to be used, default: aes-256-gcm
 * @returns {Promise<{ encryptedData: string, authTag: Buffer }>} - Encrypted data and authentication tag
 */
function encryptData(newData, encryptionAlg) {
    return __awaiter(this, void 0, void 0, function () {
        var encryptionAlgorithm, cipher, encryptedData, authTag;
        return __generator(this, function (_a) {
            try {
                encryptionAlgorithm = encryptionAlg || 'aes-256-gcm';
                cipher = crypto_1.default.createCipheriv(encryptionAlgorithm, encryptionKey, iv);
                encryptedData = cipher.update(newData, 'utf8', 'hex');
                encryptedData += cipher.final('hex');
                authTag = cipher.getAuthTag();
                return [2 /*return*/, { encryptedData: encryptedData, authTag: authTag }];
            }
            catch (error) {
                console.error("\x1b[31m", error);
                throw new Error(error);
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Decrypts data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data
 * @param {Buffer} authTag - Authentication tag
 * @returns {Promise<string>} - Decrypted data
 */
function decryptData(encryptedData, authTag) {
    return __awaiter(this, void 0, void 0, function () {
        var decipher, decryptedData;
        return __generator(this, function (_a) {
            try {
                decipher = crypto_1.default.createDecipheriv('aes-256-gcm', encryptionKey, iv);
                decipher.setAuthTag(authTag);
                decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
                decryptedData += decipher.final('utf8');
                return [2 /*return*/, decryptedData];
            }
            catch (error) {
                console.error("\x1b[31m", error);
                throw new Error(error);
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Encrypts the IP address
 * @param {string} ip - IP address to be encrypted
 * @returns {string} - Encrypted IP address
 */
function encryptIP(ip) {
    try {
        return ip.split('.').map(function (part) { return parseInt(part, 10).toString(16); }).join('');
    }
    catch (error) {
        console.error("\x1b[31m", error);
        throw new Error(error);
    }
}
/**
 * Decrypts the IP address
 * @param {string} encryptedIP - Encrypted IP address
 * @returns {string} - Decrypted IP address
 */
function decryptIP(encryptedIP) {
    try {
        var match = encryptedIP.match(/.{1,2}/g);
        var ip = match ? match.map(function (part) { return parseInt(part, 16); }).join('.') : '';
        return ip;
    }
    catch (error) {
        console.error("\x1b[31m", error);
        throw new Error(error);
    }
}
// Export all the functions as a single object with a common name
var encrypts = {
    generateRandomNumber: generateRandomNumber,
    encryptPassword: encryptPassword,
    comparePassword: comparePassword,
    encryptData: encryptData,
    decryptData: decryptData,
    encryptIP: encryptIP,
    decryptIP: decryptIP,
    permanentEncryptPassword: permanentEncryptPassword,
};
exports.default = encrypts;
