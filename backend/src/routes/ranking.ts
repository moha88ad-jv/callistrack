import { Router, Request, Response } from 'express';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/ranking
 * Returns top-50 public users sorted by points descending.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.level,
         u.points,
         (SELECT COUNT(*)::int FROM workouts WHERE user_id = u.id) AS workouts_completed,
         (SELECT COUNT(*)::int FROM spots    WHERE created_by = u.id) AS spots_created
       FROM users u
       WHERE u.is_public = TRUE
       ORDER BY u.points DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
