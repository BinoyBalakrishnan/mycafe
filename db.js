// db.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// ✅ Azure SQL Database connection settings
const config = {
  user: process.env.DB_USER,            // e.g. yourusername
  password: process.env.DB_PASSWORD,    // e.g. YourPassword@123
  server: process.env.DB_SERVER,        // e.g. mycafedb.database.windows.net
  database: process.env.DB_NAME,        // e.g. MyCafeDB
  options: {
    encrypt: true,                      // ✅ Required for Azure SQL
    trustServerCertificate: false,      // false = strict SSL
  },
  pool: {
    max: 10,                            // max concurrent connections
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// ✅ Connection Pool
let poolPromise;

const connectToDB = async () => {
  if (!poolPromise) {
    try {
      console.log("🔗 Connecting to Azure SQL Database...");
      poolPromise = sql.connect(config);
      await poolPromise;
      console.log("✅ Connected to Azure SQL Database!");
    } catch (err) {
      console.error("❌ Database connection failed:", err.message);
      poolPromise = null;
      setTimeout(connectToDB, 5000); // Retry connection
    }
  }
  return poolPromise;
};

export default { sql, poolPromise: connectToDB() };
