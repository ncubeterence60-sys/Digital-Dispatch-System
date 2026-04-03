import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const server = createServer(app);
export const io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('../../legacy-frontend'));

const prisma = new PrismaClient();

app.get('/', (req, res) => res.redirect('/login.html'));

// Mount routes (to be refactored to TS)
try {
  app.use('/api/drivers', require('../routes/drivers'));
} catch {}
app.use('/api/customers', require('../routes/customers'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/payments', require('../routes/payments'));

// OSRM Route
app.get('/api/route', async (req: express.Request, res: express.Response) => {
  const { from_lat, from_lng, to_lat, to_lng } = req.query;
  try {
    const response = await fetch(`${process.env.OSRM_URL}/route/v1/driving/${from_lng},${from_lat};${to_lng},${to_lat}?overview=full&steps=true`);
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(503).json({ error: 'OSRM unavailable, using Haversine fallback' });
  }
});

// OpenAI Dispatch Opt (stub)
app.post('/api/ai/match-trip', async (req: express.Request, res: express.Response) => {
  // TODO: OpenAI call
  res.json({ recommendedDrivers: [] });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 API Backend on http://localhost:${PORT}`);
});

