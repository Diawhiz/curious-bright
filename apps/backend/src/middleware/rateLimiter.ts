import rateLimit from 'express-rate-limit';

/**
 * Helper to format the Rate Limit headers in a human-readable way
 * and return a consistent JSON error payload.
 */
const rateLimitHandler = (req: any, res: any) => {
  res.status(429).json({
    error: 'Too many requests. Please slow down and try again later.',
    retryAfter: Math.ceil((res.getHeader('Retry-After') as number) || 60),
  });
};

// ---------------------------------------------------------------------------
// 1. GLOBAL catch-all limiter — safety net for every route
//    1000 requests per 15 minutes per IP
// ---------------------------------------------------------------------------
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// ---------------------------------------------------------------------------
// 2. AUTH routes — tightest limits to prevent brute-force & credential stuffing
//    - /auth/login   → 10 per 15 min
//    - /auth/register → 5 per hour
// ---------------------------------------------------------------------------
export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts toward the cap
  handler: rateLimitHandler,
});

export const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 3. FILE UPLOAD — prevent S3/MinIO bandwidth abuse
//    - presigned URL generation: 20 per 10 min
//    - ingestion trigger: 3 per hour (admin action)
// ---------------------------------------------------------------------------
export const uploadUrlLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const bookIngestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 4. BOOK READ — prevents origin file scraping / bandwidth hammering
//    50 book-read requests per 15 minutes per IP
// ---------------------------------------------------------------------------
export const bookReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 5. SEARCH — prevent typesense CPU abuse
//    60 searches per minute per IP
// ---------------------------------------------------------------------------
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 6. SUBMISSIONS — protect against spam submissions
//    5 submissions per hour per IP
// ---------------------------------------------------------------------------
export const submissionCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 7. REPORTS — prevent report spam
//    10 reports per hour per IP
// ---------------------------------------------------------------------------
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 8. ROOMS — prevent room creation spam
//    20 room creations / joins per 10 minutes per IP
// ---------------------------------------------------------------------------
export const roomActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 9. MODERATOR APPLICATIONS — one per user anyway, but IP-level guard
//    3 per hour per IP
// ---------------------------------------------------------------------------
export const moderatorApplicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// 10. ANALYTICS — admin-only but still rate-limited to prevent hammering
//     30 per minute per IP
// ---------------------------------------------------------------------------
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
