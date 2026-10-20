const { rateLimit } = require("express-rate-limit");

// Limits on the login and register routes, per IP address, so passwords
// can't be guessed endlessly. Counts are kept in memory: on Vercel each
// running instance keeps its own, so this slows guessing down rather than
// setting an exact limit.

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

// Failed logins only - a user who keeps logging in successfully is fine.
const LOGIN_ATTEMPTS_PER_15_MINUTES = 10;
const REGISTRATIONS_PER_HOUR = 5;

const tooManyRequests = (message) => ({ ok: false, message });

exports.loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: LOGIN_ATTEMPTS_PER_15_MINUTES,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooManyRequests(
    "Too many login attempts. Please try again in 15 minutes."
  ),
});

exports.registerLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: REGISTRATIONS_PER_HOUR,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooManyRequests(
    "Too many accounts created. Please try again later."
  ),
});
