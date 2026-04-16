const express = require("express");
const rateLimit = require("express-rate-limit");
const Coupon = require("../models/Coupon");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const router = express.Router();

const couponValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many coupon validation requests." },
});

const createCouponSchema = {
  name: { required: true, type: "string", maxLength: 100 },
  code: { required: true, type: "string", maxLength: 30 },
  type: { required: true, type: "string", enum: ["percentage", "fixed"] },
  value: { required: true, type: "number", min: 0 },
  expiresAt: { required: true, type: "string" },
  maxUses: { type: "number", min: 1 },
  country: { type: "string", enum: ["india", "canada", "both"] },
};

const validateCouponSchema = {
  code: { required: true, type: "string" },
  collection: { required: true, type: "string", enum: ["social-cuts", "signature-cuts"] },
  quantity: { type: "number", min: 1 },
  country: { type: "string", enum: ["india", "canada"] },
};

const UNIT_PRICES = {
  india: {
    "social-cuts": 2999,
    "signature-cuts": 4999,
  },
  canada: {
    "social-cuts": 79.99,
    "signature-cuts": 149.99,
  },
};

// GET /api/coupons — Admin: list all coupons
router.get("/", requireAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ coupons });
  } catch (error) {
    console.error("List coupons error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/coupons — Admin: create coupon
router.post("/", requireAuth, validate(createCouponSchema), async (req, res) => {
  try {
    const { name, code, type, value, expiresAt, maxUses, country } = req.body;

    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      return res.status(400).json({ error: "Invalid expiry date" });
    }

    if (expiryDate <= new Date()) {
      return res.status(400).json({ error: "Expiry date must be in the future" });
    }

    const coupon = await Coupon.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      value,
      expiresAt: expiryDate,
      maxUses: maxUses || 100,
      country: country || "both",
    });

    res.status(201).json({ coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "A coupon with this code already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: "Validation failed", details: messages });
    }
    console.error("Create coupon error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/coupons/:id — Admin: delete coupon
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid coupon ID" });
    }
    console.error("Delete coupon error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/coupons/validate — Public: validate coupon code
router.post("/validate", couponValidateLimiter, validate(validateCouponSchema), async (req, res) => {
  try {
    const { code, collection, quantity, country } = req.body;
    const userCountry = country || "india";

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    if (coupon.expiresAt <= new Date()) {
      return res.status(400).json({ error: "This coupon has expired" });
    }

    if (coupon.usageCount >= coupon.maxUses) {
      return res.status(400).json({ error: "This coupon has reached its usage limit" });
    }

    // Check country eligibility
    if (coupon.country !== "both" && coupon.country !== userCountry) {
      return res.status(400).json({ error: "This coupon is not valid for your region" });
    }

    const countryPrices = UNIT_PRICES[userCountry] || UNIT_PRICES.india;
    const unitPrice = countryPrices[collection];
    const qty = quantity && quantity >= 1 ? Math.floor(quantity) : 1;
    const originalPrice = unitPrice * qty;

    let discountAmount;
    if (coupon.type === "percentage") {
      discountAmount = userCountry === "india"
        ? Math.round((originalPrice * coupon.value) / 100)
        : parseFloat(((originalPrice * coupon.value) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(coupon.value, originalPrice);
      if (userCountry === "canada") {
        discountAmount = parseFloat(discountAmount.toFixed(2));
      }
    }

    const finalPrice = parseFloat((originalPrice - discountAmount).toFixed(userCountry === "canada" ? 2 : 0));

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
      },
      originalPrice,
      discountAmount,
      finalPrice,
    });
  } catch (error) {
    console.error("Validate coupon error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
