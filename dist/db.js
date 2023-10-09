"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg = require("pg").Pool;
require("dotenv").config();
exports.pool = new pg({
    user: process.env.PG_USER,
    password: `${process.env.PG_DBPASS}`,
    host: process.env.PG_HOST,
    post: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    connectionString: `${process.env.DB_CONNECTION_LINK}`,
    ssl: {
        rejectUnauthorized: false,
    }
});
