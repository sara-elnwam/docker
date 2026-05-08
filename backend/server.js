
const express = require('express');
const { Pool } = require('pg');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to initialize database with Retry Logic
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    console.log("✅ Database initialized successfully.");
  } catch (err) {
    // If connection fails (e.g. DB still booting), try again after 5 seconds
    console.error("❌ DB connection failed. Retrying in 5 seconds...", err.message);
    setTimeout(initDb, 5000);
  }
};

// Start DB initialization
initDb();

// Routes
// 1. Get all students
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    const result = await pool.query('INSERT INTO students (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update a student's name
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query('UPDATE students SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
