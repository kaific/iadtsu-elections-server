const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

// Config .env to ./config/config.env
require("dotenv").config({
  path: "./config/config.env",
});

// Connect to Database
connectDB();

app.use(cors());

// Use bodyParser
app.use(bodyParser.json());

// // Config only for development

// if (process.env.NODE_ENV === "development") {
//   app.use(
//     cors({
//       origin: process.env.CLIENT_URL,
//     })
//   );

app.use(morgan("dev"));
// Morgan gives information about each request
// Cors allows to deal with react for localhost at port 3000 without issues
// }

// Load all routes

const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const nominationRouter = require("./routes/nomination.route");
const electionRouter = require("./routes/election.route");
const activeRouter = require("./routes/active.route");

// Use routes

app.use("/api/", authRouter);
app.use("/api/", userRouter);
app.use("/api/", nominationRouter);
app.use("/api/", electionRouter);
app.use("/api/", activeRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
