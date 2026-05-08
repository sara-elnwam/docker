const express = require('express');
const { Pool } = require('pg');
const app = express();

// ده ضروري عشان السيرفر يفهم البيانات اللي جاية من الفورم
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// دالة لإنشاء جدول الطلاب تلقائياً
const initDb = async () => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS students (id SERIAL PRIMARY KEY, name TEXT NOT NULL)');
    console.log("Database table is ready.");
  } catch (err) { console.error(err); }
};
initDb();

// 1. استقبال اسم طالب جديد (POST)
app.post('/api/students', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO students (name) VALUES ($1) RETURNING *', [name]);
  res.json(result.rows[0]);
});

// 2. عرض كل الطلاب (GET)
app.get('/api/students', async (req, res) => {
  const result = await pool.query('SELECT * FROM students ORDER BY id DESC');
  res.json(result.rows);
});

app.listen(3000, () => console.log('Server running on port 3000'));
