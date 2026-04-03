const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('../../dispatch_system.db');
const router = express.Router();

/**
 * Customer Login (simple auth - matches marketplace style)
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  try {
    // Create users table if not exists (fallback to marketplace)
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'customer'
    )`);
    db.exec(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES ('customer', 'customer', 'customer')`);

    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password_hash = ?').get(username, password);
    if (user) {
      res.json({ 
        success: true, 
        token: 'mock-jwt-' + Date.now(), // simple mock
        role: user.role,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get ride estimate using distance service
 */
router.get('/estimate', async (req, res) => {
  const { pickup_location, dropoff_location } = req.query;
  if (!pickup_location || !dropoff_location) {
    return res.status(400).json({ error: 'pickup_location and dropoff_location required' });
  }

  try {
    // Harare-focused mock geocoding (Nominatim in production)
    const harareCoords = {
      'Harare CBD': [-17.8179, 31.0446],
      'Airport': [-17.9297, 31.1004],
      'Borrowdale': [-17.788, 31.071],
      'Avondale': [-17.802, 31.035],
      'Eastlea': [-17.835, 31.078],
      'Mount Pleasant': [-17.789, 31.083]
    };
    
    const pickup = harareCoords[pickup_location] || [-17.8179, 31.0446]; // Default Harare CBD
    const dropoff = harareCoords[dropoff_location] || [-17.9297, 31.1004]; // Default Airport
    
    // Haversine distance (from distance.js logic)
    const R = 6371;
    const dLat = (dropoff[0] - pickup[0]) * Math.PI / 180;
    const dLng = (dropoff[1] - pickup[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(pickup[0] * Math.PI / 180) * Math.cos(dropoff[0] * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    
    const baseFare = 5.0;
    const perKm = 1.5;
    const estimated_price = Math.round((baseFare + distanceKm * perKm) * 100) / 100;
    const eta_minutes = Math.round((distanceKm / 50) * 60); // 50km/h avg
    
    res.json({
      success: true,
      distance_km: parseFloat(distanceKm.toFixed(2)),
      estimated_price,
      eta_minutes,
      currency: 'USD'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create Ride/Trip (customer requests ride)
 */
router.post('/rides', (req, res) => {
  const { pickup_location, dropoff_location, passenger_name, passenger_phone, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO trips (pickup_location, dropoff_location, passenger_name, passenger_phone, 
                        pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    const result = stmt.run(pickup_location, dropoff_location, passenger_name, passenger_phone, 
                           pickup_lat, pickup_lng, dropoff_lat, dropoff_lng);
    global.io.emit('newTrip', { trip_id: result.lastInsertRowid });
    res.json({ success: true, trip_id: result.lastInsertRowid, message: 'Ride created - pending driver assignment' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * View my trips (customer)
 */
router.get('/trips', (req, res) => {
  const { phone } = req.query; // filter by phone
  try {
    const trips = db.prepare(`
      SELECT * FROM trips WHERE passenger_phone = ? ORDER BY created_at DESC
    `).all(phone);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
