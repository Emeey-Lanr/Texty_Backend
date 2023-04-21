import express from "express"
export const route = express.Router()
import {signup, signin, verifyUserProfile} from "../UserController/userController"

route.post("/signup", signup)
route.post("/signin", signin)
route.get("/verifyUserProfile", verifyUserProfile)




// export route


