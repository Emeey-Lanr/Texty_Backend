

import { Request, Response,} from "express"
import {pool} from "../db"

const brcypt = require("bcrypt")
const jwt = require("jsonwebtoken")

 export const signup = async (req: Request, res: Response) => {

     const  {username,password, img_url,background_img_url, about_me,post, following,followers, notification, blocked, state} = req.body
     try {
    //    Find if user exist
        const findUser = await pool.query("SELECT username FROM user_info WHERE username = $1", [username])
    
         if (findUser.rows.length > 0) {
             res.send({message:"Username already exist", status:false})

         } else {
            //hash the user password
             const hashedPasword = await brcypt.hash(password, 10)
            //  user db insertion
             const registeringUserData = [username, hashedPasword, img_url, background_img_url, about_me, JSON.stringify(post), JSON.stringify(following), JSON.stringify(followers), JSON.stringify(notification), JSON.stringify(blocked), state]
             const registerUser = await pool.query("INSERT INTO user_info(username, password, img_url,background_img_url, about_me, post, following, followers,notification,blocked,state) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", registeringUserData)
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
    blocked: [];
   state:string
    
}
const userDataObject:userData = {
         username: "",
  img_url: "",
    about_me: "",
    post:[],
    following: [],
    followers: [],
    notification: [],
    blocked:[],
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
    const message = async (userData?: userData,followingFollowersUser?:F,  status?: boolean, loggedIn?: boolean, currentUser?: boolean, noUserFound?: boolean, lookedForUser?: userData,followingFollowersLookedFor?:F, id?: number, message?: string, userMessage?:{}[] | []) => {
       
          
        switch (id) {
            case  11:
                return res.send({ userData: userData,followingFollowersUser, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser,  followingFollowersLookedFor, message, userMessage });
            case 12:
                return res.send({ userData: userData, followingFollowersUser, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message, userMessage });
            case 13:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message: message, userMessage });
            case 2:
                return res.send({ userData: userData, followingFollowersUser, status: status, loggedIn: loggedIn, currentUser, lookedForUser: lookedForUser, followingFollowersLookedFor, message: message, userMessage });
            case 0:
                return res.send({ bothUnavailable: noUserFound, status: status, loggedIn: loggedIn, message: message, userMessage });
            default :
                return res.send({noUserFound:noUserFound, message:message})
                
        }
        
    }
    const searchForUser = async (userId: string, lookedForUserUsername: string,) => {
        // A fuction that looks for both user
        
        const lookForUserQuery = "SELECT id, username, img_url, background_img_url, about_me,post, following, followers, notification,blocked, state FROM user_info WHERE username IN ($1, $2)"
        
        const lookedForUser = await pool.query(lookForUserQuery, [userId, lookedForUserUsername])
        const searchLoggedInUserMessage = await pool.query("SELECT * FROM texty_p_chat WHERE owner = $1", [userId])
        // This helps to get current user profile image for chat identification 
        const addImages =  lookedForUser.rows.map((name: { username: string, img_url:string }) => {
            searchLoggedInUserMessage.rows.map((namee: { notowner: string, notowner_imgurl: string }) => {
                if (namee.notowner === name.username) {
                         namee.notowner_imgurl = name.img_url
                     }
            
         })
             })
        


        // If only one user is found is either the person search for or the person searching
        const ifUser = await lookedForUser.rows.filter((name: { username: string }) => name.username === userId)
        const ifOtherUser = await lookedForUser.rows.filter((name: { username: string }) => name.username === lookedForUserUsername)

         const lookForAllUser = await pool.query("SELECT id, username, about_me, img_url, background_img_url FROM user_info")
       
        let ifUserFollowingFollowers:F = {following:[], followers:[] }
        let ifOtherUserFollowingFollowers: F = { following: [], followers: [] }
        let updateNotification = []
        // The lookedForUserUsername can be a path identification and not just only a username
        // if we identify it to be notification which is a path we change all checked to true that means the notification has been checked
        console.log(lookedForUserUsername, "this is it")
        if (lookedForUserUsername === "notification") {
            
                      updateNotification = await ifUser[0].notification
            updateNotification.map((data: { checked: boolean }) => {
                       if (!data.checked) {
                                  data.checked = true
                          }
                 
                      })
            try {
            const updateNotificationQuery  = await pool.query("UPDATE user_info SET notification = $1 WHERE username = $2", [JSON.stringify(updateNotification), ifUser[0].username])
            } catch (error:any) {
             console.log(error.message)   
            }
        
              console.log(updateNotification, "yea your notification")
           }
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
                    if (ifOtherUser[0].followers.length > 0) {
                          ifOtherUserFollowingFollowers.followers.push(name)
                    }
                  
                }
            })
     }) 
       
            
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
                message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, userDataObject,  ifOtherUserFollowingFollowers,11,"Only the user logged in is found", searchLoggedInUserMessage.rows)
            } else if (ifUser.length === 1 && lookedForUserUsername !== ifUser[0].username) {
                message(ifUser[0], ifUserFollowingFollowers, true, true, true, false, userDataObject,ifOtherUserFollowingFollowers,  12, "User Searched for not found", searchLoggedInUserMessage.rows)
            }else {
// If it's the person searched for
                console.log("user is not logged in")
                message(userDataObject, ifUserFollowingFollowers, true, false, false, false, lookedForUser.rows[0], ifOtherUserFollowingFollowers,13, "Only the user searched for is found", [])
            }
        } else if (lookedForUser.rows.length === 2) {
            // It checks if both users details are availbale
            console.log("both user are looged available")
             message( ifUser[0], ifUserFollowingFollowers, true, true, true, false, ifOtherUser[0], ifOtherUserFollowingFollowers, 2, "Both users found", searchLoggedInUserMessage.rows)
        } else if (lookedForUser.rows.length === 0) {
            // It checks if no user is found
            message(userDataObject,ifUserFollowingFollowers, false, false, false, false, userDataObject, ifOtherUserFollowingFollowers, 0, "No user found", [])
          
         
       }
    }
    try {

         const identification = req.headers.authorization.split(",")

       
     
        const verfifyToken = await jwt.verify(identification[1], process.env.TKN)
     
        searchForUser(verfifyToken.userId, identification[2])
     
       
        
    } catch (error:any) {
        if (error.message === "jwt malformed"  || error.message === "jwt expired" ) {
            const identification = req.headers.authorization.split(",")
            searchForUser("", identification[2])
        }
        console.log(error.message)
    }
    
     
    
}

 export const followerUser = async (req: Request, res: Response) => {
     const { ownerUsername, userTheyTryingToFollow, notificationWords } = req.body

     try {
         const searchUserLoggedInId = await pool.query("SELECT id FROM user_info WHERE username = $1", [ownerUsername])
         const searchThePersonHeWantsToFollowId = await pool.query("SELECT id FROM user_info WHERE username = $1", [userTheyTryingToFollow])
        //  console.log(searchUserLoggedInId.rows[0].id, searchThePersonHeWantsToFollowId.rows[0].id)
 
         const updateLoggedInUserFollowing = await pool.query("UPDATE user_info SET following  = following || $1 WHERE username = $2", [JSON.stringify({ username: userTheyTryingToFollow, id:searchThePersonHeWantsToFollowId.rows[0].id}), ownerUsername ])
         const updatelookedForUserFollowers = await pool.query("UPDATE user_info SET followers = followers || $1, notification = notification || $2 WHERE username = $3",
             [JSON.stringify({ username: ownerUsername, id:searchUserLoggedInId.rows[0].id }), JSON.stringify({ followed: true, checked: false, notificationDetails: `${ownerUsername} ${notificationWords}`, username: ownerUsername }),userTheyTryingToFollow])

         
        
         
     } catch (error:any) {
         console.log(error.message)
        
     }
             

    
 }

 export const unfollowUser = async (req: Request, res: Response) => {
     const { userLoggedInUserName, userTheyWantToUnfollow } = req.body
     console.log(userLoggedInUserName, userTheyWantToUnfollow)
     const removeUserFromUserFollowingQuery = "UPDATE user_info SET following = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(following) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND following @> $3"
    const  removeUserFromUserFollowerQuery = "UPDATE user_info SET followers = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(followers) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND followers @> $3"
    try {
        const removeUserFromUserFollowing = await pool.query(removeUserFromUserFollowingQuery, [userTheyWantToUnfollow, userLoggedInUserName, JSON.stringify([{username:userTheyWantToUnfollow}])])
        const removeUserFromUserFollower = await pool.query(removeUserFromUserFollowerQuery, [userLoggedInUserName, userTheyWantToUnfollow,JSON.stringify([{username:userLoggedInUserName}])]) 
    } catch (error: any) {
        console.log(error.message, "error message")
        
    }
     
}


export const searchForUsers = async (req: Request, res: Response) => {
    try {
        // const lookedForAllUsers = 
        const allUsers = await pool.query("SELECT id, username, img_url, about_me, following, followers FROM user_info")
        const ifUserExist = await allUsers.rows.filter((name: { username: string }) => name.username.toUpperCase().indexOf(req.body.username.toUpperCase()) > -1);


     res.send({status:true, ifUserExist, group:[]})

        

        
    } catch (error:any) {
        
    }
}


 export const userPost = (req: Request, res: Response) => {
     const { username, postContent } = req.body
     
  
         pool.query("UPDATE user_info SET post = post || $1 WHERE username = $2", [JSON.stringify(postContent),username]).then((result:any) => {
                  res.status(200).send({message:"success", status:true})
         }).catch((error: any) => {
             res.status(404).send({message:"error", status:false})
           console.log(error.message)
       })
     
    
}


export const updateAboutMe = async (req: Request, res: Response) => {
    const {username, aboutme } = req.body
    try {
        const aboutMeUpdateQuery = await pool.query("UPDATE user_info SET about_me = $1 WHERE username = $2", [aboutme, username])
        console.log(aboutMeUpdateQuery)
     res.status(200).send({message:"updated succefully", status:true})
    } catch (error: any) {
        res.status(404).send({message:"an error occured", status:false})
       
    }
}

export const blockUser = async(req: Request, res: Response) => {
    try {
        const {userLoggedIn, userToBeBlocked} = req.body
        const blockUser = await pool.query("UPDATE user_info SET blocked = blocked || $1 WHERE username = $2", [JSON.stringify({ username: userToBeBlocked }), userLoggedIn])
        res.status(200).send({ message: "blocked successfully", status: true })
    } catch (error:any) {
        res.status(404).send({message:error.message, status:false})
    }
}

export const unblockUser = async (req: Request, res: Response) => {
    try {
        const {userLoggedIn, userToBeBlocked} = req.body
        const queryString = "UPDATE user_info SET blocked = COALESCE( (SELECT jsonb_agg(e) FROM jsonb_array_elements(blocked) e WHERE e->>'username' <> $1 ), '[]'::jsonb)  WHERE username = $2 AND blocked @> $3"
         const activateQuery = await pool.query(queryString, [userToBeBlocked, userLoggedIn, JSON.stringify([{username:userToBeBlocked}]) ])
    } catch (error:any) {
     console.log(error.message)   
    }
    
}

export const deleteAccount = async (req:Request, res:Response) => {
    try {
    console.log(req.body)
        const {password, username} = req.body
        const user = await pool.query("SELECT password FROM user_info WHERE username = $1", [username])
        const comparePassword = await brcypt.compare(password, user.rows[0].password)
       console.log(comparePassword)
        if (comparePassword) {
            const deleteUser = await pool.query("DELETE FROM user_info WHERE username = $1", [username])
            const deleteMessage = await pool.query("DELETE FROM texty_p_chat WHERE owner = $1", [username])
            res.status(200).send({status:true, message:"account details deleted succesfully"})
        } else {
            console.log("incorrect password")
            res.status(404).send({status:false, message:"Incorrect password"})
        }
    } catch (error) {
        console.log(error)
    }
}









// module.exports = {
//     signup,
//     signin
// }