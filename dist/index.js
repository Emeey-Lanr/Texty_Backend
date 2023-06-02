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
const messageRoute_1 = require("./UserRoute/messageRoute");
const dotenv_1 = __importDefault(require("dotenv"));
const socketController_1 = require("./socketController");
const socketController_2 = require("./socketController");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
dotenv_1.default.config();
// Middle Ware
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/user", user_1.route);
app.use("/message", messageRoute_1.messageroute);
const PORT = process.env.PORT;
////////////////////////////////
exports.io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
exports.io.on("connection", (socket) => {
    socket.emit("hello", { id: socket.id });
    // Database details registering
    socket.on("userInfoOrSearchedForInfo", (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.userinfo.username !== "") {
            socket.join(data.userinfo.username);
            (0, socketController_2.addUserInfoToServerDatabase)(data.userinfo.username, data.userLookedFor.username, data.userinfo, data.userLookedFor, data.usermessage);
            const homePost = (0, socketController_2.addUserPostOrEmitPost)(data.userinfo.username, data.userinfo.post);
            console.log(homePost, data.userinfo.post, "this ref");
            exports.io.sockets.to(data.userinfo.username).emit("homePost", homePost);
        }
        //    console.log(data.userinfo , data.userLookedFor)
    }));
    const followFunction = (emitingSocketName1, emitingSocketName2, userLoggedInUserName, userTheyWantToFollow, notificationWord) => {
        let details = (0, socketController_2.followUser)(userLoggedInUserName, userTheyWantToFollow, notificationWord);
        console.log(details);
        exports.io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName1}`, { lookedForUserFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userLoggedInUserName, error: details.errorStatus }),
            exports.io.sockets.to(userTheyWantToFollow).emit(`${emitingSocketName2}`, { notification: details.notification, addedFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userTheyWantToFollow, error: details.errorStatus });
    };
    const unfollowFunction = (emitingSocketName, userLoggedInUserName, userYouWantToUnfollow) => {
        const details = (0, socketController_2.unfollowUser)(userLoggedInUserName, userYouWantToUnfollow);
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
    // Socket for private messaging 
    socket.on("privateMessage", (data) => {
        // const message = (checked:boolean) => {
        //     return {sender:data.sender, time:data.time, text:data.text, checked:checked}
        // }
        const messageDataBase = (0, socketController_2.createMessageBoxOrSendMessage)(data.owner, data.notowner, data.owner_imgurl, data.notowner_imgurl, { sender: data.sender, time: data.time, text: data.text, checked: true }, { sender: data.sender, time: data.time, text: data.text, checked: false });
        const ownerMessageDetails = messageDataBase.find((name) => name.owner === data.owner && name.notowner === data.notowner);
        const notOwnerMessageDetails = messageDataBase.find((name) => name.owner === data.notowner && name.notowner === data.owner);
        exports.io.sockets.to(data.owner).emit("incomingMessage", ownerMessageDetails);
        exports.io.sockets.to(data.notowner).emit("incomingMessage", notOwnerMessageDetails);
        //  io.sockets.to().emit()
        //  io.sockets.to().emit()
    });
    // update if user has checked his or her own current message
    socket.on("updatchecked", (data) => {
        (0, socketController_2.updatchecked)(data.owner, data.notowner);
    });
    socket.on("deleteUserMessageBox", (data) => {
        console.log(data);
        (0, socketController_2.deleteMessage)(data.owner, data.notOwner);
        exports.io.sockets.to(data.owner).emit("messageDeleted", { notowner: data.notOwner, owner: data.owner });
    });
    // Post emiitter to followers
    socket.on("emitPost", (data) => {
        var _a;
        console.log(data, "na the data be this");
        const details = (0, socketController_2.addAndEmitPost)(data.username, data.post);
        exports.io.sockets.to(data.username).emit("userNewPost", { post: details.userPost, homePost: details.userHomePost });
        if (data.username === "Emeey_Lanr") {
            // all user that has regitered gets to see my post if i post wherther you
            // follow me or not
            const allUsers = socketController_1.serverDataBase.filter((details) => details.username !== data.username);
            allUsers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit("newPostForFollowers", { newPost: data.post });
            });
        }
        else {
            (_a = details.followers) === null || _a === void 0 ? void 0 : _a.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit("newPostForFollowers", { newPost: data.post });
            });
        }
        console.log(details.followers);
    });
    const likeUnlikeCommentFunction = (user, comment, img_url, commentTime, postedBy, time, state, socketName1, socketName2) => {
        let detailsBox = [];
        if (state === "like") {
            detailsBox = (0, socketController_2.likeFunction)(user, postedBy, time);
        }
        else if (state === "unlike") {
            detailsBox = (0, socketController_2.unlikeFunction)(user, postedBy, time);
        }
        else if (state === "comment") {
            detailsBox = (0, socketController_2.commentFunction)(user, comment, img_url, commentTime, postedBy, time);
        }
        console.log(detailsBox);
        // this goes to the current user 
        exports.io.sockets.to(user).emit(socketName1, { likes: detailsBox, postedBy: postedBy, time: time });
        const allUsers = socketController_1.serverDataBase.filter((details) => details.username !== postedBy);
        const postedByUserFollower = socketController_1.serverDataBase.find((details) => details.username == postedBy);
        // // this is meant of the other users that follows or alll user for emeey lanr
        if (postedBy === "Emeey_Lanr") {
            exports.io.sockets.to("Emeey_Lanr").emit(socketName1, { likes: detailsBox, postedBy: postedBy, time: time });
            allUsers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit(socketName2, { likes: detailsBox, postedBy: postedBy, time: time });
            });
        }
        else {
            // but if not emeey lanr we know only those following the user have the post
            postedByUserFollower === null || postedByUserFollower === void 0 ? void 0 : postedByUserFollower.followers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit(socketName2, { likes: detailsBox, postedBy: postedBy, time: time });
            });
        }
    };
    socket.on("like", (data) => {
        console.log("we are here");
        likeUnlikeCommentFunction(data.user, "", "", "", data.postedBy, data.time, data.state, "likeOrUnlike1", "likeOrUnlike2");
    });
    socket.on("unlike", (data) => {
        likeUnlikeCommentFunction(data.user, "", "", "", data.postedBy, data.time, data.state, "likeOrUnlike1", "likeOrUnlike2");
        // likeGeneralFunction(data.user, data.)
    });
    socket.on("comment", (data) => {
        likeUnlikeCommentFunction(data.user, data.comment, data.imgUrl, data.commentTime, data.postedBy, data.time, data.state, "comment1", "Comment2");
    });
    socket.on("blockUser", (data) => {
        console.log(data, "you are blocked");
        const blockDetails = (0, socketController_2.blockUserFunction)(data.userLoggedIn, data.userToBeBlocked);
        exports.io.sockets.to(data.userLoggedIn).emit("blocked", { details: blockDetails.userBlocked });
    });
    socket.on("unblockUser", (data) => {
        console.log(data, "you've been unblocked");
        const unblockDetails = (0, socketController_2.unblockFuction)(data.userLoggedIn, data.userToBeBlocked);
        exports.io.sockets.to(data.userLoggedIn).emit("unblocked", { details: unblockDetails.userBlocked });
    });
    // blocking and unblocking via profile
    socket.on("blockVP", (data) => {
        const blockDetails = (0, socketController_2.blockUserFunction)(data.user, data.userToBeUnblocked);
        exports.io.sockets.to(data.user).emit("blockedVP", { userDetails: blockDetails.userBlocked, userBlockedDetails: blockDetails.otherUserBlockedDetails, userBlockedUsername: data.userToBeUnblocked });
    });
    socket.on("unblockVP", (data) => {
        const unblockDetails = (0, socketController_2.unblockFuction)(data.user, data.userToBeUnblocked);
        exports.io.sockets.to(data.user).emit("unblockedVP", { userDetails: unblockDetails.userBlocked, userBlockedDetails: unblockDetails.userToBeUnBlockedBlockedDetails, userBlockedUsername: data.userToBeUnblocked });
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
