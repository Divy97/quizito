import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getClient } from '../utils/database.js';
import { sendUnauthorized } from '../utils/response.js';
import { User } from '../types/api.js';

interface JwtPayload {
  id: string;
}

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface User {
      id: string;
      google_id: string;
      email: string;
      username: string;
      avatar_url: string;
      created_at: Date;
      updated_at: Date;
    }
    interface Request {
      user?: User;
    }
  }
}

// Strict authentication - requires valid token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      sendUnauthorized(res, 'Authentication required: No token provided');
      return;
    }

    const user = await verifyToken(token);
    if (!user) {
      sendUnauthorized(res, 'Invalid or expired token');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Authentication failed');
  }
};

// Soft authentication - doesn't fail if no token
export const softAuthenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next(); // No token, proceed without user
    }

    const user = await verifyToken(token);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Invalid token, but we don't fail the request
    console.warn('Invalid token encountered during soft authentication');
  }
  
  next();
};

// Helper function to extract token from request
const extractToken = (req: Request): string | null => {
  // Check cookies first
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  
  // Check Authorization header
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
  }
  
  return null;
};

// Helper function to verify JWT token
const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const client = await getClient();
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as User;
    } finally {
      client.release();
    }
  } catch (error) {
    return null;
  }
}; 