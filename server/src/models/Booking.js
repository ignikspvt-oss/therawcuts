const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, "Phone number cannot exceed 15 characters"],
      default: "",
    },
    eventDetails: {
      type: String,
      required: [true, "Event details are required"],
      trim: true,
      maxlength: [2000, "Details cannot exceed 2000 characters"],
    },
    referenceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    selectedCollection: {
      type: String,
      required: [true, "Collection is required"],
      enum: {
        values: ["social-cuts", "signature-cuts"],
        message: "Invalid collection: {VALUE}",
      },
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    country: {
      type: String,
      enum: ["india", "canada"],
      default: "india",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
