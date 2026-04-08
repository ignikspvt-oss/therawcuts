const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Coupon = require("../models/Coupon");
const validate = require("../middleware/validate");
const { doubleCsrfProtection } = require("../middleware/csrf");
const { sendBookingConfirmation } = require("../lib/email");

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests. Please try again later." },
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

const createOrderSchema = {
  bookingId: { required: true, type: "string" },
};

const verifySchema = {
  razorpay_order_id: { required: true, type: "string" },
  razorpay_payment_id: { required: true, type: "string" },
  razorpay_signature: { required: true, type: "string" },
  bookingId: { required: true, type: "string" },
};

// POST /api/payments/create-order — Create real Razorpay order (India only)
router.post("/create-order", paymentLimiter, doubleCsrfProtection, validate(createOrderSchema), async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Booking is not in pending state" });
    }

    if (booking.country === "canada") {
      return res.status(400).json({ error: "Online payment is not available for Canada bookings" });
    }

    const countryPrices = UNIT_PRICES[booking.country] || UNIT_PRICES.india;
    const unitPrice = countryPrices[booking.selectedCollection];
    if (!unitPrice) {
      return res.status(400).json({ error: "Invalid collection" });
    }
    const originalAmount = unitPrice * (booking.quantity || 1);

    let discountAmount = 0;
    let appliedCoupon = "";

    if (booking.couponCode) {
      const coupon = await Coupon.findOne({
        code: booking.couponCode,
        isActive: true,
      });

      if (
        coupon &&
        coupon.expiresAt > new Date() &&
        coupon.usageCount < coupon.maxUses &&
        (coupon.country === booking.country || coupon.country === "both")
      ) {
        if (coupon.type === "percentage") {
          discountAmount = Math.round((originalAmount * coupon.value) / 100);
        } else {
          discountAmount = Math.min(coupon.value, originalAmount);
        }
        appliedCoupon = coupon.code;
      }
    }

    const finalAmount = originalAmount - discountAmount;

    // Create Razorpay order (amount in paise, INR only)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        collection: booking.selectedCollection,
        customerName: booking.fullName,
      },
    });

    const transaction = await Transaction.create({
      bookingId: booking._id,
      razorpayOrderId: razorpayOrder.id,
      amount: finalAmount,
      originalAmount,
      discountAmount,
      couponCode: appliedCoupon,
      status: "created",
      currency: "INR",
      country: "india",
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: finalAmount,
      amountInPaise: Math.round(finalAmount * 100),
      originalAmount,
      discountAmount,
      couponCode: appliedCoupon,
      bookingId: booking._id,
      transactionId: transaction._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    console.error("Create order error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/payments/verify — Verify Razorpay payment signature
router.post("/verify", paymentLimiter, doubleCsrfProtection, validate(verifySchema), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    let receivedBuffer;
    try {
      receivedBuffer = Buffer.from(razorpay_signature, "hex");
    } catch {
      return res.status(400).json({ error: "Payment verification failed — invalid signature" });
    }
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ error: "Payment verification failed — invalid signature" });
    }

    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
      bookingId,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status === "paid") {
      return res.status(400).json({ error: "Payment already verified" });
    }

    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.status = "paid";
    await transaction.save();

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "confirmed" },
      { returnDocument: "after" }
    );

    if (transaction.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: transaction.couponCode },
        { $inc: { usageCount: 1 } }
      );
    }

    sendBookingConfirmation({ booking, transaction }).catch((err) => {
      console.error("Failed to send confirmation email:", err.message);
    });

    res.json({ success: true, booking, transaction });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    console.error("Verify payment error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
