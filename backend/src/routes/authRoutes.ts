import { Router, Request, Response } from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

const router = Router();

// Placeholder for the user type. This should match the one in the middleware.
interface User {
  id: string;
}

// 1. Initiates the Google OAuth2 flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Google redirects here after successful authentication
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    if (!req.user) {
      logger.error('Authentication failed: No user object in request after Google callback.');
      res.status(401).json({ message: 'Authentication failed' });
      return;
    }
    // User is authenticated, create JWT
    const user = req.user as User;
    logger.info({ userId: user.id }, 'User authenticated successfully via Google. Creating JWT.');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    // Set JWT in a secure, HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 24 * 60 * 60 * 1000, 
    });

    // Redirect to the frontend application
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// 3. A protected route to get the current user's information
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  logger.info({ userId: req.user?.id }, 'User data requested for /me endpoint.');
  res.json(req.user);
});

// 4. Logout route
router.post('/logout', (req: Request, res: Response) => {
  logger.info('User logging out.');
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router; 