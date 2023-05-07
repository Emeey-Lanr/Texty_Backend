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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
// const cors = require("cors")
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const user_1 = require("./UserRoute/user");
const socketController_1 = require("./socketController");
// dotenv.config()
require("dotenv").config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// const Socket = require("socket.io")
// Middle Ware
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/user", user_1.route);
const PORT = process.env.PORT;
////////////////////////////////
exports.io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
exports.io.on("connection", (socket) => {
    socket.emit("hello", { id: socket.id });
    // socket.on("userInfoOrSearchedForInfo", (data) => {
    //     console.log(data, "this the data")
    // })
    // Database details registering
    socket.on("userInfoOrSearchedForInfo", (data) => {
        if (data.userinfo.username !== "") {
            socket.join(data.userinfo.username);
            (0, socketController_1.addUserInfoToServerDatabase)(data.userinfo.username, data.userLookedFor.username, data.userinfo, data.userLookedFor);
        }
        //    console.log(data.userinfo , data.userLookedFor)
    });
    const followFunction = (emitingSocketName1, emitingSocketName2, userLoggedInUserName, userTheyWantToFollow, notificationWord) => {
        let details = (0, socketController_1.followUser)(userLoggedInUserName, userTheyWantToFollow, notificationWord);
        console.log(details);
        exports.io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName1}`, { lookedForUserFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userLoggedInUserName, error: details.errorStatus }),
            exports.io.sockets.to(userTheyWantToFollow).emit(`${emitingSocketName2}`, { notification: details.notification, addedFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userTheyWantToFollow, error: details.errorStatus });
    };
    const unfollowFunction = (emitingSocketName, userLoggedInUserName, userYouWantToUnfollow) => {
        const details = (0, socketController_1.unfollowUser)(userLoggedInUserName, userYouWantToUnfollow);
        console.log(details);
        exports.io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName}`, { userLoggedInFollowing: details.followingForUserThatWantsToUnfollow, userTheyWantToUnFollowFollowers: details.followersForUserTheyHaveUnfollowed, loggedInUser: userLoggedInUserName, error: details.error });
    };
    // Allows you to follow user searched for via the route the other user profile is diplayed
    socket.on("followSocket1", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(data.ownerUsername);
        followFunction("followedUserLookedFor", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords);
    }));
    // Allows you to unfollow user searched for via route because user Id  username is not the same as the username in the redux store
    socket.on("unfollowSocket1", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow } = data;
        console.log(userLoggedInUserName, userTheyWantToUnfollow);
        unfollowFunction("unFollowed", userLoggedInUserName, userTheyWantToUnfollow);
    });
    //when  user Id  username is the same as the username in the redux store
    socket.on("followSocket2", (data) => {
        followFunction("userFollowingWhenFollowing", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords);
    });
    socket.on("unfollowSocket2", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow } = data;
        unfollowFunction("userFollowingWhenUnFollowing", userLoggedInUserName, userTheyWantToUnfollow);
    });
    // follow, unfollow socket 2 happens when you follow or unfollow someone via a searched person route followers and following
    socket.on("followSocket3", (data) => {
        followFunction("followingViaAnotherPersonFFlist", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords);
    });
    socket.on("unfollowSocket3", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow } = data;
        unfollowFunction("unfollowingViaAnotherPersonFFlist", userLoggedInUserName, userTheyWantToUnfollow);
    });
    socket.on("disconnect", () => {
        console.log("a user has disconnected");
    });
});
httpServer.listen(PORT, () => {
    console.log(`server has started @ port ${PORT}`);
});
// io.on("connection", (socket: { emit: (arg0: string, arg1: { id: any }) => void; id: any; on: (arg0: string, arg1: () => void) => void }) => {
//     socket.emit("hello", {id:socket.id})
//     socket.on("disconnect", () => {
//         console.log("a user has disconnected")
//     })
// })
