import pool from '../db/pool';

/** Points awarded per action */
export const POINTS = {
  WORKOUT:     10,
  RATING:       5,
  SPOT_CREATED: 20,
} as const;

/** Points needed to reach each level (cumulative) */
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

/**
 * Returns the level for a given points total.
 * Level 1 = 0 pts, Level 2 = 100 pts, ..., Level 10 = 4500 pts.
 * Above max threshold the level keeps incrementing every 1000 pts.
 */
export function calcLevel(points: number): number {
  for (let lvl = LEVEL_THRESHOLDS.length - 1; lvl >= 0; lvl--) {
    if (points >= LEVEL_THRESHOLDS[lvl]) {
      return lvl + 1;
    }
  }
  return 1;
}

/**
 * Awards points to a user and recalculates level.
 * Returns the updated { points, level } values.
 */
export async function awardPoints(
  userId: string,
  action: keyof typeof POINTS
): Promise<{ points: number; level: number; levelUp: boolean }> {
  const delta = POINTS[action];

  const result = await pool.query(
    `UPDATE users
     SET points = points + $1
     WHERE id = $2
     RETURNING points, level AS old_level`,
    [delta, userId]
  );
  if (result.rowCount === 0) throw new Error('Nutzer nicht gefunden');

  const newPoints = result.rows[0].points as number;
  const oldLevel  = result.rows[0].old_level as number;
  const newLevel  = calcLevel(newPoints);

  if (newLevel !== oldLevel) {
    await pool.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);
  }

  return { points: newPoints, level: newLevel, levelUp: newLevel > oldLevel };
}

/**
 * Returns the top-N users sorted by points descending.
 */
export async function getRanking(limit = 50): Promise<object[]> {
  const result = await pool.query(
    `SELECT id, username, level, points,
            stats.workouts_completed,
            stats.spots_created
     FROM users
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS workouts_completed, 0 AS spots_created FROM workouts WHERE user_id = users.id
     ) stats ON TRUE
     WHERE is_public = TRUE
     ORDER BY points DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Calculates the average star rating for a spot.
 */
export function calcAverageRating(stars: number[]): number {
  if (stars.length === 0) return 0;
  return parseFloat((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(2));
}
