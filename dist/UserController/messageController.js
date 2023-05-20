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
exports.deleteMessage = exports.updatechecked = exports.sendOrCreateMessageConnection = void 0;
const db_1 = require("../db");
const sendOrCreateMessageConnection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { owner, notowner, sender, text, time } = req.body;
        console.log(owner, notowner);
        const searchForBothUsersQuery = "SELECT * FROM groupie_p_chat WHERE owner = $1 AND notowner = $2";
        const searchForOwnerMessageBox = yield db_1.pool.query(searchForBothUsersQuery, [owner, notowner]);
        const searchForNotOwnerMessageBox = yield db_1.pool.query(searchForBothUsersQuery, [notowner, owner]);
        const addToExistingQuery = "UPDATE groupie_p_chat SET message = message || $1 WHERE owner = $2";
        const createNewMessageQuery = "INSERT INTO groupie_p_chat(owner, notowner,notowner_imgurl, message) VALUES($1,$2,$3,$4)";
        const addMessageFunction = (user1, user2, addUser, checked1, checked2) => __awaiter(void 0, void 0, void 0, function* () {
            // let = { sender: sender, text: text, checked: false, time: time }
            const addMessage = yield db_1.pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: checked1, time: time }), addUser]);
            const createMessageBox = yield db_1.pool.query(createNewMessageQuery, [user1, user2, "", JSON.stringify([{ sender: sender, text: text, checked: checked2, time: time }])]);
        });
        // const message = async (checked:boolean) => {
        //     return { sender: sender, text: text, checked: checked, time: time }
        // }
        if (searchForOwnerMessageBox.rows.length === 0 && searchForNotOwnerMessageBox.rows.length === 0) {
            const createOwnerMessageBox = yield db_1.pool.query(createNewMessageQuery, [owner, notowner, "", JSON.stringify([{ sender: sender, text: text, checked: true, time: time }])]);
            const createNotOwnerMessageBox = yield db_1.pool.query(createNewMessageQuery, [notowner, owner, "", JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])]);
        }
        else if (searchForOwnerMessageBox.rows.length > 0 && searchForNotOwnerMessageBox.rows.length === 0) {
            // const addMessage = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), owner])
            // const createMessageBox = await pool.query(createNewMessageQuery, [notowner, owner,"",  JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])]) 
            addMessageFunction(notowner, owner, owner, true, false);
        }
        else if (searchForOwnerMessageBox.rows.length === 0 && searchForNotOwnerMessageBox.rows.length > 0) {
            // const addMessage = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), notowner])
            // const createMessageBox = await pool.query(createNewMessageQuery, [owner, notowner,"",  JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])]) 
            addMessageFunction(owner, notowner, notowner, false, true);
        }
        else if (searchForOwnerMessageBox.rows.length > 0 && searchForNotOwnerMessageBox.rows.length > 0) {
            const addMessageOwner = yield db_1.pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), owner]);
            const addMessageNotForOwner = yield db_1.pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: false, time: time }), notowner]);
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.sendOrCreateMessageConnection = sendOrCreateMessageConnection;
const updatechecked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { owner, notowner } = req.body;
        const getUserCurrentMeessage = yield db_1.pool.query("SELECT * FROM groupie_p_chat WHERE owner = $1 AND notowner = $2", [owner, notowner]);
        const change = yield getUserCurrentMeessage.rows[0].message.map((data) => {
            data.checked = true;
        });
        console.log(change, "na me", getUserCurrentMeessage.rows[0].message);
        const updatechecked = yield db_1.pool.query("UPDATE groupie_p_chat SET message = $1 where owner = $2 AND notowner = $3", [JSON.stringify(getUserCurrentMeessage.rows[0].message), owner, notowner]);
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.updatechecked = updatechecked;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { owner, notOwner } = req.body;
        console.log(owner, notOwner, "from message controller");
        const messageBox = yield db_1.pool.query("DELETE FROM groupie_p_chat WHERE owner = $1 AND notowner = $2", [owner, notOwner]);
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.deleteMessage = deleteMessage;
