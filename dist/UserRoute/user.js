"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = __importDefault(require("express"));
exports.route = express_1.default.Router();
const userController_1 = require("../UserController/userController");
exports.route.post("/signup", userController_1.signup);
exports.route.post("/signin", userController_1.signin);
exports.route.get("/verifyUserProfile", userController_1.verifyUserProfile);
exports.route.post("/followUser", userController_1.followerUser);
exports.route.post("/unfollowUser", userController_1.unfollowUser);
exports.route.post("/search", userController_1.searchForUsers);
exports.route.post("/sendMessageOrCreate", userController_1.sendOrCreateMessageConnection);
// export route
