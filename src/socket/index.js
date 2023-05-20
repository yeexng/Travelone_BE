// Declare an object to store onlineUsers arrays for each room
const roomsOnlineUsers = {};

export const newConnectionHandler = (socket, io) => {
  // "connection" is NOT A CUSTOM EVENT. This is a socket.io event, it's triggered every time a new client connects!
  console.log("A new client connected! it's id is:", socket.id);
  // 1. Emit a "welcome" event to the connected client

  //joinRoom
  socket.on("joinRoom", (room) => {
    console.log("Room Id", room);
    socket.join(room);

    if (!roomsOnlineUsers[room]) {
      roomsOnlineUsers[room] = [];
    }

    const onlineUsers = roomsOnlineUsers[room];
    // 2. Listen to an event emitted by FE called "setUsername", this event should contain the username in the payload
    socket.on("setUsername", (payload) => {
      socket.emit("welcome", {
        message: `Welcome ${payload} onboard!!`,
      });
      console.log("username:", payload);

      const existingUserIndex = onlineUsers.findIndex(
        (user) => user.socketId === socket.id
      );

      if (existingUserIndex !== -1) {
        // User already exists, update the username
        onlineUsers[existingUserIndex].username = payload;
      } else {
        // New user, add to the onlineUsers array
        onlineUsers.push({
          username: payload,
          socketId: socket.id,
        });
      }

      const newUserArray = [...onlineUsers];
      console.log("Updated onlineUsers Array:", newUserArray);
      // 2.1 Whenever we receive the username, we have to keep track of it together with the socket.id
      // onlineUsers.push(...onlineUsers, {
      //   username: payload,
      //   socketId: socket.id,
      // });
      // console.log("line 22 ", onlineUsers);

      // 2.2 Then we have to send the list of online users to the current user that just "logged in"
      socket.emit("loggedIn", newUserArray);

      // 2.3 We have also to inform everybody else of the new user which just joined
      socket.broadcast.to(room).emit("updateOnlineUsersList", newUserArray);
    });

    // 3. Listen for an event called "sendMessage", this is triggered when a user sends a new chat message
    socket.on("sendMessage", (message) => {
      // 3.1 Whenever we receive the new message we have to "propagate" that message to everybody but not the sender
      socket.broadcast.to(room).emit("newMessage", message);
    });

    // 4. Listen for an event called "disconnect" (this is NOT A CUSTOM EVENT!). This event happens when an user closes the browser/tab/window
    socket.on("disconnect", () => {
      const filteredUsers = onlineUsers.filter(
        (user) => user.socketId !== socket.id
      );
      roomsOnlineUsers[room] = filteredUsers;
      socket.broadcast.to(room).emit("updateOnlineUsersList", filteredUsers);
      io.emit("message", "A user has left the party");
    });
  });
};
