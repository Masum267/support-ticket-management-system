
import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
} from "../controllers/authController.js";

const router = express.Router();

// User Account Based Login Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,

  limit: 5,

  // Identify users by email instead of IP address
  keyGenerator: (req) => {
    return String(req.body?.email || "unknown")
      .trim()
      .toLowerCase();
  },

  // Successful login attempts will not count
  skipSuccessfulRequests: true,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many failed login attempts for this account. Please try again after 5 minutes.",
  },
});

// Register
router.post("/register", register);

// Login
router.post("/login", loginLimiter, login);

export default router;
