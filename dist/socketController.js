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
exports.deleteAccount = exports.deletePost = exports.unblockFuction = exports.blockUserFunction = exports.commentFunction = exports.unlikeFunction = exports.likeFunction = exports.addAndEmitPost = exports.deleteMessage = exports.updatchecked = exports.createMessageBoxOrSendMessage = exports.unfollowUser = exports.followUser = exports.suggestUser = exports.addUserPostOrEmitPost = exports.addUserInfoToServerDatabase = exports.updateHomePost = exports.createHomePostDb = exports.updateInfo = exports.homePost = exports.serverDataBase = void 0;
const db_1 = require("./db");
const homepostModel_1 = require("./homepostModel");
exports.serverDataBase = [];
let serverMessageDataBase = [];
exports.homePost = [];
const updateInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lookForUsersQuery = "SELECT id, username, img_url, background_img_url, about_me,post, following, followers, notification,blocked, state FROM user_info";
        const users = yield db_1.pool.query(lookForUsersQuery);
        exports.serverDataBase = users.rows;
    }
    catch (error) {
        return new Error(error.message);
    }
});
exports.updateInfo = updateInfo;
const createHomePostDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const texyHomePost = yield homepostModel_1.homePostModel.findOne({ postId: `${process.env.homePostId}` });
        if (texyHomePost !== null) {
            exports.homePost = texyHomePost.post;
        }
        else {
            const addPost = new homepostModel_1.homePostModel({ postId: process.env.homePostId, post: [] });
            const savePost = yield addPost.save();
        }
    }
    catch (error) {
        return new Error(error.message);
    }
});
exports.createHomePostDb = createHomePostDb;
const updateHomePost = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = yield homepostModel_1.homePostModel.findOneAndUpdate({ postId: process.env.homePostId }, { postId: process.env.homePostId, post: exports.homePost });
    }
    catch (error) {
    }
});
exports.updateHomePost = updateHomePost;
const ifUserExistOrViceVersa = (username, serverId, details, secondDetails) => {
    exports.serverDataBase.map((name, id) => {
        if (name.username === username) {
            serverId = id;
        }
    });
    const post = exports.serverDataBase[serverId].post;
    exports.serverDataBase[serverId] = details;
    exports.serverDataBase[serverId].post = post;
    exports.serverDataBase.push(secondDetails);
};
const addUserInfoToServerDatabase = (userLoggedInUsername, userLookedForUsername, loggedInUserDetails, userLookedForDetails, userAllMessage) => {
    if (userLookedForUsername === "") {
        let serverId = 0;
        const checkifUserExist = exports.serverDataBase.find((name) => name.username === userLoggedInUsername);
        if (checkifUserExist) {
            exports.serverDataBase.map((name, id) => {
                if (name.username === checkifUserExist.username) {
                    serverId = id;
                }
            });
            const userPost = exports.serverDataBase[serverId].post;
            exports.serverDataBase[serverId] = loggedInUserDetails;
            exports.serverDataBase[serverId].post = userPost;
        }
        else {
            exports.serverDataBase.push(loggedInUserDetails);
        }
    }
    else {
        const checkifUserExist = exports.serverDataBase.find((name) => name.username === userLoggedInUsername);
        const checkifLookedForUserExist = exports.serverDataBase.find((name) => name.username === userLookedForUsername);
        let userId = 0;
        let lookedForUserId = 0;
        if (checkifUserExist && checkifLookedForUserExist) {
            // if both user exist already, we change the psql database info with the server database
            exports.serverDataBase.map((name, id) => {
                if (name.username === checkifUserExist.username) {
                    userId = id;
                }
                if (name.username === checkifLookedForUserExist.username) {
                    lookedForUserId = id;
                }
            });
            const userServerPost = exports.serverDataBase[userId].post;
            const lookedForUserServerPost = exports.serverDataBase[lookedForUserId].post;
            exports.serverDataBase[userId] = loggedInUserDetails;
            exports.serverDataBase[lookedForUserId] = userLookedForDetails;
            exports.serverDataBase[userId].post = userServerPost;
            exports.serverDataBase[lookedForUserId].post = lookedForUserServerPost;
        }
        else if (!checkifUserExist && !checkifLookedForUserExist) {
            // if both don't exist we push in the psql databse into the server database array 
            exports.serverDataBase.push(loggedInUserDetails, userLookedForDetails);
        }
        else if (!checkifUserExist && checkifLookedForUserExist) {
            // if the looged in user doesn't exist and the user looked for already exist in the server database
            // we push in the looged in user and change the looked for user info with what we have in its database
            ifUserExistOrViceVersa(checkifLookedForUserExist.username, lookedForUserId, userLookedForDetails, loggedInUserDetails);
        }
        else if (checkifUserExist && !checkifLookedForUserExist) {
            // if user logged in exist in the  and the looked for user doesn't exist
            // we change the logged in user details with what we are getting from psql db and push in the looked for user
            ifUserExistOrViceVersa(checkifUserExist.username, userId, loggedInUserDetails, userLookedForDetails);
        }
    }
    // For add messages to db
    serverMessageDataBase = serverMessageDataBase.filter((details) => details.owner !== userLoggedInUsername);
    const loggedInuserAllMessageLength = userAllMessage.length;
    userAllMessage.map((details, id) => {
        const check = serverMessageDataBase.filter((details) => details.owner === userLoggedInUsername).length;
        if (check <= loggedInuserAllMessageLength) {
            serverMessageDataBase.push(details);
        }
    });
    const user = exports.serverDataBase.find((details) => details.username === userLoggedInUsername);
    const userLookedFor = exports.serverDataBase.find((details) => details.username === userLookedForUsername);
    // return serverDataBase
    return { user, userLookedFor };
};
exports.addUserInfoToServerDatabase = addUserInfoToServerDatabase;
const addUserPostOrEmitPost = (user, post) => __awaiter(void 0, void 0, void 0, function* () {
    const userPostExist = exports.serverDataBase.find((details) => details.username === user);
    const userHomePostExist = exports.homePost.find((details) => details.user === user);
    const emeeyLanrHomePost = exports.homePost.find((details) => details.user === "Emeey_Lanr");
    if (userPostExist) {
        userPostExist.post = post;
    }
    if (!userHomePostExist) {
        exports.homePost.push({ user: user, post: [] });
        return { user: user, post: emeeyLanrHomePost };
    }
    else {
        const post = user === 'Emeey_Lanr' ? userHomePostExist.post : [userHomePostExist.post, emeeyLanrHomePost === null || emeeyLanrHomePost === void 0 ? void 0 : emeeyLanrHomePost.post].flat();
        return { user: userHomePostExist.user, post };
    }
});
exports.addUserPostOrEmitPost = addUserPostOrEmitPost;
// code for suggesting user
const suggestUser = (username) => {
    const user = exports.serverDataBase.find((details) => details.username === username);
    let suggestedUser = [];
    if ((user === null || user === void 0 ? void 0 : user.following.length) === 0) {
        suggestedUser = exports.serverDataBase.filter((details) => details.username !== username);
        user === null || user === void 0 ? void 0 : user.blocked.map((user) => {
            suggestedUser = suggestedUser.filter((details) => details.username !== user.username);
        });
    }
    else {
        user === null || user === void 0 ? void 0 : user.following.map((following) => {
            suggestedUser = exports.serverDataBase.filter((detail) => detail.username !== following.username && detail.username !== username);
        });
        user === null || user === void 0 ? void 0 : user.blocked.map((user) => {
            suggestedUser = suggestedUser.filter((details) => details.username !== user.username);
        });
    }
    let shuffledUsers = suggestedUser.sort(() => Math.random() - 0.5);
    // const notFollowingLength = unfollowing.length
    return shuffledUsers.filter((_, id) => id < 6);
};
exports.suggestUser = suggestUser;
const followUser = (userLoggedIn, userLookedFor, notificationWords) => {
    const findLoggedInUser = exports.serverDataBase.find((name) => name.username === userLoggedIn);
    const findTheLookedForUser = exports.serverDataBase.find((name) => name.username === userLookedFor);
    // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    let errorStatus = false;
    if (!findTheLookedForUser) {
        errorStatus = true;
    }
    else {
        errorStatus = false;
    }
    const loggedInUserDetails = {
        id: findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.id,
        username: findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.username,
        img_url: findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.img_url,
        about_me: findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.about_me,
    };
    const lookedForUserDetails = {
        id: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.id,
        username: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.username,
        img_url: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.img_url,
        about_me: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.about_me,
    };
    // This prevents double pushing, It checks if user already exist in  user following if it does it doesn't push
    // const checkIfUserAlreadyExistForUserLoggedIn = findLoggedInUser?.following.find((details) => details.username === userLookedFor)
    // later used some instead
    if (!(findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.following.some((details) => details.username === userLookedFor))) {
        findTheLookedForUser && findLoggedInUser ? findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.following.push(lookedForUserDetails) : "";
    }
    // const checkIfUserExistInLookedForUserFollowers = findTheLookedForUser?.followers.find((details) => details.username === userLoggedIn)
    if (!(findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.followers.some((details) => details.username === userLoggedIn))) {
        findTheLookedForUser && findLoggedInUser ? findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.followers.push(loggedInUserDetails) : "";
    }
    // followed means this type on notification is a type where user gets to know they've been followed and can follow back via the notification
    findTheLookedForUser && findLoggedInUser ? findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.notification.push({ followed: true, checked: false, notificationDetails: `${userLoggedIn} ${notificationWords}`, username: userLoggedIn, img_url: findTheLookedForUser.img_url }) : "can't find user";
    // this following details is meant to reflect in the notification that you are now following the user that has followed you
    return { followerDetailsLookedForUser: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.followers, notification: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.notification, followingDetailsLoggedInUser: findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.following, errorStatus: errorStatus };
};
exports.followUser = followUser;
const unfollowUser = (userLoggedInUserName, userTheyWantToUnfollow) => {
    const userThatWantToUnfollowDetails = exports.serverDataBase.find((details) => details.username === userLoggedInUserName);
    const userTheyWantToUnfolllowDetails = exports.serverDataBase.find((details) => details.username === userTheyWantToUnfollow);
    // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    // let followingDetailsForUserThatWantsToUnfollow:FollowFollowersDetails[]  = []
    // let followersDetailsForUserUnfollowed: FollowFollowersDetails[] = []
    let errorStatus = false;
    if (userThatWantToUnfollowDetails) {
        userThatWantToUnfollowDetails.following = userThatWantToUnfollowDetails === null || userThatWantToUnfollowDetails === void 0 ? void 0 : userThatWantToUnfollowDetails.following.filter((details) => details.username !== (userTheyWantToUnfolllowDetails === null || userTheyWantToUnfolllowDetails === void 0 ? void 0 : userTheyWantToUnfolllowDetails.username));
    }
    if (userTheyWantToUnfolllowDetails) {
        userTheyWantToUnfolllowDetails.followers = userTheyWantToUnfolllowDetails === null || userTheyWantToUnfolllowDetails === void 0 ? void 0 : userTheyWantToUnfolllowDetails.followers.filter((details) => details.username !== (userThatWantToUnfollowDetails === null || userThatWantToUnfollowDetails === void 0 ? void 0 : userThatWantToUnfollowDetails.username));
    }
    else {
        errorStatus = true;
    }
    return { followingForUserThatWantsToUnfollow: userThatWantToUnfollowDetails === null || userThatWantToUnfollowDetails === void 0 ? void 0 : userThatWantToUnfollowDetails.following, followersForUserTheyHaveUnfollowed: userTheyWantToUnfolllowDetails === null || userTheyWantToUnfolllowDetails === void 0 ? void 0 : userTheyWantToUnfolllowDetails.followers, error: errorStatus };
};
exports.unfollowUser = unfollowUser;
const createMessageBoxOrSendMessage = (owner, notowner, owner_imgurl, notowner_imgurl, incomingMessageOwner, incomingMessageNotOwner) => {
    const ownerMessage = serverMessageDataBase.find((name) => name.owner === owner && name.notowner === notowner);
    const notOwnerMessage = serverMessageDataBase.find((name) => name.owner === notowner && name.notowner === owner);
    const notOwner = exports.serverDataBase.find((details) => details.username === notowner);
    const ifBlockedByNotOwner = notOwner === null || notOwner === void 0 ? void 0 : notOwner.blocked.find((details) => details.username === owner);
    let blocked = false;
    if (ifBlockedByNotOwner) {
        blocked = true;
    }
    else {
        blocked = false;
        if (ownerMessage && notOwnerMessage) {
            ownerMessage.message.push(incomingMessageOwner);
            notOwnerMessage.message.push(incomingMessageNotOwner);
        }
        else if (ownerMessage && !notOwnerMessage) {
            ownerMessage.message.push(incomingMessageOwner);
            serverMessageDataBase.push({ owner: notowner, notowner: owner, notowner_imgurl: owner_imgurl, message: [incomingMessageNotOwner] });
        }
        else if (!ownerMessage && notOwnerMessage) {
            serverMessageDataBase.push({ owner: owner, notowner: notowner, notowner_imgurl: notowner_imgurl, message: [incomingMessageOwner] });
            notOwnerMessage.message.push(incomingMessageNotOwner);
        }
        else if (!ownerMessage && !notOwnerMessage) {
            serverMessageDataBase.push({ owner: owner, notowner: notowner, notowner_imgurl: notowner_imgurl, message: [incomingMessageOwner] }, { owner: notowner, notowner: owner, notowner_imgurl: owner_imgurl, message: [incomingMessageNotOwner] });
        }
    }
    // ownerMessage.message.push(incomingMessage)
    return { blocked, serverMessageDataBase };
};
exports.createMessageBoxOrSendMessage = createMessageBoxOrSendMessage;
const updatchecked = (owner, notowner) => {
    const userCurrentMesage = serverMessageDataBase.find((name) => name.owner === owner && name.notowner === notowner);
    userCurrentMesage === null || userCurrentMesage === void 0 ? void 0 : userCurrentMesage.message.map((data) => {
        data.checked = true;
    });
};
exports.updatchecked = updatchecked;
const deleteMessage = (owner, notOwner) => {
    serverMessageDataBase = serverMessageDataBase.filter((details) => details.owner !== owner && details.notowner !== notOwner);
};
exports.deleteMessage = deleteMessage;
const addAndEmitPost = (username, userPost) => {
    const { text, date, time, postedBy, comment, likes } = userPost;
    const user = exports.serverDataBase.find((details) => details.username === postedBy);
    const new_Post = {
        text,
        date,
        time,
        postedBy,
        comment,
        likes,
        poster_imgUrl: user === null || user === void 0 ? void 0 : user.img_url
    };
    const findUserHomePost = exports.homePost.find((details) => details.user === username);
    const userFollowers = exports.serverDataBase.find((details) => details.username === username);
    // we pushed into user home post
    findUserHomePost === null || findUserHomePost === void 0 ? void 0 : findUserHomePost.post.push(new_Post);
    userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.post.push(new_Post);
    const post = exports.homePost.map((data) => {
        userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.followers.map((details, id) => {
            if (details.username === data.user) {
                data.post.push(new_Post);
            }
        });
    });
    return { followers: userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.followers, userHomePost: findUserHomePost, userPost: userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.post, post: new_Post };
};
exports.addAndEmitPost = addAndEmitPost;
const likeFunction = (user, postedBy, time) => {
    var _a;
    // we search for the user that posted the post
    const userLoggedIn = exports.serverDataBase.find((details) => details.username === user);
    const postedByUser = exports.serverDataBase.find((details) => details.username === postedBy);
    if (postedByUser) {
        // we look for its post and the current post
        const currentPost = postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.post.find((details) => details.postedBy === postedBy && details.time === time);
        // we push in the user that owns the post
        if (currentPost) {
            (_a = currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes) === null || _a === void 0 ? void 0 : _a.push(user);
        }
        if (user !== postedBy && currentPost) {
            postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.notification.push({
                followed: false,
                checked: false,
                notificationDetails: `${user} liked your post`,
                username: user,
                img_url: `${userLoggedIn === null || userLoggedIn === void 0 ? void 0 : userLoggedIn.img_url}`,
            });
        }
        // we check everybody home post to see if a user has that same post
        exports.homePost.map((details) => {
            details.post.map((details) => {
                if (details.postedBy === postedBy && details.time === time) {
                    details.likes = currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes;
                }
            });
        });
        return { LikeUnlike: currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes, notification: postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.notification, available: true };
    }
    else {
        return { LikeUnlike: [], notification: [], available: false };
    }
};
exports.likeFunction = likeFunction;
const unlikeFunction = (user, postedBy, time) => {
    var _a;
    // we acting on the user's real post and replacing the non owner post details with user's post
    const postedByUser = exports.serverDataBase.find((details, id) => details.username === postedBy);
    if (postedByUser) {
        const post = postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.post.find((details) => details.postedBy === postedBy && details.time === time);
        if (post) {
            post.likes = (_a = post.likes) === null || _a === void 0 ? void 0 : _a.filter((details) => details !== user);
            //
        }
        exports.homePost.map((details) => {
            details.post.map((details) => {
                if (details.postedBy === postedBy && details.time === time) {
                    details.likes = post === null || post === void 0 ? void 0 : post.likes;
                }
            });
        });
        return { likes: post === null || post === void 0 ? void 0 : post.likes, available: true };
    }
    else {
        return { likes: [], available: false };
    }
};
exports.unlikeFunction = unlikeFunction;
const commentFunction = (user, comment, img_url, commentTime, postedBy, time) => {
    var _a;
    const userLoggedIn = exports.serverDataBase.find((details) => details.username === user);
    const postedByUser = exports.serverDataBase.find((details, id) => details.username === postedBy);
    if (postedByUser) {
        const post = postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.post.find((details) => details.postedBy === postedBy && details.time === time);
        if (post) {
            (_a = post.comment) === null || _a === void 0 ? void 0 : _a.push({ username: user, comment, img_url, time: commentTime });
        }
        exports.homePost.map((details) => {
            details.post.map((details) => {
                if (details.postedBy === postedBy && details.time === time) {
                    details.comment = post === null || post === void 0 ? void 0 : post.comment;
                }
            });
        });
        if (post) {
            postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.notification.push({
                followed: false,
                checked: false,
                notificationDetails: `${user} commented on your post`,
                username: user,
                img_url: `${userLoggedIn === null || userLoggedIn === void 0 ? void 0 : userLoggedIn.img_url}`,
            });
        }
        return { comment: post === null || post === void 0 ? void 0 : post.comment, notification: postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.notification, available: true };
    }
    else {
        return { comment: [], notification: [], available: false };
    }
};
exports.commentFunction = commentFunction;
const blockUserFunction = (userLoggedIn, userToBeBlocked) => {
    // find the user logged in and blocked box
    const user = exports.serverDataBase.find((details) => details.username === userLoggedIn);
    const userToBeBlockedDetails = exports.serverDataBase.find((details) => details.username === userToBeBlocked);
    // this is to check whether user has been added to the block list already
    // to prevent double pushing
    let check = user === null || user === void 0 ? void 0 : user.blocked.find((details) => details.username === userToBeBlocked);
    if (!check) {
        user === null || user === void 0 ? void 0 : user.blocked.push({ username: userToBeBlocked });
    }
    return { userBlocked: user === null || user === void 0 ? void 0 : user.blocked, otherUserBlockedDetails: userToBeBlockedDetails === null || userToBeBlockedDetails === void 0 ? void 0 : userToBeBlockedDetails.blocked };
};
exports.blockUserFunction = blockUserFunction;
const unblockFuction = (userLoggedIn, userToBeUnBlocked) => {
    // find the user logged in and blocked box
    const user = exports.serverDataBase.find((details) => details.username === userLoggedIn);
    const userToBeUnBlockedDetails = exports.serverDataBase.find((details) => details.username === userToBeUnBlocked);
    if (user) {
        user.blocked = user === null || user === void 0 ? void 0 : user.blocked.filter((details) => details.username !== userToBeUnBlocked);
    }
    return { userBlocked: user === null || user === void 0 ? void 0 : user.blocked, userToBeUnBlockedBlockedDetails: userToBeUnBlockedDetails === null || userToBeUnBlockedDetails === void 0 ? void 0 : userToBeUnBlockedDetails.blocked };
};
exports.unblockFuction = unblockFuction;
const deletePost = (time, username) => {
    const user = exports.serverDataBase.find((data) => data.username === username);
    const findUser = exports.homePost.find((data) => data.user === username);
    if (user) {
        user.post = user.post.filter((data) => data.time !== time && data.postedBy === username);
    }
    if (findUser) {
        findUser.post = findUser.post.filter((posts) => posts.time !== time && posts.postedBy === username);
    }
    return { userhomePost: findUser === null || findUser === void 0 ? void 0 : findUser.post, userProfilePost: user === null || user === void 0 ? void 0 : user.post, username };
};
exports.deletePost = deletePost;
const deleteAccount = (username) => {
    exports.serverDataBase = exports.serverDataBase.filter((details) => details.username !== username);
};
exports.deleteAccount = deleteAccount;
