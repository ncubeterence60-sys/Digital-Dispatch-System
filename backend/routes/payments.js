const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('../../dispatch_system.db');
const router = express.Router();

/**
 * Get payment history (all completed trips)
 */
router.get('/', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT t.*, d.name as driver_name 
      FROM trips t 
      LEFT JOIN drivers d ON t.driver_id = d.driver_id 
      WHERE t.status = 'completed' 
      ORDER BY t.completed_at DESC
    `).all();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Process payment for trip (mock)
 */
router.post('/:tripId/pay', (req, res) => {
  const { tripId } = req.params;
  const { amount, payment_method } = req.body;
  try {
    // Update trip with payment info (mock success)
    const stmt = db.prepare(`
      UPDATE trips SET 
        payment_status = 'paid', 
        payment_amount = ?, 
        payment_method = ?,
        paid_at = CURRENT_TIMESTAMP
      WHERE trip_id = ?
    `);
    const result = stmt.run(amount, payment_method, tripId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const trip = db.prepare('SELECT * FROM trips WHERE trip_id = ?').get(tripId);
    global.io.emit('paymentUpdate', { tripId, status: 'paid' });
    res.json({ success: true, trip, message: 'Payment processed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Driver earnings (by driver)
 */
router.get('/driver/:driverId', (req, res) => {
  const { driverId } = req.params;
  try {
    const earnings = db.prepare(`
      SELECT 
        COUNT(*) as total_trips,
        COALESCE(SUM(fare), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN date(paid_at) = date('now') THEN payment_amount END), 0) as today_earnings
      FROM trips 
      WHERE driver_id = ? AND status = 'completed' AND payment_status = 'paid'
    `).get(driverId);
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
