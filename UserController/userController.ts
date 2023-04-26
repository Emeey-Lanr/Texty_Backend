

import { Request, Response } from "express"
import {pool} from "../db"
import { stringify } from "querystring"
const brcypt = require("bcrypt")
const jwt = require("jsonwebtoken")

 export const signup = async (req: Request, res: Response) => {

     const  {username,password, img_url, about_me,post, following,followers, notification, state} = req.body
     try {
    //    Find if user exist
        const findUser = await pool.query("SELECT username FROM user_info WHERE username = $1", [username])
    
         if (findUser.rows.length > 0) {
             res.send({message:"Username already exist", status:false})

         } else {
            //hash the user password
             const hashedPasword = await brcypt.hash(password, 10)
            //  user db insertion
             const registeringUserData = [username, hashedPasword, img_url, about_me, JSON.stringify(post), JSON.stringify(following), JSON.stringify(followers), JSON.stringify(notification), state]
             const registerUser = await pool.query("INSERT INTO user_info(username, password, img_url, about_me, post, following, followers,notification,state) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)", registeringUserData)
            //  token creation
             const userToken = await jwt.sign({ userId: username }, process.env.TKN, { expiresIn: "7d" })
             res.send({status:true, client_Token:userToken, username:username})

         }
         

     } catch (error: any) {
         console.log(error.message)
        
        
    }
    
    
}

export const signin = async (req: Request, res: Response) => {
    const message = (message:string,status:boolean, username?:string) => {
     res.send({message:message,status:status, username})   
    }
    try {
        const{username, password} = req.body
        const findUser = await pool.query("SELECT * FROM user_info WHERE username = $1", [username])
       
        if (findUser.rows.length > 0) {
            const checkIfPassword = await brcypt.compare(password, findUser.rows[0].password)
            if (checkIfPassword) {
               const userToken = await jwt.sign({ userId:findUser.rows[0].username }, process.env.TKN, { expiresIn: "7d" })
                message(userToken, true, findUser.rows[0].username)
                
            } else {
                 message("Invalid Password", false)
            }
            
        } else {
            message("Invalid login crendentails", false)
        }
    } catch (error:any) {
        console.log(error.message)
        
    }
    
}

interface userData {
    username: string;
    img_url: string;
    about_me: string;
    post: [];
    following: [];
    followers: [];
    notification: [];
   state:string
    
}
const userDataObject:userData = {
         username: "",
  img_url: "",
    about_me: "",
    post:[],
    following: [],
    followers: [],
  notification:[],
state:""
}
  interface Details {
            username: string;
            about_me: string,
            img_url: string,
            state:string
        }
        interface F {
            following: {
                username: string;
                about_me: string,
                img_url: string,
                state: string
            }[];
            followers: {
                username: string;
                about_me: string,
                img_url: string,
                state: string
            }[];

        }

export const verifyUserProfile = async (req: any, res: Response) => {
    const message = async (userData?: userData,followingFollowersUser?:F,  status?: boolean, loggedIn?: boolean, currentUser?: boolean, noUserFound?: boolean, lookedForUser?: userData,followingFollowersLookedFor?:F, id?: number, message?: string) => {
       
          
        switch (id) {
            case  11:
                return res.send({ userData: userData,followingFollowersUser, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser,  followingFollowersLookedFor, message });
            case 12:
                return res.send({ userData: userData, followingFollowersLookedFor, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message });
            case 13:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message: message });
            case 2:
                return res.send({ userData: userData, followingFollowersUser, status: status, loggedIn: loggedIn, currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message: message });
            case 0:
                return res.send({ bothUnavailable: noUserFound, status: status, loggedIn: loggedIn, message: message });
            default :
                return res.send({noUserFound:noUserFound, message:message})
                
        }
        
    }
    const searchForUser = async (userId: string, lookedForUserUsername: string) => {
        // A fuction that looks for both user
        
        const lookForUserQuery = "SELECT username, img_url, about_me,post, following, followers, notification, state FROM user_info WHERE username IN ($1, $2)"
        const lookedForUser = await pool.query(lookForUserQuery, [userId, lookedForUserUsername])
        console.log(lookedForUser.rows)

        // If only one user is found is either the person search for or the person searching
        const ifUser = await lookedForUser.rows.filter((name: { username: string }) => name.username === userId)
        const ifOtherUser = await lookedForUser.rows.filter((name: { username: string }) => name.username === lookedForUserUsername)

         const lookForAllUser = await pool.query("SELECT username, about_me, img_url,  state FROM user_info")
        console.log(lookForAllUser.rows, ifUser, "user")
      
        let ifUserFollowingFollowers:F = {following:[], followers:[] }
        let ifOtherUserFollowingFollowers: F = { following: [], followers: [] }
        const addUserFollowingFollowersForLoggedInUser = async () => {
              const addFollowingFollowersUser =  await lookForAllUser.rows.map((name: userData) => {
            ifUser[0].following.map((followingName: Details) => {
                if (followingName.username === name.username) {
                    if (ifUser[0].following.length > 0) {
                         ifUserFollowingFollowers.following.push(name)
                    }
                   
                }
            })
            ifUser[0].followers.map((followersName: Details) => {
                if (followersName.username === name.username) {
                    if(ifUser[0].followers.length > 0)
                     ifUserFollowingFollowers.followers.push(name)
                }
            })
      }) 
          if (ifUserFollowingFollowers.following.length > 0 && ifUserFollowingFollowers.followers.length > 0) {
            let changeState = await ifUserFollowingFollowers.following.map((name: Details) => {
                ifUserFollowingFollowers.followers.map((followerName:Details) => {
                    if (name.username === followerName.username) {
                        name.state = "follows you"
                    }
                })
            })
        }
            
        }
        const addUserFollowingFollowersForUserLookedFor = async () => {
            
     const addFollowingFollowersUserLookedFor =  await lookForAllUser.rows.map((name: userData) => {
            ifOtherUser[0].following.map((followingName: Details) => {
                if (followingName.username === name.username) {
                    if (ifOtherUser[0].following.length > 0) {
                        ifOtherUserFollowingFollowers.following.push(name)
                    }
                }
            })
            ifOtherUser[0].followers.map((followersName: Details) => {
                if (followersName.username === name.username) {
                    if (lookedForUser[0].followers.length > 0) {
                          ifOtherUserFollowingFollowers.followers.push(name)
                    }
                  
                }
            })
     }) 
          if (ifOtherUserFollowingFollowers.following.length > 0 ) {
            let changeState = await ifOtherUserFollowingFollowers.following.map((name: Details) => {
                ifOtherUserFollowingFollowers.followers.map((user: Details) => {
                    if (name.username === user.username) {
                             name.state ="follows you"
                         }
                     })
            })
        }
         
         if (ifOtherUserFollowingFollowers.following.length > 0 ) {
             let changeState = await ifOtherUserFollowingFollowers.followers.map((name:Details) => {
                 ifOtherUserFollowingFollowers.followers.map((user: Details) => {
                     if (name.username === user.username) {
                         name.state = "follows you"
                     }
                 })
            })
        }
            
        }
        if (ifUser.length > 0 && ifOtherUser.length > 0) {
            
            addUserFollowingFollowersForLoggedInUser()
            addUserFollowingFollowersForUserLookedFor()
        } else if (ifUser.length > 0 && ifOtherUser.length === 0) {
            addUserFollowingFollowersForLoggedInUser()
        } else if (ifUser.length === 0 && ifOtherUser.length > 0) {
            addUserFollowingFollowersForUserLookedFor()
        } else {
            console.log("no user found")
        }
        
    
    
        
      
      

        if (lookedForUser.rows.length === 1) {
            // if it the person searching
            if (ifUser.length === 1 && lookedForUserUsername === ifUser[0].username) {
                console.log("User is logged in")
                message(ifUser[0], ifOtherUserFollowingFollowers, true, true, true, false, userDataObject,  ifOtherUserFollowingFollowers,11,"Only the user logged in is found")
            } else if (ifUser.length === 1 && lookedForUserUsername !== ifUser[0].username) {
                message(ifUser[0], ifOtherUserFollowingFollowers, true, true, true, false, userDataObject,ifOtherUserFollowingFollowers,  12, "User Searched for not found")
            }else {
// If it's the person searched for
                console.log("user is not logged in")
                message(userDataObject, ifUserFollowingFollowers, true, false, false, false, lookedForUser.rows[0], ifOtherUserFollowingFollowers,13, "Only the user searched for is found")
            }
        } else if (lookedForUser.rows.length === 2) {
            // It checks if both users details are availbale
            console.log("both user are looged available")
             message( ifUser[0], ifUserFollowingFollowers, true, true, true, false, ifOtherUser[0], ifOtherUserFollowingFollowers, 2, "Both users found")
        } else if (lookedForUser.rows.length === 0) {
            // It checks if no user is found
            message(userDataObject,ifUserFollowingFollowers, false, false, false, false, userDataObject, ifOtherUserFollowingFollowers, 0, "No user found")
          
         
       }
    }
    try {

         const identification = req.headers.authorization.split(",")

       
     
        const verfifyToken = await jwt.verify(identification[1], process.env.TKN)
     
        searchForUser(verfifyToken.userId, identification[2])
     
       
        
    } catch (error:any) {
        if (error.message === "jwt malformed") {
            const identification = req.headers.authorization.split(",")
            searchForUser("", identification[2])
        }
        console.log(error.message)
    }
    
     
    
}

 export const followerUser = async (req: Request, res: Response) => {
     const { ownerUsername, userTheyTryingToFollow } = req.body

     try {
         const loggedInUser = await pool.query("SELECT * FROM user_info WHERE username = $1", [ownerUsername])
         const lookedForUser = await pool.query()
         
     } catch (error:any) {
         console.log(error.message)
        
     }
             

    
 }






// module.exports = {
//     signup,
//     signin
// }