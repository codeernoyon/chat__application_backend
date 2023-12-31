// -------- Internal Import -------- //
const User = require("../models/userSchema");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/erroeHandler");
const token = require("../utils/token");

// ------- user save on database ------ //
const saveUserInDatabase = async (req, res, next) => {
  const { name, email, imageUrl } = req.body;
  try {
    // find user from database
    const user = await User.findOne({ email });
    // if user already save on database return from hare
    if (user) {
      // create a token for user
      const userToken = token(user);

      // send a response with user data and cookie
      res
        .setHeader("Access-Control-Allow-Origin", "*")
        .setHeader("Access-Control-Allow-Credentials", "true")
        .cookie("userToken", userToken, {
          httpOnly: true,
          // secure: true,
        })
        .status(200)
        .json({
          message: "Welcome to your world",
          token: userToken,
          user,
        });
    } else {
      // create a new user in database
      const newUser = new User({
        name,
        email,
        imageUrl,
      });
      //  save user in database
      await newUser.save();
      // create a token for user
      const userToken = token(newUser);

      res
        .setHeader("Access-Control-Allow-Origin", "*")
        .setHeader("Access-Control-Allow-Credentials", "true")
        .cookie("userToken", userToken, {
          httpOnly: true,
        })
        .status(200)
        .json({
          message: "User Create Successful",
          token: userToken,
          user: newUser?._doc,
        });
    }
  } catch (error) {
    next(error);
  }
};
// ------- user image update on database ------ //
const updateUserInfo = async (req, res, next) => {
  const { _id, name, email, imageUrl, description } = req.body;
  const user = await User.findOne({ _id });
  // if don't match user save user in database through error
  if (!user) {
    return next("User dose't exist");
  }
  // create update user information filter with email
  const updateUser = await User.findOneAndUpdate({ email: email }, req.body, {
    new: true,
    runValidator: true,
    useUpdateAndModify: true,
  });
  res.status(200).json({
    updateUser,
    message: "User information update successfully",
  });
};

// get all user from data base
const getAllUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    // find user from database
    const user = await User.findOne({ email });

    // if don't match user save user in database through error
    if (!user) {
      return next("User dose't exist");
    }

    User.find({})
      .sort({ name: 1 })
      .then(function (users) {
        res.status(200).json({
          allUsers: users,
        });
      });
  } catch (error) {
    next(error.message);
  }
};

module.exports = { saveUserInDatabase, updateUserInfo, getAllUser };
