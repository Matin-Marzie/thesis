import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Authenticated upload endpoints key by user id instead of IP - a genuine
// abuse case here is one account uploading too much, not one IP (which
// would also unfairly penalize other users behind the same NAT/WiFi).
// Falls back to the IP if req.user is somehow missing (shouldn't happen -
// verifyJWT always runs first on these routes).
const keyByUser = (req) => req.user?.id ? String(req.user.id) : ipKeyGenerator(req);

// Blunts credential brute-forcing. Kept relatively low - legitimate login
// 10 attempts every 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts.\nYou have reached the limit.\nPlease try again later.' },
});

// Higher ceiling than login - legitimate multi-device silent refreshing (access tokens expire hourly) is expected traffic here. 
// This mainly guards against reuse-detection-triggering probing / abuse of a leaked refresh token, not normal usage.
// 30 attempts every 15 minutes
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many refresh attempts.\nYou have reached the limit.\nPlease try again later.' },
});

// Both send-code and forgot-password already enforce a 60s per-email resend
// cooldown in their controllers (keyed by the email itself, regardless of
// source IP), so repeatedly targeting one victim is already blocked. What
// these limiters guard against instead is one IP cycling through many
// different target emails quickly - each request sends a real email, so
// unlimited use here is a spam/cost/reputation risk, not just noise.
export const sendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification code requests.\nYou have reached the limit.\nPlease try again later.' },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests.\nYou have reached the limit.\nPlease try again later.' },
});

// These two verify a 6-digit code (1M possibilities). Each code already has
// its own 5-wrong-attempts cap (see PasswordResetCode.js), so guessing one
// specific code is already infeasible - this limiter's job is capping the
// rate of guesses/requests an IP can throw at the endpoint itself, same
// risk class as login.
export const verifyResetCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts.\nYou have reached the limit.\nPlease try again later.' },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts.\nYou have reached the limit.\nPlease try again later.' },
});

// Video upload + ffmpeg transcoding is by far the most CPU/disk/bandwidth
// expensive thing this server does (up to 100MB per file). Placed before
// the multer middleware on its route so an over-limit request is rejected
// before spending any bandwidth/disk on the upload body itself.
// 10 uploads per hour for a single user
export const createReelLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUser,
  message: { message: 'Too many reel uploads.\nYou have reached the limit.\nYou can upload 10 reels per hour.\nPlease try again later.' },
});

// Cheaper than video (5MB, no transcoding), but still a disk write worth capping.
export const profilePictureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUser,
  message: { message: 'Too many profile picture uploads.\nYou have reached the limit.\nYou can upload 10 profile pictures per 15 minutes.\nPlease try again later.' },
});

// No auth required and no LIMIT on the underlying query - each call returns
// a whole language's dictionary. A real client fetches this rarely (on
// language select/switch), so this mainly guards against scraping the full
// word list or hammering a heavy, unauthenticated query.
export const dictionaryLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many dictionary requests.\nYou have reached the limit.\nPlease try again later.' },
});

// No auth required. A language's alphabet is small (tens of rows, not
// thousands like the dictionary), so this stays far more permissive than
// dictionaryLimiter - it just guards against scripted scraping/hammering.
// 20 requests per 15 minutes per IP
export const lettersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many letters requests.\nYou have reached the limit.\nPlease try again later.' },
});

// No auth required. A short, fixed curated list (~45 videos), fetched once
// per app open rather than per-item, so this stays generous like
// lettersLimiter - it just guards against scripted scraping/hammering.
// 20 requests per 15 minutes per IP
export const videosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many video requests.\nYou have reached the limit.\nPlease try again later.' },
});

// Public, no-auth endpoint (see feedback.html) - keyed by IP since there's
// no user to key by. Generous enough for a real person submitting feedback,
// tight enough to blunt spam/abuse of the open form.
// 5 submissions per hour per IP
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many feedback submissions.\nYou have reached the limit.\nPlease try again later.' },
});
