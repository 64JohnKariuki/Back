// orderModel.js

const pool = require("../config/db");

exports.getAllOrders = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT O.order_id, U.name, O.created, O.grand_total " +
        "FROM orders O INNER JOIN users U ON O.user_id = U.user_id;",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

exports.getOrderById = (orderId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT U.name, O.grand_total, U.created, O.address " +
        "FROM orders O INNER JOIN users U ON O.user_id = U.user_id " +
        "WHERE O.order_id = ?;",
      [orderId],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

exports.getProductsByOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT P2.pro_id, P2.name, P.qty, P.grand_total " +
        "FROM orders O INNER JOIN productsInOrder P ON O.order_id = P.order_id " +
        "INNER JOIN products P2 ON P.pro_id = P2.pro_id " +
        "WHERE O.order_id = ?;",
      [orderId],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

exports.updateOrder = (orderId, newData) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE orders SET ? WHERE order_id = ?",
      [newData, orderId],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

exports.getPastOrdersByCustomerID = (orderId) => {
  const query =
    "SELECT O.order_id, P.name, O.created, PIN.qty, PIN.grand_total " +
    "FROM orders O INNER JOIN productsInOrder PIN ON O.order_id = PIN.order_id  " +
    "INNER JOIN products P ON PIN.pro_id = P.pro_id " +
    "WHERE O.user_id = ? " +
    "ORDER BY O.order_id DESC;";
  return new Promise((resolve, reject) => {
    pool.query(query, [orderId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
