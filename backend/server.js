// backend/server.js
const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/api/data', async (req, res) => {
  res.json({ message: "Hello from Node.js Backend with Database!" });
});

app.listen(3000, () => console.log('Server running on port 3000'));
