const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('../../dispatch_system.db');
const router = express.Router();

/**
 * Get dashboard stats (aggregated)
 */
router.get('/stats', (req, res) => {
  try {
    const stats = {
      active_requests: db.prepare('SELECT COUNT(*) as count FROM trips WHERE status IN ("pending", "arriving")').get().count,
      online_drivers: db.prepare('SELECT COUNT(*) as count FROM drivers WHERE status = "Available"').get().count,
      today_revenue: db.prepare(`
        SELECT COALESCE(SUM(fare), 0) as total 
        FROM trips WHERE date(completed_at) = date('now') AND status = 'completed'
      `).get().total,
      total_growth: '18' // Mock % or calculate
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get services/service types (Rides, Delivery, Repairs)
 */
router.get('/services', (req, res) => {
  try {
    // Create services table if missing
    db.exec(`CREATE TABLE IF NOT EXISTS service_types (
      service_type_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      base_price REAL,
      km_rate REAL,
      icon TEXT,
      active BOOLEAN DEFAULT 1
    )`);
    
    // Seed demo data
    const services = [
      {service_type_id: 1, name: 'Rides', description: 'Taxi/Uber style transport', base_price: 5.0, km_rate: 1.5, icon: 'fa-car'},
      {service_type_id: 2, name: 'Delivery', description: 'Parcel/courier delivery', base_price: 3.0, km_rate: 0.8, icon: 'fa-box'},
      {service_type_id: 3, name: 'Repairs', description: 'Vehicle/mechanical repairs', base_price: 25.0, km_rate: 0, icon: 'fa-tools'}
    ];
    
    db.prepare(`INSERT OR IGNORE INTO service_types 
      (service_type_id, name, description, base_price, km_rate, icon) 
      VALUES (?, ?, ?, ?, ?, ?)`).run(...Object.values(services[0]));
    db.prepare(`INSERT OR IGNORE INTO service_types 
      (service_type_id, name, description, base_price, km_rate, icon) 
      VALUES (?, ?, ?, ?, ?, ?)`).run(...Object.values(services[1]));
    db.prepare(`INSERT OR IGNORE INTO service_types 
      (service_type_id, name, description, base_price, km_rate, icon) 
      VALUES (?, ?, ?, ?, ?, ?)`).run(...Object.values(services[2]));

    const serviceTypes = db.prepare('SELECT * FROM service_types WHERE active = 1 ORDER BY service_type_id').all();
    res.json(serviceTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get providers (drivers online/offline)
 */
router.get('/providers', (req, res) => {
  try {
    const providers = db.prepare(`
      SELECT driver_id as id, name, phone, status, lat, lng, 
             COUNT(t.trip_id) as active_trips
      FROM drivers d 
      LEFT JOIN trips t ON d.driver_id = t.driver_id AND t.status != 'completed'
      GROUP BY d.driver_id ORDER BY d.updated_at DESC
    `).all();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get requests (synonym for trips - live/pending)
 */
router.get('/requests', (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT t.*, d.name as driver_name 
      FROM trips t LEFT JOIN drivers d ON t.driver_id = d.driver_id
    `;
    let params = [];
    if (status) {
      query += ` WHERE t.status = ?`;
      params = [status];
    }
    query += ` ORDER BY t.created_at DESC LIMIT 50`;
    
    const requests = db.prepare(query).all(...params);
    global.io.emit('dashboardUpdate', { type: 'requests', count: requests.length });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * View all trips (legacy)
 */
router.get('/trips', (req, res) => {
  try {
    const trips = db.prepare(`
      SELECT t.*, d.name as driver_name, d.phone as driver_phone, d.status as driver_status
      FROM trips t 
      LEFT JOIN drivers d ON t.driver_id = d.driver_id 
      ORDER BY t.created_at DESC
    `).all();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * View all drivers (legacy)
 */
router.get('/drivers', (req, res) => {
  try {
    const drivers = db.prepare('SELECT * FROM drivers ORDER BY updated_at DESC').all();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Assign driver to trip
 */
router.post('/assign/:tripId/:driverId', (req, res) => {
  const { tripId, driverId } = req.params;
  try {
    const tripStmt = db.prepare('UPDATE trips SET driver_id = ?, status = "arriving" WHERE trip_id = ? AND status = "pending"');
    const tripResult = tripStmt.run(driverId, tripId);
    
    if (tripResult.changes === 0) {
      return res.status(404).json({ error: 'Trip not found or already assigned' });
    }
    
    db.prepare('UPDATE drivers SET status = "Busy" WHERE driver_id = ?').run(driverId);
    
    global.io.emit('tripAssigned', { tripId, driverId });
    global.io.emit('dashboardUpdate', { type: 'assignment', tripId, driverId });
    
    res.json({ success: true, message: 'Driver assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
