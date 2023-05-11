"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageBoxOrSendMessage = exports.unfollowUser = exports.followUser = exports.addUserInfoToServerDatabase = void 0;
const serverDataBase = [];
let serverMessageDataBase = [];
const ifUserExistOrViceVersa = (username, serverId, details, secondDetails) => {
    serverDataBase.map((name, id) => {
        if (name.username === username) {
            serverId = id;
        }
    });
    serverDataBase[serverId] = details;
    serverDataBase.push(secondDetails);
};
const addUserInfoToServerDatabase = (userLoggedInUsername, userLookedForUsername, loggedInUserDetails, userLookedForDetails, userAllMessage) => {
    if (userLookedForUsername === "") {
        let serverId = 0;
        const checkifUserExist = serverDataBase.find((name) => name.username === userLoggedInUsername);
        if (checkifUserExist) {
            serverDataBase.map((name, id) => {
                if (name.username === checkifUserExist.username) {
                    serverId = id;
                }
            });
            serverDataBase[serverId] = loggedInUserDetails;
        }
        else {
            serverDataBase.push(loggedInUserDetails);
        }
    }
    else {
        const checkifUserExist = serverDataBase.find((name) => name.username === userLoggedInUsername);
        const checkifLookedForUserExist = serverDataBase.find((name) => name.username === userLookedForUsername);
        let userId = 0;
        let lookedForUserId = 0;
        if (checkifUserExist && checkifLookedForUserExist) {
            // if both user exist already, we change the psql database info with the server database
            serverDataBase.map((name, id) => {
                if (name.username === checkifUserExist.username) {
                    userId = id;
                }
                if (name.username === checkifLookedForUserExist.username) {
                    lookedForUserId = id;
                }
            });
            serverDataBase[userId] = loggedInUserDetails;
            serverDataBase[lookedForUserId] = userLookedForDetails;
            console.log("both user exist");
        }
        else if (!checkifUserExist && !checkifLookedForUserExist) {
            // if both don't exist we push in the psql databse into the server database array 
            serverDataBase.push(loggedInUserDetails, userLookedForDetails);
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
    console.log(serverDataBase, serverMessageDataBase);
};
exports.addUserInfoToServerDatabase = addUserInfoToServerDatabase;
// export const acceptIncomingMessageFromDb = (userId:string, userAllMessage:ServerMessageInterface[]) => {
//     // serverMessageDataBase.push()
// }
const followUser = (userLoggedIn, userLookedFor, notificationWords) => {
    const findLoggedInUser = serverDataBase.find((name) => name.username === userLoggedIn);
    const findTheLookedForUser = serverDataBase.find((name) => name.username === userLookedFor);
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
    const userThatWantToUnfollowDetails = serverDataBase.find((details) => details.username === userLoggedInUserName);
    const userTheyWantToUnfolllowDetails = serverDataBase.find((details) => details.username === userTheyWantToUnfollow);
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
