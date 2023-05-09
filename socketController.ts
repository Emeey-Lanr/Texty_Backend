
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
    id:string,
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
    

export const followUser = (userLoggedIn:string, userLookedFor:string, notificationWords:string)=>   {
    const findLoggedInUser = serverDataBase.find((name) => name.username === userLoggedIn)
    const findTheLookedForUser = serverDataBase.find((name) => name.username === userLookedFor)

    console.log(findLoggedInUser, findTheLookedForUser,"I'm working")
    // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    let errorStatus = false
    if (!findTheLookedForUser) {
        errorStatus = true
    } else {
        errorStatus = false
    }
   console.log(errorStatus)
    const loggedInUserDetails = {
              id:findLoggedInUser?.id,
             username: findLoggedInUser?.username,
    img_url: findLoggedInUser?.img_url,
    about_me: findLoggedInUser?.about_me,
    }
    const lookedForUserDetails = {
        id:findTheLookedForUser?.id,
         username: findTheLookedForUser?.username,
    img_url: findTheLookedForUser?.img_url,
    about_me: findTheLookedForUser?.about_me,
    }
    // This prevents double pushing, It checks if user already exist in  user following if it does it doesn't push
    const checkIfUserAlreadyExistForUserLoggedIn = findLoggedInUser?.following.find((details) => details.username === userLookedFor)
    if (!checkIfUserAlreadyExistForUserLoggedIn) {
       findTheLookedForUser && findLoggedInUser ?   findLoggedInUser?.following.push(lookedForUserDetails) : console.log("can't find one user")
    }
    const checkIfUserExistInLookedForUserFollowers = findTheLookedForUser?.followers.find((details) => details.username === userLoggedIn)
    if (!checkIfUserExistInLookedForUserFollowers) {
      findTheLookedForUser && findLoggedInUser ?   findTheLookedForUser?.followers.push(loggedInUserDetails) : console.log("can't find one user")
    }
  
    
    // followed means this type on notification is a type where user gets to know they've been followed and can follow back via the notification
   findTheLookedForUser && findLoggedInUser ?  findTheLookedForUser?.notification.push({ followed: true, checked: false, notificationDetails:`${userLoggedIn} ${notificationWords}`, username:userLoggedIn, img_url:findTheLookedForUser.img_url}): console.log("can't find user")

    // this following details is meant to reflect in the notification that you are now following the user that has followed you
    return { followerDetailsLookedForUser:findTheLookedForUser?.followers, notification: findTheLookedForUser?.notification, followingDetailsLoggedInUser:findLoggedInUser?.following, errorStatus:errorStatus }
    
    
   
}

export const unfollowUser = (userLoggedInUserName: string, userTheyWantToUnfollow: string) => {
    const userThatWantToUnfollowDetails = serverDataBase.find((details)=>details.username === userLoggedInUserName) 
    const userTheyWantToUnfolllowDetails = serverDataBase.find((details) => details.username === userTheyWantToUnfollow)
       // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    console.log(userLoggedInUserName, userTheyWantToUnfollow, userThatWantToUnfollowDetails?.following,"user following")
    // let followingDetailsForUserThatWantsToUnfollow:FollowFollowersDetails[]  = []
    // let followersDetailsForUserUnfollowed: FollowFollowersDetails[] = []
    let errorStatus = false
    if(userThatWantToUnfollowDetails){
         userThatWantToUnfollowDetails.following  = userThatWantToUnfollowDetails?.following.filter((details) => details.username !== userTheyWantToUnfolllowDetails?.username)
    }
    if (userTheyWantToUnfolllowDetails) {
        userTheyWantToUnfolllowDetails.followers = userTheyWantToUnfolllowDetails?.followers.filter((details) => details.username !== userThatWantToUnfollowDetails?.username)
    } else {
        errorStatus = true
    }
    
    console.log(userThatWantToUnfollowDetails?.following, userTheyWantToUnfolllowDetails?.followers, errorStatus)
    

    return {followingForUserThatWantsToUnfollow: userThatWantToUnfollowDetails?.following, followersForUserTheyHaveUnfollowed:userTheyWantToUnfolllowDetails?.followers, error:errorStatus}
        
    
    
    
}