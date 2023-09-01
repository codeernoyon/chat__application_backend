// -------- Internal Import -------- //
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ErrorHandler = require("./utils/erroeHandler");
const cors = require("cors");
const { saveUserInDatabase } = require("./controllers/AuthController");
const { AuthRoute } = require("./routes/AuthRoutes");
const cookieParser = require("cookie-parser");

// -----====== cors options ====----- /
const corsOptions = {
  origin: "*",
  credentials: true,
  // access-control-allow-credentials:true,
  optionSuccessStatus: 200,
};

// -------- app create for use application -------- //
const app = express();
dotenv.config();

// -------- Database connect ------- //
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connect successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// ------ app use for third party library --- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

// -------- Routing ----------- //
app.use("/api/v1", AuthRoute);

app.use("/cookie", (req, res) => {
  res.cookie("user", "noyonislam");
  res.send("cookie");
});

// -------- create a server -------- //
app.listen(process.env.SERVER_PORT, () =>
  console.log(`App listing to port ${process.env.SERVER_PORT}`)
);

// ------====== Error Handle -----======
app.use(ErrorHandler);
