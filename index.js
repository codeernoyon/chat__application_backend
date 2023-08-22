// -------- Internal Import -------- //
import express from "express";

// -------- app create for use application -------- //
const app = express();

// -------- create a server -------- //
app.listen(4000, () => {
  console.log("server is run on port 4000");
});
