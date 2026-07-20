require("dotenv").config();

const connectDB = require("../config/db");
const Coupon = require("../models/Coupon");

const CODE = "KALYANAM";
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

(async () => {
  try {
    await connectDB();

    const coupon = await Coupon.findOneAndUpdate(
      { code: CODE },
      {
        $setOnInsert: {
          name: "Kalyanam Launch Offer",
          code: CODE,
          type: "percentage",
          value: 25,
          expiresAt: new Date(Date.now() + TWO_YEARS_MS),
          maxUses: 1000,
          country: "india",
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    console.log("Coupon ready:", {
      id: coupon._id.toString(),
      code: coupon.code,
      value: coupon.value,
      expiresAt: coupon.expiresAt,
      maxUses: coupon.maxUses,
      country: coupon.country,
    });
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed coupon:", error.message);
    process.exit(1);
  }
})();
