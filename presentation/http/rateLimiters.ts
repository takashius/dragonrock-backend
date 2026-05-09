import rateLimit from "express-rate-limit";
import config from "../../config.js";

export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimitLoginWindowMs,
  max: config.rateLimitLoginMax,
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitivePublicRateLimiter = rateLimit({
  windowMs: config.rateLimitSensitiveWindowMs,
  max: config.rateLimitSensitiveMax,
  standardHeaders: true,
  legacyHeaders: false,
});
