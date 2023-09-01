const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: "I'm use whatsapp",
    },
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
