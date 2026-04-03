#!/usr/bin/env node
/**
 * Digital Dispatch Backend Server - API Routes Integration
 * Mounts /api/drivers, /api/customers, /api/admin, /api/payments
 * Compatible with drivers.js and new routes. Stable PWA serving.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
global.io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../../front end')));

app.get('/', (req, res) => res.redirect('/login.html'));

// DB connection
const dbPath = path.join(__dirname, '../dispatch_system.db');
const db = new Database(dbPath, { readonly: false });
console.log('✅ Connected to dispatch_system.db');

// Mount routes
// Fixed routes - require checks
try {
  app.use('/api/drivers', require('./routes/drivers'));
  console.log('✅ Mounted /api/drivers');
} catch (e) {
  console.log('⚠️  /api/drivers route not found - skipping');
}
console.log('✅ Mounted /api/drivers');
app.use('/api/customers', require('./routes/customers'));
console.log('✅ Mounted /api/customers');
app.use('/api/admin', require('./routes/admin'));
console.log('✅ Mounted /api/admin');
app.use('/api/payments', require('./routes/payments'));
console.log('✅ Mounted /api/payments');

// Fallback: serve login.html or dashboard_fixed.html (existing files)
app.use((req, res) => {
  const loginPath = path.join(__dirname, '../../front end/login.html');
  const dashboardPath = path.join(__dirname, '../../front end/dashboard_fixed.html');
  if (fs.existsSync(dashboardPath)) {
    return res.sendFile(dashboardPath);
  }
  res.sendFile(loginPath);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📱 PWA/API ready: login -> create ride -> assign driver -> view trips -> payments');
  console.log('🔗 Open: http://localhost:3000/login.html');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  db.close();
  server.close(() => process.exit(0));
});
