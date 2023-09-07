const express = require("express");
const { messageSaveInDataBase } = require("../controllers/MessageController");

const MessageRoute = express.Router();

// ----- routes -------
MessageRoute.post("/message", messageSaveInDataBase);

module.exports = { MessageRoute };
