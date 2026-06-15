import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./app";

import { Server } from "socket.io";

const port = 3000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});