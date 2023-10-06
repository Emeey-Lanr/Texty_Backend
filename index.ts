import express, { Express, Request, Response } from "express"

// const cors = require("cors")
import cors from "cors"

import {createServer} from "http"
import {Server, Socket } from "socket.io"
import { route } from "./UserRoute/user"
import {messageroute} from "./UserRoute/messageRoute"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { deleteAccount, serverDataBase, suggestUser } from "./socketController"
import {
    updateInfo,
    addUserInfoToServerDatabase,
    addUserPostOrEmitPost,
    followUser, unfollowUser,
    createMessageBoxOrSendMessage,
    updatchecked,
    deleteMessage,
    addAndEmitPost,
    likeFunction,
    unlikeFunction,
    commentFunction,
    blockUserFunction,
    unblockFuction,
    deletePost
} from "./socketController"



const app: Express = express()
const httpServer = createServer(app)
dotenv.config()




// Middle Ware

app.use(cors({}))
app.use(express.json({limit:"25mb"}))
app.use(express.urlencoded({ extended: true, limit:"25mb" }));


app.use("/user", route)
app.use("/message", messageroute)
const PORT = process.env.PORT




////////////////////////////////
export const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket:Socket) => {
    socket.emit("hello", { id: socket.id }) 

    // Database details registering
    socket.on("userInfoOrSearchedForInfo", async (data) => {
        if (data.userinfo.username !== "") {
       
            socket.join(data.userinfo.username)
      const serverDataBase =   addUserInfoToServerDatabase(data.userinfo.username, data.userLookedFor.username, data.userinfo, data.userLookedFor, data.usermessage)
            const homePost = addUserPostOrEmitPost(data.userinfo.username, data.userinfo.post)
           const suggestedUser = suggestUser(data.userinfo.username);
       
            io.sockets.to(data.userinfo.username).emit("homePost", homePost)
            io.sockets.to(data.userinfo.username).emit("profilePost", { user: serverDataBase.user, lookedForUser: serverDataBase.userLookedFor })
            io.sockets.to(data.userinfo.username).emit("suggestedUser", {suggestedUser});
        }

})
    const followFunction = (emitingSocketName1:string, emitingSocketName2:string, userLoggedInUserName:string, userTheyWantToFollow:string, notificationWord:string) => {
      let details = followUser(userLoggedInUserName, userTheyWantToFollow, notificationWord)
       
        io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName1}`, { lookedForUserFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userLoggedInUserName,error:details.errorStatus  }),
       io.sockets.to(userTheyWantToFollow).emit(`${emitingSocketName2}`, { notification: details.notification, addedFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser:userTheyWantToFollow, error:details.errorStatus })
      
    
    }
    const unfollowFunction = (emitingSocketName:string, userLoggedInUserName:string, userYouWantToUnfollow:string) => {
        const details = unfollowUser(userLoggedInUserName, userYouWantToUnfollow)
    
        
         io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName}`, { userLoggedInFollowing: details.followingForUserThatWantsToUnfollow, userTheyWantToUnFollowFollowers: details.followersForUserTheyHaveUnfollowed, loggedInUser: userLoggedInUserName, error:details.error})
       
    }
   
// Allows you to follow user searched for via the route the other user profile is diplayed
    socket.on("followSocket1", async (data) => {
      
    followFunction("followedUserLookedFor", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords)
    })

    // Allows you to unfollow user searched for via route because user Id  username is not the same as the username in the redux store
    socket.on("unfollowSocket1", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow} = data
       
       unfollowFunction("unFollowed",userLoggedInUserName, userTheyWantToUnfollow)
    })

    //when  user Id  username is the same as the username in the redux store
    socket.on("followSocket2", (data)=>{
   
        followFunction("userFollowingWhenFollowing","followedNotification",  data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords)
    })
    socket.on("unfollowSocket2", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow} = data
       unfollowFunction("userFollowingWhenUnFollowing", userLoggedInUserName, userTheyWantToUnfollow )
    })

    // follow, unfollow socket 2 happens when you follow or unfollow someone via a searched person route followers and following

    socket.on("followSocket3", (data)=>{
        followFunction("followingViaAnotherPersonFFlist", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords )
    })
    socket.on("unfollowSocket3", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow} = data
       unfollowFunction("unfollowingViaAnotherPersonFFlist", userLoggedInUserName, userTheyWantToUnfollow)
    })


    // Socket for private messaging 
    socket.on("privateMessage", (data) => {
       
      const messageDataBase =   createMessageBoxOrSendMessage(data.owner, data.notowner, data.owner_imgurl, data.notowner_imgurl, {sender:data.sender, time:data.time, text:data.text, checked:true}, {sender:data.sender, time:data.time, text:data.text, checked:false} )
       
        const ownerMessageDetails = messageDataBase.serverMessageDataBase .find((name) => name.owner === data.owner && name.notowner === data.notowner)
        const notOwnerMessageDetails = messageDataBase.serverMessageDataBase.find((name) => name.owner === data.notowner && name.notowner === data.owner)
        
        io.sockets.to(data.owner).emit("incomingMessage", { blocked: messageDataBase.blocked, owner: true, message: ownerMessageDetails })
        io.sockets.to(data.notowner).emit("incomingMessage", { blocked: messageDataBase.blocked, owner:false, message: notOwnerMessageDetails })
     
         
    })
    
    // update if user has checked his or her own current message
    socket.on("updatchecked", (data)=>{
        updatchecked(data.owner, data.notowner)
    })

    socket.on("deleteUserMessageBox", (data) => {
       
        deleteMessage(data.owner, data.notOwner)
        io.sockets.to(data.owner).emit("messageDeleted", { notowner:data.notOwner, owner:data.owner })
        
    })


    // Post emiitter to followers
    socket.on("emitPost", (data) => {

        const details = addAndEmitPost(data.username, data.post)
         const post =  details.post
          io.sockets.to(data.username).emit("userNewPost", {post:details.userPost, homePost:details.userHomePost})

        if (data.username === "Emeey_Lanr") {
            // all user that has regitered gets to see my post if i post wherther you
            // follow me or not
            const allUsers = serverDataBase.filter((details) => details.username !== data.username)
            allUsers.map((details) => {
                io.sockets.to(`${details.username}`).emit("newPostForFollowers", {newPost:post})
            })
            
        } else {
             details.followers?.map((details) => {
            io.sockets.to(`${details.username}`).emit("newPostForFollowers", {newPost:post})
        })
        }
      
       
        
         
    })


    const likeUnlikeCommentFunction = (user: string, comment:string, img_url:string, commentTime:string, postedBy: string, time: string, state: string, socketName1:string, socketName2:string) => {
        let detailsBox: any = []
        let notification: any = []
        let available = false
        if (state === "like") {
            let  likes_with_Notification  = likeFunction(user, postedBy, time)
            detailsBox = likes_with_Notification.LikeUnlike
            notification = likes_with_Notification.notification
            available = likes_with_Notification.available
        } else if (state === "unlike") {
            let details = unlikeFunction(user, postedBy, time)
            detailsBox = details.likes
             available =  details.available
        }
        // } else if(state === "comment") {
        //     detailsBox = commentFunction(user, comment, img_url, commentTime, postedBy, time)
        // }
             


            // this goes to the current user 
            io.sockets.to(user).emit(socketName1, { likes: detailsBox,  postedBy: postedBy, time:time, available})
            

            const allUsers = serverDataBase.filter((details) => details.username !== postedBy)
            const postedByUserFollower = serverDataBase.find((details) => details.username == postedBy)
            
            // // this is meant of the other users that follows or alll user for emeey lanr
            if (postedBy === "Emeey_Lanr") {
                io.sockets.to("Emeey_Lanr").emit(socketName1, { likes: detailsBox, notification:notification, notified:state === "like" ? true : false, postedBy: postedBy, time:time, available})
             allUsers.map((details) => {
                io.sockets.to(`${details.username}`).emit(socketName2, {likes:detailsBox, postedBy:postedBy, time:time, notified:false, available})
             })
                
            } else {
                 io.sockets.to(`${postedBy}`).emit(socketName1, {likes:detailsBox, userThatLiked: user, notification:notification, notified:state === "like" ? true : false, postedBy:postedBy, time:time, available})  
                // but if not emeey lanr we know only those following the user have the post
                postedByUserFollower?.followers.map((details) => {
                    io.sockets.to(`${details.username}`).emit(socketName2, {likes:detailsBox, postedBy:postedBy, time:time, notified:false, available})  
                })
                
            }
        }
        
     socket.on("like", (data) => {
        
            likeUnlikeCommentFunction(data.user,"", "", "",  data.postedBy,  data.time, data.state, "likeOrUnlike1", "likeOrUnlike2")
           
            
        })
   
    socket.on("unlike", (data) => {
       
         likeUnlikeCommentFunction(data.user,"", "", "",  data.postedBy,  data.time, data.state, "likeOrUnlike1", "likeOrUnlike2")
        // likeGeneralFunction(data.user, data.)
    })
    socket.on("comment", (data) => {
      
        const comment = commentFunction(data.user, data.comment, data.imgUrl, data.commentTime, data.postedBy, data.time)
        
        // we're sending to the user's followers
        // for Emeeey's case we search for all users that we have except emeey
        const allUsers = serverDataBase.filter((details) => details.username !== data.postedBy)
        
        // we look for the user that posted and check the person's followers and send it to them
        const postedByUserFollower = serverDataBase.find((details) => details.username === data.postedBy)
        if (data.postedBy === "Emeey_Lanr") {
             io.sockets.to("Emeey_Lanr").emit("comment1", { comment:comment.comment, notification:comment.notification, notified:true, postedBy:data.postedBy, time:data.time, available:comment.available})
               allUsers.map((details) => {
                io.sockets.to(`${details.username}`).emit("Comment2", {comment:comment.comment,  postedBy:data.postedBy, time:data.time, notified:false, available:comment.available })
            })
        } else {
             io.sockets.to(`${data.postedBy}`).emit("comment1", { comment:comment.comment, userThatCommented:data.user, notification:comment.notification, notified:true, postedBy:data.postedBy, time:data.time, available:comment.available})
             postedByUserFollower?.followers.map((details) => {
                    io.sockets.to(`${details.username}`).emit("Comment2", {comment:comment.comment, postedBy:data.postedBy, time:data.time, notified:false, available:comment.available})  
                })
        }
        //  likeUnlikeCommentFunction(data.user, data.comment, data.imgUrl, data.commentTime, data.postedBy, data.time, data.state, "comment1", "Comment2")
        
    })
        
    socket.on("blockUser", (data) => {
   const blockDetails = blockUserFunction(data.userLoggedIn, data.userToBeBlocked)
     io.sockets.to(data.userLoggedIn).emit("blocked", {details:blockDetails.userBlocked})    

    })

    socket.on("unblockUser", (data) => {
   
           const unblockDetails = unblockFuction(data.userLoggedIn, data.userToBeBlocked)
     io.sockets.to(data.userLoggedIn).emit("unblocked", {details:unblockDetails.userBlocked})   
    })
    // blocking and unblocking via profile
    socket.on("blockVP", (data) => {
        const blockDetails = blockUserFunction(data.user, data.userToBeUnblocked)
        io.sockets.to(data.user).emit("blockedVP", {userDetails:blockDetails.userBlocked, userBlockedDetails:blockDetails.otherUserBlockedDetails, userBlockedUsername:data.userToBeUnblocked})
    })
    socket.on("unblockVP", (data) => {
        const unblockDetails = unblockFuction(data.user, data.userToBeUnblocked)
        io.sockets.to(data.user).emit("unblockedVP",{userDetails:unblockDetails.userBlocked, userBlockedDetails:unblockDetails.userToBeUnBlockedBlockedDetails, userBlockedUsername:data.userToBeUnblocked} )
    })


    socket.on("deletePost",  (data) => {
       
        const postDeletedFunction = deletePost(data.time, data.username)

        io.sockets.to(data.username).emit("postDeleted", {time:data.time, homePost:postDeletedFunction.userhomePost, profilePost:postDeletedFunction.userProfilePost, username:postDeletedFunction.username})
    })
    
    socket.on("deleteAccount", (data) => {
        console.log(data)
        deleteAccount(data.username)
    })
    
      
    socket.on("disconnect", () => {
       
        
    })


   
    
})

httpServer.listen(PORT, async () => {
    try {
        const updateInfoFunction = await updateInfo()
        const connect = await mongoose.connect(`${process.env.URI}`)
        console.log(`server has started @ port ${PORT}`);
    } catch (error:any) {
        console.log(`${error.message}`)
    }
   
})

