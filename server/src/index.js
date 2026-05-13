require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const couponRoutes = require("./routes/coupons");
const transactionRoutes = require("./routes/transactions");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

// Trust proxy (required for correct client IP behind reverse proxy, rate limiting & HTTPS detection)
app.set("trust proxy", 1);

// HTTPS enforcement in production
if (isProd) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Security headers with custom CSP for Razorpay
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://lumberjack.razorpay.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Global rate limiter — 100 req per 15min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", globalLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TEMP: debug URI on Vercel — REMOVE after debugging
app.get("/api/debug-uri", (req, res) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return res.json({ set: false });
  try {
    const u = new URL(uri.replace("mongodb+srv://", "https://"));
    res.json({
      set: true,
      length: uri.length,
      host: u.hostname,
      user: u.username,
      passwordLength: u.password.length,
      db: u.pathname,
    });
  } catch (e) {
    res.json({ set: true, parseError: e.message, length: uri.length });
  }
});

// TEMP: try connecting from Vercel and return the real error — REMOVE after debugging
app.get("/api/debug-connect", async (req, res) => {
  const dns = require("dns").promises;
  const { MongoClient } = require("mongodb");
  const uri = process.env.MONGODB_URI;
  const result = { node: process.version, region: process.env.VERCEL_REGION || "unknown" };

  try {
    const u = new URL(uri.replace("mongodb+srv://", "https://"));
    result.host = u.hostname;
    try {
      const srv = await dns.resolveSrv(`_mongodb._tcp.${u.hostname}`);
      result.srv = srv.map(r => `${r.name}:${r.port}`);
    } catch (e) {
      result.srvError = `${e.code || ""} ${e.message}`;
    }
  } catch (e) {
    result.urlParseError = e.message;
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db().admin().ping();
    result.connect = "OK";
  } catch (e) {
    result.connect = "FAIL";
    result.errorName = e.name;
    result.errorMessage = e.message;
    result.errorCode = e.code;
    if (e.cause) result.errorCause = String(e.cause).slice(0, 500);
    if (e.reason) {
      result.errorReason = {
        type: e.reason.type,
        servers: e.reason.servers ? Array.from(e.reason.servers.entries()).map(([h, s]) => ({
          host: h,
          type: s.type,
          error: s.error ? String(s.error).slice(0, 300) : null,
        })) : null,
      };
    }
  } finally {
    try { await client.close(); } catch {}
  }

  res.json(result);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Connect to DB (mongoose caches the connection across serverless invocations)
connectDB();

// For local development, start the HTTP server
if (!isProd) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (development)`);
  });
}

module.exports = app;
