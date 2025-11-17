/**
 * Rate limiting for AI API calls and sensitive operations
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  // AI generation: 10 requests per minute per user
  aiGeneration: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // Chat messages: 30 per minute per user
  chatMessages: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
  // Brand creation: 5 per hour per user
  brandCreation: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Project creation: 20 per hour per user
  projectCreation: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  },
  // Export: 20 per hour per user
  export: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  },
};

/**
 * Check if request is rate limited
 * Returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  userId: string,
  operation: keyof typeof RATE_LIMITS
): { allowed: boolean; resetIn?: number } {
  const config = RATE_LIMITS[operation];
  const key = `${userId}:${operation}`;
  const now = Date.now();

  // Get or create entry
  let entry = rateLimitStore.get(key);

  // Reset if window has passed
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Check limit
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      resetIn: Math.ceil((entry.resetTime - now) / 1000), // seconds
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return { allowed: true };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Get remaining requests for a user and operation
 */
export function getRemainingRequests(
  userId: string,
  operation: keyof typeof RATE_LIMITS
): { remaining: number; resetIn: number } {
  const config = RATE_LIMITS[operation];
  const key = `${userId}:${operation}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    return {
      remaining: config.maxRequests,
      resetIn: 0,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

