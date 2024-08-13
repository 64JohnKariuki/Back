// cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");

// Route to get shopping cart for a user
router.get("/:user_id", cartController.getShoppingCart);

// Route to add a product to the shopping cart
router.post("/add", cartController.addToCart);

// Route to remove a product from the shopping cart
router.delete("/remove/:productId/:user_id", cartController.removeFromCart);

router.post("/buy/:id", cartController.buy);

module.exports = router;
