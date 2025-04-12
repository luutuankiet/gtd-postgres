const express = require('express');
const cors = require('cors'); // Import the cors module
const { Pool } = require('pg');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Configure PostgreSQL connection
const pool = new Pool({
  user: 'ken',
  host: 'boyluu0819.ddns.net',
  database: 'gtd_dash',
  password: '659142',
  port: 5433,
});

// Middleware
app.use(cors()); // Use CORS middleware to enable CORS
app.use(express.json()); // Parse incoming JSON requests

// Define the API endpoint
app.get('/search', async (req, res) => {
  const term = req.query.term;
  if (!term) {
    return res.status(400).json({ error: 'Query term is required' });
  }

  try {
    const result = await pool.query(
      `SELECT todo_title, todo_content, 
              ts_rank(search, websearch_to_tsquery('english', $1)) + 
              ts_rank(search, websearch_to_tsquery('simple', $1)) AS rank
       FROM prod.tmp_ts__fact_todos 
       WHERE search @@ websearch_to_tsquery('english', $1)
          OR search @@ websearch_to_tsquery('simple', $1)
       ORDER BY rank DESC`,
      [term]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});