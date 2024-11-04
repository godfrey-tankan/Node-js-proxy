const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws"); 
const { getAllUsersData } = require("./controllers/authController");

dbConnect();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Connecting to the Django WebSocket server
const djangoSocket = new WebSocket("ws://localhost:8000/ws/chat/");

djangoSocket.on("open", async () => {
  console.log("Connected to Django WebSocket server");

  try {
    const users = await getAllUsersData();

    const userList = users.map(user => ({
      username: user.username,
      email: user.email,
    }));

    djangoSocket.send(JSON.stringify({
      type: "all_users",
      users: userList,
    }));
  } catch (error) {
    console.error("Error fetching users:", error.message);
  }
});

djangoSocket.on("message", (data) => {
  console.log("Received message from Django:", data);
});

djangoSocket.on("error", (error) => {
  console.error("WebSocket error:", error);
});

djangoSocket.on("close", () => {
  console.log("Disconnected from Django WebSocket server");
});

// Verifying JWT for Socket.io connections
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.headers["sec-websocket-protocol"];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Authentication error:", err);
        return next(new Error("Authentication error"));
      }
      socket.user = decoded;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
};

io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.username);

  socket.on("send_message", (msg) => {
    console.log("Message received:", msg);
    // Sending the message to the Django WebSocket
    if (djangoSocket.readyState === WebSocket.OPEN) {
      djangoSocket.send(
        JSON.stringify({
          user: socket.user.username,
          msg,
        })
      );
      socket.broadcast.emit("receive_message", {
        user: socket.user.username,
        msg,
      });
    } else {
      console.error("WebSocket connection is not open");
    }
  });

  socket.on("user_typing", (data) => {
    socket.broadcast.emit("user_typing", data);
  });

  socket.on("new_user", (data) => {
    socket.broadcast.emit("new_user", data.user);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.username);
  });
});

// Starting the server
const SERVER_PORT = process.env.SERVER_PORT || 7001;
server.listen(SERVER_PORT, () => {
  console.log(`Server now running on port ${SERVER_PORT}`);
});
