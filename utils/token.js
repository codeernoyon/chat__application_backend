const jwt = require("jsonwebtoken");

const token = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = token;
