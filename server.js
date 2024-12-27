// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const router = require("./routes");
const morgan = require("morgan");
require("dotenv").config(); // Load environment variables from .env file
const Transaction = require("./models/transactionModel");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
// const userToken = require("./routes/userTokenRoute");

const app = express();

app.use(
  cors({
    origin: 3000,
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Mount routes with /api prefix
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

const PORT = 8000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//define a home route
app.get('/', function(req, res){
    res.send('Home reached')
    console.log('Home page reached')
});

// app.get("/config", (req, res) => {
//   res.json({
//     publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//   });
// });
//
// app.post("/create-payment-intent", async (req, res) => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       currency: "EUR",
//       amount: 1999,
//       automatic_payment_methods: { enabled: true },
//     });
//
//     // Send publishable key and PaymentIntent details to client
//     res.json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (e) {
//     res.status(400).json({
//       error: {
//         message: e.message,
//       },
//     });
//   }
// });

const url = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' 
  : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

// STEP 1: Getting access token
const getAccessToken = async (req, res, next) => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  
  // Ensure key and secret are defined
  if (!key || !secret) {
    return res.status(500).json({ error: "Consumer Key/Secret not set in environment variables" });
  }

  const auth =new Buffer.from(`${key}:${secret}`).toString("base64");
  console.log("Authorization Header:", `Basic ${auth}`);

  try {
    const response = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    req.token = response.data.access_token; // Attach token to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Failed to get access token:", err.message);
    res.status(500).json({ error: "Failed to get access token" });
  }
};

// STEP 2: STK push
app.post("/stk", getAccessToken, async (req, res) => {
  const { phone, amount } = req.body;

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  
  const shortCode = process.env.MPESA_PAYBILL;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.CALLBACK_URL;

  const password =new Buffer.from(shortCode + passkey + timestamp).toString("base64");

  try {
    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone}`, // customer phone number
        PartyB: shortCode,
        PhoneNumber: `254${phone}`,
        CallBackURL: callbackUrl,
        AccountReference: "Order001", // Custom reference, e.g., order number
        TransactionDesc: "Payment for order",
      },
      {
        headers: {
          Authorization: `Bearer ${req.token}`, // Token added here
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("STK Push error:", error.message);
    res.status(500).json({ error: "Failed to initiate STK Push", details: error.message });
  }
});

// STEP 3: Callback URL
const callbackRoute = process.env.CALLBACK_ROUTE || 'mpesa_callback'; // fallback if undefined
app.post(`/${callbackRoute}`, (req, res) => {
  if (!req.body.Body.stkCallback.CallbackMetadata) {
    console.log(req.body.Body.stkCallback.ResultDesc);
    res.status(200).json("ok");
    return;
  }

  const amount = req.body.Body.stkCallback.CallbackMetadata.Item[0].Value;
  const code = req.body.Body.stkCallback.CallbackMetadata.Item[1].Value;
  const phone1 = req.body.Body.stkCallback.CallbackMetadata.Item[4].Value.toString().substring(3);
  const phone = `0${phone1}`;

  console.log({ phone, code, amount });
  const transaction = new Transaction({
    customer_number: phone,
    mpesa_ref: code,
    amount: amount,
  });

  transaction
    .save()
    .then((data) => {
      console.log({ message: "Transaction saved successfully", data });
    })
    .catch((err) => console.log(err.message));

  res.status(200).json("ok");
});

// STEP 4: Stk push query
app.post("/stkpushquery", getAccessToken, async (req, res) => {
  const CheckoutRequestID = req.body.CheckoutRequestID;

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const shortCode = process.env.MPESA_PAYBILL;
  const passkey = process.env.MPESA_PASSKEY;

  const password =new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: CheckoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({ error: "STK push query failed", details: err.message });
  }
});

app.get("/transactions", (req, res) => {
  Transaction.find({})
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(200).json(data);
        data.forEach((transaction) => {
          const firstFour = transaction.customer_number.substring(0, 4);
          const lastTwo = transaction.customer_number.slice(-2);
          console.log(`${firstFour}xxxx${lastTwo}`);
        });
      }
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
