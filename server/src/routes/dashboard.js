const express = require("express");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const CANADA_PRICES = {
  "social-cuts": 79.99,
  "signature-cuts": 149.99,
};

// GET /api/dashboard/stats — Admin: dashboard statistics
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      indiaRevenueResult,
      canadaConfirmedBookings,
      recentBookings,
      recentTransactions,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "pending" }),
      // India revenue: sum of paid INR transactions
      Transaction.aggregate([
        { $match: { status: "paid", currency: "INR" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      // Canada revenue: confirmed bookings × CAD unit price
      Booking.find({ country: "canada", status: "confirmed" })
        .select("selectedCollection quantity")
        .lean(),
      Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
      Transaction.find({ status: "paid" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("bookingId", "fullName selectedCollection country")
        .lean(),
    ]);

    const indiaRevenue = indiaRevenueResult.length > 0 ? indiaRevenueResult[0].total : 0;
    const totalPaidTransactions = indiaRevenueResult.length > 0 ? indiaRevenueResult[0].count : 0;

    const canadaRevenue = canadaConfirmedBookings.reduce((sum, b) => {
      const price = CANADA_PRICES[b.selectedCollection] || 0;
      return sum + price * (b.quantity || 1);
    }, 0);

    res.json({
      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        indiaRevenue,
        canadaRevenue: parseFloat(canadaRevenue.toFixed(2)),
        totalPaidTransactions,
      },
      recentBookings,
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
