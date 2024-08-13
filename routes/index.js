const express = require("express");

const router = express.Router();

const cartController = require("../controller/cartController");
const productController = require("../controller/productController");
const orderController = require("../controller/orderController");
const userController = require("../controller/userController");
const authToken = require("../middleware/authToken");

// Route for user
router.post("/signup", authToken, userController.register);
router.post("/signin", authToken, userController.login);
router.get("/allUsers", userController.allUsers);
router.get("/userDetails", userController.userDetails);

// Shopping cart
// router.get("/:userId", cartController.getShoppingCart);
// router.post("/add", cartController.addToCart);
// router.delete("/remove/:productId/:userId", cartController.removeFromCart);
// router.post("/buy/:id", cartController.buy);
// router.get("/cartDetails/:id", cartController.cartDetails);
//
// // Route to orders
// router.get("/orders", orderController.getAllOrders);
// router.get("/:id", orderController.getOrderById);
// router.get("/getProductsByOrder/:id", orderController.getProductsByOrder);
// router.put("/update/:id", orderController.updateOrder);
// router.get("/myPastOrders/:id", orderController.getPastOrdersByCustomerID);

module.exports = router;
