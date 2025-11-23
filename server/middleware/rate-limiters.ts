import rateLimit from 'express-rate-limit';
import { securityLogger } from '../utils/security-logger.js';

export const publicBrandingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
  handler: (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    securityLogger.rateLimitExceeded('/system/public-branding', ip);
    res.status(429).json({ 
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 60
    });
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many upload requests, please try again later.' },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    securityLogger.rateLimitExceeded('/system/upload-logo', ip);
    res.status(429).json({ 
      message: 'Too many upload requests, please try again later.',
      retryAfter: 900
    });
  },
});
