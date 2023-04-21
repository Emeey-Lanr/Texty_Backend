"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../groupie_BackEnd/index");
index_1.io.on("connection", (socket) => {
    socket.emit("hello", { id: socket.id });
    socket.on("disconnect", () => {
        console.log("a user has disconnected");
    });
});
