import express from "express"
export const route = express.Router()
import {
    signup,
    signin,
    verifyUserProfile,
    followerUser,
    unfollowUser,
    searchForUsers,
    userPost,
    commentLikesNotification,
    deletePost,
    updateBackgroundProfileImage,
    updateAboutMe,
    blockUser,
    unblockUser,
    deleteAccount
} from "../UserController/userController"

route.post("/signup", signup)
route.post("/signin", signin)
route.get("/verifyUserProfile", verifyUserProfile)
route.post("/followUser", followerUser)
route.post("/unfollowUser", unfollowUser)
route.post("/search", searchForUsers)
route.post("/createPost", userPost)
route.put("/commentLikesNotification", commentLikesNotification);
route.put("/updateImg", updateBackgroundProfileImage)
route.put("/updateAboutMe", updateAboutMe)
route.put("/blockUser", blockUser)
route.put("/unBlockUser", unblockUser)
route.put("/deleteAccount", deleteAccount)
route.put("/deletePost", deletePost)





// export route


