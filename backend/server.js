import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 3000;

// Docker will inject these from the 'environment' section of docker-compose.yml
const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to MySQL inside Docker!");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

testConnection();

app.get('/', (req, res) => {
    res.send('API is running!');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});



