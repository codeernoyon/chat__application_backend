const express = require("express");
const {
  messageSaveInDataBase,
  getMessages,
} = require("../controllers/MessageController");

const MessageRoute = express.Router();

// ----- routes -------
MessageRoute.post("/message", messageSaveInDataBase);
MessageRoute.get("/getMessages/:email/:from/:to", getMessages);

module.exports = { MessageRoute };
