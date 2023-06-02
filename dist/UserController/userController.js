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
exports.deleteAccount = exports.unblockUser = exports.blockUser = exports.updateAboutMe = exports.userPost = exports.searchForUsers = exports.unfollowUser = exports.followerUser = exports.verifyUserProfile = exports.signin = exports.signup = void 0;
const db_1 = require("../db");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, img_url, background_img_url, about_me, post, following, followers, notification, blocked, state } = req.body;
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
            const registeringUserData = [username, hashedPasword, img_url, background_img_url, about_me, JSON.stringify(post), JSON.stringify(following), JSON.stringify(followers), JSON.stringify(notification), JSON.stringify(blocked), state];
            const registerUser = yield db_1.pool.query("INSERT INTO user_info(username, password, img_url,background_img_url, about_me, post, following, followers,notification,blocked,state) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", registeringUserData);
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
const userDataObject = {
    username: "",
    img_url: "",
    about_me: "",
    post: [],
    following: [],
    followers: [],
    notification: [],
    blocked: [],
    state: ""
};
const verifyUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = (userData, followingFollowersUser, status, loggedIn, currentUser, noUserFound, lookedForUser, followingFollowersLookedFor, id, message, userMessage) => __awaiter(void 0, void 0, void 0, function* () {
        switch (id) {
            case 11:
                return res.send({ userData: userData, followingFollowersUser, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message, userMessage });
            case 12:
                return res.send({ userData: userData, followingFollowersUser, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message, userMessage });
            case 13:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message: message, userMessage });
            case 2:
                return res.send({ userData: userData, followingFollowersUser, status: status, loggedIn: loggedIn, currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message: message, userMessage });
            case 0:
                return res.send({ bothUnavailable: noUserFound, status: status, loggedIn: loggedIn, message: message, userMessage });
            default:
                return res.send({ noUserFound: noUserFound, message: message });
        }
    });
    const searchForUser = (userId, lookedForUserUsername) => __awaiter(void 0, void 0, void 0, function* () {
        // A fuction that looks for both user
        const lookForUserQuery = "SELECT id, username, img_url, background_img_url, about_me,post, following, followers, notification,blocked, state FROM user_info WHERE username IN ($1, $2)";
        const lookedForUser = yield db_1.pool.query(lookForUserQuery, [userId, lookedForUserUsername]);
        const searchLoggedInUserMessage = yield db_1.pool.query("SELECT * FROM texty_p_chat WHERE owner = $1", [userId]);
        // This helps to get current user profile image for chat identification 
        const addImages = lookedForUser.rows.map((name) => {
            searchLoggedInUserMessage.rows.map((namee) => {
                if (namee.notowner === name.username) {
                    namee.notowner_imgurl = name.img_url;
                }
            });
        });
        // If only one user is found is either the person search for or the person searching
        const ifUser = yield lookedForUser.rows.filter((name) => name.username === userId);
        const ifOtherUser = yield lookedForUser.rows.filter((name) => name.username === lookedForUserUsername);
        const lookForAllUser = yield db_1.pool.query("SELECT id, username, about_me, img_url, background_img_url FROM user_info");
        let ifUserFollowingFollowers = { following: [], followers: [] };
        let ifOtherUserFollowingFollowers = { following: [], followers: [] };
        let updateNotification = [];
        // The lookedForUserUsername can be a path identification and not just only a username
        // if we identify it to be notification which is a path we change all checked to true that means the notification has been checked
        console.log(lookedForUserUsername, "this is it");
        if (lookedForUserUsername === "notification") {
            updateNotification = yield ifUser[0].notification;
            updateNotification.map((data) => {
                if (!data.checked) {
                    data.checked = true;
                }
            });
            try {
                const updateNotificationQuery = yield db_1.pool.query("UPDATE user_info SET notification = $1 WHERE username = $2", [JSON.stringify(updateNotification), ifUser[0].username]);
            }
            catch (error) {
                console.log(error.message);
            }
            console.log(updateNotification, "yea your notification");
        }
        const addUserFollowingFollowersForLoggedInUser = () => __awaiter(void 0, void 0, void 0, function* () {
            const addFollowingFollowersUser = yield lookForAllUser.rows.map((name) => {
                ifUser[0].following.map((followingName) => {
                    if (followingName.username === name.username) {
                        if (ifUser[0].following.length > 0) {
                            ifUserFollowingFollowers.following.push(name);
                        }
                    }
                });
                ifUser[0].followers.map((followersName) => {
                    if (followersName.username === name.username) {
                        if (ifUser[0].followers.length > 0)
                            ifUserFollowingFollowers.followers.push(name);
                    }
                });
            });
        });
        const addUserFollowingFollowersForUserLookedFor = () => __awaiter(void 0, void 0, void 0, function* () {
            const addFollowingFollowersUserLookedFor = yield lookForAllUser.rows.map((name) => {
                ifOtherUser[0].following.map((followingName) => {
                    if (followingName.username === name.username) {
                        if (ifOtherUser[0].following.length > 0) {
                            ifOtherUserFollowingFollowers.following.push(name);
                        }
                    }
                });
                ifOtherUser[0].followers.map((followersName) => {
                    if (followersName.username === name.username) {
                        if (ifOtherUser[0].followers.length > 0) {
                            ifOtherUserFollowingFollowers.followers.push(name);
                        }
                    }
                });
            });
        });
        if (ifUser.length > 0 && ifOtherUser.length > 0) {
            addUserFollowingFollowersForLoggedInUser();
            addUserFollowingFollowersForUserLookedFor();
        }
        else if (ifUser.length > 0 && ifOtherUser.length === 0) {
            addUserFollowingFollowersForLoggedInUser();
        }
        else if (ifUser.length === 0 && ifOtherUser.length > 0) {
            addUserFollowingFollowersForUserLookedFor();
        }
        else {
            console.log("no user found");
        }
        if (lookedForUser.rows.length === 1) {
            // if it the person searching
            if (ifUser.length === 1 && lookedForUserUsername === ifUser[0].username) {
                console.log("User is logged in");
                message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, userDataObject, ifOtherUserFollowingFollowers, 11, "Only the user logged in is found", searchLoggedInUserMessage.rows);
            }
            else if (ifUser.length === 1 && lookedForUserUsername !== ifUser[0].username) {
                message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, userDataObject, ifOtherUserFollowingFollowers, 12, "User Searched for not found", searchLoggedInUserMessage.rows);
            }
            else {
                // If it's the person searched for
                console.log("user is not logged in");
                message(userDataObject, ifUserFollowingFollowers, true, false, false, false, lookedForUser.rows[0], ifOtherUserFollowingFollowers, 13, "Only the user searched for is found", []);
            }
        }
        else if (lookedForUser.rows.length === 2) {
            // It checks if both users details are availbale
            console.log("both user are looged available");
            message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, ifOtherUser[0], ifOtherUserFollowingFollowers, 2, "Both users found", searchLoggedInUserMessage.rows);
        }
        else if (lookedForUser.rows.length === 0) {
            // It checks if no user is found
            message(userDataObject, ifUserFollowingFollowers, false, false, false, false, userDataObject, ifOtherUserFollowingFollowers, 0, "No user found", []);
        }
    });
    try {
        const identification = req.headers.authorization.split(",");
        const verfifyToken = yield jwt.verify(identification[1], process.env.TKN);
        searchForUser(verfifyToken.userId, identification[2]);
    }
    catch (error) {
        if (error.message === "jwt malformed" || error.message === "jwt expired") {
            const identification = req.headers.authorization.split(",");
            searchForUser("", identification[2]);
        }
        console.log(error.message);
    }
});
exports.verifyUserProfile = verifyUserProfile;
const followerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ownerUsername, userTheyTryingToFollow, notificationWords } = req.body;
    try {
        const searchUserLoggedInId = yield db_1.pool.query("SELECT id FROM user_info WHERE username = $1", [ownerUsername]);
        const searchThePersonHeWantsToFollowId = yield db_1.pool.query("SELECT id FROM user_info WHERE username = $1", [userTheyTryingToFollow]);
        //  console.log(searchUserLoggedInId.rows[0].id, searchThePersonHeWantsToFollowId.rows[0].id)
        const updateLoggedInUserFollowing = yield db_1.pool.query("UPDATE user_info SET following  = following || $1 WHERE username = $2", [JSON.stringify({ username: userTheyTryingToFollow, id: searchThePersonHeWantsToFollowId.rows[0].id }), ownerUsername]);
        const updatelookedForUserFollowers = yield db_1.pool.query("UPDATE user_info SET followers = followers || $1, notification = notification || $2 WHERE username = $3", [JSON.stringify({ username: ownerUsername, id: searchUserLoggedInId.rows[0].id }), JSON.stringify({ followed: true, checked: false, notificationDetails: `${ownerUsername} ${notificationWords}`, username: ownerUsername }), userTheyTryingToFollow]);
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.followerUser = followerUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userLoggedInUserName, userTheyWantToUnfollow } = req.body;
    console.log(userLoggedInUserName, userTheyWantToUnfollow);
    const removeUserFromUserFollowingQuery = "UPDATE user_info SET following = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(following) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND following @> $3";
    const removeUserFromUserFollowerQuery = "UPDATE user_info SET followers = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(followers) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND followers @> $3";
    try {
        const removeUserFromUserFollowing = yield db_1.pool.query(removeUserFromUserFollowingQuery, [userTheyWantToUnfollow, userLoggedInUserName, JSON.stringify([{ username: userTheyWantToUnfollow }])]);
        const removeUserFromUserFollower = yield db_1.pool.query(removeUserFromUserFollowerQuery, [userLoggedInUserName, userTheyWantToUnfollow, JSON.stringify([{ username: userLoggedInUserName }])]);
    }
    catch (error) {
        console.log(error.message, "error message");
    }
});
exports.unfollowUser = unfollowUser;
const searchForUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const lookedForAllUsers = 
        const allUsers = yield db_1.pool.query("SELECT id, username, img_url, about_me, following, followers FROM user_info");
        const ifUserExist = yield allUsers.rows.filter((name) => name.username.toUpperCase().indexOf(req.body.username.toUpperCase()) > -1);
        res.send({ status: true, ifUserExist, group: [] });
    }
    catch (error) {
    }
});
exports.searchForUsers = searchForUsers;
const userPost = (req, res) => {
    const { username, postContent } = req.body;
    db_1.pool.query("UPDATE user_info SET post = post || $1 WHERE username = $2", [JSON.stringify(postContent), username]).then((result) => {
        res.status(200).send({ message: "success", status: true });
    }).catch((error) => {
        res.status(404).send({ message: "error", status: false });
        console.log(error.message);
    });
};
exports.userPost = userPost;
const updateAboutMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, aboutme } = req.body;
    try {
        const aboutMeUpdateQuery = yield db_1.pool.query("UPDATE user_info SET about_me = $1 WHERE username = $2", [aboutme, username]);
        console.log(aboutMeUpdateQuery);
        res.status(200).send({ message: "updated succefully", status: true });
    }
    catch (error) {
        res.status(404).send({ message: "an error occured", status: false });
    }
});
exports.updateAboutMe = updateAboutMe;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userLoggedIn, userToBeBlocked } = req.body;
        const blockUser = yield db_1.pool.query("UPDATE user_info SET blocked = blocked || $1 WHERE username = $2", [JSON.stringify({ username: userToBeBlocked }), userLoggedIn]);
        res.status(200).send({ message: "blocked successfully", status: true });
    }
    catch (error) {
        res.status(404).send({ message: error.message, status: false });
    }
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userLoggedIn, userToBeBlocked } = req.body;
        const queryString = "UPDATE user_info SET blocked = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(blocked) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND blocked @> $3";
        const activateQuery = yield db_1.pool.query(queryString, [userToBeBlocked, userLoggedIn, JSON.stringify([{ username: userToBeBlocked }])]);
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.unblockUser = unblockUser;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { password, username } = req.body;
        const user = yield db_1.pool.query("SELECT password FROM user_info WHERE username = $1", [username]);
        const comparePassword = yield brcypt.compare(password, user.rows[0].password);
        console.log(comparePassword);
        if (comparePassword) {
            const deleteUser = yield db_1.pool.query("DELETE FROM user_info WHERE username = $1", [username]);
            const deleteMessage = yield db_1.pool.query("DELETE FROM texty_p_chat WHERE owner = $1", [username]);
            res.status(200).send({ status: true, message: "account details deleted succesfully" });
        }
        else {
            console.log("incorrect password");
            res.status(404).send({ status: false, message: "Incorrect password" });
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.deleteAccount = deleteAccount;
// module.exports = {
//     signup,
//     signin
// }
