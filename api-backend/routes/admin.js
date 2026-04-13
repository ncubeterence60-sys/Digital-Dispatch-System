const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('../../dispatch_system.db');
const router = express.Router();

const ADMIN_SECRET = 'digital-dispatch-admin';

// Simple auth middleware (demo - token starts with 'admin:' + hash)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('admin:') || crypto.createHmac('sha256', ADMIN_SECRET).update(token.slice(6)).digest('hex') !== token.split(':')[1]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Create users table and demo admin on first run - FIXED for existing DB
db.exec(`DROP TABLE IF EXISTS users`);
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'admin');

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = `admin:${username}:${crypto.createHmac('sha256', ADMIN_SECRET).update(username + Date.now()).digest('hex').slice(0,32)}`;
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Login error' });
  }
});

// GET /trips - list recent trips
router.get('/trips', authMiddleware, (req, res) => {
  try {
    const statement = db.prepare(`
      SELECT id, customer_name as customer, driver_name as driver, 
             pickup_loc as pickup, dropoff_loc as dropoff, price, status, created_at as date 
      FROM trips ORDER BY id DESC LIMIT 50
    `);
    const trips = statement.all();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /drivers - active drivers
router.get('/drivers', authMiddleware, (req, res) => {
  try {
    const statement = db.prepare('SELECT id, name, status, current_location as location, rating FROM drivers ORDER BY rating DESC');
    const drivers = statement.all();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /verify
router.get('/verify', (req, res) => {
  authMiddleware(req, res, () => res.json({ valid: true }));
});

// Protect existing routes
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const totalTrips = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(price), 0) as revenue FROM trips WHERE status = "completed"').get().revenue;
    const activeDrivers = db.prepare('SELECT COUNT(*) as count FROM drivers WHERE status = "available"').get().count;
    const pendingPayouts = db.prepare('SELECT COALESCE(SUM(platform_fee), 0) as payouts FROM payments WHERE status = "pending"').get().payouts || 0;

    res.json({
      totalTrips,
      totalRevenue,
      activeDrivers,
      pendingPayouts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
