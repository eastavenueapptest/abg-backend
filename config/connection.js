require("dotenv").config();
const mysql = require("mysql2");
const pool = mysql.createPool({
  host: process.env.NODE_APP_SERVER,
  user: process.env.NODE_APP_USERNAME,
  password: process.env.NODE_APP_PASSWORD,
  database: process.env.NODE_APP_DATABASE,
  port: process.env.NODE_APP_DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to MySQL database: ", process.env.NODE_APP_DATABASE);
    connection.release();
  }
});
module.exports = pool.promise();
