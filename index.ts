import express, { Express, Request, Response } from "express"

// const cors = require("cors")
import cors from "cors"

import {createServer} from "http"
import {Server, Socket } from "socket.io"
import { route } from "./UserRoute/user"
import {addUserInfoToServerDatabase, followUser, unfollowUser} from "./socketController"
// dotenv.config()
require("dotenv").config()

const app: Express = express()
const httpServer = createServer(app)
// const Socket = require("socket.io")


// Middle Ware
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())


app.use("/user", route)
const PORT = process.env.PORT




////////////////////////////////
export const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket:Socket) => {
    socket.emit("hello", { id: socket.id }) 

    // socket.on("userInfoOrSearchedForInfo", (data) => {
    //     console.log(data, "this the data")
    // })
  
    // Database details registering
    socket.on("userInfoOrSearchedForInfo", (data) => {
        if (data.userinfo.username !== "") {
            socket.join(data.userinfo.username)
           addUserInfoToServerDatabase(data.userinfo.username, data.userLookedFor.username, data.userinfo, data.userLookedFor)
        }
    //    console.log(data.userinfo , data.userLookedFor)
})
    const followFunction = (emitingSocketName1:string, emitingSocketName2:string, userLoggedInUserName:string, userTheyWantToFollow:string, notificationWord:string) => {
      let details = followUser(userLoggedInUserName, userTheyWantToFollow, notificationWord)
        console.log(details)
       
        io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName1}`, { lookedForUserFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser: userLoggedInUserName,error:details.errorStatus  }),
       io.sockets.to(userTheyWantToFollow).emit(`${emitingSocketName2}`, { notification: details.notification, addedFollowers: details.followerDetailsLookedForUser, followingDetails: details.followingDetailsLoggedInUser, loggedInUser:userTheyWantToFollow, error:details.errorStatus })
      
    
    }
    const unfollowFunction = (emitingSocketName:string, userLoggedInUserName:string, userYouWantToUnfollow:string) => {
        const details = unfollowUser(userLoggedInUserName, userYouWantToUnfollow)
        console.log(details)
        
         io.sockets.to(userLoggedInUserName).emit(`${emitingSocketName}`, { userLoggedInFollowing: details.followingForUserThatWantsToUnfollow, userTheyWantToUnFollowFollowers: details.followersForUserTheyHaveUnfollowed, loggedInUser: userLoggedInUserName, error:details.error})
       
    }
   
// Allows you to follow user searched for via the route the other user profile is diplayed
    socket.on("followSocket1", async (data) => {
      console.log(data.ownerUsername, )
    
    followFunction("followedUserLookedFor", "followedNotification", data.ownerUsername, data.userTheyTryingToFollow, data.notificationWords)
    })

    // Allows you to unfollow user searched for via route because user Id  username is not the same as the username in the redux store
    socket.on("unfollowSocket1", (data) => {
        const { userLoggedInUserName, userTheyWantToUnfollow} = data
        console.log(userLoggedInUserName, userTheyWantToUnfollow )
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

    socket.on("disconnect", () => {
        console.log("a user has disconnected")
    })
    
})

httpServer.listen(PORT,() => {
    console.log(`server has started @ port ${PORT}`)
})

// io.on("connection", (socket: { emit: (arg0: string, arg1: { id: any }) => void; id: any; on: (arg0: string, arg1: () => void) => void }) => {
//     socket.emit("hello", {id:socket.id})
    


//     socket.on("disconnect", () => {
//         console.log("a user has disconnected")
//     })
    
// })
