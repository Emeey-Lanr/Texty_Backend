"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
index_1.io.on("connection", (socket) => {
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
