

import { Request, Response } from "express"
import {pool} from "../db"
const brcypt = require("bcrypt")
const jwt = require("jsonwebtoken")
 export const signup = async (req: Request, res: Response) => {

     const  {username,password} = req.body
     try {
    //    Find if user exist
        const findUser = await pool.query("SELECT username FROM user_info WHERE username = $1", [username])
    
         if (findUser.rows.length > 0) {
             res.send({message:"Username already exist", status:false})

         } else {
            //hash the user password
             const hashedPasword = await brcypt.hash(password, 10)
            //  user db insertion
             const registerUser = await pool.query("INSERT INTO user_info(username, password) VALUES($1, $2)", [username, hashedPasword])
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
    id: number;
    username: string;
    password: string;
    img_url?: string;
    about_me?: string,
    friends?: object[];
    post?: object[];
    
}
export const verifyUserProfile = async (req: any, res: Response) => {
    const message = (userData?: userData,  status?: boolean, loggedIn?: boolean, currentUser?:boolean,  noUserFound?:boolean, lookedForUser?:userData, id?:number, message?:string) => {
        switch (id) {
            case  11:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message });
            case 12:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message });
            case 13:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser: currentUser, lookedForUser: lookedForUser, message: message });
            case 2:
                return res.send({ userData: userData, status: status, loggedIn: loggedIn, currentUser, lookedForUser: lookedForUser, message: message });
            case 0:
                return res.send({ bothUnavailable: noUserFound, status: status, loggedIn: loggedIn, message: message });
            default :
                return res.send({noUserFound:noUserFound, message:message})
                
        }
        
    }
    const searchForUser = async (userId: string, lookedForUserUsername: string) => {
        // A fuction that looks for both user
        const lookedForUser = await pool.query("SELECT * FROM user_info WHERE username IN ($1, $2)", [userId, lookedForUserUsername])
        // If only one user is found is either the person search for or the person searching
        const ifUser = await lookedForUser.rows.filter((name: { username: string }) => name.username === userId)
        const ifOtherUser = await  lookedForUser.rows.filter((name: { username: string }) => name.username === lookedForUserUsername)
        if (lookedForUser.rows.length === 1) {
            // if it the person searching
            if (ifUser.length === 1 && lookedForUserUsername === ifUser[0].username) {
                console.log("User is logged in")
                message(ifUser[0], true, true, true, false, {id:0, username:"", password:""}, 11, "Only the user logged in is found")
            } else if (ifUser.length === 1 && lookedForUserUsername !== ifUser[0].username) {
                message(ifUser[0], true, true, true, false, {id:0, username:"", password:""}, 12, "User Searched for not found")
            }else {
// If it's the person searched for
                console.log("user is not logged")
                message({id:0, username:"", password:""}, true, false, false, false, lookedForUser.rows[0], 13, "Only the user searched for is found")
            }
        } else if (lookedForUser.rows.length === 2) {
            // It checks if both users details are availbale
            console.log("both user are looged available")
             message( ifUser[0], true, true, true, false, ifOtherUser[0], 2, "Both users found")
        } else if (lookedForUser.rows.length === 0) {
            // It checks if no user is found
            message({id:0, username:"", password:""} , false, false, false, false, {id:0, username:"", password:""}, 0, "No user found")
          
         
       }
    }
    try {
         const identification = req.headers.authorization.split(",")

       
        console.log(identification)
        const verfifyToken = await jwt.verify(identification[1], process.env.TKN)
        console.log(verfifyToken)
        searchForUser(verfifyToken.userId, identification[2])
     
       
        
    } catch (error:any) {
        if (error.message === "jwt malformed") {
            const identification = req.headers.authorization.split(",")
            searchForUser("", identification[2])
        }
        console.log(error.message)
    }
    
     
    
}






// module.exports = {
//     signup,
//     signin
// }