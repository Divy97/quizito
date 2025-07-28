import { Response } from 'express';
import { ApiResponse } from '../types/api.js';

// Success response helper
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  res.status(statusCode).json(response);
};

// Error response helper
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500
): void => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  res.status(statusCode).json(response);
};

// Validation error response helper
export const sendValidationError = (
  res: Response,
  errors: Record<string, string[]>
): void => {
  const response: ApiResponse = {
    success: false,
    error: 'Validation failed',
    data: { errors },
  };
  res.status(400).json(response);
};

// Not found response helper
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  sendError(res, message, 404);
};

// Unauthorized response helper
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, 401);
};

// Forbidden response helper
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendError(res, message, 403);
}; 