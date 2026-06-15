import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/news
 * Returns all news articles.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.username AS author
       FROM news n
       LEFT JOIN users u ON u.id = n.created_by
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/news
 * Create news. Admin only.
 */
router.post('/',
  authenticate,
  requireAdmin,
  [
    body('title').trim().isLength({ min: 2, max: 200 }),
    body('excerpt').notEmpty(),
    body('category').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const result = await pool.query(
        `INSERT INTO news (title, excerpt, category, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.body.title, req.body.excerpt, req.body.category, req.user!.userId]
      );
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * DELETE /api/news/:id
 * Delete news. Admin only.
 */
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: 'News gelöscht' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
