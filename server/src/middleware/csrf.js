const { doubleCsrf } = require("csrf-csrf");

const isProd = process.env.NODE_ENV === "production";

const {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () =>
    process.env.CSRF_SECRET || process.env.JWT_SECRET || "dev-csrf-secret",
  getSessionIdentifier: (req) => req.ip + (req.headers["user-agent"] || ""),
  cookieName: isProd ? "__Host-csrf" : "csrf-token",
  cookieOptions: {
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    httpOnly: true,
    path: "/",
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

module.exports = {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
};
