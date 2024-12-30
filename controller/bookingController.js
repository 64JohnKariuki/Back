// bookingController.js

const bookModel = require("../models/bookModel");

exports.createBooking = (req, res) => {
  const { userId, name, phone, email, address, bookingNo, items, totalAmount, paymentMethod } = req.body;
  
  // Ensure all required fields are present
  if (!userId || !name || !phone || !email || !address || !bookingNo || !items || !totalAmount || !paymentMethod) {
    return res.status(400).json({ message: "All fields are required." });
  }

  bookModel
    .createBooking(userId, name, phone, email, address, bookingNo, items, totalAmount, paymentMethod)
    .then((result) => {
      res.status(201).json({
        message: "Booking created successfully",
        checkOutRequestID: result.checkOutRequestID,
        bookingId: result.bookingId,
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send("Error creating booking.");
    });
};