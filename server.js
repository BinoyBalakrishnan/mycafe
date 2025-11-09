import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "./db.js"; // Ensure this exports { sql, poolPromise }
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Uploads folder setup
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static("uploads"));

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Health check route
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", message: "Server running fine" })
);

// ✅ Fetch Menu Items
app.get("/api/data", async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool.request().query("SELECT * FROM dbo.MenuItems");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Fetch Order Items
app.get("/api/OrderItemdata", async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool.request().query("SELECT * FROM dbo.OrderItems");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching order items:", err);
    res.status(500).send(err.message);
  }
});

// ✅ Add Menu Item
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

// ✅ Delete Menu Item
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await db.poolPromise;
    await pool.request().input("Id", db.sql.Int, id).query("DELETE FROM dbo.MenuItems WHERE Id = @Id");

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update Menu Item
app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { Name, Price, Description } = req.body;

  if (!Name || !Price) {
    return res.status(400).json({ error: "Name and Price are required" });
  }

  try {
    const pool = await db.poolPromise;
    const result = await pool
      .request()
      .input("Id", db.sql.Int, id)
      .input("Name", db.sql.NVarChar(100), Name)
      .input("Description", db.sql.NVarChar(500), Description || null)
      .input("Price", db.sql.Decimal(10, 2), Price)
      .query(`
        UPDATE dbo.MenuItems
        SET Name = @Name, Description = @Description, Price = @Price, UpdatedDate = GETDATE()
        WHERE Id = @Id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item updated successfully" });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Registration API
app.post("/api/regpostdata", async (req, res) => {
  const { firstName, lastName, restaurantName, email, mobile, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await db.poolPromise;
    await pool
      .request()
      .input("firstName", db.sql.VarChar, firstName)
      .input("lastName", db.sql.VarChar, lastName)
      .input("restaurantName", db.sql.VarChar, restaurantName)
      .input("email", db.sql.VarChar, email)
      .input("mobile", db.sql.VarChar, mobile)
      .input("password", db.sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO dbo.[User] (FirstName, LastName, RestaurantName, EmailID, MobileNumber, Password, CreationDate)
        VALUES (@firstName, @lastName, @restaurantName, @email, @mobile, @password, GETDATE())
      `);

    res.status(201).json({ message: "Restaurant registered successfully" });
  } catch (err) {
    console.error("Error registering restaurant:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Login API (JWT)
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

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
    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
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

// ✅ Serve React App (safe fallback)
const __dirnameResolved = path.resolve();
const clientBuildPath = path.join(__dirnameResolved, "client", "build");

if (fs.existsSync(path.join(clientBuildPath, "index.html"))) {
  // Serve React build if exists
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // Fallback if build not found
  app.get("*", (req, res) => {
    res.status(404).send("⚠️ React build not found. Please run `npm run build` inside the client folder.");
  });
}

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
