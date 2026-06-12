import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';

const SALT_ROUNDS = 10;
const POINTS_PER_LEVEL = 500;

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Validates email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates password strength:
 * min 8 chars, at least one uppercase, one digit, one special char.
 */
export function isValidPassword(pw: string): boolean {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

/**
 * Calculates level from total points.
 * Level = floor(points / POINTS_PER_LEVEL) + 1, capped at 20.
 */
export function calcLevel(points: number): number {
  return Math.min(20, Math.floor(points / POINTS_PER_LEVEL) + 1);
}

/**
 * Registers a new user.
 * Throws if email already taken or validation fails.
 */
export async function registerUser(input: RegisterInput) {
  if (!isValidEmail(input.email)) throw new Error('Ungültige E-Mail-Adresse');
  if (!isValidPassword(input.password)) {
    throw new Error('Passwort muss mindestens 8 Zeichen, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw new Error('E-Mail bereits vergeben');
  }

  const hash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, email_verified)
     VALUES ($1, $2, $3, TRUE)
     RETURNING id, username, email, level, points, is_public`,
    [input.username.trim(), input.email.toLowerCase(), hash]
  );
  return result.rows[0];
}

/**
 * Logs in a user. Returns a signed JWT on success.
 */
export async function loginUser(input: LoginInput): Promise<{ token: string; user: object }> {
  const result = await pool.query(
    'SELECT id, username, email, password_hash, level, points, is_public, is_admin FROM users WHERE email = $1',
    [input.email.toLowerCase()]
  );
  if (result.rowCount === 0) {
    console.error(`[LOGIN] User not found: ${input.email.toLowerCase()}`);
    throw new Error('E-Mail oder Passwort falsch');
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(input.password, user.password_hash);
  if (!match) {
    console.error(`[LOGIN] Password mismatch for ${input.email}`);
    console.error(`[DEBUG] Hash in DB: ${user.password_hash.substring(0, 10)}...`);
    throw new Error('E-Mail oder Passwort falsch');
  }
  
  console.log(`[LOGIN] ✅ Successful login: ${input.email}`);

  const token = jwt.sign(
    { userId: user.id, isAdmin: user.is_admin },
    process.env.JWT_SECRET ?? 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
  );

  const { password_hash, ...safeUser } = user;
  return { token, user: safeUser };
}

/**
 * Deletes all personal data for a user (DSGVO Article 17).
 * Cascades via FK constraints in the DB.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}
