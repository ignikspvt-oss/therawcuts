const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Coupon name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [30, "Code cannot exceed 30 characters"],
    },
    type: {
      type: String,
      required: [true, "Coupon type is required"],
      enum: {
        values: ["percentage", "fixed"],
        message: "Type must be percentage or fixed",
      },
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Value cannot be negative"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
      min: [1, "Max uses must be at least 1"],
    },
    country: {
      type: String,
      enum: ["india", "canada", "both"],
      default: "both",
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, isActive: 1 });

// Validate percentage doesn't exceed 100
couponSchema.pre("validate", function () {
  if (this.type === "percentage" && this.value > 100) {
    this.invalidate("value", "Percentage discount cannot exceed 100%");
  }
});

module.exports = mongoose.model("Coupon", couponSchema);
