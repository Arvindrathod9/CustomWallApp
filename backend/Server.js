const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const PORT = 5000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key'; // Change this to a strong secret in production

const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory chat history (for demo; use DB for production)
let chatMessages = [];

io.on('connection', (socket) => {
  // Send chat history to new client
  socket.emit('chat-history', chatMessages);

  // Listen for new messages
  socket.on('chat-message', (msg) => {
    // msg: { user, text, timestamp }
    chatMessages.push(msg);
    if (chatMessages.length > 100) chatMessages.shift(); // keep last 100
    io.emit('chat-message', msg); // broadcast to all
  });
});

// Configure your email transport (use your real credentials in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'memorywall9@gmail.com', // replace with your email
    pass: 'toii afsh ugjh qqqz' // use an app password, not your real password
  }
});

function sendVerificationEmail(to, code) {
  return transporter.sendMail({
    from: '"MemoryWall" <your_gmail@gmail.com>',
    to,
    subject: 'Your MemoryWall Email Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your MemoryWall verification code is: <b>${code}</b></p>`
  });
}

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

// Middleware to verify JWT (fetches latest role from DB)
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    // Fetch the latest user role from DB
    db.query('SELECT role FROM users WHERE id = ?', [user.userid], (dbErr, results) => {
      if (dbErr || results.length === 0) {
        return res.status(403).json({ error: 'User not found or DB error' });
      }
      req.user = { ...user, role: results[0].role };
      next();
    });
  });
}

// Step 2: Middleware to check user role
function checkUserRole(allowedRoles) {
  return function (req, res, next) {
    const userRole = req.user?.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Register endpoint (step 1: store in pending_users, send code)
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

  // Check if username or email already exists in users or pending_users
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
    db.query('SELECT * FROM pending_users WHERE username = ? OR email = ?', [username, email], (err2, pendingResults) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      if (pendingResults.length > 0) {
        return res.status(409).json({ error: 'A registration is already pending for this username or email. Please check your email for the code.' });
      }
      // Generate 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      // Insert into pending_users
      db.query('INSERT INTO pending_users (username, password, name, email, country, profile_pic, code) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, password, name, email, country, profile_pic || null, code],
        (err3, result) => {
          if (err3) return res.status(500).json({ error: 'Database error' });
          // Send verification email
          sendVerificationEmail(email, code)
            .then(() => {
              res.json({ message: 'Verification code sent to email. Please verify to complete registration.' });
            })
            .catch((mailErr) => {
              res.status(500).json({ error: 'Failed to send verification email', details: mailErr.message });
            });
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
  db.query('SELECT id, username, name, email, country, profile_pic, role FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Return user data
    const user = results[0];
    // Issue JWT
    const token = jwt.sign({ userid: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      userid: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      country: user.country,
      profile_pic: user.profile_pic || null,
      role: user.role,
      token
    });
  });
});

// Example protected endpoint
app.get('/api/protected-test', authenticateJWT, (req, res) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user });
});

// Get user profile (with plan features)
app.get('/api/profile/:userid', authenticateJWT, (req, res) => {
  const { userid } = req.params;
  db.query('SELECT id, username, name, email, country, profile_pic, email_verified, role FROM users WHERE id = ?', [userid], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = results[0];
    // Get user's plan from subscriptions
    db.query('SELECT plan FROM subscriptions WHERE userid = ?', [userid], (err2, subResults) => {
      let planName = 'Basic';
      if (!err2 && subResults.length > 0) {
        planName = subResults[0].plan;
      } else if (user.role === 'advanced') {
        planName = 'Advanced';
      } else if (user.role === 'premium') {
        planName = 'Premium';
      }
      // Get plan features
      db.query('SELECT id FROM plans WHERE name = ?', [planName], (err3, planRows) => {
        if (err3 || planRows.length === 0) {
          return res.json({ ...user, plan: planName, features: [] });
        }
        const planId = planRows[0].id;
        db.query('SELECT feature_key, feature_value, feature_label FROM plan_features WHERE plan_id = ?', [planId], (err4, features) => {
          if (err4) return res.json({ ...user, plan: planName, features: [] });
          res.json({ ...user, plan: planName, features });
        });
      });
    });
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
    // Always set admin role as 'premium' for UI and 'admin' for backend
    const token = jwt.sign({ username, role: 'premium', isAdmin: true }, ADMIN_JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username, role: 'premium', isAdmin: true });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Admin-only: List all users (detailed)
app.get('/api/admin/users', adminAuthenticateJWT, (req, res) => {
  const sql = `
    SELECT u.id, u.username, u.name, u.email, u.country, u.created_at, u.profile_pic, u.role,
           s.plan AS subscription_plan
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.userid
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const users = results.map(u =>
      u.username === 'Arvind Rathod' ? { ...u, role: 'premium' } : u
    );
    res.json(users);
  });
});

// --- More Admin Endpoints ---
// USERS: View, update, delete
app.get('/api/admin/users/:id', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT id, username, name, email, country, created_at, profile_pic, role FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = results[0];
    // Always show admin as premium in the UI
    if (user.username === 'Arvind Rathod') user.role = 'premium';
    res.json(user);
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

// Step 3: Admin endpoint to update user role
app.post('/api/admin/update-role', adminAuthenticateJWT, (req, res) => {
  const { userId, newRole } = req.body;
  if (!userId || !newRole) {
    return res.status(400).json({ error: 'userId and newRole are required' });
  }
  // Only allow valid roles
  const validRoles = ['free', 'advanced', 'premium', 'admin'];
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  // Prevent admin from being downgraded from 'admin'
  db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    if (results[0].role === 'admin' && newRole !== 'admin') {
      return res.status(403).json({ error: 'Cannot change role of admin user' });
    }
    db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});

// Step 4: Example feature restriction (e.g., share draft)
app.post('/api/drafts/share', authenticateJWT, checkUserRole(['advanced', 'premium', 'admin']), (req, res) => {
  // Implement share draft logic here
  res.json({ message: 'Draft shared (example endpoint)' });
});

// Step 5: assignRoleFromPlan function
const roleFromPlan = {
  basic: 'free',
  advanced: 'advanced',
  premium: 'premium',
};
async function assignRoleFromPlan(userId) {
  return new Promise((resolve, reject) => {
    db.query('SELECT plan FROM subscriptions WHERE userid = ?', [userId], (err, results) => {
      if (err) return reject(err);
      const plan = results[0]?.plan || 'basic';
      const newRole = roleFromPlan[plan] || 'free';
      db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId], (err2) => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  });
}

/*
Step 6: SQL for daily cron job to expire plans (run externally, not in Node.js):

UPDATE users
JOIN subscriptions ON users.id = subscriptions.userid
SET users.role = 'free'
WHERE subscriptions.end_date < CURDATE();
*/

// --- Analytics Endpoints for Dashboard ---
app.get('/api/admin/analytics/roles', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const breakdown = {};
    results.forEach(r => { breakdown[r.role || 'free'] = r.count; });
    res.json(breakdown);
  });
});

app.get('/api/admin/analytics/countries', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT country, COUNT(*) as count FROM users GROUP BY country ORDER BY count DESC LIMIT 6', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const breakdown = {};
    results.forEach(r => { breakdown[r.country || 'Unknown'] = r.count; });
    res.json(breakdown);
  });
});

app.get('/api/admin/analytics/growth', adminAuthenticateJWT, (req, res) => {
  db.query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM users GROUP BY month ORDER BY month ASC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/admin/analytics/revenue', adminAuthenticateJWT, (req, res) => {
  db.query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as amount FROM payments GROUP BY month ORDER BY month ASC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/admin/analytics/activity', adminAuthenticateJWT, (req, res) => {
  db.query("SELECT username as user, 'register' as type, created_at as time FROM users ORDER BY created_at DESC LIMIT 10", (err, regRows) => {
    if (err) return res.json([]); // Always return an array
    db.query("SELECT username as user, 'upgrade' as type, updated_at as time FROM users WHERE role IN ('advanced','premium') ORDER BY updated_at DESC LIMIT 10", (err2, upRows) => {
      if (err2) return res.json([]);
      db.query("SELECT username as user, 'delete' as type, NOW() as time FROM users WHERE 1=0", (err3, delRows) => { // Placeholder for deletions
        if (err3) return res.json([]);
        const all = [...regRows, ...upRows, ...delRows].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
        res.json(Array.isArray(all) ? all : []);
      });
    });
  });
});

// --- Extra Stickers for Users ---
// SQL to create the table (run this in your MySQL client):
/*
CREATE TABLE IF NOT EXISTS user_stickers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sticker VARCHAR(128) NOT NULL,
  UNIQUE KEY unique_user_sticker (user_id, sticker),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
*/

// Get extra stickers for a user (admin only)
app.get('/api/admin/user/:id/stickers', adminAuthenticateJWT, (req, res) => {
  const userId = req.params.id;
  db.query('SELECT sticker FROM user_stickers WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results.map(r => r.sticker));
  });
});

// Assign extra stickers to a user (admin only)
app.post('/api/admin/user/:id/stickers', adminAuthenticateJWT, (req, res) => {
  const userId = req.params.id;
  const { stickers } = req.body; // stickers: array of sticker filenames
  if (!Array.isArray(stickers)) return res.status(400).json({ error: 'Stickers must be an array' });
  // Remove all current, then insert new
  db.query('DELETE FROM user_stickers WHERE user_id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (stickers.length === 0) return res.json({ success: true });
    const values = stickers.map(s => [userId, s]);
    db.query('INSERT INTO user_stickers (user_id, sticker) VALUES ?', [values], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});

// Get extra stickers for a user (user can fetch their own)
app.get('/api/user/:id/stickers', authenticateJWT, (req, res) => {
  const userId = req.params.id;
  // Only allow the user to fetch their own stickers
  if (parseInt(userId) !== req.user.userid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  db.query('SELECT sticker FROM user_stickers WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results.map(r => r.sticker));
  });
});

// Verify email code endpoint (step 2: move from pending_users to users)
app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  db.query('SELECT * FROM pending_users WHERE email = ? AND code = ?', [email, code], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid code or email' });
    const pending = results[0];
    // Check if user already exists (should not happen, but safety)
    db.query('SELECT * FROM users WHERE email = ? OR username = ?', [pending.email, pending.username], (err2, userResults) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      if (userResults.length > 0) {
        // Clean up pending_users
        db.query('DELETE FROM pending_users WHERE id = ?', [pending.id]);
        return res.status(409).json({ error: 'User already registered.' });
      }
      // Insert into users
      db.query('INSERT INTO users (username, password, name, email, country, profile_pic, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [pending.username, pending.password, pending.name, pending.email, pending.country, pending.profile_pic],
        (err3, result) => {
          if (err3) return res.status(500).json({ error: 'Database error' });
          // Remove from pending_users
          db.query('DELETE FROM pending_users WHERE id = ?', [pending.id]);
          // Send confirmation email
          sendVerificationEmailConfirmation(pending.email).catch(() => {});
          // Issue JWT
          const token = jwt.sign(
            { userid: result.insertId, username: pending.username, email: pending.email, role: 'free' },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          res.json({
            success: true,
            message: 'Email verified and registration complete!',
            userid: result.insertId,
            username: pending.username,
            name: pending.name,
            email: pending.email,
            country: pending.country,
            profile_pic: pending.profile_pic || null,
            role: 'free',
            token
          });
        });
    });
  });
});

// Confirmation email sender
function sendVerificationEmailConfirmation(to) {
  return transporter.sendMail({
    from: '"MemoryWall" <your_gmail@gmail.com>',
    to,
    subject: 'Welcome to MemoryWall! Your Email is Verified',
    html: `
      <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:24px;box-shadow:0 4px 32px #bfa16c22;padding:0;font-family:Montserrat,Segoe UI,Arial,sans-serif;">
        <div style="background:#bfa16c;color:white;border-top-left-radius:24px;border-top-right-radius:24px;padding:24px 32px;font-weight:900;font-size:32px;letter-spacing:1px;text-align:center;">
          MemoryWall
        </div>
        <div style="padding:32px 32px 24px 32px;text-align:center;">
          <h2 style="color:#bfa16c;font-size:26px;margin-bottom:12px;">Welcome to MemoryWall!</h2>
          <p style="font-size:18px;color:#333;margin-bottom:18px;">Your email has been <b>successfully verified</b>.</p>
          <div style="background:#f5faff;border-radius:16px;padding:18px 0;margin-bottom:18px;">
            <ul style="list-style:none;padding:0;margin:0;font-size:16px;color:#444;">
              <li style="margin:10px 0;"><b>✓</b> Create and customize your wall</li>
              <li style="margin:10px 0;"><b>✓</b> Share and collaborate with friends</li>
              <li style="margin:10px 0;"><b>✓</b> Use premium stickers (if assigned)</li>
              <li style="margin:10px 0;"><b>✓</b> Real-time public chat</li>
              <li style="margin:10px 0;"><b>✓</b> And much more!</li>
            </ul>
          </div>
          <div style="margin:24px 0 12px 0;">
            <h3 style="color:#bfa16c;margin-bottom:8px;">Get Started Tips:</h3>
            <ol style="text-align:left;max-width:400px;margin:0 auto 0 auto;color:#333;font-size:15px;">
              <li>Log in and set up your profile with a picture and details.</li>
              <li>Start creating your first wall—choose a background, add stickers, and decorate!</li>
              <li>Share your wall with friends or invite them to collaborate.</li>
              <li>Join the public chat to meet other MemoryWall users.</li>
            </ol>
          </div>
          <p style="color:#bfa16c;font-weight:700;font-size:18px;margin-top:24px;">Thank you for joining <span style="color:#bfa16c;">MemoryWall</span>!<br/>We hope you enjoy your experience.</p>
        </div>
      </div>
    `
  });
}

// Resend verification code endpoint (for pending_users)
app.post('/api/resend-verification-code', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Generate new 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  db.query('UPDATE pending_users SET code = ? WHERE email = ?', [code, email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No pending registration for this email.' });
    sendVerificationEmail(email, code)
      .then(() => {
        res.json({ success: true, message: 'Verification code resent.' });
      })
      .catch((mailErr) => {
        res.status(500).json({ error: 'Failed to send verification email', details: mailErr.message });
      });
  });
});

// Delete user account and all data
app.delete('/api/users/:id', authenticateJWT, (req, res) => {
  const userId = parseInt(req.params.id);
  if (userId !== req.user.userid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Delete from all related tables
  db.query('DELETE FROM drafts WHERE userid = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error (drafts)' });
    db.query('DELETE FROM user_stickers WHERE user_id = ?', [userId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error (stickers)' });
      db.query('DELETE FROM pending_users WHERE email = (SELECT email FROM users WHERE id = ?)', [userId], (err3) => {
        // Ignore error if not found in pending_users
        db.query('DELETE FROM users WHERE id = ?', [userId], (err4) => {
          if (err4) return res.status(500).json({ error: 'Database error (users)' });
          res.json({ success: true });
        });
      });
    });
  });
});

// --- PLANS: List, create, update, delete ---
// List all plans with their structured features
app.get('/api/admin/plans', adminAuthenticateJWT, (req, res) => {
  db.query('SELECT * FROM plans ORDER BY display_order, id', (err, plans) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.query('SELECT * FROM plan_features ORDER BY plan_id, feature_order, id', (err2, features) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      const plansWithFeatures = plans.map(plan => ({
        ...plan,
        features: features.filter(f => f.plan_id === plan.id)
      }));
      res.json(plansWithFeatures);
    });
  });
});

// Create a new plan with structured features
app.post('/api/admin/plans', adminAuthenticateJWT, (req, res) => {
  const { name, price, display_order, features } = req.body;
  if (!name) return res.status(400).json({ error: 'Plan name required' });
  db.query('INSERT INTO plans (name, price, display_order) VALUES (?, ?, ?)', [name, price || 0, display_order || 0], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const planId = result.insertId;
    if (Array.isArray(features) && features.length > 0) {
      const values = features.map(f => [planId, f.feature_key, f.feature_value, f.feature_label, f.feature_order || 0]);
      db.query('INSERT INTO plan_features (plan_id, feature_key, feature_value, feature_label, feature_order) VALUES ?', [values], (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error (features)' });
        res.json({ success: true, planId });
      });
    } else {
      res.json({ success: true, planId });
    }
  });
});

// Update a plan and its structured features
app.put('/api/admin/plans/:id', adminAuthenticateJWT, (req, res) => {
  const planId = req.params.id;
  const { name, price, display_order, features } = req.body;
  db.query('UPDATE plans SET name = ?, price = ?, display_order = ? WHERE id = ?', [name, price, display_order, planId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.query('DELETE FROM plan_features WHERE plan_id = ?', [planId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error (delete features)' });
      if (Array.isArray(features) && features.length > 0) {
        const values = features.map(f => [planId, f.feature_key, f.feature_value, f.feature_label, f.feature_order || 0]);
        db.query('INSERT INTO plan_features (plan_id, feature_key, feature_value, feature_label, feature_order) VALUES ?', [values], (err3) => {
          if (err3) return res.status(500).json({ error: 'Database error (insert features)' });
          res.json({ success: true });
        });
      } else {
        res.json({ success: true });
      }
    });
  });
});

// Delete a plan (and its features via cascade)
app.delete('/api/admin/plans/:id', adminAuthenticateJWT, (req, res) => {
  db.query('DELETE FROM plans WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// User requests plan upgrade (admin can approve, or auto-approve for demo)
app.post('/api/user/upgrade-plan', authenticateJWT, (req, res) => {
  const { newPlan } = req.body;
  const userid = req.user?.userid;
  if (!userid || !newPlan) {
    return res.status(400).json({ error: 'userid and newPlan are required' });
  }
  // Update the user's plan in subscriptions table
  db.query('UPDATE subscriptions SET plan = ? WHERE userid = ?', [newPlan, userid], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const updateUserRole = () => {
      db.query('UPDATE users SET role = ? WHERE id = ?', [newPlan.toLowerCase(), userid]);
    };
    if (result.affectedRows === 0) {
      // If no subscription, create one
      db.query('INSERT INTO subscriptions (userid, plan, start_date, end_date) VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))', [userid, newPlan], (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error' });
        updateUserRole();
        res.json({ success: true, plan: newPlan });
      });
    } else {
      updateUserRole();
      res.json({ success: true, plan: newPlan });
    }
  });
});

// Public: List all plans with their features (for user upgrade UI)
app.get('/api/plans', (req, res) => {
  db.query('SELECT * FROM plans ORDER BY display_order, id', (err, plans) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.query('SELECT * FROM plan_features ORDER BY plan_id, feature_order, id', (err2, features) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      const plansWithFeatures = plans.map(plan => ({
        ...plan,
        features: features.filter(f => f.plan_id === plan.id)
      }));
      res.json(plansWithFeatures);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

