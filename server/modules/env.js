"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_PORT = exports.CLIENT_PORT = exports.APP_HOSTNAME = exports.CLIENT_SECRET = exports.CLIENT_ID = exports.CLIENT_DB = exports.URI = void 0;
var dotenv_1 = require("dotenv");
dotenv_1.default.config({ path: './credentials.env.local' });
/**
 * The URI for the MongoDB database.
 */
var URI = process.env.MONGODB_URI || undefined;
exports.URI = URI;
/**
 * The name of the client database.
 */
var CLIENT_DB = process.env.CLIENT_DB || undefined;
exports.CLIENT_DB = CLIENT_DB;
/**
 * The ID of the client.
 */
var CLIENT_ID = process.env.CLIENT_ID || undefined;
exports.CLIENT_ID = CLIENT_ID;
/**
 * The client secret.
 */
var CLIENT_SECRET = process.env.CLIENT_SECRET || undefined;
exports.CLIENT_SECRET = CLIENT_SECRET;
/**
 * The hostname of the application.
 */
var APP_HOSTNAME = process.env.APP_HOSTNAME || "localhost";
exports.APP_HOSTNAME = APP_HOSTNAME;
/**
 * The port number for the client.
 */
var CLIENT_PORT = parseInt(process.env.CLIENT_PORT) || 3000;
exports.CLIENT_PORT = CLIENT_PORT;
/**
 * The port number for the server.
 */
var SERVER_PORT = parseInt(process.env.SERVER_PORT) || 3001;
exports.SERVER_PORT = SERVER_PORT;
