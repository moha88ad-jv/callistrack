import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/posts/:communityId
 * Returns all posts for a community.
 */
router.get('/:communityId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username,
        COUNT(pl.user_id)::int AS likes,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) AS is_liked
       FROM community_posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       WHERE p.community_id = $2
       GROUP BY p.id, u.username
       ORDER BY p.created_at DESC`,
      [req.user!.userId, req.params.communityId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/posts/:communityId
 * Create a post in a community.
 */
router.post('/:communityId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const memberCheck = await pool.query(
      'SELECT 1 FROM community_members WHERE community_id = $1 AND user_id = $2',
      [req.params.communityId, req.user!.userId]
    );
    if (!memberCheck.rowCount) {
      res.status(403).json({ error: 'Du bist kein Mitglied dieser Community' }); return;
    }

    const result = await pool.query(
      `INSERT INTO community_posts (community_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.communityId, req.user!.userId, req.body.content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/posts/:postId/like
 * Like or unlike a post.
 */
router.post('/:postId/like', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await pool.query(
      'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [req.params.postId, req.user!.userId]
    );

    if (existing.rowCount) {
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [req.params.postId, req.user!.userId]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [req.params.postId, req.user!.userId]);
      res.json({ liked: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
