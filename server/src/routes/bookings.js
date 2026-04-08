const express = require("express");
const rateLimit = require("express-rate-limit");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { doubleCsrfProtection } = require("../middleware/csrf");

const router = express.Router();

const bookingCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many booking requests. Please try again later." },
});

const bookingSchema = {
  fullName: { required: true, type: "string", maxLength: 200 },
  email: { required: true, type: "string", pattern: /^\S+@\S+\.\S+$/ },
  phone: { type: "string", maxLength: 15 },
  eventDetails: { required: true, type: "string", maxLength: 2000 },
  referenceUrl: { type: "string", maxLength: 500 },
  selectedCollection: {
    required: true,
    type: "string",
    enum: ["social-cuts", "signature-cuts"],
  },
  quantity: { type: "number", min: 1 },
  country: { type: "string", enum: ["india", "canada"] },
};

// POST /api/bookings — Public: create a new booking
router.post("/", bookingCreateLimiter, doubleCsrfProtection, validate(bookingSchema), async (req, res) => {
  try {
    const { fullName, email, phone, eventDetails, referenceUrl, selectedCollection, quantity, couponCode, country } = req.body;

    const resolvedCountry = country || "india";
    const booking = await Booking.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      eventDetails: eventDetails.trim(),
      referenceUrl: referenceUrl ? referenceUrl.trim() : "",
      selectedCollection,
      quantity: quantity && quantity >= 1 ? Math.floor(quantity) : 1,
      couponCode: couponCode ? couponCode.trim().toUpperCase() : "",
      status: resolvedCountry === "canada" ? "confirmed" : "pending",
      country: resolvedCountry,
    });

    res.status(201).json({ booking });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: "Validation failed", details: messages });
    }
    console.error("Create booking error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bookings — Admin: list all bookings
router.get("/", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.country && ["india", "canada"].includes(req.query.country)) {
      filter.country = req.query.country;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List bookings error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bookings/:id — Admin: single booking with transaction
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const transaction = await Transaction.findOne({ bookingId: booking._id }).lean();

    res.json({ booking, transaction });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    console.error("Get booking error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/bookings/:id/status — Admin: update booking status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ booking });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    console.error("Update booking status error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
