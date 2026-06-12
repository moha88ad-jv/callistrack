import pool from '../db/pool';

export interface CreateSpotInput {
  name: string;
  description?: string;
  address?: string;
  lat: number;
  lng: number;
  equipment: string[];
  userId: string;
}

const DUPLICATE_RADIUS_M = 20; // metres

/**
 * Calculates the distance in metres between two lat/lng pairs
 * using the Haversine formula.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns nearby spots within DUPLICATE_RADIUS_M of the given coordinates.
 */
export async function findNearbySpots(lat: number, lng: number): Promise<object[]> {
  // We use a simple bounding-box pre-filter then exact haversine in JS
  // (avoids PostGIS dependency while still being correct for small radii)
  const deltaLat = DUPLICATE_RADIUS_M / 111_320;
  const deltaLng = DUPLICATE_RADIUS_M / (111_320 * Math.cos((lat * Math.PI) / 180));

  const result = await pool.query(
    `SELECT id, name, lat, lng FROM spots
     WHERE lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4
       AND status != 'archived'`,
    [lat - deltaLat, lat + deltaLat, lng - deltaLng, lng + deltaLng]
  );

  return result.rows.filter(
    (s: { lat: number; lng: number }) =>
      haversineDistance(lat, lng, s.lat, s.lng) <= DUPLICATE_RADIUS_M
  );
}

/**
 * Returns all non-archived spots, filtered by optional equipment list.
 */
export async function getAllSpots(equipmentFilter?: string[]) {
  if (equipmentFilter && equipmentFilter.length > 0) {
    const result = await pool.query(
      `SELECT s.*, COALESCE(AVG(r.stars), 0)::float AS rating
       FROM spots s
       LEFT JOIN ratings r ON r.spot_id = s.id
       WHERE s.status != 'archived'
         AND s.equipment && $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [equipmentFilter]
    );
    return result.rows;
  }
  const result = await pool.query(
    `SELECT s.*, COALESCE(AVG(r.stars), 0)::float AS rating
     FROM spots s
     LEFT JOIN ratings r ON r.spot_id = s.id
     WHERE s.status != 'archived'
     GROUP BY s.id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
}

/**
 * Returns a single spot with its ratings.
 */
export async function getSpotById(id: string) {
  const spotResult = await pool.query(
    `SELECT s.*, COALESCE(AVG(r.stars), 0)::float AS rating
     FROM spots s
     LEFT JOIN ratings r ON r.spot_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [id]
  );
  if (spotResult.rowCount === 0) return null;

  const ratingsResult = await pool.query(
    `SELECT r.id, r.stars, r.comment, r.created_at,
            u.username
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.spot_id = $1
     ORDER BY r.created_at DESC`,
    [id]
  );

  return { ...spotResult.rows[0], ratings: ratingsResult.rows };
}

/**
 * Creates a new spot. Checks for duplicates first.
 */
export async function createSpot(input: CreateSpotInput) {
  const nearby = await findNearbySpots(input.lat, input.lng);
  if (nearby.length > 0) {
    const warning = { duplicateWarning: true, nearbySpots: nearby };
    throw Object.assign(new Error('Möglicher Duplikat-Spot in der Nähe gefunden'), warning);
  }

  const result = await pool.query(
    `INSERT INTO spots (name, description, address, lat, lng, equipment, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'user-created', $7)
     RETURNING *`,
    [input.name, input.description ?? null, input.address ?? null,
     input.lat, input.lng, input.equipment, input.userId]
  );
  return result.rows[0];
}

/**
 * Admin: set spot status (validate / reject).
 */
export async function moderateSpot(spotId: string, action: 'validate' | 'reject') {
  const status = action === 'validate' ? 'validated' : 'archived';
  const result = await pool.query(
    `UPDATE spots SET status = $1 WHERE id = $2 RETURNING *`,
    [status, spotId]
  );
  return result.rows[0] ?? null;
}
