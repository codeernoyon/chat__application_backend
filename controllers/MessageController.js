const Messages = require("../models/MessageSchema");
const User = require("../models/userSchema");
const ErrorHandler = require("../utils/erroeHandler");

// ---------- message save on database ------------
const messageSaveInDataBase = async (req, res, next) => {
  const { email, sender, receiver, message } = req.body;
  try {
    // ------- found user -------
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User dose't exist"));
    }
    // ----- check valid message ------
    if (!user && !sender && !receiver && !message) {
      return next(new ErrorHandler("Can't send the message"));
    }

    // check user online & offline
    const userOnline = onlineUsers.get(receiver);

    // --- create instance ----
    const newMessage = new Messages({
      message,
      sender,
      receiver,
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

// ----------- get messages ---------------
const getMessages = async (req, res, next) => {
  const { email, sender, receiver } = req.params;
  try {
    // ------- found user -------
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User dose't exist"));
    }
    // ------ find messages from database ----------

    const allMessages = await Messages.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort("created_at");

    // all unread message for when user come online
    let unReadMessages = [];

    // -------- get index all user for filtering unread message
    allMessages.forEach((message, index) => {
      if (
        message.status !== "read" &&
        JSON.stringify(message.sender._id) === `"${receiver}"`
      ) {
        allMessages[index].status = "read";
        unReadMessages.push(message._id);
      }
    });
    // -------- when user come online update all message read --------
    await Messages.updateMany(
      { _id: unReadMessages },
      {
        $set: {
          status: "read",
        },
      }
    );
    // ---------- after all work done send response with all message data
    res.status(200).json({
      allMessages,
    });
  } catch (error) {
    next(new ErrorHandler(error.message));
  }
};
module.exports = { messageSaveInDataBase, getMessages };
