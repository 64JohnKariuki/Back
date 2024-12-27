// userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
// const authToken = require("../middleware/authToken");

/**
 * Route to register a new user
 * @route POST /register
 * @access Public
 */
router.post("/register", userController.register);

/**
 * Route to log in a user
 * @route POST /login
 * @access Public
 */
router.post("/login", userController.login);

/**
 * Route to get all users
 * @route GET /all
 * @access Private
 */
router.get("/all", userController.allUsers);

/**
 * Route to get user details
 * @route GET /details
 * @access Private
 */
router.get("/details", userController.userDetails);

module.exports = router; //
