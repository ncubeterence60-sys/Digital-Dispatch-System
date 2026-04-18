const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = global.prisma;

// POST /login (public)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPw = await bcrypt.hash('customer', parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, passwordHash: hashedPw, role: 'CUSTOMER' }
    });
    if (!(await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, role: 'CUSTOMER' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /rides
router.post('/rides', async (req, res) => {
  const data = req.body;
  try {
    const trip = await prisma.trip.create({
      data: {
        pickupLocation: data.pickup_location,
        dropoffLocation: data.dropoff_location,
        passengerName: data.passenger_name,
        passengerPhone: data.passenger_phone,
        pickupLat: data.pickup_lat,
        pickupLng: data.pickup_lng,
        dropoffLat: data.dropoff_lat,
        dropoffLng: data.dropoff_lng,
        status: 'PENDING'
      }
    });
    if (global.io) global.io.emit('newTrip', { id: trip.id });
    res.json({ success: true, trip_id: trip.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /trips
router.get('/trips', async (req, res) => {
  const { phone } = req.query;
  try {
    const trips = await prisma.trip.findMany({
      where: { passengerPhone: phone },
      orderBy: { createdAt: 'desc' }
    });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

