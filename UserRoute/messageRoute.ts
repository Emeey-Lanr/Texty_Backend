
import express from "express"

export const messageroute = express.Router()
import { sendOrCreateMessageConnection, updatechecked, deleteMessage } from "../UserController/messageController"

messageroute.post("/sendMessageOrCreate", sendOrCreateMessageConnection)
messageroute.post("/updatechecked", updatechecked)
messageroute.post("/deleteMessage",deleteMessage )


