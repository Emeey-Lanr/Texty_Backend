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
exports.removeDoubleFollowingFollowers = exports.deleteAccount = exports.unblockUser = exports.blockUser = exports.updateAboutMe = exports.updateBackgroundProfileImage = exports.deletePost = exports.likeUnlikePost = exports.userPost = exports.searchForUsers = exports.commentLikesNotification = exports.unfollowUser = exports.followerUser = exports.verifyUserProfile = exports.signin = exports.signup = void 0;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = require("jsonwebtoken");
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
            const hashedPasword = yield bcrypt_1.default.hash(password, 10);
            //  user db insertion
            const registeringUserData = [username, hashedPasword, img_url, background_img_url, about_me, JSON.stringify(post), JSON.stringify(following), JSON.stringify(followers), JSON.stringify(notification), JSON.stringify(blocked), state];
            const registerUser = yield db_1.pool.query("INSERT INTO user_info(username, password, img_url,background_img_url, about_me, post, following, followers,notification,blocked,state) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", registeringUserData);
            //  token creation
            const userToken = yield jwt.sign({ userId: username }, process.env.TKN, { expiresIn: "7d" });
            res.send({ status: true, client_Token: userToken, username: username });
        }
    }
    catch (error) {
        res.status(404).send({ message: "an error occured", status: false });
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
            const checkIfPassword = yield bcrypt_1.default.compare(password, findUser.rows[0].password);
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
        return res.send({ message: "an error occured", status: false });
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
            }
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
        if (lookedForUser.rows.length === 1) {
            // if it the person searching
            if (ifUser.length === 1 && lookedForUserUsername === ifUser[0].username) {
                message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, userDataObject, ifOtherUserFollowingFollowers, 11, "Only the user logged in is found", searchLoggedInUserMessage.rows);
            }
            else if (ifUser.length === 1 && lookedForUserUsername !== ifUser[0].username) {
                message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, userDataObject, ifOtherUserFollowingFollowers, 12, "User Searched for not found", searchLoggedInUserMessage.rows);
            }
            else {
                // If it's the person searched for
                message(userDataObject, ifUserFollowingFollowers, true, false, false, false, lookedForUser.rows[0], ifOtherUserFollowingFollowers, 13, "Only the user searched for is found", []);
            }
        }
        else if (lookedForUser.rows.length === 2) {
            // It checks if both users details are availbale
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
    }
});
exports.verifyUserProfile = verifyUserProfile;
const followerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ownerUsername, userTheyTryingToFollow, notificationWords } = req.body;
    try {
        const searchUserLoggedInId = yield db_1.pool.query("SELECT id, img_url, following FROM user_info WHERE username = $1", [ownerUsername]);
        const searchThePersonHeWantsToFollowId = yield db_1.pool.query("SELECT id, img_url, followers FROM user_info WHERE username = $1", [userTheyTryingToFollow]);
        if (!searchUserLoggedInId.rows[0].following.some((details) => details.username === userTheyTryingToFollow)) {
            const updateLoggedInUserFollowing = yield db_1.pool.query("UPDATE user_info SET following  = following || $1 WHERE username = $2", [
                JSON.stringify({
                    username: userTheyTryingToFollow,
                    id: searchThePersonHeWantsToFollowId.rows[0].id,
                }),
                ownerUsername,
            ]);
        }
        if (!searchThePersonHeWantsToFollowId.rows[0].followers.some((details) => details.username === ownerUsername)) {
            const updatelookedForUserFollowers = yield db_1.pool.query("UPDATE user_info SET followers = followers || $1, notification = notification || $2 WHERE username = $3", [
                JSON.stringify({
                    username: ownerUsername,
                    id: searchUserLoggedInId.rows[0].id,
                }),
                JSON.stringify({
                    followed: true,
                    checked: false,
                    img_url: `${searchUserLoggedInId.rows[0].img_url}`,
                    notificationDetails: `${ownerUsername} ${notificationWords}`,
                    username: ownerUsername,
                }),
                userTheyTryingToFollow,
            ]);
        }
    }
    catch (error) {
        res.status(400).send({ mesage: "an error occured", status: false });
    }
});
exports.followerUser = followerUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userLoggedInUserName, userTheyWantToUnfollow } = req.body;
    const removeUserFromUserFollowingQuery = "UPDATE user_info SET following = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(following) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND following @> $3";
    const removeUserFromUserFollowerQuery = "UPDATE user_info SET followers = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(followers) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND followers @> $3";
    try {
        const removeUserFromUserFollowing = yield db_1.pool.query(removeUserFromUserFollowingQuery, [userTheyWantToUnfollow, userLoggedInUserName, JSON.stringify([{ username: userTheyWantToUnfollow }])]);
        const removeUserFromUserFollower = yield db_1.pool.query(removeUserFromUserFollowerQuery, [userLoggedInUserName, userTheyWantToUnfollow, JSON.stringify([{ username: userLoggedInUserName }])]);
    }
    catch (error) {
        res.status(400).send({ mesage: "an error occured", status: false });
    }
});
exports.unfollowUser = unfollowUser;
const commentLikesNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, postedBy, type } = req.body;
    try {
        let message = "";
        if (type === "commented") {
            message = `${user} commented on your post`;
        }
        else if (type === "like") {
            message = `${user} liked your post`;
        }
        const lookForUser = yield db_1.pool.query("SELECT img_url FROM user_info WHERE username = $1", [user]);
        const notification = {
            followed: false,
            checked: false,
            notificationDetails: message,
            username: user,
            img_url: `${lookForUser.rows[0].img_url}`,
        };
        if (user !== postedBy) {
            const notificationUpdate = yield db_1.pool.query("UPDATE user_info SET  notification = notification || $1 WHERE username = $2", [JSON.stringify(notification), postedBy]);
        }
    }
    catch (error) {
    }
});
exports.commentLikesNotification = commentLikesNotification;
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
const userPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, postContent } = req.body;
    try {
        const updatePost = yield db_1.pool.query("UPDATE user_info SET post = post || $1 WHERE username = $2", [JSON.stringify(postContent), username]);
        res.status(200).send({ message: "success", status: true });
    }
    catch (error) {
        res.status(400).json({ message: "an error occured", status: false });
    }
});
exports.userPost = userPost;
const likeUnlikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, postedBy, time, state } = req.body;
    try {
        const post = yield db_1.pool.query("SELECT post FROM user_info WHERE username = $1", [postedBy]);
        const allPost = post.rows[0].post;
        let currentPostId = -1;
        for (let i = 0; i < allPost.length; i++) {
            if (allPost[i].time === time) {
                currentPostId = i;
                break;
            }
        }
        if (state === "like") {
            if (!allPost[currentPostId].likes.some((data) => data === user)) {
                allPost[currentPostId].likes.push(user);
            }
        }
        else if (state === "unlike") {
            allPost[currentPostId].likes = allPost[currentPostId].likes.filter((data) => data !== user);
        }
        else if (state === "comment") {
            allPost[currentPostId].comment.push({ username: user, comment: req.body.comment, img_url: req.body.imgUrl, time: req.body.commentTime });
        }
        const update = yield db_1.pool.query("UPDATE user_info SET post = $1 WHERE username = $2", [JSON.stringify(allPost), postedBy]);
    }
    catch (error) {
        res.status(400).json({ message: "an error occured", status: false });
    }
});
exports.likeUnlikePost = likeUnlikePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { time, username } = req.body;
    try {
        const deletePostQuery = "UPDATE user_info SET post = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(post) e WHERE e->>'time' <> $1 ), '[]'::jsonb)  WHERE username = $2";
        const deletePost = yield db_1.pool.query(deletePostQuery, [time, username]);
        res.status(202).send({ message: "deleted successfully", status: true });
    }
    catch (error) {
        res.status(409).send({ message: "deleted successfully", status: true });
    }
});
exports.deletePost = deletePost;
const updateBackgroundProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, profileBackground, imgPreviewedUrl } = req.body;
    try {
        const whereToUpdate = { img: "" };
        if (profileBackground === "Profile Image") {
            whereToUpdate.img = "img_url";
        }
        else if (profileBackground === "Background Image") {
            whereToUpdate.img = "background_img_url";
        }
        const uploadImage = yield cloudinary_1.v2.uploader.upload(imgPreviewedUrl, { public_id: `${username}${whereToUpdate.img}` });
        const updateUser = yield db_1.pool.query(`UPDATE user_info SET ${whereToUpdate.img} = $1 WHERE username = $2`, [uploadImage.secure_url, username]);
        res.status(200).send({ img_url: uploadImage.secure_url, username, status: true, where: whereToUpdate.img });
    }
    catch (error) {
        res.status(400).send({ message: "an error occured", status: false });
    }
});
exports.updateBackgroundProfileImage = updateBackgroundProfileImage;
const updateAboutMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, aboutme } = req.body;
    try {
        const aboutMeUpdateQuery = yield db_1.pool.query("UPDATE user_info SET about_me = $1 WHERE username = $2", [aboutme, username]);
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
        res.status(404).send({ message: error.message, status: false });
    }
});
exports.unblockUser = unblockUser;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, username } = req.body;
        const user = yield db_1.pool.query("SELECT password FROM user_info WHERE username = $1", [username]);
        const comparePassword = yield bcrypt_1.default.compare(password, user.rows[0].password);
        if (comparePassword) {
            const deleteUser = yield db_1.pool.query("DELETE FROM user_info WHERE username = $1", [username]);
            const deleteMessage = yield db_1.pool.query("DELETE FROM texty_p_chat WHERE owner = $1", [username]);
            res.status(200).send({ status: true, message: "account details deleted succesfully" });
        }
        else {
            res.status(404).send({ status: false, message: "Incorrect password" });
        }
    }
    catch (error) {
        res.status(404).send({ status: false, message: "Incorrect password" });
    }
});
exports.deleteAccount = deleteAccount;
const removeDoubleFollowingFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userFriends = yield db_1.pool.query("SELECT following, followers FROM user_info WHERE username = $1", [req.body.username]);
        const filterDoubleUsers = (friends) => __awaiter(void 0, void 0, void 0, function* () {
            let users = "";
            let filteredFriends = [];
            for (let i = 0; i < friends.length; i++) {
                if (!filteredFriends.some((details) => details.username === friends[i].username)) {
                    console.log(true);
                    filteredFriends.push(friends[i]);
                }
                else {
                    console.log(false);
                }
            }
            return filteredFriends;
        });
        const following = yield filterDoubleUsers(userFriends.rows[0].following);
        const followers = yield filterDoubleUsers(userFriends.rows[0].followers);
        const updateFriends = yield db_1.pool.query("UPDATE user_info SET following = $1, followers = $2 WHERE username = $3", [JSON.stringify(following), JSON.stringify(followers), `${req.body.username}`]);
        res.status(200).send({ status: true, message: "updated succesfully", following, followers });
    }
    catch (error) {
        res.status(404).send({ status: false, message: "Unable to update" });
    }
});
exports.removeDoubleFollowingFollowers = removeDoubleFollowingFollowers;
// module.exports = {
//     signup,
//     signin
// }
