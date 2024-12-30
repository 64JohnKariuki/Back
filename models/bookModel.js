// bookingModel.js

const pool = require("../config/db");

exports.createBooking = (
  userId,
  name,
  phone,
  email,
  location,
  bookingNo,
  package,
  date,
  time,
  totalAmount,
  paymentMethod
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO booking (user_id, name, phone, email, location, booking_no, package, date, time, grand_total) VALUES (?, ?, ?, ?);",
      [userId, name, phone, email, location, bookingNo, package, date, time, totalAmount],
      (err, bookingResult) => {
        if (err) {
          reject(err);
        } else {
          const bookingId = bookingResult.insertId;
          const packageValues = packages.map((package) => [
            bookingId,
            package.package_id,
            package.price * package.quantity,
          ]);

          pool.query(
            "INSERT INTO booking (booking_id, product_id, qty, grand_total) VALUES ?",
            [packageValues],
            (err, productsResult) => {
              if (err) {
                reject(err);
              } else {
                pool.query(
                  "INSERT INTO transaction (name, email, phone, booking_id, payment_method, amount) VALUES (?, ?, ?, ?, ?, ?)",
                  [name, email, phone, bookingId, paymentMethod, totalAmount],
                  (err, transactionResult) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve({ bookingId, bookingResult, productsResult, transactionResult });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};

exports.getAllBookings = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM booking;", (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
};