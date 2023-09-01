// -------- Internal Import -------- //
const express = require("express");
const {
  saveUserInDatabase,
  updateUserInfo,
} = require("../controllers/AuthController");
const AuthRoute = express.Router();

// --------- Routers ------- //
AuthRoute.post("/user", saveUserInDatabase);
AuthRoute.put("/updateUserInfo", updateUserInfo);

module.exports = { AuthRoute };
