import mysql from 'mysql2/promise';

// Docker will inject these from the 'environment' section of docker-compose.yml
const db = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("Successfully connected to MySQL inside Docker!");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

testConnection();

export default db;