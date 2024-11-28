// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const Exercise = require("./models/Exercise.model");
const Plan = require("./models/Plans.model");

const app = express();
const FRONTEND_URL = process.env.ORIGIN || "http://localhost:3000";

// mongoose
//   .connect("mongodb://127.0.0.1:27017/momentum-fit")
//   .then((x) =>
//     console.log(`connected to Mongo! Database name:"${x.connections[0].name}"`)
//   )
//   .catch((err) => console.error("error connecting to Mongo", err));

  app.use(cors({
    origin: [FRONTEND_URL], 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true,
  }));
  

// if adding static do it after logger !
app.use(logger("dev"));

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

app.get("/", (req, res, next) => {
  console.log(req);
  res.send("<h1>Welcome</h1>");
});

app.use("/api", require("./routes/index.routes"));

app.use("/auth", require("./routes/auth.routes"));

app.use("/api", require("./routes/exercises.routes"));
app.use("/api", require("./routes/plans.routes"));

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
