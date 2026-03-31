Uconst express = require('express');
const Database = require('better-sqlite3');
const db = new Database('../../dispatch_system.db');

const router = express.Router();

/**
 * Update driver status (online/offline) and location - Emit to customers
 */
router.post('/:driverId/status', (req, res) => {
  const { driverId } = req.params;
  const { status, lat, lng, heading = 0 } = req.body;

  if (!['online', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Status must be online or offline' });
  }

  const dbStatus = status === 'online' ? 'Available' : 'Offline';
  try {
    const stmt = db.prepare('UPDATE drivers SET status = ?, lat = ?, lng = ?, heading = ?, updated_at = CURRENT_TIMESTAMP WHERE driver_id = ?');
    const result = stmt.run(dbStatus, lat || null, lng || null, heading, driverId);
    if (result.changes === 0) return res.status(404).json({ error: 'Driver not found' });
    
    // Emit real-time location to all customers (room-based in production)
    if (global.io && lat && lng) {
      global.io.emit('driverLocation', {
        driverId,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        heading: parseFloat(heading),
        status: dbStatus,
        timestamp: new Date().toISOString()
      });
      console.log(`📍 Emitted driver ${driverId} location to ${global.io.engine.clientsCount} clients`);
    }
    
    res.json({ success: true, status: dbStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get nearby pending trips
 */
router.get('/:driverId/trips', (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = db.prepare('SELECT lat, lng FROM drivers WHERE driver_id = ?').get(driverId);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const trips = db.prepare(`
      SELECT trip_id, pickup_location, dropoff_location, passenger_name, passenger_phone, 
             pickup_lat, pickup_lng, status, fare as estimated_price
      FROM trips WHERE status = 'pending' AND driver_id IS NULL ORDER BY created_at DESC LIMIT 5
    `).all();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Accept trip
 */
router.post('/:driverId/trips/:tripId/accept', (req, res) => {
  const { driverId, tripId } = req.params;
  try {
    const stmt = db.prepare('UPDATE trips SET driver_id = ?, status = "arriving" WHERE trip_id = ? AND status = "pending"');
    const result = stmt.run(driverId, tripId);
    if (result.changes === 0) return res.status(404).json({ error: 'Trip not found or assigned' });
    db.prepare('UPDATE drivers SET status = "Busy" WHERE driver_id = ?').run(driverId);
    global.io.emit('tripUpdate', { tripId, status: 'arriving', driverId });
    res.json({ success: true, status: 'arriving' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Pickup confirmed
 */
router.post('/:driverId/trips/:tripId/pickup', (req, res) => {
  const { driverId, tripId } = req.params;
  try {
    db.prepare('UPDATE trips SET status = "picked_up" WHERE trip_id = ? AND driver_id = ?').run(tripId, driverId);
    global.io.emit('tripUpdate', { tripId, status: 'picked_up' });
    res.json({ success: true, status: 'picked_up' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Complete trip + set actual fare
 */
router.post('/:driverId/trips/:tripId/complete', (req, res) => {
  const { driverId, tripId } = req.params;
  const { actual_fare } = req.body;
  try {
    db.prepare('UPDATE trips SET status = "completed", fare = ?, completed_at = CURRENT_TIMESTAMP WHERE trip_id = ? AND driver_id = ?').run(actual_fare, tripId, driverId);
    db.prepare('UPDATE drivers SET status = "Available" WHERE driver_id = ?').run(driverId);
    global.io.emit('tripUpdate', { tripId, status: 'completed' });
    res.json({ success: true, status: 'completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reject trip
 */
router.post('/trips/:tripId/reject', (req, res) => {
  const { tripId } = req.params;
  const { reason } = req.body;
  try {
    db.prepare("UPDATE trips SET status = 'pending', driver_id = NULL WHERE trip_id = ?").run(tripId);
    res.json({ success: true, reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Earnings
 */
router.get('/:driverId/earnings', (req, res) => {
  const { driverId } = req.params;
  try {
    const data = db.prepare(`
      SELECT COALESCE(SUM(fare), 0) as total, 
             COALESCE(SUM(CASE WHEN date(completed_at) = date('now') THEN fare END), 0) as today,
             COUNT(*) as trips FROM trips WHERE driver_id = ? AND status = 'completed'
    `).get(driverId);
    res.json({
      total_earnings: parseFloat(data.total).toFixed(2),
      today_earnings: parseFloat(data.today).toFixed(2),
      total_trips: data.trips || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
