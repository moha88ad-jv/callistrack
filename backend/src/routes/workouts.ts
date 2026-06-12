import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { awardPoints } from '../services/gamificationService';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/workouts/my
 * Returns workouts for the authenticated user.
 */
router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT w.*, json_agg(json_build_object('id', e.id, 'name', e.name, 'reps', e.reps, 'sets', e.sets)) AS exercises
     FROM workouts w
     LEFT JOIN exercises e ON e.workout_id = w.id
     WHERE w.user_id = $1
     GROUP BY w.id
     ORDER BY w.created_at DESC`,
    [req.user!.userId]
  );
  res.json(result.rows);
});

/**
 * POST /api/workouts
 * Body: { spotId?, title, durationSec?, notes?, exercises: [{name, reps, sets}] }
 */
router.post(
  '/',
  authenticate,
  [
    body('exercises').isArray({ min: 1 }).withMessage('Mindestens eine Übung erforderlich'),
    body('exercises.*.name').notEmpty().withMessage('Übungsname darf nicht leer sein'),
    body('exercises.*.reps').isInt({ min: 1 }),
    body('exercises.*.sets').isInt({ min: 1 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const wRes = await client.query(
        `INSERT INTO workouts (user_id, spot_id, title, duration_sec, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user!.userId, req.body.spotId ?? null, req.body.title ?? null,
         req.body.durationSec ?? null, req.body.notes ?? null]
      );
      const workout = wRes.rows[0];

      for (const ex of req.body.exercises) {
        await client.query(
          'INSERT INTO exercises (workout_id, name, reps, sets) VALUES ($1,$2,$3,$4)',
          [workout.id, ex.name, ex.reps, ex.sets]
        );
      }

      await client.query('COMMIT');

      // Award points & log outside of transaction
      const { points, level, levelUp } = await awardPoints(req.user!.userId, 'WORKOUT');
      await pool.query(
        'INSERT INTO activities (user_id, type, description, ref_id) VALUES ($1,$2,$3,$4)',
        [req.user!.userId, 'workout', `Workout "${req.body.title ?? 'Workout'}" geloggt`, workout.id]
      );

      res.status(201).json({ workout, points, level, levelUp });
    } catch (err: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

export default router;
