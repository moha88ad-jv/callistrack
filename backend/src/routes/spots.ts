import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { getAllSpots, getSpotById, createSpot, moderateSpot } from '../services/spotService';
import { awardPoints } from '../services/gamificationService';
import { authenticate, requireAdmin } from '../middleware/auth';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/spots
 * Query: ?equipment=Klimmzugstange,Barren
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const eq = req.query.equipment as string | undefined;
  const filter = eq ? eq.split(',').map((e) => e.trim()) : undefined;
  const spots = await getAllSpots(filter);
  res.json(spots);
});

/**
 * GET /api/spots/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const spot = await getSpotById(req.params.id);
  if (!spot) { res.status(404).json({ error: 'Spot nicht gefunden' }); return; }
  res.json(spot);
});

/**
 * POST /api/spots
 * Creates a new spot. Auth required.
 */
router.post(
  '/',
  authenticate,
  [
    body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name 2–150 Zeichen'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Ungültige Breite'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Ungültige Länge'),
    body('equipment').isArray({ min: 1 }).withMessage('Mindestens ein Equipment-Eintrag'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const spot = await createSpot({ ...req.body, userId: req.user!.userId });
      // Award points
      await awardPoints(req.user!.userId, 'SPOT_CREATED');
      // Log activity
      await pool.query(
        'INSERT INTO activities (user_id, type, description, ref_id) VALUES ($1,$2,$3,$4)',
        [req.user!.userId, 'spot', `Neuen Spot "${spot.name}" erstellt`, spot.id]
      );
      res.status(201).json(spot);
    } catch (err: any) {
      if (err.duplicateWarning) {
        res.status(409).json({ error: err.message, nearbySpots: err.nearbySpots, duplicateWarning: true });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * PATCH /api/spots/:id/moderate
 * Admin only. Body: { action: 'validate' | 'reject' }
 */
router.patch(
  '/:id/moderate',
  authenticate,
  requireAdmin,
  [body('action').isIn(['validate', 'reject'])],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const spot = await moderateSpot(req.params.id, req.body.action);
    if (!spot) { res.status(404).json({ error: 'Spot nicht gefunden' }); return; }
    res.json(spot);
  }
);

export default router;

/**
 * PUT /api/spots/:id
 * Update a spot. Only creator or admin can edit.
 */
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, address, equipment } = req.body;
    const spotRes = await pool.query('SELECT created_by FROM spots WHERE id = $1', [req.params.id]);
    if (!spotRes.rowCount) { res.status(404).json({ error: 'Spot nicht gefunden' }); return; }

    const spot = spotRes.rows[0];
    if (spot.created_by !== req.user!.userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'Keine Berechtigung' }); return;
    }

    const result = await pool.query(
      `UPDATE spots SET name = COALESCE($1, name), description = COALESCE($2, description),
       address = COALESCE($3, address), equipment = COALESCE($4, equipment)
       WHERE id = $5 RETURNING *`,
      [name ?? null, description ?? null, address ?? null, equipment ?? null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/spots/:id
 * Delete a spot. Only creator or admin can delete.
 */
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const spotRes = await pool.query('SELECT created_by FROM spots WHERE id = $1', [req.params.id]);
    if (!spotRes.rowCount) { res.status(404).json({ error: 'Spot nicht gefunden' }); return; }

    const spot = spotRes.rows[0];
    if (spot.created_by !== req.user!.userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'Keine Berechtigung' }); return;
    }

    await pool.query('DELETE FROM spots WHERE id = $1', [req.params.id]);
    res.json({ message: 'Spot gelöscht' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/spots/:id
 * Update a spot. Only creator or admin can edit.
 */
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, address, equipment } = req.body;
    const spotRes = await pool.query('SELECT created_by FROM spots WHERE id = $1', [req.params.id]);
    if (!spotRes.rowCount) { res.status(404).json({ error: 'Spot nicht gefunden' }); return; }

    const spot = spotRes.rows[0];
    const isOwner = spot.created_by === req.user!.userId;
    const isAdmin = req.user!.isAdmin;
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Keine Berechtigung' }); return;
    }

    const result = await pool.query(
      `UPDATE spots SET name = COALESCE($1, name), description = COALESCE($2, description),
       address = COALESCE($3, address), equipment = COALESCE($4, equipment)
       WHERE id = $5 RETURNING *`,
      [name ?? null, description ?? null, address ?? null, equipment ?? null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/spots/:id
 * Delete a spot. Only creator or admin can delete.
 */
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const spotRes = await pool.query('SELECT created_by FROM spots WHERE id = $1', [req.params.id]);
    if (!spotRes.rowCount) { res.status(404).json({ error: 'Spot nicht gefunden' }); return; }

    const spot = spotRes.rows[0];
    const isOwner = spot.created_by === req.user!.userId;
    const isAdmin = req.user!.isAdmin;
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Keine Berechtigung' }); return;
    }

    await pool.query('DELETE FROM spots WHERE id = $1', [req.params.id]);
    res.json({ message: 'Spot gelöscht' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
