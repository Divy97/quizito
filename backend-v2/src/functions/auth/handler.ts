import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { corsMiddleware } from '../../shared/middleware/cors.js';
import { sendSuccess, sendError } from '../../shared/utils/response.js';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { getClient } from '../../shared/utils/database.js';
import { User } from '../../shared/types/api.js';

// Initialize passport
import '../../shared/config/passport.js';

const app = express();
const logger = createFunctionLogger('auth-service');

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy', service: 'auth-service' });
});

// Initiates the Google OAuth2 flow
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google redirects here after successful authentication
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    logger.info('Google callback reached', { user: req.user });
    
    if (!req.user) {
      logger.error('Authentication failed: No user object in request after Google callback');
      sendError(res, 'Authentication failed', 401);
      return;
    }

    try {
      // User is authenticated, create JWT
      const user = req.user as User;
      logger.info({ userId: user.id }, 'User authenticated successfully via Google. Creating JWT.');

      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET is not set');
        sendError(res, 'Internal server error', 500);
        return;
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
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

      logger.info('Setting cookie with options', cookieOptions);
      res.cookie('token', token, cookieOptions);

      // Redirect to the frontend application with the token as a query parameter
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      logger.error('Error in Google callback', error);
      sendError(res, 'Authentication failed', 500);
    }
  }
);

// get the current user's information
app.get('/auth/me', async (req, res) => {
  try {
    // Get the token from the request
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      sendError(res, 'No token provided', 401);
      return;
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not set');
      sendError(res, 'Internal server error', 500);
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    const client = await getClient();
    
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length === 0) {
        sendError(res, 'User not found', 404);
        return;
      }
      
      sendSuccess(res, result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error in /me endpoint', error);
    sendError(res, 'Invalid token', 403);
  }
});

// Logout route
app.post('/auth/logout', (_req, res) => {
  logger.info('User logging out');
  res.clearCookie('token');
  sendSuccess(res, { message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response) => {
  logger.error('Unhandled error in auth service', { error: err.message, stack: err.stack });
  sendError(res, 'Internal server error', 500);
});

// 404 handler
app.use('*', (_req, res) => {
  sendError(res, 'Route not found', 404);
});

export const handler = serverless(app); 