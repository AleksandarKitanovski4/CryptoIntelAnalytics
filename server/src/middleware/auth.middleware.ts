import { Request, Response, NextFunction } from 'express';

// Simple authentication middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];

  // Check if API key matches the one in environment variables
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
} 