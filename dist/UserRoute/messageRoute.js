"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageroute = void 0;
const express_1 = __importDefault(require("express"));
exports.messageroute = express_1.default.Router();
const messageController_1 = require("../UserController/messageController");
exports.messageroute.post("/sendMessageOrCreate", messageController_1.sendOrCreateMessageConnection);
exports.messageroute.post("/updatechecked", messageController_1.updatechecked);
exports.messageroute.post("/deleteMessage", messageController_1.deleteMessage);
