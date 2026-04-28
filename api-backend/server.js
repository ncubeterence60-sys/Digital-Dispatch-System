#!/usr/bin/env node
/**
 * Digital Dispatch Backend Server - SECURE VERSION
 * JWT + Bcrypt + Helmet + Rate Limit + Prisma PG + HTTPS
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
global.prisma = new PrismaClient();
console.log('✅ Prisma connected to PostgreSQL');

global.io = new require('socket.io')(httpsServer, { cors: { origin: ['http://localhost:5173', 'https://localhost:3443'], credentials: true } });

// ================= SECURITY MIDDLEWARE =================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'ws://localhost:3000']
    }
  }
}));

// Rate limit global API
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// Rate limit logins
app.use('/api/admin/login', rateLimit({ windowMs: 60 * 1000, max: 5 }));
app.use('/api/drivers/login', rateLimit({ windowMs: 60 * 1000, max: 5 }));
app.use('/api/customers/login', rateLimit({ windowMs: 60 * 1000, max: 5 }));

// CORS restricted
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:3443'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../../front end'), { maxAge: '1h' }));

// ================= JWT MIDDLEWARE =================
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin role check
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ================= ROUTES =================
app.get('/', (req, res) => res.redirect('/login.html'));

// Public routes first
app.use('/api/customers', require('./routes/customers')); // login public
app.use('/api/drivers', require('./routes/drivers')); // login public

// Protected
app.use('/api/admin', authenticateJWT, requireAdmin, require('./routes/admin'));
app.use('/api/payments', authenticateJWT, require('./routes/payments'));

// Fallback static
app.use((req, res) => {
  const paths = [
    path.join(__dirname, '../../front end/dashboard_fixed.html'),
    path.join(__dirname, '../../front end/login.html'),
    path.join(__dirname, '../../front end/login.html')
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return res.sendFile(p);
  }
  res.status(404).json({ error: 'Not found' });
});

// ================= HTTPS SERVER =================
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

const PORT = process.env.PORT || 3443;
const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(PORT, () => {
  console.log(`🔒 Secure HTTPS server on https://localhost:${PORT}`);
  console.log('📱 Ready: https://localhost:3443/login.html');
  console.log('⚠️ Accept self-signed cert in browser');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await global.prisma.$disconnect();
  httpsServer.close(() => process.exit(0));
});

