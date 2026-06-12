import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter     from './routes/auth';
import spotsRouter    from './routes/spots';
import workoutsRouter from './routes/workouts';
import ratingsRouter  from './routes/ratings';
import usersRouter    from './routes/users';
import rankingRouter  from './routes/ranking';
import pool           from './db/pool';

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',');
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/spots',    spotsRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/ratings',  ratingsRouter);
app.use('/api/users',    usersRouter);
app.use('/api/ranking',  rankingRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e: any) {
    res.status(503).json({ status: 'error', db: e.message });
  }
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 CallisTrack API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    // Verify DB connection on startup
    pool.query('SELECT COUNT(*) FROM users')
      .then(r => console.log(`   DB: ✅ Connected (${r.rows[0].count} users)`))
      .catch(e => console.error(`   DB: ❌ ${e.message}`));
  });
}

export default app;
