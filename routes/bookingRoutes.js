// bookingRoutes.js

const router = require("express").Router();
const bookingController = require("../controller/bookingController");
// const authToken = require("../middleware/authToken");

// Route to create an booking
router.post("/create", bookingController.createBooking);

// Route to get all bookings
router.get("/all", bookingController.getAllBookings);

// Route to get booking details by ID
router.get("/:id", bookingController.getBookingById);

// Route to get products by booking ID
router.get("/products/:id", bookingController.getProductsByBooking);

// Route to update an existing booking
router.put("/update/:id", bookingController.updateBooking);

// Route to get past bookings by customerId
router.get(
  "/myPastBookings/:id",

  bookingController.getPastBookingsByCustomerID
);

module.exports = router;
