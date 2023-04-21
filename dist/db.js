"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg = require("pg").Pool;
require("dotenv").config();
exports.pool = new pg({
    user: process.env.PG_USER,
    password: "**1234Lanr",
    host: process.env.PG_HOST,
    post: process.env.PG_PORT,
    database: process.env.PG_DATABASE
});
