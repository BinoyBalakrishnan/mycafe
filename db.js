import sql from 'mssql';
const { ConnectionPool } = sql;
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // true if you're on Azure
    trustServerCertificate: true // dev only
  },
  connectionTimeout: 15000, // Optional: tune as needed
};

const poolPromise = new ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to Azure SQL DB');
    return pool;
  })
  .catch(err => console.log('DB connection failed: ', err));

export default { sql, poolPromise };
