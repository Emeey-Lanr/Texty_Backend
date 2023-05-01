
interface FollowFollowersDetails  {
    username?: string;
    img_url?: string ;
    about_me?: string;
}
interface Notification {
    followed: boolean;
    checked: boolean;
    notificationDetails: string;
    username: string;
    img_url:string,

}
interface ServerDatabase {
    username: string;
    img_url: string;
    about_me: string;
    post: [];
    following: FollowFollowersDetails[];
    followers:FollowFollowersDetails [];
    notification:Notification [];
    state:string
}
 const serverDataBase: ServerDatabase[] = []
 
const ifUserExistOrViceVersa = (username:string,  serverId:number, details:ServerDatabase, secondDetails:ServerDatabase) => {
     serverDataBase.map((name, id) => {
                    if (name.username === username) {
                        serverId = id
                    }
                 })
              serverDataBase[serverId] = details
             serverDataBase.push(secondDetails)
}

export const addUserInfoToServerDatabase = (userLoggedInUsername: string, userLookedForUsername: string, loggedInUserDetails: ServerDatabase, userLookedForDetails: ServerDatabase) => {
        if (userLookedForUsername === "") {
             let serverId = 0
             const checkifUserExist = serverDataBase.find((name) => name.username === userLoggedInUsername)
            if (checkifUserExist) {
                serverDataBase.map((name, id) => {
                    if (name.username === checkifUserExist.username) {
                         serverId = id
                     }
                })
                
                serverDataBase[serverId] =  loggedInUserDetails
            } else {
                serverDataBase.push(loggedInUserDetails)
                 
             }
        } else {
            const checkifUserExist = serverDataBase.find((name) => name.username === userLoggedInUsername)
            const checkifLookedForUserExist = serverDataBase.find((name) => name.username === userLookedForUsername)
            let userId = 0
            let lookedForUserId = 0
            
            if (checkifUserExist && checkifLookedForUserExist) {
                // if both user exist already, we change the psql database info with the server database
                serverDataBase.map((name, id) => {
                    if (name.username === checkifUserExist.username) {
                         userId = id
                    }
                    if (name.username === checkifLookedForUserExist.username) {
                        lookedForUserId = id
                    }
                })
                 serverDataBase[userId] = loggedInUserDetails
                serverDataBase[lookedForUserId] = userLookedForDetails  
                console.log("both user exist")
            } else if (!checkifUserExist && !checkifLookedForUserExist) {
                // if both don't exist we push in the psql databse into the server database array 
                serverDataBase.push(loggedInUserDetails, userLookedForDetails)
                console.log("bot user don't exist")
            } else if (!checkifUserExist && checkifLookedForUserExist) {
                 // if the looged in user doesn't exist and the user looked for already exist in the server database
                // we push in the looged in user and change the looked for user info with what we have in its database
                
                ifUserExistOrViceVersa(checkifLookedForUserExist.username, lookedForUserId, userLookedForDetails, loggedInUserDetails)
                console.log("logged in user doesn't exist")
            } else if (checkifUserExist && !checkifLookedForUserExist) {
                // if user logged in exist in the  and the looked for user doesn't exist
                // we change the logged in user details with what we are getting from psql db and push in the looked for user
                ifUserExistOrViceVersa(checkifUserExist.username, userId, loggedInUserDetails, userLookedForDetails)
                console.log("logged in user exist but the other one doesn't")
            }
               
           
        }
        console.log(serverDataBase)
}
    

export const followUserSearchedForFromProfileFunction = (userLoggedIn:string, userLookedFor:string)=>   {
    const findLoggedInUser = serverDataBase.find((name) => name.username === userLoggedIn)
    const findTheLookedForUser = serverDataBase.find((name) => name.username === userLookedFor)
    console.log(findLoggedInUser, findTheLookedForUser)
    const loggedInUserDetails = {
             username: findLoggedInUser?.username,
    img_url: findLoggedInUser?.img_url,
    about_me: findLoggedInUser?.about_me,
    }
    const lookedForUserDetails = {
         username: findTheLookedForUser?.username,
    img_url: findTheLookedForUser?.img_url,
    about_me: findTheLookedForUser?.about_me,
    }
    findLoggedInUser?.following.push(lookedForUserDetails)
    findTheLookedForUser?.followers.push(loggedInUserDetails)
    // followed means this type on notification is a type where user gets to know they've been followed and can follow back via the notification
    findTheLookedForUser?.notification.push({ followed: true, checked: false, notificationDetails:`${userLoggedIn} follows you`, username:userLoggedIn, img_url:findTheLookedForUser.img_url})

    return { followerDetails: findTheLookedForUser?.followers, notification: findTheLookedForUser?.notification }
    // let m = findTheLookedForUser?.followers
    // return m
}