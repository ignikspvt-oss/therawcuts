const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");
const validate = require("../middleware/validate");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many refresh requests." },
});

const loginSchema = {
  email: { required: true, type: "string", pattern: /^\S+@\S+\.\S+$/ },
  password: { required: true, type: "string", minLength: 6 },
};

const refreshSchema = {
  refreshToken: { required: true, type: "string" },
};

const ACCESS_TTL = "1h";
const REFRESH_TTL = "7d";

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}-refresh`;

const signTokens = (adminId) => {
  const accessToken = jwt.sign({ id: adminId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
  });
  const refreshToken = jwt.sign({ id: adminId, type: "refresh" }, getRefreshSecret(), {
    expiresIn: REFRESH_TTL,
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = signTokens(admin._id);

    res.json({
      token: accessToken,
      refreshToken,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/refresh — Exchange refresh token for new access token
router.post("/refresh", refreshLimiter, validate(refreshSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret());
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    const { accessToken, refreshToken: newRefreshToken } = signTokens(admin._id);

    res.json({
      token: accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
