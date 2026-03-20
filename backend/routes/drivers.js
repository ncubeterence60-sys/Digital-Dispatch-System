const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('../dispatch_system.db');

const router = express.Router();

/**
 * Update driver status (online/offline) and location - uses service_providers table
 */
router.post('/:driverId/status', (req, res) => {
  const { driverId } = req.params;
  const { status, lat, lng } = req.body;

  if (!['online', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Status must be online or offline' });
  }

  const providerStatus = status === 'online' ? 'Available' : 'Offline';
  try {
    const sql = 'UPDATE service_providers SET status = ?, lat = ?, lng = ?, updated_at = CURRENT_TIMESTAMP WHERE provider_id = ?';
    const stmt = db.prepare(sql);
    const result = stmt.run(providerStatus, lat || null, lng || null, driverId);
    if (result.changes === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json({ success: true, status: providerStatus, location: { lat, lng } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get pending trips for driver (service_requests transport type unassigned)
 */
router.get('/:driverId/trips', (req, res) => {
  const { driverId } = req.params;
  try {
    const driverStmt = db.prepare('SELECT lat, lng FROM service_providers WHERE provider_id = ?');
    const driver = driverStmt.get(driverId);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    // Nearby pending Transport requests (within 20km approx)
    const sql = 'SELECT request_id as trip_id, user_name, user_phone, pickup_location, dropoff_location, lat as pickup_lat, lng as pickup_lng, status FROM service_requests WHERE service_type_id = 1 AND status = "Pending" AND provider_id IS NULL ORDER BY created_at DESC LIMIT 5';
    const stmt = db.prepare(sql);
    const trips = stmt.all();
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
    const sql = 'UPDATE service_requests SET provider_id = ?, status = "DriverArriving", updated_at = CURRENT_TIMESTAMP WHERE request_id = ? AND status IN ("Pending", "SearchingForDriver")';
    const stmt = db.prepare(sql);
    const result = stmt.run(driverId, tripId);
    if (result.changes === 0) return res.status(404).json({ error: 'Trip not found or already assigned' });
    // Set driver busy
    const driverStmt = db.prepare('UPDATE service_providers SET status = "Busy" WHERE provider_id = ?');
    driverStmt.run(driverId);
    global.emitTripUpdate && global.emitTripUpdate(tripId, 'DriverArriving');
    res.json({ success: true, message: 'Trip accepted - Driver arriving', status: 'DriverArriving' });
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
    const sql = "UPDATE service_requests SET status = 'Pending', provider_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?";
    const stmt = db.prepare(sql);
    const result = stmt.run(tripId);
    if (result.changes === 0) return res.status(404).json({ error: 'Trip not found' });
    res.json({ success: true, message: 'Trip rejected', reason: reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get driver earnings (completed Transport requests)
 */
router.get('/:driverId/earnings', (req, res) => {
  const { driverId } = req.params;
  try {
    const sql = `
      SELECT 
        COALESCE(SUM(total_price), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN date(updated_at) = date('now') THEN total_price END), 0) as today_earnings,
        COUNT(*) as total_trips
      FROM service_requests 
      WHERE provider_id = ? AND service_type_id = 1 AND status = 'Completed'
    `;
    const stmt = db.prepare(sql);
    const earnings = stmt.get(driverId);
    res.json({
      today_earnings: parseFloat(earnings.today_earnings || 0).toFixed(2),
      total_earnings: parseFloat(earnings.total_earnings || 0).toFixed(2),
      total_trips: earnings.total_trips || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

