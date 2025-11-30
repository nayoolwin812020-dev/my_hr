const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'org_attendance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to promise-based for async/await
const promisePool = pool.promise();

// Test Connection
promisePool.getConnection()
  .then(conn => {
    console.log('Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

module.exports = promisePool;