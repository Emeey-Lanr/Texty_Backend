import mongoose from "mongoose";

const homePost = new mongoose.Schema({
    postId:{type:String,require:true},
    post: { type:Array}
})
export const homePostModel = mongoose.model("textyHomePost", homePost)