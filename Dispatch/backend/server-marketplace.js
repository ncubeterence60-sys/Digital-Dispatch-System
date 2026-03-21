#!/usr/bin/env node

/**
 * Digital Dispatch System - Uber-style Dashboard Backend
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Mock communications (no Twilio)
async function sendWhatsApp(phone, message) {
  console.log(`📱 WhatsApp to ${phone}: ${message}`);
  return { success: true, messageId: 'mock-' + Date.now() };
}

async function sendSMS(phone, message) {
  console.log(`📱 SMS to ${phone}: ${message}`);
  return { success: true, messageId: 'mock-' + Date.now() };
}

async function sendNotification(phone, message) {
  console.log(`🔔 Notification to ${phone}: ${message}`);
  return { success: true, demo: true };
}

function formatPhoneNumber(phone) {
  return phone.replace(/[^0-9+]/g, '');
}

// Mock comms ready - no destructuring needed

// Distance calculation
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
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
app.use(express.static(path.join(__dirname, '..', '..', 'front end')));

// Serve login.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'front end', 'login.html'));
});

// DB - Fixed better-sqlite3 sync connection
const dbPath = path.join(__dirname, '..', '..', '..', 'dispatch_system.db');
const db = new Database(dbPath);
console.log('Connected to dispatch_system.db at', dbPath);

// Initialize tables (sync)
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'Dispatcher',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES ('admin', 'admin', 'Admin')");
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_types (
      service_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      icon TEXT
    );
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_providers (
      provider_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      service_type_id INTEGER,
      status TEXT DEFAULT 'Offline',
      lat REAL,
      lng REAL,
      rating REAL DEFAULT 5.0
    );
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_requests (
      request_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      user_phone TEXT,
      service_type_id INTEGER,
      pickup_location TEXT,
      dropoff_location TEXT,
      status TEXT DEFAULT 'Pending',
      provider_id INTEGER
    );
  `);
  
  console.log('DB schema ready');
} catch (err) {
  console.error('DB setup error:', err);
}


// DB init already handled above
console.log('DB schema ready');

// Login route (for new UI)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
try {
  const row = db.get("SELECT * FROM users WHERE username = ?", username);
  if (row && row.password_hash === password) {
    res.json({ success: true, role: row.role, message: "Login successful!", dashboard: row.role === 'Admin' ? 'admin-dashboard.html' : 'dashboard_fixed.html' });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
} catch (err) {
  console.error('Database error:', err);
  res.status(500).json({ success: false, message: "Server error" });
}
});

// API Routes
app.get('/services', (req, res) => {
  try {
    const rows = db.all('SELECT * FROM service_types');
    res.json(rows || []);
  } catch (err) {
    console.error('Services error:', err);
    res.status(500).json([]);
  }
});

app.get('/providers', (req, res) => {
try {
  const rows = db.all('SELECT * FROM service_providers');
  res.json(rows || []);
} catch (err) {
  console.error('Providers error:', err);
  res.status(500).json([]);
}
});

app.get('/requests', (req, res) => {
try {
  const rows = db.all(`
    SELECT sr.*, st.name as service_type_name, sp.name as provider_name 
    FROM service_requests sr 
    LEFT JOIN service_types st ON sr.service_type_id = st.service_type_id 
    LEFT JOIN service_providers sp ON sr.provider_id = sp.provider_id
  `);
  res.json(rows || []);
} catch (err) {
  console.error('Requests error:', err);
  res.status(500).json([]);
}
});

app.post('/requests', (req, res) => {
  const { user_name, user_phone, service_type_id, pickup_location, dropoff_location } = req.body;
try {
  const stmt = db.prepare(`INSERT INTO service_requests (user_name, user_phone, service_type_id, pickup_location, dropoff_location) VALUES (?, ?, ?, ?, ?)`);
  const info = stmt.run(user_name, user_phone, service_type_id, pickup_location, dropoff_location);
  res.json({ message: 'Request created', request_id: info.lastInsertRowid });
} catch (err) {
  console.error('Insert request error:', err);
  res.status(500).json({ error: err.message });
}
});

app.put('/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
try {
  const stmt = db.prepare('UPDATE service_requests SET status = ? WHERE request_id = ?');
  const info = stmt.run(status, id);
  if (info.changes === 0) return res.status(404).json({ error: 'Request not found' });
  io.emit('tripUpdate', { request_id: id, status });
  res.json({ message: 'Status updated' });
} catch (err) {
  console.error('Update status error:', err);
  res.status(500).json({ error: err.message });
}
});

app.get('/drivers', (req, res) => app.get('/providers')(req, res));
app.get('/trips', (req, res) => app.get('/requests')(req, res));

// Comms (mock)
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

// Distance
app.get('/api/distance', (req, res) => {
  const { from_lat, from_lng, to_lat, to_lng } = req.query;
  const distance = calcDistance(parseFloat(from_lat), parseFloat(from_lng), parseFloat(to_lat), parseFloat(to_lng));
  res.json({ distance_km: distance });
});

app.get('/company', (req, res) => res.json({
  name: 'Digital Dispatch',
  tagline: 'Uber-style platform',
  stats: { activeDrivers: 12, activeTrips: 3, totalRevenue: '$2450' }
}));

// 404 fallback
app.use((req, res) => res.sendFile(path.join(__dirname, '..', '..', 'front end', 'dashboard_fixed.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Digital Dispatch running on http://localhost:${PORT}`);
  console.log('📱 Mock WhatsApp/SMS, live Socket.io');
  console.log('🗺️  Dashboard at http://localhost:3000');
});

function emitTripUpdate(id, status) {
  io.emit('tripUpdate', { request_id: id, status });
}
