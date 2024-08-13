const pool = require("../config/db");
const { Schema } = pool;

const transactionSchema = new Schema(
  {
    customer_number: {
      type: String,
      required: true,
      index: true,
      match: /^[0-9]{10}$/,
    },
    mpesa_ref: {
      type: String,
      required: true,
      index: true,
      match: /^[A-Z0-9]{10}$/,
    },
    amount: { type: String, required: true },
  },
  { timestamps: true }
);

const Transaction = pool.model("Transaction", transactionSchema);

module.exports = Transaction;
