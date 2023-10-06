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
const mongoose_1 = __importDefault(require("mongoose"));
const socketController_1 = require("./socketController");
const socketController_2 = require("./socketController");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
dotenv_1.default.config();
// Middle Ware
app.use((0, cors_1.default)({}));
app.use(express_1.default.json({ limit: "25mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "25mb" }));
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
            const serverDataBase = (0, socketController_2.addUserInfoToServerDatabase)(data.userinfo.username, data.userLookedFor.username, data.userinfo, data.userLookedFor, data.usermessage);
            const homePost = (0, socketController_2.addUserPostOrEmitPost)(data.userinfo.username, data.userinfo.post);
            const suggestedUser = (0, socketController_1.suggestUser)(data.userinfo.username);
            homePost.then((result) => {
                exports.io.sockets.to(data.userinfo.username).emit("homePost", result);
            });
            exports.io.sockets.to(data.userinfo.username).emit("profilePost", { user: serverDataBase.user, lookedForUser: serverDataBase.userLookedFor });
            exports.io.sockets.to(data.userinfo.username).emit("suggestedUser", { suggestedUser });
        }
    }));
    const followFunction = (emitingSocketName1, emitingSocketName2, userLoggedInUserName, userTheyWantToFollow, notificationWord) => {
        let details = (0, socketController_2.followUser)(userLoggedInUserName, userTheyWantToFollow, notificationWord);
        exports.io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName1}`, { lookedForUserFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userLoggedInUserName, error: details.errorStatus }),
            exports.io.sockets.to(userTheyWantToFollow).emit(`${emitingSocketName2}`, { notification: details.notification, addedFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userTheyWantToFollow, error: details.errorStatus });
    };
    const unfollowFunction = (emitingSocketName, userLoggedInUserName, userYouWantToUnfollow) => {
        const details = (0, socketController_2.unfollowUser)(userLoggedInUserName, userYouWantToUnfollow);
        exports.io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName}`, { userLoggedInFollowing: details.followingForUserThatWantsToUnfollow, userTheyWantToUnFollowFollowers: details.followersForUserTheyHaveUnfollowed, loggedInUser: userLoggedInUserName, error: details.error });
    };
    // Allows you to follow user searched for via the route the other user profile is diplayed
    socket.on("followSocket1", (data) => __awaiter(void 0, void 0, void 0, function* () {
        followFunction("followedUserLookedFor", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords);
    }));
    // Allows you to unfollow user searched for via route because user Id  username is not the same as the username in the redux store
    socket.on("unfollowSocket1", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow } = data;
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
        const messageDataBase = (0, socketController_2.createMessageBoxOrSendMessage)(data.owner, data.notowner, data.owner_imgurl, data.notowner_imgurl, { sender: data.sender, time: data.time, text: data.text, checked: true }, { sender: data.sender, time: data.time, text: data.text, checked: false });
        const ownerMessageDetails = messageDataBase.serverMessageDataBase.find((name) => name.owner === data.owner && name.notowner === data.notowner);
        const notOwnerMessageDetails = messageDataBase.serverMessageDataBase.find((name) => name.owner === data.notowner && name.notowner === data.owner);
        exports.io.sockets.to(data.owner).emit("incomingMessage", { blocked: messageDataBase.blocked, owner: true, message: ownerMessageDetails });
        exports.io.sockets.to(data.notowner).emit("incomingMessage", { blocked: messageDataBase.blocked, owner: false, message: notOwnerMessageDetails });
    });
    // update if user has checked his or her own current message
    socket.on("updatchecked", (data) => {
        (0, socketController_2.updatchecked)(data.owner, data.notowner);
    });
    socket.on("deleteUserMessageBox", (data) => {
        (0, socketController_2.deleteMessage)(data.owner, data.notOwner);
        exports.io.sockets.to(data.owner).emit("messageDeleted", { notowner: data.notOwner, owner: data.owner });
    });
    // Post emiitter to followers
    socket.on("emitPost", (data) => {
        var _a;
        const details = (0, socketController_2.addAndEmitPost)(data.username, data.post);
        const post = details.post;
        exports.io.sockets.to(data.username).emit("userNewPost", { post: details.userPost, homePost: details.userHomePost });
        if (data.username === "Emeey_Lanr") {
            // all user that has regitered gets to see my post if i post wherther you
            // follow me or not
            const allUsers = socketController_1.serverDataBase.filter((details) => details.username !== data.username);
            allUsers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit("newPostForFollowers", { newPost: post });
            });
        }
        else {
            (_a = details.followers) === null || _a === void 0 ? void 0 : _a.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit("newPostForFollowers", { newPost: post });
            });
        }
        (0, socketController_2.updateHomePost)();
    });
    const likeUnlikeCommentFunction = (user, comment, img_url, commentTime, postedBy, time, state, socketName1, socketName2) => {
        let detailsBox = [];
        let notification = [];
        let available = false;
        if (state === "like") {
            let likes_with_Notification = (0, socketController_2.likeFunction)(user, postedBy, time);
            detailsBox = likes_with_Notification.LikeUnlike;
            notification = likes_with_Notification.notification;
            available = likes_with_Notification.available;
        }
        else if (state === "unlike") {
            let details = (0, socketController_2.unlikeFunction)(user, postedBy, time);
            detailsBox = details.likes;
            available = details.available;
        }
        // } else if(state === "comment") {
        //     detailsBox = commentFunction(user, comment, img_url, commentTime, postedBy, time)
        // }
        // this goes to the current user 
        exports.io.sockets.to(user).emit(socketName1, { likes: detailsBox, postedBy: postedBy, time: time, available });
        const allUsers = socketController_1.serverDataBase.filter((details) => details.username !== postedBy);
        const postedByUserFollower = socketController_1.serverDataBase.find((details) => details.username == postedBy);
        // // this is meant of the other users that follows or alll user for emeey lanr
        if (postedBy === "Emeey_Lanr") {
            exports.io.sockets.to("Emeey_Lanr").emit(socketName1, { likes: detailsBox, notification: notification, notified: state === "like" ? true : false, postedBy: postedBy, time: time, available });
            allUsers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit(socketName2, { likes: detailsBox, postedBy: postedBy, time: time, notified: false, available });
            });
        }
        else {
            exports.io.sockets.to(`${postedBy}`).emit(socketName1, { likes: detailsBox, userThatLiked: user, notification: notification, notified: state === "like" ? true : false, postedBy: postedBy, time: time, available });
            // but if not emeey lanr we know only those following the user have the post
            postedByUserFollower === null || postedByUserFollower === void 0 ? void 0 : postedByUserFollower.followers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit(socketName2, { likes: detailsBox, postedBy: postedBy, time: time, notified: false, available });
            });
        }
    };
    socket.on("like", (data) => __awaiter(void 0, void 0, void 0, function* () {
        likeUnlikeCommentFunction(data.user, "", "", "", data.postedBy, data.time, data.state, "likeOrUnlike1", "likeOrUnlike2");
        (0, socketController_2.updateHomePost)();
    }));
    socket.on("unlike", (data) => {
        likeUnlikeCommentFunction(data.user, "", "", "", data.postedBy, data.time, data.state, "likeOrUnlike1", "likeOrUnlike2");
        // likeGeneralFunction(data.user, data.)
        (0, socketController_2.updateHomePost)();
    });
    socket.on("comment", (data) => {
        const comment = (0, socketController_2.commentFunction)(data.user, data.comment, data.imgUrl, data.commentTime, data.postedBy, data.time);
        // we're sending to the user's followers
        // for Emeeey's case we search for all users that we have except emeey
        const allUsers = socketController_1.serverDataBase.filter((details) => details.username !== data.postedBy);
        // we look for the user that posted and check the person's followers and send it to them
        const postedByUserFollower = socketController_1.serverDataBase.find((details) => details.username === data.postedBy);
        if (data.postedBy === "Emeey_Lanr") {
            exports.io.sockets.to("Emeey_Lanr").emit("comment1", { comment: comment.comment, notification: comment.notification, notified: true, postedBy: data.postedBy, time: data.time, available: comment.available });
            allUsers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit("Comment2", { comment: comment.comment, postedBy: data.postedBy, time: data.time, notified: false, available: comment.available });
            });
        }
        else {
            exports.io.sockets.to(`${data.postedBy}`).emit("comment1", { comment: comment.comment, userThatCommented: data.user, notification: comment.notification, notified: true, postedBy: data.postedBy, time: data.time, available: comment.available });
            postedByUserFollower === null || postedByUserFollower === void 0 ? void 0 : postedByUserFollower.followers.map((details) => {
                exports.io.sockets.to(`${details.username}`).emit("Comment2", { comment: comment.comment, postedBy: data.postedBy, time: data.time, notified: false, available: comment.available });
            });
        }
        (0, socketController_2.updateHomePost)();
        //  likeUnlikeCommentFunction(data.user, data.comment, data.imgUrl, data.commentTime, data.postedBy, data.time, data.state, "comment1", "Comment2")
    });
    socket.on("blockUser", (data) => {
        const blockDetails = (0, socketController_2.blockUserFunction)(data.userLoggedIn, data.userToBeBlocked);
        exports.io.sockets.to(data.userLoggedIn).emit("blocked", { details: blockDetails.userBlocked });
    });
    socket.on("unblockUser", (data) => {
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
    socket.on("deletePost", (data) => {
        const postDeletedFunction = (0, socketController_2.deletePost)(data.time, data.username);
        exports.io.sockets.to(data.username).emit("postDeleted", { time: data.time, homePost: postDeletedFunction.userhomePost, profilePost: postDeletedFunction.userProfilePost, username: postDeletedFunction.username });
        (0, socketController_2.updateHomePost)();
    });
    socket.on("deleteAccount", (data) => {
        (0, socketController_1.deleteAccount)(data.username);
    });
    socket.on("disconnect", () => {
    });
});
httpServer.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateInfoFunction = yield (0, socketController_2.updateInfo)();
        const connect = yield mongoose_1.default.connect(`${process.env.URI}`);
        const homePost = yield (0, socketController_2.createHomePostDb)();
        console.log(`server has started @ port ${PORT}`);
    }
    catch (error) {
        console.log(`${error.message}`);
    }
}));
