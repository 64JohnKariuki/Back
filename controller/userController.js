// userController.js

const userModel = require("../models/userModel");

exports.register = (req, res) => {
  const newUser = req.body;
  userModel
    .register(newUser)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send("Error registering user.");
    });
};

exports.login = (req, res) => {
  const credentials = req.body;
  userModel
    .login(credentials)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send("Error logging in user.");
    });
};

exports.allUsers = (req, res) => {
  userModel
    .allUsers()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send("Error fetching users.");
    });
};

exports.userDetails = (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in the token
  userModel
    .getUserDetails(userId)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send("Error fetching user details.");
    });
};
