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

// ✅ Example Login API (CORS test)
app.post("/api/login", async (req, res) => {
  res.json({ message: "Login OK ✅ CORS working" });
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
