const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: { type: String },
    sender: { type: mongoose.Schema.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.ObjectId, ref: "User" },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessageSchema);

module.exports = Messages;
