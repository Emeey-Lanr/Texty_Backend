"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserInfoToServerDatabase = void 0;
const serverDataBase = [];
const ifUserExistOrViceVersa = (username, serverId, details, secondDetails) => {
    serverDataBase.map((name, id) => {
        if (name.username === username) {
            serverId = id;
        }
    });
    serverDataBase[serverId] = details;
    serverDataBase.push(secondDetails);
};
const addUserInfoToServerDatabase = (userLoggedInUsername, userLookedForUsername, loggedInUserDetails, userLookedForDetails) => {
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
    console.log(serverDataBase);
};
exports.addUserInfoToServerDatabase = addUserInfoToServerDatabase;
