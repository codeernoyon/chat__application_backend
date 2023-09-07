const Messages = require("../models/MessageSchema");
const User = require("../models/userSchema");
const ErrorHandler = require("../utils/erroeHandler");

// ---------- message save on database ------------
const messageSaveInDataBase = async (req, res, next) => {
  const { email, from, to, message } = req.body;
  try {
    // ------- found user -------
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User dose't exist"));
    }
    // ----- check valid message ------

    if (!user && from && to) {
      return next(new ErrorHandler("Can't send the message"));
    }

    // check user online & offline
    const userOnline = onlineUsers.get(to);
    // --- create instance ----
    const newMessage = new Messages({
      message,
      from,
      to,
      status: userOnline ? "deliver" : "send",
    });

    // ---- message save --------
    await newMessage.save();

    // ------ send response -----
    res.status(200).json({
      data: newMessage._doc,
    });
  } catch (error) {
    next(new ErrorHandler(error.messages));
  }
};

module.exports = { messageSaveInDataBase };
