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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserProfile = exports.signin = exports.signup = void 0;
const db_1 = require("../db");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        //    Find if user exist
        const findUser = yield db_1.pool.query("SELECT username FROM user_info WHERE username = $1", [username]);
        if (findUser.rows.length > 0) {
            res.send({ message: "Username already exist", status: false });
        }
        else {
            //hash the user password
            const hashedPasword = yield brcypt.hash(password, 10);
            //  user db insertion
            const registerUser = yield db_1.pool.query("INSERT INTO user_info(username, password) VALUES($1, $2)", [username, hashedPasword]);
            //  token creation
            const userToken = yield jwt.sign({ userId: username }, process.env.TKN, { expiresIn: "7d" });
            res.send({ status: true, client_Token: userToken, username: username });
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = (message, status, username) => {
        res.send({ message: message, status: status, username });
    };
    try {
        const { username, password } = req.body;
        const findUser = yield db_1.pool.query("SELECT * FROM user_info WHERE username = $1", [username]);
        if (findUser.rows.length > 0) {
            const checkIfPassword = yield brcypt.compare(password, findUser.rows[0].password);
            if (checkIfPassword) {
                const userToken = yield jwt.sign({ userId: findUser.rows[0].username }, process.env.TKN, { expiresIn: "7d" });
                message(userToken, true, findUser.rows[0].username);
            }
            else {
                message("Invalid Password", false);
            }
        }
        else {
            message("Invalid login crendentails", false);
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.signin = signin;
const verifyUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = (userData, status, loggedIn, currentUser, noUserFound, lookedForUser, id, message) => {
        switch (id) {
            case 11:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message });
            case 12:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message });
            case 13:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message: message });
            case 2:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser, lookedForUser: lookedForUser, message: message });
            case 0:
                return res.send({ bothUnavailable: noUserFound, status: status, loggedIn: loggedIn, message: message });
            default:
                return res.send({ noUserFound: noUserFound, message: message });
        }
    };
    const searchForUser = (userId, lookedForUserUsername) => __awaiter(void 0, void 0, void 0, function* () {
        // A fuction that looks for both user
        const lookedForUser = yield db_1.pool.query("SELECT * FROM user_info WHERE username IN ($1, $2)", [userId, lookedForUserUsername]);
        // If only one user is found is either the person search for or the person searching
        const ifUser = yield lookedForUser.rows.filter((name) => name.username === userId);
        const ifOtherUser = yield lookedForUser.rows.filter((name) => name.username === lookedForUserUsername);
        if (lookedForUser.rows.length === 1) {
            // if it the person searching
            if (ifUser.length === 1 && lookedForUserUsername === ifUser[0].username) {
                console.log("User is logged in");
                message(ifUser[0], true, true, true, false, { id: 0, username: "", password: "" }, 11, "Only the user logged in is found");
            }
            else if (ifUser.length === 1 && lookedForUserUsername !== ifUser[0].username) {
                message(ifUser[0], true, true, true, false, { id: 0, username: "", password: "" }, 12, "User Searched for not found");
            }
            else {
                // If it's the person searched for
                console.log("user is not logged");
                message({ id: 0, username: "", password: "" }, true, false, false, false, lookedForUser.rows[0], 13, "Only the user searched for is found");
            }
        }
        else if (lookedForUser.rows.length === 2) {
            // It checks if both users details are availbale
            console.log("both user are looged available");
            message(ifUser[0], true, true, true, false, ifOtherUser[0], 2, "Both users found");
        }
        else if (lookedForUser.rows.length === 0) {
            // It checks if no user is found
            message({ id: 0, username: "", password: "" }, false, false, false, false, { id: 0, username: "", password: "" }, 0, "No user found");
        }
    });
    try {
        const identification = req.headers.authorization.split(",");
        console.log(identification);
        const verfifyToken = yield jwt.verify(identification[1], process.env.TKN);
        console.log(verfifyToken);
        searchForUser(verfifyToken.userId, identification[2]);
    }
    catch (error) {
        if (error.message === "jwt malformed") {
            const identification = req.headers.authorization.split(",");
            searchForUser("", identification[2]);
        }
        console.log(error.message);
    }
});
exports.verifyUserProfile = verifyUserProfile;
// module.exports = {
//     signup,
//     signin
// }
