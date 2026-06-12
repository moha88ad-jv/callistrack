import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { awardPoints, calcAverageRating } from '../services/gamificationService';
import pool from '../db/pool';

const router = Router();

/**
 * POST /api/ratings
 * Body: { spotId, stars (1-5), comment? }
 */
router.post(
  '/',
  authenticate,
  [
    body('spotId').isUUID(),
    body('stars').isInt({ min: 1, max: 5 }).withMessage('Bewertung 1–5 Sterne'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const result = await pool.query(
        `INSERT INTO ratings (spot_id, user_id, stars, comment)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (spot_id, user_id) DO UPDATE SET stars = $3, comment = $4
         RETURNING *`,
        [req.body.spotId, req.user!.userId, req.body.stars, req.body.comment ?? null]
      );

      // Recalculate average
      const allStars = await pool.query('SELECT stars FROM ratings WHERE spot_id = $1', [req.body.spotId]);
      const avg = calcAverageRating(allStars.rows.map((r: { stars: number }) => r.stars));

      // Award points
      const { points, level, levelUp } = await awardPoints(req.user!.userId, 'RATING');

      const spot = await pool.query('SELECT name FROM spots WHERE id = $1', [req.body.spotId]);
      const spotName = spot.rows[0]?.name ?? 'Spot';
      await pool.query(
        'INSERT INTO activities (user_id, type, description, ref_id) VALUES ($1,$2,$3,$4)',
        [req.user!.userId, 'rating', `${spotName} bewertet (${req.body.stars}★)`, req.body.spotId]
      );

      res.status(201).json({ rating: result.rows[0], newAverage: avg, points, level, levelUp });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
