const express = require('express');
const router = express.Router();
const prisma = global.prisma;

// GET / (protected)
router.get('/', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        trip: true,
        driver: { select: { name: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:tripId/pay (protected)
router.post('/:tripId/pay', async (req, res) => {
  const { tripId } = req.params;
  const { amount, payment_method } = req.body;
  try {
    const payment = await prisma.payment.upsert({
      where: { tripId: parseInt(tripId) },
      update: {
        amount,
        status: 'PAID',
        paidAt: new Date()
      },
      create: {
        tripId: parseInt(tripId),
        driverId: req.user.id, // From JWT
        amount,
        status: 'PAID'
      }
    });
    if (global.io) global.io.emit('paymentUpdate', payment);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /driver/:driverId (protected)
router.get('/driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const stats = await prisma.payment.aggregate({
      where: { driverId: parseInt(driverId) },
      _count: { id: true },
      _sum: { amount: true }
    });
    res.json({
      totalTrips: stats._count.id,
      totalEarnings: stats._sum.amount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

