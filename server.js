import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "./db.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// ✅ Setup for ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret123";
// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS FIX — must be before routes
app.use(
  cors({
    origin: [
      "https://purple-island-00b1be310.3.azurestaticapps.net", // frontend domain
      "http://localhost:3000", // optional for local testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

app.get("/", (req, res) => res.send("✅ Backend is running"));

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running fine" });
});

// ✅ Test CORS route
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS working fine ✅" });
});

// ✅ Uploads setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await db.poolPromise;
    const userResult = await pool
      .request()
      .input("Email", db.sql.NVarChar, email)
      .query("SELECT * FROM LoginDetails WHERE Email = @Email");

    if (userResult.recordset.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.recordset[0];

    
    if (password !== user.PasswordHash) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const role = user.Role || "user";
    const token = jwt.sign({ userId: user.Id, role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, role, email: user.Email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/data", async (req, res) => {
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

app.delete("/api/items/:id", async (req, res) => {
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

app.put("/api/items/:id", async (req, res) => {
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

app.post("/api/regpostdata", async (req, res) => {
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

app.post("/api/orderplace", async (req, res) => {
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


app.post("/api/orders", async (req, res) => {
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
// ✅ Serve React build (only if exists)
const buildPath = path.join(__dirname, "client", "build");
if (fs.existsSync(path.join(buildPath, "index.html"))) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.status(404).send("⚠️ React build not found.");
  });
}

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
