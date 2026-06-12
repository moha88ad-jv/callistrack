import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { registerUser, loginUser, deleteAccount } from '../services/authService';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username 3–50 Zeichen'),
    body('email').isEmail().withMessage('Ungültige E-Mail'),
    body('password').isLength({ min: 8 }).withMessage('Passwort min. 8 Zeichen'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const user = await registerUser(req.body);
      res.status(201).json({ message: 'Registrierung erfolgreich', user });
    } catch (err: any) {
      res.status(409).json({ error: err.message });
    }
  }
);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const result = await loginUser(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
);

/**
 * DELETE /api/auth/account
 * Deletes the authenticated user's account (DSGVO Art. 17).
 */
router.delete('/account', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteAccount(req.user!.userId);
    res.json({ message: 'Account und alle personenbezogenen Daten wurden gelöscht' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
