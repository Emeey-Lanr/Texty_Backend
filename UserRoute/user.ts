import express from "express"
export const route = express.Router()
import {signup, signin, verifyUserProfile, followerUser} from "../UserController/userController"

route.post("/signup", signup)
route.post("/signin", signin)
route.get("/verifyUserProfile", verifyUserProfile)
route.post("/followUser", followerUser)




// export route


