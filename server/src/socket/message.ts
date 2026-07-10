import type { Socket } from "socket.io";
import { io } from "./index";

export function registerChatHandlers(socket: Socket) {
  console.log("Chat socket connected:", socket.id);

  socket.on("message", (data: string) => {
    console.log("Received message:", data);
    io.emit("message", data); // broadcast to everyone, including sender
    // or socket.broadcast.emit("message", data); to exclude sender
  });

  socket.on("disconnect", () => {
    console.log("Chat socket disconnected:", socket.id);
  });
}