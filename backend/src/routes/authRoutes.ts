import { Router, Request, Response } from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';


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
    console.log('--- Google Callback Reached ---');
    console.log('User object from Passport:', req.user);
    if (!req.user) {
      console.error('Authentication failed: No user object in request after Google callback.');
      res.status(401).json({ message: 'Authentication failed' });
      return;
    }
    // User is authenticated, create JWT
    const user = req.user as User;
    console.log({ userId: user.id }, 'User authenticated successfully via Google. Creating JWT.');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    // Set JWT in a secure, HttpOnly cookie
    const isSecureConnection = (process.env.FRONTEND_URL || '').startsWith('https://');

    const cookieOptions = {
      httpOnly: true,
      secure: isSecureConnection,
      sameSite: (isSecureConnection ? 'none' : 'lax') as 'lax' | 'strict' | 'none' | undefined,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    console.log('Setting cookie with options:', cookieOptions);
    res.cookie('token', token, cookieOptions);

    // Redirect to the frontend application with the token as a query parameter
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// 3. A protected route to get the current user's information
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  console.log("in /me")
  res.json(req.user);
});

// 4. Logout route
router.post('/logout', (req: Request, res: Response) => {
  console.log('User logging out.');
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router; 