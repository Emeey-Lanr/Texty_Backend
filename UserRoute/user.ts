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
    likeUnlikePost,

    commentLikesNotification,
    deletePost,
    updateBackgroundProfileImage,
    updateAboutMe,
    blockUser,
    unblockUser,
    deleteAccount,
    removeDoubleFollowingFollowers
    
} from "../UserController/userController"

route.post("/signup", signup)
route.post("/signin", signin)
route.get("/verifyUserProfile", verifyUserProfile)
route.post("/followUser", followerUser)
route.post("/unfollowUser", unfollowUser)
route.post("/search", searchForUsers)
route.post("/createPost", userPost)
route.put("/likeUnlikeComment", likeUnlikePost);

route.put("/commentLikesNotification", commentLikesNotification);
route.put("/updateImg", updateBackgroundProfileImage)
route.put("/updateAboutMe", updateAboutMe)
route.put("/blockUser", blockUser)
route.put("/unBlockUser", unblockUser)
route.put("/deleteAccount", deleteAccount)
route.put("/deletePost", deletePost)

// double following and followers
route.put("/doubleFollowingXFollowers", removeDoubleFollowingFollowers)






// export route


