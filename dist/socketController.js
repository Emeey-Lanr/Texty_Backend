"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unblockFuction = exports.blockUserFunction = exports.commentFunction = exports.unlikeFunction = exports.likeFunction = exports.addAndEmitPost = exports.deleteMessage = exports.updatchecked = exports.createMessageBoxOrSendMessage = exports.unfollowUser = exports.followUser = exports.addUserPostOrEmitPost = exports.addUserInfoToServerDatabase = exports.serverDataBase = void 0;
exports.serverDataBase = [];
let serverMessageDataBase = [];
const homePost = [];
const ifUserExistOrViceVersa = (username, serverId, details, secondDetails) => {
    exports.serverDataBase.map((name, id) => {
        if (name.username === username) {
            serverId = id;
        }
    });
    exports.serverDataBase[serverId] = details;
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
            exports.serverDataBase[serverId] = loggedInUserDetails;
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
            exports.serverDataBase[userId] = loggedInUserDetails;
            exports.serverDataBase[lookedForUserId] = userLookedForDetails;
            console.log("both user exist");
        }
        else if (!checkifUserExist && !checkifLookedForUserExist) {
            // if both don't exist we push in the psql databse into the server database array 
            exports.serverDataBase.push(loggedInUserDetails, userLookedForDetails);
            console.log("bot user don't exist");
        }
        else if (!checkifUserExist && checkifLookedForUserExist) {
            // if the looged in user doesn't exist and the user looked for already exist in the server database
            // we push in the looged in user and change the looked for user info with what we have in its database
            ifUserExistOrViceVersa(checkifLookedForUserExist.username, lookedForUserId, userLookedForDetails, loggedInUserDetails);
            console.log("logged in user doesn't exist");
        }
        else if (checkifUserExist && !checkifLookedForUserExist) {
            // if user logged in exist in the  and the looked for user doesn't exist
            // we change the logged in user details with what we are getting from psql db and push in the looked for user
            ifUserExistOrViceVersa(checkifUserExist.username, userId, loggedInUserDetails, userLookedForDetails);
            console.log("logged in user exist but the other one doesn't");
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
    console.log(exports.serverDataBase, serverMessageDataBase);
};
exports.addUserInfoToServerDatabase = addUserInfoToServerDatabase;
const addUserPostOrEmitPost = (user, post) => {
    const userPostExist = exports.serverDataBase.find((details) => details.username === user);
    const userHomePostExist = homePost.find((details) => details.user === user);
    if (userPostExist) {
        userPostExist.post = post;
    }
    if (!userHomePostExist) {
        homePost.push({ user: user, post: [] });
        return { user: user, post: [] };
    }
    else {
        return userHomePostExist;
    }
};
exports.addUserPostOrEmitPost = addUserPostOrEmitPost;
// export const acceptIncomingMessageFromDb = (userId:string, userAllMessage:ServerMessageInterface[]) => {
//     // serverMessageDataBase.push()
// }
const followUser = (userLoggedIn, userLookedFor, notificationWords) => {
    const findLoggedInUser = exports.serverDataBase.find((name) => name.username === userLoggedIn);
    const findTheLookedForUser = exports.serverDataBase.find((name) => name.username === userLookedFor);
    console.log(findLoggedInUser, findTheLookedForUser, "I'm working");
    // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    let errorStatus = false;
    if (!findTheLookedForUser) {
        errorStatus = true;
    }
    else {
        errorStatus = false;
    }
    console.log(errorStatus);
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
    const checkIfUserAlreadyExistForUserLoggedIn = findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.following.find((details) => details.username === userLookedFor);
    if (!checkIfUserAlreadyExistForUserLoggedIn) {
        findTheLookedForUser && findLoggedInUser ? findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.following.push(lookedForUserDetails) : console.log("can't find one user");
    }
    const checkIfUserExistInLookedForUserFollowers = findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.followers.find((details) => details.username === userLoggedIn);
    if (!checkIfUserExistInLookedForUserFollowers) {
        findTheLookedForUser && findLoggedInUser ? findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.followers.push(loggedInUserDetails) : console.log("can't find one user");
    }
    // followed means this type on notification is a type where user gets to know they've been followed and can follow back via the notification
    findTheLookedForUser && findLoggedInUser ? findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.notification.push({ followed: true, checked: false, notificationDetails: `${userLoggedIn} ${notificationWords}`, username: userLoggedIn, img_url: findTheLookedForUser.img_url }) : console.log("can't find user");
    // this following details is meant to reflect in the notification that you are now following the user that has followed you
    return { followerDetailsLookedForUser: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.followers, notification: findTheLookedForUser === null || findTheLookedForUser === void 0 ? void 0 : findTheLookedForUser.notification, followingDetailsLoggedInUser: findLoggedInUser === null || findLoggedInUser === void 0 ? void 0 : findLoggedInUser.following, errorStatus: errorStatus };
};
exports.followUser = followUser;
const unfollowUser = (userLoggedInUserName, userTheyWantToUnfollow) => {
    const userThatWantToUnfollowDetails = exports.serverDataBase.find((details) => details.username === userLoggedInUserName);
    const userTheyWantToUnfolllowDetails = exports.serverDataBase.find((details) => details.username === userTheyWantToUnfollow);
    // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    console.log(userLoggedInUserName, userTheyWantToUnfollow, userThatWantToUnfollowDetails === null || userThatWantToUnfollowDetails === void 0 ? void 0 : userThatWantToUnfollowDetails.following, "user following");
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
    console.log(userThatWantToUnfollowDetails === null || userThatWantToUnfollowDetails === void 0 ? void 0 : userThatWantToUnfollowDetails.following, userTheyWantToUnfolllowDetails === null || userTheyWantToUnfolllowDetails === void 0 ? void 0 : userTheyWantToUnfolllowDetails.followers, errorStatus);
    return { followingForUserThatWantsToUnfollow: userThatWantToUnfollowDetails === null || userThatWantToUnfollowDetails === void 0 ? void 0 : userThatWantToUnfollowDetails.following, followersForUserTheyHaveUnfollowed: userTheyWantToUnfolllowDetails === null || userTheyWantToUnfolllowDetails === void 0 ? void 0 : userTheyWantToUnfolllowDetails.followers, error: errorStatus };
};
exports.unfollowUser = unfollowUser;
const createMessageBoxOrSendMessage = (owner, notowner, owner_imgurl, notowner_imgurl, incomingMessageOwner, incomingMessageNotOwner) => {
    const ownerMessage = serverMessageDataBase.find((name) => name.owner === owner && name.notowner === notowner);
    const notOwnerMessage = serverMessageDataBase.find((name) => name.owner === notowner && name.notowner === owner);
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
    // ownerMessage.message.push(incomingMessage)
    //  console.log(ownerMessage, notOwnerMessage)
    return serverMessageDataBase;
};
exports.createMessageBoxOrSendMessage = createMessageBoxOrSendMessage;
const updatchecked = (owner, notowner) => {
    const userCurrentMesage = serverMessageDataBase.find((name) => name.owner === owner && name.notowner === notowner);
    userCurrentMesage === null || userCurrentMesage === void 0 ? void 0 : userCurrentMesage.message.map((data) => {
        data.checked = true;
    });
    console.log(userCurrentMesage === null || userCurrentMesage === void 0 ? void 0 : userCurrentMesage.message);
};
exports.updatchecked = updatchecked;
const deleteMessage = (owner, notOwner) => {
    console.log(owner, notOwner, "from socket controller");
    // serverMessageDataBase = serverMessageDataBase.filter((details)=>details.owner !== owner && details.notowner !== notOwner  )
};
exports.deleteMessage = deleteMessage;
const addAndEmitPost = (username, userPost) => {
    const findUserHomePost = homePost.find((details) => details.user === username);
    const userFollowers = exports.serverDataBase.find((details) => details.username === username);
    // we pushed into user home post
    findUserHomePost === null || findUserHomePost === void 0 ? void 0 : findUserHomePost.post.push(userPost);
    userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.post.push(userPost);
    const post = homePost.map((data) => {
        userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.followers.map((details, id) => {
            if (details.username === data.user) {
                data.post.push(userPost);
            }
        });
    });
    console.log(findUserHomePost === null || findUserHomePost === void 0 ? void 0 : findUserHomePost.post, homePost);
    return { followers: userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.followers, userHomePost: findUserHomePost, userPost: userFollowers === null || userFollowers === void 0 ? void 0 : userFollowers.post };
};
exports.addAndEmitPost = addAndEmitPost;
const likeFunction = (user, postedBy, time) => {
    var _a;
    // we search for the user that posted the post
    const postedByUser = exports.serverDataBase.find((details) => details.username === postedBy);
    // we look for its post and the current post
    const currentPost = postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.post.find((details) => details.postedBy === postedBy && details.time === time);
    // we push in the user that wants t
    (_a = currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes) === null || _a === void 0 ? void 0 : _a.push(user);
    // we check everybody home post to see if a user has that same post 
    homePost.map((details) => {
        details.post.map((details) => {
            if (details.postedBy === postedBy && details.time === time) {
                details.likes = currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes;
            }
        });
    });
    console.log(postedByUser, currentPost, currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes, "yea yea yea yea");
    return currentPost === null || currentPost === void 0 ? void 0 : currentPost.likes;
};
exports.likeFunction = likeFunction;
const unlikeFunction = (user, postedBy, time) => {
    var _a;
    const postedByUser = exports.serverDataBase.find((details, id) => details.username === postedBy);
    const post = postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.post.find((details) => details.postedBy === postedBy && details.time === time);
    if (post) {
        post.likes = (_a = post.likes) === null || _a === void 0 ? void 0 : _a.filter((details) => details !== user);
        //
    }
    homePost.map((details) => {
        details.post.map((details) => {
            if (details.postedBy === postedBy && details.time === time) {
                details.likes = post === null || post === void 0 ? void 0 : post.likes;
            }
        });
    });
    console.log(postedByUser, post === null || post === void 0 ? void 0 : post.likes, "you unliked this post");
    return post === null || post === void 0 ? void 0 : post.likes;
};
exports.unlikeFunction = unlikeFunction;
const commentFunction = (user, comment, img_url, commentTime, postedBy, time) => {
    var _a;
    const postedByUser = exports.serverDataBase.find((details, id) => details.username === postedBy);
    const post = postedByUser === null || postedByUser === void 0 ? void 0 : postedByUser.post.find((details) => details.postedBy === postedBy && details.time === time);
    if (post) {
        (_a = post.comment) === null || _a === void 0 ? void 0 : _a.push({ username: user, comment, img_url, time: commentTime });
    }
    return post === null || post === void 0 ? void 0 : post.comment;
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
