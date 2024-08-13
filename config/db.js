// database/connection.js
const mysql = require("mysql");
// const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file

// mongoose.connect(process.env.MONGODB_URI); //MongoDB Connection String
//
// const connect = mongoose.connection;
//
// connect.on("error", console.error.bind(console, "MongoDB connection error:"));
//
// connect.once("open", async () => {
//   console.log("Connected to MongoDB");
//   await insertDefaultAdmin(); // Insert default admin if none exists
// });

//Mysql DB connection starts
const pool = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "peapo",
});

pool.connect(function (error) {
  if (error) {
    console.log("Db connection error ☹️!!!!!");
  } else {
    console.log("connected to db successfully 😊");
  }
});

// Export the pool
module.exports = pool;
