export const newConnectionHandler = (socket, io) => {
  // "connection" is NOT A CUSTOM EVENT. This is a socket.io event, it's triggered every time a new client connects!
  console.log("A new client connected! it's id is:", socket.id);
  // 1. Emit a "welcome" event to the connected client
  socket.emit("welcome", { message: `HELLO ${socket.id}` });

  // Broadcast when a user connects
  socket.broadcast.emit("message", "A user has joined the gig");

  // Listen for 'connectToRoom' events from the client
  socket.on("connectToRoom", (room) => {
    // join the specified room
    socket.join(room);

    // emit a message to the room that a new user has joined
    io.to(room).emit("userJoined", `A new user has joined room ${room}`);
  });

  // 3. Listen for an event called "sendMessage", this is triggered when a user sends a new chat message
  socket.on("sendMessage", (message) => {
    console.log(message);
    // 3.1 Whenever we receive the new message we have to "propagate" that message to everybody but not the sender
    socket.broadcast.emit("newMessage", message);
  });

  // Run when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the party");
  });

  //   //Listen for chatMessage
  //   socket.on("chatMessage", (msg) => {
  //     io.emit("message", msg);
  //   });
};
