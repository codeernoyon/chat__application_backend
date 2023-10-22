const { response } = require("express");
const Messages = require("../models/MessageSchema");
const User = require("../models/userSchema");
const ErrorHandler = require("../utils/erroeHandler");
const fs = require("fs");
const { log } = require("console");

// ---------- message save on database ------------
const messageSaveInDataBase = async (req, res, next) => {
  const { sender, receiver, message, fileType, status } = req.body;
  try {
    // ------- found user -------
    const user = await User.findOne({ _id: sender });
    if (!user) {
      return next("User dose't exist");
    }
    // ----- check valid message ------
    if (!user && !sender && !receiver && !message && !fileType) {
      return next("Can't send the message");
    }

    // check user online & offline
    const userOnline = onlineUsers.get(receiver);

    // --- create instance ----
    const newMessage = new Messages({
      message,
      sender,
      receiver,
      status: userOnline ? "deliver" : "sent",
      fileType,
    });

    // ---- message save --------
    await newMessage.save();

    // ------ send response -----
    res.status(200).json({
      data: newMessage._doc,
    });
  } catch (error) {
    next(error);
  }
};

// ----------- get messages ---------------
const getMessages = async (req, res, next) => {
  const { sender, receiver } = req.params;
  try {
    // ------- found user -------
    const user = await User.findOne({ _id: sender });
    if (!user) {
      return next("User dose't exist");
    }
    if (receiver === undefined || receiver === null)
      return next("receiver disvalue");

    // ------ find messages from database ----------

    const allMessages = await Messages.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: "asc" });

    // all unread message for when user come online
    let unReadMessages = [];
    // -------- get index all user for filtering unread message
    allMessages.forEach((message, index) => {
      if (
        message.status !== "read" &&
        JSON.stringify(message.sender) === `"${receiver}"`
      ) {
        allMessages[index].status = "read";
        unReadMessages.push(message._id);
      }
    });
    // -------- when user come online update all message read --------
    // check user online & offline
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
    next(error.message);
  }
};
// ---------- audio message save on local folder ------------
const audioMessage = async (req, res, next) => {
  const { sender, receiver } = req.query;
  try {
    // ------- found user -------
    const user = await User.findOne({ _id: sender });
    if (!user) {
      return next("User dose't exist");
    }
    // ----- check valid message ------
    if (!user && !sender && !receiver) {
      return next("Can't send the message");
    }
    // ----- check valid file message ------
    if (!req.file) return next("file dose't found");

    // file ready for save to folder
    const date = Date.now();
    // let fileName = "Uploads/recording/" + date + req.file.originalname;
    let fileName = date;

    // fs.renameSync(req.file.path, fileName);

    // check user online & offline
    const userOnline = onlineUsers.get(receiver);

    // --- create instance ----
    const newMessage = new Messages({
      message: fileName,
      sender,
      receiver,
      status: userOnline ? "deliver" : "sent",
      fileType: "audio",
    });

    // ---- message save --------
    await newMessage.save();

    // ------ send response -----
    res.status(200).json({
      data: newMessage._doc,
    });
  } catch (error) {
    next(error);
  }
};

// ----------- all messages user controller ---------------
const allMessagesUser = async (req, res, next) => {
  const { id } = req.params;
  // ------- found user -------
  const user = await User.findOne({ _id: id });
  if (!user) {
    return next("User dose't exist");
  }
  try {
    //  get all messages from data base using user id
    const allMessages = await Messages.find({
      $or: [{ sender: id }, { receiver: id }],
    }).sort({ createdAt: -1 });

    // store filter user id
    let messageReceiver = [];
    let messageSenders = [];

    allMessages.forEach(async (message) => {
      // user to all receiver message user
      if (message.sender.toString() === id) {
        messageReceiver.push(message.receiver.toString());
      }

      // all sender message user to user
      if (message.receiver.toString() === id) {
        messageSenders.push(message.sender);
      }
    });

    // find all user sender && receiver from data base send response
    const allMessagesUsers = await User.find({
      $or: [
        { _id: [...new Set(messageSenders)] },
        { _id: [...new Set(messageReceiver)] },
      ],
    });

    allMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const users = new Map();
    const messagesStateChange = [];

    const filterUser = (receiverId) => {
      let item = allMessagesUsers.filter((user) => {
        return user._id.toString() === receiverId.toString();
      });
      return item;
    };

    allMessages.forEach((mes) => {
      const isSender = mes.sender.toString() === id;
      const clcId = isSender ? mes.receiver.toString() : mes.sender.toString();
      if (mes.status === "sent") {
        messagesStateChange.push(mes.id);
      }
      if (!users.get(clcId)) {
        const {
          _id,
          message,
          sender,
          receiver,
          status,
          fileType,
          createdAt,
          updatedAt,
        } = mes;
        let user = {
          messageId: _id,
          message,
          sender,
          receiver,
          status,
          fileType,
          createdAt,
          updatedAt,
        };
        if (isSender) {
          user = {
            ...user,
            user: { ...filterUser(mes.receiver) },
            totalUnreadMessages: 0,
          };
        } else {
          user = {
            ...user,
            user: { ...filterUser(mes.sender) },
            totalUnreadMessages: mes.status !== "read" ? 1 : 0,
          };
        }
        users.set(clcId, { ...user });
      } else if (mes.status !== "read" && !isSender) {
        const user = users.get(clcId);
        users.set(clcId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    // const userOnline = onlineUsers.get(receiver);
    // if (userOnline) {
    //   if (messagesStateChange.length) {
    //     // -------- when user come online update all message read --------
    //     await Messages.updateMany(
    //       { _id: messagesStateChange },
    //       {
    //         $set: {
    //           status: "deliver",
    //         },
    //       }
    //     );
    //   }
    // }
    // ----------- response ----------- //
    res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  } catch (error) {
    next(error.message);
  }
};

// ---------- update all message when user come online --------
const updateAllMessage = async (req, res, next) => {
  const { id } = req.params;
  // ------- found user -------
  const user = await User.findOne({ _id: id });
  if (!user) {
    return next("User dose't exist");
  }
  try {
    //  get all messages from data base using user id
    const allMessages = await Messages.find({
      $or: [{ sender: id }, { receiver: id }],
    }).sort({ createdAt: -1 });
    // all unread message for when user come online
    let unReadMessages = [];
    // -------- get index all user for filtering unread message
    allMessages.forEach((message, index) => {
      if (
        message.status !== "read" &&
        JSON.stringify(message.receiver) === `"${id}"`
      ) {
        allMessages[index].status = "deliver";
        unReadMessages.push(message._id);
      }
    });
    // -------- when user come online update all message read --------
    await Messages.updateMany(
      { _id: unReadMessages },
      {
        $set: {
          status: "deliver",
        },
      }
    );
    // ----------- response ----------- //
    res.status(200).json({
      message: "update all message",
    });
  } catch (error) {
    next(error.message);
  }
};
module.exports = {
  messageSaveInDataBase,
  getMessages,
  audioMessage,
  allMessagesUser,
  updateAllMessage,
};
