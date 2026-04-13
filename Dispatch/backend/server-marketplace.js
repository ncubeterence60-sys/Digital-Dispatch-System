#!/usr/bin/env node

/**
 * Digital Dispatch System - Dashboard Backend (Working Version)
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

async function sendWhatsApp(phone, message) {
  console.log(`📱 WhatsApp to ${phone}: ${message}`);
  return { success: true, messageId: 'mock-' + Date.now() };
}

async function sendSMS(phone, message) {
  console.log(`📱 SMS to ${phone}: ${message}`);
  return { success: true, messageId: 'mock-' + Date.now() };
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

const dbPath = path.join(__dirname, '..', '..', '..', 'dispatch_system.db');
const db = new sqlite3.Database(dbPath);
console.log('Connected to dispatch_system.db at', dbPath);

db.exec(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'Dispatcher',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
db.exec(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES ('admin', 'admin', 'Admin')`);

db.exec(`CREATE TABLE IF NOT EXISTS service_types (
  service_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  icon TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS service_providers (
  provider_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT,
  service_type_id INTEGER,
  status TEXT DEFAULT 'Offline',
  lat REAL,
  lng REAL,
  rating REAL DEFAULT 5.0
)`);

db.exec(`CREATE TABLE IF NOT EXISTS service_requests (
  request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  user_phone TEXT,
  service_type_id INTEGER,
  pickup_location TEXT,
  dropoff_location TEXT,
  status TEXT DEFAULT 'Pending',
  provider_id INTEGER
)`);

const serviceTypeStmt = db.prepare(`INSERT OR IGNORE INTO service_types (service_type_id, name, icon) VALUES (1, ?, ?)`);
serviceTypeStmt.run('Transport', 'taxi');
console.log('Service type seeded successfully:', {service_type_id: 1, name: 'Transport', icon: 'taxi'});

try {
  db.exec(`INSERT OR IGNORE INTO service_providers (provider_id, name, phone, service_type_id, status, lat, lng, rating) VALUES (1, 'John Doe', '+263712345678', 1, 'Available', -17.8252, 31.0335, 4.8), (2, 'Sarah Smith', '+263772345678', 1, 'Busy', -17.82, 31.04, 4.9)`);
} catch (e) { console.log('Providers already exist'); }

try {
  db.exec(`INSERT OR IGNORE INTO service_requests (request_id, user_name, user_phone, service_type_id, pickup_location, dropoff_location, status) VALUES (1, 'Tinashe', '+263712987654', 1, 'Harare CBD', 'Airport', 'Pending')`);
} catch (e) { console.log('Sample request already exists'); }

console.log('DB schema ready');

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ success: false, message: "Server error" });
      return;
    }
    if (row && row.password_hash === password) {
      res.json({ success: true, role: row.role, message: "Login successful!", dashboard: row.role === 'Admin' ? 'admin-dashboard.html' : 'dashboard_fixed.html' });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

app.get('/services', (req, res) => {
  db.all('SELECT * FROM service_types', (err, rows) => {
    if (err) {
      console.error('Services error:', err);
      res.status(500).json([]);
      return;
    }
    res.json(rows);
  });
});

app.get('/providers', (req, res) => {
  db.all('SELECT * FROM service_providers', (err, rows) => {
    if (err) {
      console.error('Providers error:', err);
      res.status(500).json([]);
      return;
    }
    res.json(rows);
  });
});

app.get('/requests', (req, res) => {
  db.all(`
    SELECT sr.*, st.name as service_type_name, sp.name as provider_name 
    FROM service_requests sr 
    LEFT JOIN service_types st ON sr.service_type_id = st.service_type_id 
    LEFT JOIN service_providers sp ON sr.provider_id = sp.provider_id
  `, (err, rows) => {
    if (err) {
      console.error('Requests error:', err);
      res.status(500).json([]);
      return;
    }
    res.json(rows);
  });
});

app.post('/requests', (req, res) => {
  const { user_name, user_phone, service_type_id, pickup_location, dropoff_location } = req.body;
  db.run(`INSERT INTO service_requests (user_name, user_phone, service_type_id, pickup_location, dropoff_location) VALUES (?, ?, ?, ?, ?)`, 
    [user_name, user_phone, service_type_id, pickup_location, dropoff_location], function(err) {
    if (err) {
      console.error('Insert request error:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Request created', request_id: this.lastID });
    }
  });
});

app.put('/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run('UPDATE service_requests SET status = ? WHERE request_id = ?', [status, id], function(err) {
    if (err) {
      console.error('Update status error:', err);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Request not found' });
    } else {
      io.emit('tripUpdate', { request_id: id, status });
      res.json({ message: 'Status updated' });
    }
  });
});

app.get('/drivers', (req, res) => app.get('/providers')(req, res));
app.get('/trips', (req, res) => app.get('/requests')(req, res));

app.post('/communicate/whatsapp', async (req, res) => {
  const { to_phone, message } = req.body;
  const result = await sendWhatsApp(to_phone, message);
  res.json(result);
});

app.post('/communicate/sms', async (req, res) => {
  const { to_phone, message } = req.body;
  const result = await sendSMS(to_phone, message);
  res.json(result);
});

app.get('/api/distance', (req, res) => {
  const { from_lat, from_lng, to_lat, to_lng } = req.query;
  const distance = calcDistance(parseFloat(from_lat), parseFloat(from_lng), parseFloat(to_lat), parseFloat(to_lng));
  res.json({ distance_km: distance });
});

app.get('/company', (req, res) => res.json({
  name: 'Digital Dispatch',
  tagline: 'Service platform',
  stats: { activeDrivers: 12, activeTrips: 3, totalRevenue: '$2450' }
}));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('admin:')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Admin API routes - for React frontend
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (row && row.password_hash === password) {
      const token = `admin:${username}:${Date.now()}`;
      res.json({ token, role: row.role });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true });
});

app.get('/api/admin/stats', authMiddleware, (req, res) => {
  db.get("SELECT COUNT(*) as trips FROM service_requests", (err, trips) => {
    db.get("SELECT COUNT(*) as drivers FROM service_providers WHERE status='Available'", (err2, drivers) => {
      db.get("SELECT SUM(price) as revenue FROM trips WHERE status='completed'", (err3, revenue) => {
        res.json({
          totalTrips: trips?.trips || 0,
          activeDrivers: drivers?.drivers || 0,
          totalRevenue: revenue?.revenue || 0,
          pendingPayouts: 0
        });
      });
    });
  });
});

app.get('/api/admin/trips', authMiddleware, (req, res) => {
  db.all(`SELECT * FROM service_requests LIMIT 50`, (err, rows) => {
    res.json(rows || []);
  });
});

app.get('/api/admin/drivers', authMiddleware, (req, res) => {
  db.all(`SELECT * FROM service_providers`, (err, rows) => {
    res.json(rows || []);
  });
});

app.use((req, res) => res.sendFile(path.join(__dirname, '..', '..', 'public', 'dashboard_fixed.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Digital Dispatch running on http://localhost:${PORT}`);
  console.log('📱 Mock WhatsApp/SMS, live Socket.io');
  console.log('Login: http://localhost:${PORT}/login.html');
});

