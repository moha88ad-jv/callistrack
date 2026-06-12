import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/users/me
 * Returns authenticated user profile with stats and recent activities.
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userRes = await pool.query(
      `SELECT id, username, email, bio, level, points, is_public, is_admin, created_at
       FROM users WHERE id = $1`,
      [req.user!.userId]
    );
    if (!userRes.rowCount) { res.status(404).json({ error: 'Nutzer nicht gefunden' }); return; }

    const statsRes = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM workouts WHERE user_id = $1) AS workouts_completed,
         (SELECT COUNT(*)::int FROM ratings  WHERE user_id = $1) AS spots_rated,
         (SELECT COUNT(*)::int FROM spots    WHERE created_by = $1) AS spots_created`,
      [req.user!.userId]
    );

    const actRes = await pool.query(
      `SELECT id, type, description, created_at
       FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user!.userId]
    );

    res.json({
      ...userRes.rows[0],
      stats: statsRes.rows[0],
      activities: actRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/users/:id
 * Public profile.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, username, bio, level, points, is_public FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rowCount || !result.rows[0].is_public) {
      res.status(404).json({ error: 'Profil nicht gefunden oder privat' }); return;
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/users/me
 * Update bio and/or visibility.
 */
router.patch('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { bio, isPublic } = req.body;
    await pool.query(
      `UPDATE users
       SET bio = COALESCE($1, bio), is_public = COALESCE($2, is_public)
       WHERE id = $3`,
      [bio ?? null, isPublic !== undefined ? isPublic : null, req.user!.userId]
    );
    res.json({ message: 'Profil aktualisiert' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
