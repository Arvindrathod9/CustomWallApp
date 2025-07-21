const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const PORT = 5000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key'; // Change this to a strong secret in production

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

// Middleware to verify JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Register endpoint
app.post('/api/register', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing JSON body' });
  }
  const { username, password, name, email, country, profile_pic } = req.body;
  if (!username || !password || !name || !email || !country) {
    return res.status(400).json({ error: 'Username, password, name, email, and country are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  // Check if username or email already exists
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Username already exists' });
      } else {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }
    
    // Directly insert user into database (no email verification required)
    db.query('INSERT INTO users (username, password, name, email, country, profile_pic) VALUES (?, ?, ?, ?, ?, ?)', 
      [username, password, name, email, country, profile_pic || null], 
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        res.json({ 
          message: 'Account created successfully!',
          userid: result.insertId,
          username: username,
          name: name,
          email: email,
          country: country,
          profile_pic: profile_pic || null
        });
      });
  });
});



// Login endpoint (returns userid and username)
app.post('/api/login', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing JSON body' });
  }
  const { username, password } = req.body;
  db.query('SELECT id, username, name, email, country, profile_pic FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Return user data
    const user = results[0];
    // Issue JWT
    const token = jwt.sign({ userid: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      userid: user.id, 
      username: user.username,
      name: user.name,
      email: user.email,
      country: user.country,
      profile_pic: user.profile_pic || null,
      token
    });
  });
});

// Example protected endpoint
app.get('/api/protected-test', authenticateJWT, (req, res) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user });
});

// Get user profile
app.get('/api/profile/:userid', authenticateJWT, (req, res) => {
  const { userid } = req.params;
  db.query('SELECT id, username, name, email, country, profile_pic FROM users WHERE id = ?', [userid], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Update user profile
app.put('/api/profile/:userid', authenticateJWT, (req, res) => {
  const { userid } = req.params;
  const { name, country, email, profile_pic } = req.body;
  
  if (!name || !country || !email) {
    return res.status(400).json({ error: 'Name, country, and email are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  // Check if email already exists for another user
  db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userid], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Update user profile
    db.query('UPDATE users SET name = ?, country = ?, email = ?, profile_pic = ? WHERE id = ?', [name, country, email, profile_pic || null, userid], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  });
});



// Get all registered users (including passwords, for demo only)
app.get('/api/users', authenticateJWT, (req, res) => {
  db.query('SELECT username, password FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Check if a username exists
app.get('/api/users/exists/:username', (req, res) => {
  const { username } = req.params;
  db.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ exists: results.length > 0 });
  });
});

// Save or update a draft
app.post('/api/drafts', authenticateJWT, (req, res) => {
  const { userid, name, data, id, public: isPublic, editors } = req.body;
  if (!userid || !name || !data) {
    return res.status(400).json({ error: 'userid, name, and data are required' });
  }
  const publicValue = isPublic ? 1 : 0;
  // Always store editors as a JSON array (never NULL)
  const editorsJson = Array.isArray(editors) ? JSON.stringify(editors) : '[]';
  if (id) {
    // Update existing draft
    db.query(
      'UPDATE drafts SET name = ?, data = ?, public = ?, editors = ? WHERE id = ? AND userid = ?',
      [name, data, publicValue, editorsJson, id, userid],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, id });
      }
    );
  } else {
    // Insert new draft
    db.query(
      'INSERT INTO drafts (userid, name, data, public, editors) VALUES (?, ?, ?, ?, ?)',
      [userid, name, data, publicValue, editorsJson],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, id: result.insertId });
      }
    );
  }
});

// Get all drafts for a user
app.get('/api/drafts', authenticateJWT, (req, res) => {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: 'userid is required' });
  db.query('SELECT id, name, data, created_at, public FROM drafts WHERE userid = ?', [userid], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Get all drafts where the user is an editor (shared with them)
app.get('/api/drafts/shared', authenticateJWT, (req, res) => {
  const currentUsername = req.user.username;
  db.query('SELECT id, name, data, created_at, public, editors FROM drafts', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    // Filter drafts where editors includes currentUsername
    const sharedDrafts = results.filter(draft => {
      let editors = [];
      try {
        editors = draft.editors ? JSON.parse(draft.editors) : [];
      } catch {}
      // Debug log for troubleshooting
      console.log('Current username:', currentUsername, 'Draft editors:', editors, 'Draft id:', draft.id);
      return editors.includes(currentUsername);
    });
    res.json(sharedDrafts);
  });
});

// Get a draft by ID (public or owner or editor only)
app.get('/api/draft/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userid;
  const currentUsername = req.user.username;
  db.query('SELECT * FROM drafts WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Draft not found' });
    const draft = results[0];
    let editors = [];
    try {
      editors = draft.editors ? JSON.parse(draft.editors) : [];
    } catch {}
    if (draft.public || draft.userid == currentUserId || editors.includes(currentUsername)) {
      res.json(draft);
    } else {
      res.status(403).json({ error: 'You do not have access to this draft' });
    }
  });
});

// Delete a draft
app.delete('/api/drafts/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM drafts WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// --- Admin JWT Auth ---
const ADMIN_JWT_SECRET = 'your_admin_super_secret_key'; // Change in production
const ADMIN_USER = { username: 'Arvind Rathod', password: 'arvind' };

function adminAuthenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, ADMIN_JWT_SECRET, (err, admin) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.admin = admin;
    next();
  });
}

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username }, ADMIN_JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Admin-only: List all users (detailed)
app.get('/api/admin/users', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT id, username, name, email, country, created_at, profile_pic FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// --- More Admin Endpoints ---
// USERS: View, update, delete
app.get('/api/admin/users/:id', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT id, username, name, email, country, created_at, profile_pic FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});
app.put('/api/admin/users/:id', adminAuthenticateJWT, (req, res) => {
  const { name, email, country, profile_pic } = req.body;
  db.query('UPDATE users SET name = ?, email = ?, country = ?, profile_pic = ? WHERE id = ?', [name, email, country, profile_pic || null, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});
app.delete('/api/admin/users/:id', adminAuthenticateJWT, (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// ALTARS: List, view, update, delete (requires altar table)
app.get('/api/admin/altars', adminAuthenticateJWT, (req, res) => {
  // TODO: Create altar table if not exists
  db.query('SELECT * FROM altars', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error or altar table missing' });
    res.json(results);
  });
});
app.get('/api/admin/altars/:id', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT * FROM altars WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Altar not found' });
    res.json(results[0]);
  });
});
app.put('/api/admin/altars/:id', adminAuthenticateJWT, (req, res) => {
  // Example: update name/description
  const { name, description } = req.body;
  db.query('UPDATE altars SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});
app.delete('/api/admin/altars/:id', adminAuthenticateJWT, (req, res) => {
  db.query('DELETE FROM altars WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// FLAGGED CONTENT: List, resolve (requires flagged_content table)
app.get('/api/admin/flags', adminAuthenticateJWT, (req, res) => {
  // TODO: Create flagged_content table if not exists
  db.query('SELECT * FROM flagged_content', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error or flagged_content table missing' });
    res.json(results);
  });
});
app.post('/api/admin/flags/:id/resolve', adminAuthenticateJWT, (req, res) => {
  db.query('UPDATE flagged_content SET resolved = 1 WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// SUBSCRIPTIONS: List (requires subscriptions table)
app.get('/api/admin/subscriptions', adminAuthenticateJWT, (req, res) => {
  // TODO: Create subscriptions table if not exists
  db.query('SELECT * FROM subscriptions', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error or subscriptions table missing' });
    res.json(results);
  });
});

// PAYMENTS: List (requires payments table)
app.get('/api/admin/payments', adminAuthenticateJWT, (req, res) => {
  // TODO: Create payments table if not exists
  db.query('SELECT * FROM payments', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error or payments table missing' });
    res.json(results);
  });
});

// ANALYTICS: Summary (users, revenue, etc.)
app.get('/api/admin/analytics/summary', adminAuthenticateJWT, async (req, res) => {
  // Example: user count, total payments
  try {
    const [[userCount]] = await db.promise().query('SELECT COUNT(*) as count FROM users');
    let totalRevenue = 0;
    try {
      const [[revenue]] = await db.promise().query('SELECT SUM(amount) as total FROM payments');
      totalRevenue = revenue.total || 0;
    } catch {}
    res.json({ userCount: userCount.count, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ANALYTICS: Export CSV (users)
const { Parser } = require('json2csv');
app.get('/api/admin/analytics/export', adminAuthenticateJWT, async (req, res) => {
  db.query('SELECT id, username, name, email, country, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    try {
      const parser = new Parser();
      const csv = parser.parse(results);
      res.header('Content-Type', 'text/csv');
      res.attachment('users_report.csv');
      return res.send(csv);
    } catch (e) {
      res.status(500).json({ error: 'CSV export error' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

