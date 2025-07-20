import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100');
const WINDOW_MS = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'); // 15 minutes

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const userRequests = requestCounts.get(ip);
  
  if (!userRequests || now > userRequests.resetTime) {
    // First request or window expired
    requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    next();
    return;
  }
  
  if (userRequests.count >= MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
    return;
  }
  
  // Increment request count
  userRequests.count++;
  requestCounts.set(ip, userRequests);
  next();
}; 