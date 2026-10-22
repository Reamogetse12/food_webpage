import express, { Application } from 'express';
import cors from 'cors';

import authRoutes         from './routes/auth.routes';
import menuRoutes         from './routes/menu.routes';
import ordersRoutes       from './routes/orders.routes';
import reservationsRoutes from './routes/reservations.routes';

const app: Application = express();

// ── Global middleware 
app.use(cors({ origin: process.env['CLIENT_ORIGIN'] ?? 'http://localhost:4200', credentials: true }));
app.use(express.json());

// ── Routes 
app.use('/api/auth',         authRoutes);
app.use('/api/menu',         menuRoutes);
app.use('/api/orders',       ordersRoutes);
app.use('/api/reservations', reservationsRoutes);

// ── Health check 
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 fallback 
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
