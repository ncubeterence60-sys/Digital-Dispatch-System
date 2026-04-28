const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = global.prisma;

// Seed demo admin (idempotent)
async function seedAdmin() {
  const hashedPw = await bcrypt.hash('admin', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: hashedPw, role: 'ADMIN' }
  });
}
seedAdmin().catch(console.error);

// POST /login (public)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Admin access required' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /verify (protected by server middleware)
router.get('/verify', (req, res) => res.json({ valid: true, user: req.user }));

// GET /trips
router.get('/trips', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { id: 'desc' },
      take: 50,
      select: {
        id: true,
        customerName: 'passengerName',
        driver: { select: { name: true } },
        pickupLocation: true,
        dropoffLocation: true,
        fare: true,
        status: true,
        createdAt: true
      }
    });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /stats
router.get('/stats', async (req, res) => {
  try {
    const [totalTrips, totalRevenue, activeDrivers] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.aggregate({ _sum: { fare: true }, where: { status: 'COMPLETED' } }),
      prisma.driver.count({ where: { status: 'AVAILABLE' } })
    ]);
    res.json({
      totalTrips,
      totalRevenue: totalRevenue._sum.fare || 0,
      activeDrivers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

