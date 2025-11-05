// // server.js
// const express = require("express");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Example API route
// app.get("/api/message", (req, res) => {
//   res.json({ message: "Hello from the backend!" });
// });

// // For production: serve React build
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js'; 
import bcrypt from 'bcryptjs';
// Replace:
// const bcrypt = require('bcrypt');
// With:
//const bcrypt = require('bcryptjs');

import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
//import twilio from "twilio";

import twilio from "twilio";

// const TWILIO_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx";  // must start with AC
// const TWILIO_AUTH = "your_auth_token_here";
// const TWILIO_PHONE = "+1234567890"; // your Twilio phone number

// const client = twilio(TWILIO_SID, TWILIO_AUTH);

//const bodyParser = require("body-parser");
//const nodemailer = require("nodemailer");
//const twilio = require("twilio"); // if you want SMS OTP
//const cors = require("cors");

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.get('/api/data', async (req, res) => {
    debugger;
  try {
    const pool = await db.poolPromise;
    const result = await pool.request().query('SELECT * FROM dbo.MenuItems');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send(err.message);
  }
});

app.get('/api/OrderItemdata', async (req, res) => {
    debugger;
  try {
    const pool = await db.poolPromise;
    const result = await pool.request().query('SELECT * FROM dbo.OrderItems');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send(err.message);
  }
});

// app.post('/api/postdata', async (req, res) => {
//   const { name, price, description } = req.body;

//   try {
//     const pool = await db.poolPromise;
//     await pool.request()
//       .input('name', db.sql.VarChar, name)
//       .input('description', db.sql.VarChar, description || null)
//       .input('price', db.sql.Decimal(10, 2), price)
//       .query(`
//         INSERT INTO dbo.MenuItems (Name, Description, Price)
//         VALUES (@name, @description, @price)
//       `);

//     res.status(201).json({ message: 'Item added successfully' });
//   } catch (err) {
//     console.error('Error inserting item:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use('/uploads', express.static('uploads'));
// 🧩 Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.post("/api/postdata", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const pool = await db.poolPromise;
    await pool
      .request()
      .input("Name", db.sql.NVarChar, name)
      .input("Description", db.sql.NVarChar, description)
      .input("Price", db.sql.Decimal(10, 2), price)
      .input("ImageUrl", db.sql.NVarChar, imageUrl)
      .query(`
        INSERT INTO dbo.MenuItems (Name, Description, Price, ImageUrl, CreatedDate)
        VALUES (@Name, @Description, @Price, @ImageUrl, GETDATE())
      `);

    res.status(200).json({ message: "Item added successfully" });
  } catch (error) {
    console.error("Error inserting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await db.poolPromise;
    await pool.request()
      .input('Id', db.sql.Int, id)
      .query('DELETE FROM dbo.MenuItems WHERE Id = @Id');

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  debugger;
  const { id } = req.params;
  const { Name, Price, Description } = req.body;

  if (!Name || !Price) {
    return res.status(400).json({ error: "Name and Price are required" });
  }

  try {
    const pool = await db.poolPromise;
    const result = await pool.request()
      .input('Id', db.sql.Int, id)
      .input('Name', db.sql.NVarChar(100), Name)
      .input('Description', db.sql.NVarChar(500), Description || null)
      .input('Price', db.sql.Decimal(10, 2), Price)
      .query(`
        UPDATE dbo.MenuItems
        SET 
          Name = @Name, 
          Description = @Description, 
          Price = @Price,
          UpdatedDate = GETDATE()
        WHERE Id = @Id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/regpostdata', async (req, res) => {
  const { firstName, lastName, restaurantName, email, mobile, password } = req.body;

  try {
    const pool = await db.poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('firstName', db.sql.VarChar, firstName)
      .input('lastName', db.sql.VarChar, lastName)
      .input('restaurantName', db.sql.VarChar, restaurantName)
      .input('email', db.sql.VarChar, email)
      .input('mobile', db.sql.VarChar, mobile)
      .input('password', db.sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO dbo.[User] (FirstName, LastName, RestaurantName, EmailID, MobileNumber, Password, CreationDate)
        VALUES (@firstName, @lastName, @restaurantName, @email, @mobile, @password, GETDATE())
      `);

    res.status(201).json({ message: 'Restaurant registered successfully' });
  } catch (err) {
    console.error('Error registering restaurant:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.post('/api/orderplace', async (req, res) => {
  debugger;
  const { customerName, customerEmail, items } = req.body;

  // 🧾 Validate inputs
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  try {
    const pool = await db.poolPromise;

    // 🧮 Calculate total
    const totalAmount = items.reduce((sum, i) => sum + i.Price * i.Quantity, 0);

    // 🧠 Start SQL transaction for safety
    const transaction = new db.sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new db.sql.Request(transaction);

      // 🧾 Insert into Orders table
      const orderResult = await request
        .input('CustomerName', db.sql.NVarChar(100), customerName || 'Guest')
        .input('CustomerEmail', db.sql.NVarChar(100), customerEmail || '')
        .input('TotalAmount', db.sql.Decimal(10, 2), totalAmount)
        .query(`
          INSERT INTO Orders (CustomerName, CustomerEmail, TotalAmount, CreatedDate)
          OUTPUT INSERTED.Id
          VALUES (@CustomerName, @CustomerEmail, @TotalAmount, GETDATE())
        `);

      const orderId = orderResult.recordset[0].Id;

      // 🧺 Insert each order item
      for (const item of items) {
        await new db.sql.Request(transaction)
          .input('OrderId', db.sql.Int, orderId)
          .input('MenuItemId', db.sql.Int, item.Id) // Make sure column exists
          .input('Quantity', db.sql.Int, item.Quantity)
          .input('SubTotal', db.sql.Decimal(10, 2), item.Price * item.Quantity)
          .input('MenuItemName', db.sql.NVarChar, item.Name)
          
          .query(`
            INSERT INTO OrderItems (OrderId, MenuItemId, Quantity, SubTotal, MenuItemName)
            VALUES (@OrderId, @MenuItemId, @Quantity, @SubTotal, @MenuItemName)
          `);
      }

      // ✅ Commit transaction
      await transaction.commit();

      res.json({
        message: 'Order placed successfully',
        orderId,
        totalAmount,
      });
    } catch (err) {
      await transaction.rollback();
      console.error('Order transaction failed:', err);
      res.status(500).json({ message: 'Order transaction failed' });
    }
  } catch (err) {
    console.error('Database connection or query error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/orders', async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  try {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.Price * item.Quantity,
      0
    );

    const pool = await db.poolPromise;
    const transaction = new db.sql.Transaction(pool);

    await transaction.begin();

    // Insert order
    const orderRequest = new db.sql.Request(transaction);
    const orderResult = await orderRequest
      .input('TotalAmount', db.sql.Decimal(10, 2), totalAmount)
      .query(`
        INSERT INTO dbo.Orders (TotalAmount)
        OUTPUT INSERTED.OrderId
        VALUES (@TotalAmount)
      `);

    const orderId = orderResult.recordset[0].OrderId;

    // Insert order items
    for (const item of cartItems) {
      const itemRequest = new db.sql.Request(transaction);
      await itemRequest
        .input('OrderId', db.sql.Int, orderId)
        .input('ItemId', db.sql.Int, item.Id)
        .input('Name', db.sql.NVarChar, item.Name)
        .input('Price', db.sql.Decimal(10, 2), item.Price)
        .input('Quantity', db.sql.Int, item.Quantity)
        .query(`
        INSERT INTO dbo.OrderItems (OrderId, ItemId, Name, Price, Quantity)
        VALUES (@OrderId, @ItemId, @Name, @Price, @Quantity)

        `);
    }

    await transaction.commit();
    res.status(200).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//LOGIN CODE

// const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// app.post('/api/login', async (req, res) => {
//     debugger
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     const pool = await db.poolPromise;

//     const result = await pool.request()
//       .input("email", db.sql.NVarChar, email)
//       .query(`
//         SELECT Id, Username, Email, PasswordHash
//         FROM [dbo].[LoginDetails]
//         WHERE Email = @email
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const user = result.recordset[0];
//     console.log("user found:", user);

//     // Compare password with the correct field
//     const isMatch = await bcrypt.compare(password, user.PasswordHash);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user.Id, email: user.Email },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.json({
//       message: "Login successful",
//       token,
//       user: { id: user.Id, email: user.Email, username: user.Username }
//     });

//   } catch (err) {
//     console.error("Login Error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
  
//       const pool = await db.poolPromise;
//       const result = await pool.request().input("email", db.sql.NVarChar, email)
//       .query(`
//         SELECT Id, Username, Email, PasswordHash
//          FROM [dbo].[LoginDetails]
//          WHERE Email = @email
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const user = result.recordset[0];
//     console.log("user found:", user);
//     // const isMatch = await bcrypt.compare(password, user.PasswordHash);
//     // if (!isMatch) {
//     //   return res.status(400).json({ message: "Invalid email or password" });
//     // }
//     const hash = await bcrypt.hash("admin123", 10);
//     console.log(hash);

//     const token = jwt.sign(
//       { id: user.Id, email: user.EmailID },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.json({
//       message: "Login successful",
//       token,
//       user: { id: user.Id, email: user.EmailID }
//     });

//   } catch (err) {
//     console.error("Login Error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await db.poolPromise;
    const userResult = await pool.request()
      .input('Email', db.sql.NVarChar, email)
      .query('SELECT * FROM LoginDetails WHERE Email = @Email');

    if (userResult.recordset.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = userResult.recordset[0];

    // 🧂 Compare password (if stored as plain text, use ===; if hashed, use bcrypt)
    // Example: if using bcrypt
    // const isMatch = await bcrypt.compare(password, user.Password);
    const isMatch = user.PasswordHash === password; // simple comparison for now

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 🧩 Example roles: "admin", "user"
    const userRole = user.Role || 'user';

    // 🔐 Generate JWT token
    const token = jwt.sign(
      { userId: user.Id, role: userRole },
      'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    // ✅ Return role in response
    res.json({
      message: 'Login successful',
      token,
      role: userRole,
      email: user.Email
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ---------- OTP Config ----------
// const EMAIL_USER = process.env.EMAIL_USER;  // Gmail
// const EMAIL_PASS = process.env.EMAIL_PASS;  // Gmail App Password
// const TWILIO_SID = process.env.TWILIO_SID;
// const TWILIO_AUTH = process.env.TWILIO_AUTH;
// const TWILIO_PHONE = process.env.TWILIO_PHONE; // e.g. +1415xxxxxxx (Twilio number)

// const client = twilio(TWILIO_SID, TWILIO_AUTH);

// // OTP storage (replace with Redis in prod)
// let otpStore = {};

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: { user: EMAIL_USER, pass: EMAIL_PASS },
// });

// // Generate OTP
// function generateOtp() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // ---------- OTP APIs ----------
// app.post('/api/requestotp', async (req, res) => {
//   const { mobileOrEmail } = req.body;
//   if (!mobileOrEmail) return res.status(400).json({ message: "Mobile or Email is required" });

//   const otp = generateOtp();
//   otpStore[mobileOrEmail] = otp;

//   try {
//     if (mobileOrEmail.includes("@")) {
//       // Email case
//       await transporter.sendMail({
//         from: EMAIL_USER,
//         to: mobileOrEmail,
//         subject: "Your OTP Code",
//         text: `Your OTP is ${otp}`,
//       });
//       return res.json({ message: "OTP sent via Email" });
//     } else {
//       // SMS case
//       try {
//         await client.messages.create({
//           body: `Your OTP is ${otp}`,
//           from: TWILIO_PHONE,
//           to: mobileOrEmail.startsWith("+") ? mobileOrEmail : `+91${mobileOrEmail}`, // ensure E.164
//         });
//         return res.json({ message: "OTP sent via SMS" });
//       } catch (smsError) {
//         console.warn("SMS failed:", smsError.message);
//         // fallback → send to admin email
//         await transporter.sendMail({
//           from: EMAIL_USER,
//           to: EMAIL_USER,
//           subject: `OTP for ${mobileOrEmail}`,
//           text: `OTP for ${mobileOrEmail} is ${otp}`,
//         });
//         return res.json({ message: "SMS failed, OTP sent to admin email instead" });
//       }
//     }
//   } catch (error) {
//     console.error("OTP send error:", error);
//     return res.status(500).json({ message: "Failed to send OTP" });
//   }
// });

// app.post('/api/verify-otp', (req, res) => {
//   const { mobileOrEmail, otp } = req.body;
//   if (!mobileOrEmail || !otp) return res.status(400).json({ message: "Mobile/Email and OTP required" });

//   if (otpStore[mobileOrEmail] && otpStore[mobileOrEmail] === otp) {
//     delete otpStore[mobileOrEmail];
//     return res.json({ message: "OTP verified successfully" });
//   } else {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }
// });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});