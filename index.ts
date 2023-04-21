import express, { Express, Request, Response } from "express"

// const cors = require("cors")
import cors from "cors"

import {createServer} from "http"
import {Server, Socket } from "socket.io"
import { route } from "./UserRoute/user"

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





 const io = new Server (httpServer, {cors: {origin:"*"}});

io.on("connection", (socket:Socket) => {
    socket.emit("hello", { id: socket.id })
    socket.join("wale")
    socket.on("shit", (data) => {
        console.log(data)
        socket.emit("get", data.name)
    })
    
  
    
    // socket.on()


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
