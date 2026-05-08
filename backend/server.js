const express = require('express');
const { Pool } = require('pg');
const app = express();

// middleware مهم جداً عشان السيرفر يقدر يقرأ البيانات اللي بنبعتها (JSON)
app.use(express.json());

// الاتصال بقاعدة البيانات باستخدام المتغيرات اللي في Docker
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// دالة لإنشاء جدول الطلاب تلقائياً عند تشغيل السيرفر
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    console.log("✅ Database table is ready.");
  } catch (err) {
    console.error("❌ Database Error:", err);
  }
};
initDb();

// 1. عرض كل الطلاب (GET)
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. إضافة طالب جديد (POST)
app.post('/api/students', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO students (name) VALUES ($1) RETURNING *', 
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. تعديل اسم طالب (PUT)
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE students SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. حذف طالب (DELETE)
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    res.json({ message: "تم حذف الطالب بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تشغيل السيرفر على منفذ 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend is running on http://localhost:${PORT}`);
});
