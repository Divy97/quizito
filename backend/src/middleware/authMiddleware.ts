import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import dotenv from 'dotenv';


dotenv.config();

interface JwtPayload {
  id: string;
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface User {
      id: string;
      google_id: string;
      email: string;
      username: string;
      avatar_url: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const token = req.cookies.token;
  console.log('token',token)
  if (!token) {
    res.status(401).json({ message: 'Authentication required: No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * A middleware that tries to authenticate a user but does not fail if authentication is not possible.
 * If a valid JWT is present, it attaches the user to the request object (req.user).
 * If no token is present or the token is invalid, it simply proceeds without a user object.
 * This is useful for public endpoints that have optional authentication.
 */

export const softAuthenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    return next(); // No token, proceed without a user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (rows.length > 0) {
      req.user = rows[0]; // Attach user if found
    }
  } catch (error) {
    // Invalid token, but we don't fail the request.
    // We just proceed without a user.
    console.warn({ error }, 'Invalid token encountered during soft authentication. Proceeding without user.');
  }
  
  next();
}; 