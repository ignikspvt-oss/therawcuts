const xss = require("xss");

const xssOptions = {
  whiteList: {}, // disallow all tags
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
};

const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    let value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null || value === "") continue;

    if (rules.type === "string" && typeof value !== "string") {
      errors.push(`${field} must be a string`);
      continue;
    }

    // Sanitize string inputs to prevent XSS
    if (rules.type === "string" && typeof value === "string") {
      value = xss(value, xssOptions);
      req.body[field] = value;
    }

    if (rules.type === "number" && (typeof value !== "number" || isNaN(value))) {
      errors.push(`${field} must be a number`);
      continue;
    }

    if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
      errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
    }

    if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
    }

    if (rules.min !== undefined && typeof value === "number" && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};

module.exports = validate;
