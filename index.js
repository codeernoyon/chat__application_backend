// -------- Internal Import -------- //
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ErrorHandler = require("./utils/erroeHandler");
const cors = require("cors");
const { AuthRoute } = require("./routes/AuthRoutes");
const cookieParser = require("cookie-parser");
const { MessageRoute } = require("./routes/MessageRoutes");
const { Server } = require("socket.io");

// -----====== cors options ====----- /
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Authorization",
  ],
  credentials: true,
  // Access-Control-Allow-Origin:true,
};

// -------- app create for use application -------- //
const app = express();
dotenv.config();

// -------- Database connect ------- //
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connect successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// ------ app use for third party library --- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/Uploads/recording", express.static("Uploads/recording"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// -------- Routing ----------- //
app.use("/api/v1", AuthRoute);
app.use("/api/v1", MessageRoute);

app.use("/cookie", (req, res) => {
  res.cookie("user", "noyonislam");
  res.send("cookie");
});

// -------- create a server -------- //
const server = app.listen(process.env.SERVER_PORT, () =>
  console.log(`App listing to port ${process.env.SERVER_PORT}`)
);

// ------====== Error Handle -----======
app.use(ErrorHandler);

// connect with socket.io
const io = new Server(server, {
  cors: {
    origin:
      "https://chat-application-fronted.vercel.app/, http://localhost:3000/",
  },
});

// ------ for get online & offline users ------
global.onlineUsers = new Map();
global.currentMessageActiveUser = {};
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add_user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("active_user", (cUserId) => {
    currentMessageActiveUser = onlineUsers.get(cUserId);
  });
  /**
   * its a socket event that for using for realtime send message
   * @data it's come from fronted
   */
  socket.on("send_message", (data) => {
    const receiveUserSocket = onlineUsers.get(data?.receiver);
    if (receiveUserSocket) {
      socket.to(receiveUserSocket).emit("message_receive", { ...data });
    }
  });
  /**
   * its a socket event that for using voice call
   * @data it's come from fronted
   */
  socket.on("outgoing_voice_call", (data) => {
    const { sender, roomId, callType } = data;
    const receiveUserSocket = onlineUsers.get(data?.receiver);
    if (receiveUserSocket) {
      socket.to(receiveUserSocket).emit("incoming_voice_call", {
        sender: { ...sender },
        roomId,
        callType,
      });
    }
  });
  /**
   * its a socket event that for using video call
   * @data it's come from fronted
   */
  socket.on("outgoing_video_call", (data) => {
    const receiveUserSocket = onlineUsers.get(data?.receiver);
    if (receiveUserSocket) {
      socket.to(receiveUserSocket).emit("incoming_video_call", {
        sender: { ...data.sender },
        roomId: data.roomId,
        callType: data.callType,
        offer: data.offer,
      });
    }
  });
  /**
   * its a socket event that for using reject voice call
   */
  socket.on("reject_voice_call", (data) => {
    const senderUserSocket = onlineUsers.get(data?.id);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("voice_call_rejected");
    }
  });
  /**
   * its a socket event that for using reject video call
   */
  socket.on("reject_video_call", (data) => {
    const senderUserSocket = onlineUsers.get(data?.id);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("video_call_rejected");
    }
  });
  /**
   * its a socket event that for using accept call
   */
  socket.on("accept_incoming_call", ({ id, answer }) => {
    const senderUserSocket = onlineUsers.get(id);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("accept_call", { answer });
    }
  });
});
