const express = require("express");
const {
  messageSaveInDataBase,
  getMessages,
  audioMessage,
} = require("../controllers/MessageController");
const multer = require("multer");

const MessageRoute = express.Router();

const uploadAudio = multer({ dest: "Uploads/recording/" });

// ----- routes -------
MessageRoute.post("/message", messageSaveInDataBase);
MessageRoute.get("/getMessages/:email/:sender/:receiver", getMessages);
MessageRoute.post("/audioMessage", uploadAudio.single("audio"), audioMessage);

module.exports = { MessageRoute };
