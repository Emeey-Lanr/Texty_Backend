import {ServerDatabase, ServerMessageInterface, POST, MessageInterface} from "./Interface"


export const serverDataBase: ServerDatabase[] = []


let serverMessageDataBase: ServerMessageInterface[] = []
 

interface UserPost {
    user: string;
    post: POST[];
}

const homePost:UserPost[] = []
 
const ifUserExistOrViceVersa = (username:string,  serverId:number, details:ServerDatabase, secondDetails:ServerDatabase) => {
     serverDataBase.map((name, id) => {
                    if (name.username === username) {
                        serverId = id
                    }
                 })
              serverDataBase[serverId] = details
             serverDataBase.push(secondDetails)
}

export const addUserInfoToServerDatabase = (userLoggedInUsername: string, userLookedForUsername: string, loggedInUserDetails: ServerDatabase, userLookedForDetails: ServerDatabase, userAllMessage:ServerMessageInterface[]) => {
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
    // For add messages to db
    serverMessageDataBase = serverMessageDataBase.filter((details) => details.owner !== userLoggedInUsername)
    const loggedInuserAllMessageLength = userAllMessage.length
    userAllMessage.map((details, id) => {
        const check = serverMessageDataBase.filter((details) => details.owner === userLoggedInUsername).length
        if (check <= loggedInuserAllMessageLength) {
          serverMessageDataBase.push(details)
        }

        
    })
    
        console.log(serverDataBase, serverMessageDataBase)
}


export const addUserPostOrEmitPost = (user: string, post: []) => {
    const userPostExist = serverDataBase.find((details) => details.username === user)
    const userHomePostExist = homePost.find((details)=> details.user === user)
    if (userPostExist) {
      userPostExist.post = post  
    } 
    
    if (!userHomePostExist) {
        homePost.push({ user: user, post: [] })
        return { user: user, post: [] }
    } else {
        return userHomePostExist
    }


}

  
// export const acceptIncomingMessageFromDb = (userId:string, userAllMessage:ServerMessageInterface[]) => {
    

//     // serverMessageDataBase.push()
    
    
// }

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


 export const createMessageBoxOrSendMessage = (owner:string, notowner:string, owner_imgurl:string, notowner_imgurl:string, incomingMessageOwner:MessageInterface, incomingMessageNotOwner:MessageInterface) => {
    const ownerMessage = serverMessageDataBase.find((name) => name.owner === owner && name.notowner === notowner)
    const notOwnerMessage = serverMessageDataBase.find((name) => name.owner === notowner && name.notowner === owner)
    
    
    if (ownerMessage && notOwnerMessage) {
        ownerMessage.message.push(incomingMessageOwner)
        notOwnerMessage.message.push(incomingMessageNotOwner)
    } else if (ownerMessage && !notOwnerMessage) {
        ownerMessage.message.push(incomingMessageOwner)
        serverMessageDataBase.push({owner:notowner, notowner:owner, notowner_imgurl:owner_imgurl,  message:[incomingMessageNotOwner]})
        
    } else if (!ownerMessage && notOwnerMessage) {
        serverMessageDataBase.push({owner:owner, notowner:notowner, notowner_imgurl:notowner_imgurl, message:[incomingMessageOwner]})
        notOwnerMessage.message.push(incomingMessageNotOwner)
    } else if (!ownerMessage && !notOwnerMessage) {
        serverMessageDataBase.push({owner:owner, notowner:notowner,notowner_imgurl:notowner_imgurl, message:[incomingMessageOwner]}, {owner:notowner, notowner:owner, notowner_imgurl:owner_imgurl, message:[incomingMessageNotOwner]})
    }
    // ownerMessage.message.push(incomingMessage)
    //  console.log(ownerMessage, notOwnerMessage)
     return serverMessageDataBase
    
}



export const updatchecked = (owner:string, notowner:string) => {
    const userCurrentMesage  = serverMessageDataBase.find((name)=> name.owner === owner && name.notowner === notowner)
    userCurrentMesage?.message.map((data) => {
        data.checked = true
    })
    console.log(userCurrentMesage?.message)
}


export const deleteMessage = (owner: string, notOwner:string) => {
     console.log(owner, notOwner, "from socket controller")
    // serverMessageDataBase = serverMessageDataBase.filter((details)=>details.owner !== owner && details.notowner !== notOwner  )

}



export const addAndEmitPost = (username:string, userPost:POST) => {
    const findUserHomePost = homePost.find((details) => details.user === username)
    
    const userFollowers = serverDataBase.find((details) => details.username === username)
    // we pushed into user home post
    findUserHomePost?.post.push(userPost)

    userFollowers?.post.push(userPost)
    
    const post = homePost.map((data) => {
           userFollowers?.followers.map((details, id) => {
               if (details.username === data.user) {
          data.post.push(userPost)
      }
    })
    }) 

    console.log(findUserHomePost?.post, homePost)

    return {followers:userFollowers?.followers, userHomePost:findUserHomePost, userPost:userFollowers?.post}
    
}

export const likeFunction = (user: string, postedBy: string, time: string) => {
    // we search for the user that posted the post
    const postedByUser = serverDataBase.find((details) => details.username === postedBy)
    // we look for its post and the current post
    const currentPost = postedByUser?.post.find((details) => details.postedBy === postedBy && details.time === time)
    // we push in the user that wants t
    currentPost?.likes?.push(user)

    // we check everybody home post to see if a user has that same post 
    homePost.map((details) => {
        details.post.map((details) => {
            if (details.postedBy === postedBy && details.time === time) {
                 details.likes = currentPost?.likes
             }
         })
    })
    
    console.log(postedByUser, currentPost, currentPost?.likes, "yea yea yea yea")
   return currentPost?.likes
}


export const unlikeFunction = (user:string, postedBy: string, time: string) => {
 
    const postedByUser = serverDataBase.find((details, id) => details.username === postedBy)

    const post = postedByUser?.post.find((details) => details.postedBy === postedBy && details.time === time)
    
    if (post) {
        post.likes = post.likes?.filter((details) => details !== user)
        //
    } 
    homePost.map((details) => {
        details.post.map((details) => {
            if (details.postedBy === postedBy && details.time === time) {
                 details.likes = post?.likes
             }
         })
    })
    
    console.log(postedByUser, post?.likes, "you unliked this post")
 
  return post?.likes 

}

export const commentFunction = (user:string, comment:string, img_url:string, commentTime:string, postedBy: string, time: string,) => {
      const postedByUser = serverDataBase.find((details, id) => details.username === postedBy)
    const post = postedByUser?.post.find((details) => details.postedBy === postedBy && details.time === time)
    if (post) {
        post.comment?.push({ username: user, comment, img_url, time:commentTime})
    }
    

    return post?.comment
}

export const blockUserFunction = (userLoggedIn: string, userToBeBlocked: string) => {
    // find the user logged in and blocked box
    const user = serverDataBase.find((details) => details.username === userLoggedIn)
    const userToBeBlockedDetails = serverDataBase.find((details)=>details.username === userToBeBlocked)
    // this is to check whether user has been added to the block list already
    // to prevent double pushing
    let check = user?.blocked.find((details) => details.username === userToBeBlocked)
    if (!check) {
         user?.blocked.push({username:userToBeBlocked})
    }
   
    return { userBlocked: user?.blocked, otherUserBlockedDetails: userToBeBlockedDetails?.blocked }
    
}

export const unblockFuction = (userLoggedIn: string, userToBeUnBlocked: string) => {
        // find the user logged in and blocked box
    const user = serverDataBase.find((details) => details.username === userLoggedIn)
    const userToBeUnBlockedDetails = serverDataBase.find((details)=>details.username === userToBeUnBlocked)
    if (user) {
        user.blocked = user?.blocked.filter((details) => details.username !== userToBeUnBlocked)
    }
    
    return { userBlocked: user?.blocked, userToBeUnBlockedBlockedDetails:userToBeUnBlockedDetails?.blocked}
    
}