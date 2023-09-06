// -------- Internal Import -------- //
const express = require("express");
const {
  saveUserInDatabase,
  updateUserInfo,
  getAllUser,
} = require("../controllers/AuthController");
const AuthRoute = express.Router();

// --------- Routers ------- //
AuthRoute.post("/user", saveUserInDatabase);
AuthRoute.put("/updateUserInfo", updateUserInfo);
AuthRoute.post("/allUsers", getAllUser);

module.exports = { AuthRoute };
