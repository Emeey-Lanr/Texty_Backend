"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// const cors = require("cors")
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const user_1 = require("./UserRoute/user");
// dotenv.config()
require("dotenv").config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// const Socket = require("socket.io")
// Middle Ware
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/user", user_1.route);
const PORT = process.env.PORT;
const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
io.on("connection", (socket) => {
    socket.emit("hello", { id: socket.id });
    socket.join("wale");
    socket.on("shit", (data) => {
        console.log(data);
        socket.emit("get", data.name);
    });
    // socket.on()
    socket.on("disconnect", () => {
        console.log("a user has disconnected");
    });
});
httpServer.listen(PORT, () => {
    console.log(`server has started @ port ${PORT}`);
});
// io.on("connection", (socket: { emit: (arg0: string, arg1: { id: any }) => void; id: any; on: (arg0: string, arg1: () => void) => void }) => {
//     socket.emit("hello", {id:socket.id})
//     socket.on("disconnect", () => {
//         console.log("a user has disconnected")
//     })
// })
