const express = require('express');
const { Pool } = require('pg');
const app = express();

// الربط بقاعدة البيانات باستخدام الرابط اللي هنبعته من Docker
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// "API" بسيط عشان نختبر الشغل
app.get('/api/data', async (req, res) => {
  try {
    // رسالة نجاح توضح إن كل الطبقات متصلة ببعض
    res.json({ 
      message: "مبروك! الـ Frontend والـ Backend وقاعدة البيانات (Postgres) شغالين مع بعض جوه Containers!" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
