const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '#arvinD99', // update if you have a password
  database: 'memorywall'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Register endpoint
app.post('/api/register', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing JSON body' });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ username });
    });
  });
});

// Login endpoint (returns userid and username)
app.post('/api/login', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing JSON body' });
  }
  const { username, password } = req.body;
  db.query('SELECT id, username FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Return userid and username
    res.json({ userid: results[0].id, username: results[0].username });
  });
});

// Get all registered users (including passwords, for demo only)
app.get('/api/users', (req, res) => {
  db.query('SELECT username, password FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Save or update a draft
app.post('/api/drafts', (req, res) => {
  const { userid, name, data, id } = req.body;
  if (!userid || !name || !data) {
    return res.status(400).json({ error: 'userid, name, and data are required' });
  }
  if (id) {
    // Update existing draft
    db.query('UPDATE drafts SET name = ?, data = ? WHERE id = ? AND userid = ?', [name, data, id, userid], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, id });
    });
  } else {
    // Insert new draft
    db.query('INSERT INTO drafts (userid, name, data) VALUES (?, ?, ?)', [userid, name, data], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, id: result.insertId });
    });
  }
});

// Get all drafts for a user
app.get('/api/drafts', (req, res) => {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: 'userid is required' });
  db.query('SELECT id, name, data, created_at FROM drafts WHERE userid = ?', [userid], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Delete a draft
app.delete('/api/drafts/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM drafts WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
