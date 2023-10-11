import { ServerDatabase, ServerMessageInterface, POST, MessageInterface } from "./Interface"
import { pool } from "./db";
import { homePostModel } from "./homepostModel";


export let serverDataBase: ServerDatabase[] = []


let serverMessageDataBase: ServerMessageInterface[] = []
 

interface UserPost {
    user: string;
    post: POST[];
}

export let homePost: UserPost[] = []


export const updateInfo = async () => {
    try {
        const lookForUsersQuery = "SELECT id, username, img_url, background_img_url, about_me,post, following, followers, notification,blocked, state FROM user_info"
        const users = await pool.query(lookForUsersQuery)
        serverDataBase = users.rows
    } catch (error:any) {
        return new Error(error.message)
    }
}

export const createHomePostDb = async () => {
    try {
        const texyHomePost = await homePostModel.findOne({ postId: `${process.env.homePostId}` })
        if (texyHomePost !== null) {
     
            homePost = texyHomePost.post
        } else {
            const addPost = new homePostModel({postId:process.env.homePostId, post:[]})
            const savePost = await addPost.save()

        }
    } catch (error:any) {
        return new Error(error.message)
    }
}
 export const updateHomePost = async () => {
    try {
         const update = await homePostModel.findOneAndUpdate({postId:process.env.homePostId}, {postId:process.env.homePostId, post:homePost})
    } catch (error) {
        
    }
   
}

const ifUserExistOrViceVersa = (username:string,  serverId:number, details:ServerDatabase, secondDetails:ServerDatabase) => {
     serverDataBase.map((name, id) => {
                    if (name.username === username) {
                        serverId = id
                    }
     })
           const post =  serverDataBase[serverId].post 
        serverDataBase[serverId] = details
       serverDataBase[serverId].post = post
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
                 const userPost = serverDataBase[serverId].post
                serverDataBase[serverId] = loggedInUserDetails
                serverDataBase[serverId].post = userPost
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
                const userServerPost =  serverDataBase[userId].post
                const lookedForUserServerPost = serverDataBase[lookedForUserId].post;
                 serverDataBase[userId] = loggedInUserDetails
                serverDataBase[lookedForUserId] = userLookedForDetails  

                serverDataBase[userId].post = userServerPost
                serverDataBase[lookedForUserId].post = lookedForUserServerPost
              
            } else if (!checkifUserExist && !checkifLookedForUserExist) {
                // if both don't exist we push in the psql databse into the server database array 
                serverDataBase.push(loggedInUserDetails, userLookedForDetails)
              
            } else if (!checkifUserExist && checkifLookedForUserExist) {
                 // if the looged in user doesn't exist and the user looked for already exist in the server database
                // we push in the looged in user and change the looked for user info with what we have in its database
                
                ifUserExistOrViceVersa(checkifLookedForUserExist.username, lookedForUserId, userLookedForDetails, loggedInUserDetails)
                
            } else if (checkifUserExist && !checkifLookedForUserExist) {
                // if user logged in exist in the  and the looked for user doesn't exist
                // we change the logged in user details with what we are getting from psql db and push in the looked for user
                ifUserExistOrViceVersa(checkifUserExist.username, userId, loggedInUserDetails, userLookedForDetails)
                
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
    const user = serverDataBase.find((details) => details.username === userLoggedInUsername)
    const userLookedFor = serverDataBase.find((details) => details.username === userLookedForUsername)
    
    
    // return serverDataBase
    return {user, userLookedFor}
}


export const addUserPostOrEmitPost = async (user: string, post: []) => {

          const userPostExist = serverDataBase.find((details) => details.username === user)
    const userHomePostExist = homePost.find((details) => details.user === user)
    const emeeyLanrHomePost = homePost.find((details) => details.user === "Emeey_Lanr")



    if (userPostExist) {
      userPostExist.post = post  
    } 
    
        if (!userHomePostExist) {
     
        homePost.push({ user: user, post: [] })
      
      return { user: user, post: emeeyLanrHomePost}

        } else {
            const post  =  user === 'Emeey_Lanr' ? userHomePostExist.post :  [userHomePostExist.post, emeeyLanrHomePost?.post].flat()
         
            return { user: userHomePostExist.user, post }
    }
   
  


}

// code for suggesting user

export const suggestUser = (username: string) => {
  
    const user = serverDataBase.find((details) => details.username === username)
    let suggestedUser:ServerDatabase[] = []
    if (user?.following.length === 0) {
        suggestedUser = serverDataBase.filter((details) => details.username !== username)
         user?.blocked.map((user)=>{
            suggestedUser  = suggestedUser.filter((details)=> details.username !== user.username)
          })
    } else {
        user?.following.map((following) => {
                  suggestedUser =  serverDataBase.filter((detail)=>detail.username !== following.username && detail.username !== username )
            
        })
          user?.blocked.map((user)=>{
            suggestedUser  = suggestedUser.filter((details)=> details.username !== user.username)
          })
         
    }
    

    
    let shuffledUsers = suggestedUser.sort(() => Math.random() - 0.5)
    
    // const notFollowingLength = unfollowing.length

     return  shuffledUsers.filter((_, id)=> id  < 6)
}
  

export const followUser = (userLoggedIn:string, userLookedFor:string, notificationWords:string)=>   {
    const findLoggedInUser = serverDataBase.find((name) => name.username === userLoggedIn)
    const findTheLookedForUser = serverDataBase.find((name) => name.username === userLookedFor)


    // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
    let errorStatus = false
    if (!findTheLookedForUser) {
        errorStatus = true
    } else {
        errorStatus = false
    }
 
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
    // const checkIfUserAlreadyExistForUserLoggedIn = findLoggedInUser?.following.find((details) => details.username === userLookedFor)
// later used some instead
    if (!findLoggedInUser?.following.some((details)=>details.username === userLookedFor)) {
       findTheLookedForUser && findLoggedInUser ?   findLoggedInUser?.following.push(lookedForUserDetails) : ""
    }
    // const checkIfUserExistInLookedForUserFollowers = findTheLookedForUser?.followers.find((details) => details.username === userLoggedIn)
   
    if (!findTheLookedForUser?.followers.some((details) => details.username === userLoggedIn)) {
      findTheLookedForUser && findLoggedInUser ?   findTheLookedForUser?.followers.push(loggedInUserDetails) : ""
    }
  
    
    // followed means this type on notification is a type where user gets to know they've been followed and can follow back via the notification
   findTheLookedForUser && findLoggedInUser ?  findTheLookedForUser?.notification.push({ followed: true, checked: false, notificationDetails:`${userLoggedIn} ${notificationWords}`, username:userLoggedIn, img_url:findTheLookedForUser.img_url}): "can't find user"

    // this following details is meant to reflect in the notification that you are now following the user that has followed you
    return { followerDetailsLookedForUser:findTheLookedForUser?.followers, notification: findTheLookedForUser?.notification, followingDetailsLoggedInUser:findLoggedInUser?.following, errorStatus:errorStatus }
    
    
   
}

export const unfollowUser = (userLoggedInUserName: string, userTheyWantToUnfollow: string) => {
    const userThatWantToUnfollowDetails = serverDataBase.find((details)=>details.username === userLoggedInUserName) 
    const userTheyWantToUnfolllowDetails = serverDataBase.find((details) => details.username === userTheyWantToUnfollow)
       // The if statement helps to prevent the server from crashing incase there is an update and one of the user is not found
   
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
    
  
    return {followingForUserThatWantsToUnfollow: userThatWantToUnfollowDetails?.following, followersForUserTheyHaveUnfollowed:userTheyWantToUnfolllowDetails?.followers, error:errorStatus}
        
}


 export const createMessageBoxOrSendMessage = (owner:string, notowner:string, owner_imgurl:string, notowner_imgurl:string, incomingMessageOwner:MessageInterface, incomingMessageNotOwner:MessageInterface) => {
 
   const ownerMessage = serverMessageDataBase.find((name) => name.owner === owner && name.notowner === notowner)
    const notOwnerMessage = serverMessageDataBase.find((name) => name.owner === notowner && name.notowner === owner)
    
     const notOwner = serverDataBase.find((details) => details.username === notowner)
     const ifBlockedByNotOwner = notOwner?.blocked.find((details) => details.username === owner)
     let blocked = false
     if (ifBlockedByNotOwner) {
         blocked = true
     } else {
         blocked = false
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
     }
   
    // ownerMessage.message.push(incomingMessage)
  
     return { blocked, serverMessageDataBase }
    
}



export const updatchecked = (owner:string, notowner:string) => {
    const userCurrentMesage  = serverMessageDataBase.find((name)=> name.owner === owner && name.notowner === notowner)
    userCurrentMesage?.message.map((data) => {
        data.checked = true
    })
  
}


export const deleteMessage = (owner: string, notOwner:string) => {
   
    serverMessageDataBase = serverMessageDataBase.filter((details)=>details.owner !== owner && details.notowner !== notOwner  )

}



export const addAndEmitPost = (username: string, userPost: POST) => {
    const { text, date, time, postedBy, comment, likes } = userPost
    const user = serverDataBase.find((details) => details.username === postedBy)
    const new_Post = {
        text,
        date,
        time,
        postedBy,
        comment,
        likes,
        poster_imgUrl:user?.img_url
    }
  
    const findUserHomePost = homePost.find((details) => details.user === username)
    
    const userFollowers = serverDataBase.find((details) => details.username === username)
    // we pushed into user home post
    
    
    findUserHomePost?.post.push(new_Post)

    userFollowers?.post.push(new_Post)
    
    const post = homePost.map((data) => {
           userFollowers?.followers.map((details, id) => {
               if (details.username === data.user) {
          data.post.push(new_Post)
      }
           })
      
    }) 

   return {followers:userFollowers?.followers, userHomePost:findUserHomePost, userPost:userFollowers?.post, post:new_Post}
    
}

export const likeFunction = (user: string, postedBy: string, time: string) => {
    // we search for the user that posted the post
    const userLoggedIn = serverDataBase.find((details)=>details.username === user)
    const postedByUser = serverDataBase.find((details) => details.username === postedBy)
    

    if (postedByUser) {
      // we look for its post and the current post

      const currentPost = postedByUser?.post.find(
        (details) => details.postedBy === postedBy && details.time === time
      );
      // we push in the user that owns the post
        if (currentPost) {
            currentPost?.likes?.push(user);
        }
      
        if (user !== postedBy &&  currentPost) {
          
        postedByUser?.notification.push({
          followed: false,
          checked: false,
          notificationDetails: `${user} liked your post`,
          username: user,
          img_url: `${userLoggedIn?.img_url}`,
        });
      }

      // we check everybody home post to see if a user has that same post
      homePost.map((details) => {
        details.post.map((details) => {
          if (details.postedBy === postedBy && details.time === time) {
            details.likes = currentPost?.likes;
          }
        });
      });
    
        return { LikeUnlike: currentPost?.likes, notification: postedByUser?.notification, available: true }
         
    } else {
        return { LikeUnlike: [], notification: [], available:false }
    }
   
    
 
}


export const unlikeFunction = (user: string, postedBy: string, time: string) => {
    // we acting on the user's real post and replacing the non owner post details with user's post
    const postedByUser = serverDataBase.find((details, id) => details.username === postedBy)
    if (postedByUser) {
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
        return { likes: post?.likes, available: true }
    } else {
        return { likes: [], available: false } 
    }

  
 

 
 

}

export const commentFunction = (user: string, comment: string, img_url: string, commentTime: string, postedBy: string, time: string,) => {
          const userLoggedIn = serverDataBase.find(
            (details) => details.username === user
          );
    const postedByUser = serverDataBase.find((details, id) => details.username === postedBy)
    if (postedByUser) {
        const post = postedByUser?.post.find((details) => details.postedBy === postedBy && details.time === time)
    if (post) {
        post.comment?.push({ username: user, comment, img_url, time:commentTime})
    }


     homePost.map((details) => {
        details.post.map((details) => {
            if (details.postedBy === postedBy && details.time === time) {
                 details.comment = post?.comment
             }
         })
     })
    if (post) {
         postedByUser?.notification.push({
           followed: false,
           checked: false,
           notificationDetails: `${user} commented on your post`,
           username: user,
           img_url: `${userLoggedIn?.img_url}`,
         });
        
    }
       

    return { comment: post?.comment, notification: postedByUser?.notification, available: true }
        
    } else {
            return { comment: [], notification: [], available: false}
    }
    
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

export const deletePost = (time: string, username: string) => {
    const user = serverDataBase.find((data)=>data.username === username)
    const findUser = homePost.find((data) => data.user === username)
    if (user) {
        user.post = user.post.filter((data)=>data.time !== time && data.postedBy === username)
    }
    if (findUser) {
        findUser.post = findUser.post.filter((posts)=> posts.time !== time && posts.postedBy === username)
    }

    return {userhomePost:findUser?.post, userProfilePost:user?.post, username}

}

export const  deleteAccount = (username:string)=>{
     serverDataBase = serverDataBase.filter((details)=>details.username !== username)
}