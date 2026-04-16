"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiCheckCircle, HiMinus, HiPlus } from "react-icons/hi2";
import { createBooking, validateCoupon, createPaymentOrder, verifyPayment } from "@/lib/api";
import { useLocation } from "@/context/LocationContext";
import { PRICING } from "@/context/LocationContext";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact?: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: Array<{ method: string }> }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const COLLECTION_META: Record<string, { name: string; minQty: number; qtyLabel: string; qtyNote: string }> = {
  "social-cuts": {
    name: "Social Cuts",
    minQty: 1,
    qtyLabel: "Number of Cuts",
    qtyNote: "Min 3-hour shoot session per cut",
  },
  "signature-cuts": {
    name: "Signature Cuts",
    minQty: 2,
    qtyLabel: "Number of Reels",
    qtyNote: "Minimum 2 reels required",
  },
};

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { country, prices, formatPrice } = useLocation();

  const collectionSlug = searchParams.get("collection") || "";
  const meta = COLLECTION_META[collectionSlug] || COLLECTION_META["social-cuts"];

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    eventDetails: "",
    referenceUrl: "",
    collection: collectionSlug,
  });
  const [quantity, setQuantity] = useState(meta.minQty);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  // Tracks a booking created but not yet paid — reused on Razorpay modal retry
  // so we don't create a duplicate pending booking each time the modal is dismissed.
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const currentMeta = COLLECTION_META[form.collection] || COLLECTION_META["social-cuts"];
  const currentPrice = prices[form.collection as keyof typeof prices] ?? prices["social-cuts"];
  const baseTotal = currentPrice * quantity;
  const displayPrice = discountInfo ? discountInfo.finalPrice : baseTotal;

  const isCanada = country === "canada";

  const handleCollectionChange = (slug: string) => {
    const newMeta = COLLECTION_META[slug] || COLLECTION_META["social-cuts"];
    setForm({ ...form, collection: slug });
    setQuantity(newMeta.minQty);
    setPendingBookingId(null);
    if (couponApplied) {
      setCouponApplied(false);
      setCouponMessage("");
      setDiscountInfo(null);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      return next < currentMeta.minQty ? currentMeta.minQty : next;
    });
    setPendingBookingId(null);
    if (couponApplied) {
      setCouponApplied(false);
      setCouponMessage("");
      setDiscountInfo(null);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Enter a valid email";
    if (!form.eventDetails.trim()) errs.eventDetails = "Please tell us about your shoot";
    if (!form.collection) errs.collection = "Please select a collection";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMessage("");
    setCouponApplied(false);
    setDiscountInfo(null);

    try {
      const { data } = await validateCoupon(
        couponCode,
        form.collection,
        quantity,
        country ?? "india"
      );
      setCouponApplied(true);
      setCouponMessage(
        data.coupon.type === "percentage"
          ? `${data.coupon.value}% off applied!`
          : `${formatPrice(data.discountAmount)} off applied!`
      );
      setDiscountInfo({
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount,
        finalPrice: data.finalPrice,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setCouponApplied(false);
      setCouponMessage(error.response?.data?.error || "Invalid coupon code");
      setDiscountInfo(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // India: full Razorpay payment flow
  const handleIndiaSubmit = async () => {
    setProcessing(true);
    setSubmitError("");

    try {
      // Reuse a pending booking if the user dismissed the modal and is retrying,
      // so we don't accumulate orphaned pending bookings on each attempt.
      let bookingId = pendingBookingId;

      if (!bookingId) {
        const { data: bookingData } = await createBooking({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          eventDetails: form.eventDetails.trim(),
          referenceUrl: form.referenceUrl.trim(),
          selectedCollection: form.collection,
          quantity,
          couponCode: couponApplied ? couponCode.trim() : "",
          country: "india",
        });
        bookingId = bookingData.booking._id;
        setPendingBookingId(bookingId);
      }

      // After the if-block bookingId is guaranteed non-null; capture as const for closure.
      const activeBookingId = bookingId as string;
      const { data: orderData } = await createPaymentOrder(activeBookingId);

      const contact = form.phone.trim();
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.keyId,
        amount: orderData.amountInPaise,
        currency: "INR",
        name: "The Raw Cuts",
        description: `${currentMeta.name} — ${quantity} ${quantity === 1 ? "unit" : "units"}`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: activeBookingId,
            });
            setPendingBookingId(null);
            router.push("/book/confirmation");
          } catch {
            setSubmitError("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: form.fullName.trim(),
          email: form.email.trim(),
          ...(contact ? { contact } : {}),
        },
        // UPI Collect (UPI ID entry) was deprecated by NPCI on Feb 28, 2026.
        // This config promotes UPI Intent (launch UPI app) and QR prominently,
        // then shows cards / netbanking / wallets / EMI as secondary methods.
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
              other: {
                name: "Other Payment Modes",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                  { method: "emi" },
                ],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: "#600000" },
        modal: { ondismiss: () => setProcessing(false) },
      };

      if (!window.Razorpay) {
        setSubmitError("Payment gateway failed to load. Please refresh the page and try again.");
        setProcessing(false);
        return;
      }
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setSubmitError(error.response?.data?.error || "Something went wrong. Please try again.");
      setPendingBookingId(null);
      setProcessing(false);
    }
  };

  // Canada: create booking request, no payment
  const handleCanadaSubmit = async () => {
    setProcessing(true);
    setSubmitError("");

    try {
      await createBooking({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        eventDetails: form.eventDetails.trim(),
        referenceUrl: form.referenceUrl.trim(),
        selectedCollection: form.collection,
        quantity,
        couponCode: couponApplied ? couponCode.trim() : "",
        country: "canada",
      });

      router.push("/book/confirmation?type=request");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setSubmitError(error.response?.data?.error || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const handleSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isCanada) {
      await handleCanadaSubmit();
    } else {
      await handleIndiaSubmit();
    }
  };

  // Build collection options with correct prices
  const collectionOptions = Object.entries(COLLECTION_META).map(([slug, m]) => {
    const p = (PRICING[country ?? "india"] as unknown as Record<string, number>)[slug];
    const unit = slug === "social-cuts" ? "cut" : "reel";
    return { slug, label: `${m.name} — ${formatPrice(p)} per ${unit}` };
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--surface-warm)" }}>
      {/* Crimson header strip */}
      <div style={{ backgroundColor: "var(--crimson)" }} className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-6">
            <span className="brand-logo text-white" style={{ fontSize: "1.5rem" }}>
              the raw cuts.
            </span>
          </div>

          <h1 className="headline text-white" style={{ fontSize: "clamp(2.2rem,6vw,3.5rem)" }}>
            Book Your Shoot
          </h1>
          {form.collection ? (
            <p className="mt-3 text-white/70 text-base">
              You&apos;ve selected:{" "}
              <span className="text-white font-semibold">{currentMeta.name}</span>
              {" — "}
              <span className="text-white/90">
                {formatPrice(currentPrice)} per {form.collection === "social-cuts" ? "cut" : "reel"}
              </span>
            </p>
          ) : (
            <p className="mt-3 text-white/60 text-base">Select a collection below to get started.</p>
          )}

          {/* Canada notice */}
          {isCanada && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
              🇨🇦 Canadian pricing · Payment arranged after booking
            </div>
          )}
        </div>
      </div>

      {/* Form body */}
      <div className="max-w-3xl mx-auto px-6 py-12 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
              Full Name <span style={{ color: "var(--crimson)" }}>*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full rounded-xl px-4 py-3.5 transition-colors focus:outline-none"
              style={{
                background: "#fff",
                border: errors.fullName ? "1.5px solid var(--crimson)" : "1.5px solid rgba(96,0,0,0.15)",
                color: "#600000",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = errors.fullName ? "var(--crimson)" : "rgba(96,0,0,0.15)")}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm" style={{ color: "var(--crimson)" }}>{errors.fullName}</p>
            )}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
                Email Address <span style={{ color: "var(--crimson)" }}>*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3.5 transition-colors focus:outline-none"
                style={{
                  background: "#fff",
                  border: errors.email ? "1.5px solid var(--crimson)" : "1.5px solid rgba(96,0,0,0.15)",
                  color: "#600000",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? "var(--crimson)" : "rgba(96,0,0,0.15)")}
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: "var(--crimson)" }}>{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
                Phone Number{" "}
                <span className="text-xs" style={{ color: "rgba(96,0,0,0.5)" }}>Optional</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={isCanada ? "+1 (XXX) XXX-XXXX" : "+91 XXXXX XXXXX"}
                className="w-full rounded-xl px-4 py-3.5 transition-colors focus:outline-none"
                style={{
                  background: "#fff",
                  border: "1.5px solid rgba(96,0,0,0.15)",
                  color: "#600000",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(96,0,0,0.15)")}
              />
            </div>
          </div>

          {/* Event Details */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
              Details of Event / Shoot <span style={{ color: "var(--crimson)" }}>*</span>
            </label>
            <textarea
              value={form.eventDetails}
              onChange={(e) => setForm({ ...form, eventDetails: e.target.value })}
              placeholder="Tell us about your shoot — event type, date, location, or any context that helps"
              rows={4}
              className="w-full rounded-xl px-4 py-3.5 transition-colors focus:outline-none resize-none"
              style={{
                background: "#fff",
                border: errors.eventDetails ? "1.5px solid var(--crimson)" : "1.5px solid rgba(96,0,0,0.15)",
                color: "#600000",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = errors.eventDetails ? "var(--crimson)" : "rgba(96,0,0,0.15)")}
            />
            {errors.eventDetails && (
              <p className="mt-1 text-sm" style={{ color: "var(--crimson)" }}>{errors.eventDetails}</p>
            )}
          </div>

          {/* Reference Reel URL */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
              Reference Reel (URL){" "}
              <span className="text-xs" style={{ color: "rgba(96,0,0,0.5)" }}>Optional</span>
            </label>
            <input
              type="url"
              value={form.referenceUrl}
              onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })}
              placeholder="Paste a link to a reel you love (optional but helpful)"
              className="w-full rounded-xl px-4 py-3.5 transition-colors focus:outline-none"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(96,0,0,0.15)",
                color: "#600000",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(96,0,0,0.15)")}
            />
          </div>

          {/* Selected Collection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
              Selected Collection <span style={{ color: "var(--crimson)" }}>*</span>
            </label>
            <select
              value={form.collection}
              onChange={(e) => handleCollectionChange(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 transition-colors focus:outline-none"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(96,0,0,0.15)",
                color: form.collection ? "#600000" : "rgba(96,0,0,0.45)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(96,0,0,0.15)")}
            >
              <option value="" disabled style={{ color: "rgba(96,0,0,0.4)" }}>
                Please select a collection
              </option>
              {collectionOptions.map(({ slug, label }) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </select>
            {errors.collection && (
              <p className="mt-1 text-sm" style={{ color: "var(--crimson)" }}>{errors.collection}</p>
            )}
          </div>

          {/* Quantity stepper */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#600000" }}>
              {currentMeta.qtyLabel}
            </label>
            <p className="text-xs mb-3" style={{ color: "rgba(96,0,0,0.55)" }}>
              {currentMeta.qtyNote}
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= currentMeta.minQty}
                className="w-11 h-11 rounded-lg flex items-center justify-center transition-all font-bold touch-manipulation"
                style={{
                  border: "1.5px solid var(--crimson)",
                  color: "var(--crimson)",
                  background: "#fff",
                  opacity: quantity <= currentMeta.minQty ? 0.35 : 1,
                  cursor: quantity <= currentMeta.minQty ? "not-allowed" : "pointer",
                }}
              >
                <HiMinus className="w-4 h-4" />
              </button>

              <span className="text-2xl font-bold w-10 text-center" style={{ color: "#600000" }}>
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-11 h-11 rounded-lg flex items-center justify-center transition-all font-bold touch-manipulation"
                style={{
                  border: "1.5px solid var(--crimson)",
                  color: "#fff",
                  background: "var(--crimson)",
                }}
              >
                <HiPlus className="w-4 h-4" />
              </button>

              <span className="text-sm" style={{ color: "rgba(96,0,0,0.6)" }}>
                × {formatPrice(currentPrice)} ={" "}
                <span className="font-semibold" style={{ color: "var(--crimson)" }}>
                  {formatPrice(baseTotal)}
                </span>
              </span>
            </div>
          </div>

          {/* Coupon */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#600000" }}>
              Have a coupon code?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponApplied(false);
                  setCouponMessage("");
                  setDiscountInfo(null);
                }}
                placeholder="Enter code"
                className="flex-1 rounded-xl px-4 py-3.5 transition-colors focus:outline-none uppercase"
                style={{
                  background: "#fff",
                  border: "1.5px solid rgba(96,0,0,0.15)",
                  color: "#600000",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--crimson)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(96,0,0,0.15)")}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="px-6 py-3.5 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{
                  border: "1.5px solid var(--crimson)",
                  color: "var(--crimson)",
                  background: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--crimson)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "var(--crimson)";
                }}
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
            {couponMessage && (
              <p
                className="mt-2 text-sm flex items-center gap-1"
                style={{ color: couponApplied ? "#16a34a" : "var(--crimson)" }}
              >
                {couponApplied && <HiCheckCircle className="w-4 h-4" />}
                {couponMessage}
              </p>
            )}
          </div>

          {/* Price Summary */}
          {discountInfo && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: "#fff", border: "1.5px solid rgba(96,0,0,0.12)" }}>
              <div className="flex justify-between text-sm" style={{ color: "rgba(96,0,0,0.6)" }}>
                <span>Original Price</span>
                <span>{formatPrice(discountInfo.originalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: "#16a34a" }}>
                <span>Discount</span>
                <span>-{formatPrice(discountInfo.discountAmount)}</span>
              </div>
              <div
                className="flex justify-between font-bold text-lg pt-2"
                style={{ color: "#600000", borderTop: "1px solid rgba(96,0,0,0.12)" }}
              >
                <span>Total</span>
                <span>{formatPrice(discountInfo.finalPrice)}</span>
              </div>
            </div>
          )}

          {/* Payment / Request section */}
          <div className="mt-10 pt-8" style={{ borderTop: "1.5px solid rgba(96,0,0,0.12)" }}>
            {isCanada ? (
              <>
                <h2 className="text-2xl font-bold" style={{ color: "#600000" }}>
                  Almost There — Request Your Shoot.
                </h2>
                <p className="mt-2" style={{ color: "rgba(96,0,0,0.65)" }}>
                  Submit your booking request below. We&apos;ll reach out within 24 hours to confirm
                  your session and arrange payment in CA$.
                </p>
                <div className="mt-4 rounded-xl p-4 text-sm flex items-start gap-3"
                  style={{ background: "rgba(96,0,0,0.04)", border: "1px solid rgba(96,0,0,0.12)" }}>
                  <span className="text-lg leading-none">🇨🇦</span>
                  <p style={{ color: "rgba(96,0,0,0.7)" }}>
                    Estimated total:{" "}
                    <strong style={{ color: "var(--crimson)" }}>{formatPrice(displayPrice)}</strong>
                    {discountInfo && (
                      <span> (after discount)</span>
                    )}
                    {" "}— payment details will be shared via email.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold" style={{ color: "#600000" }}>
                  Almost There — Let&apos;s Lock It In.
                </h2>
                <p className="mt-2" style={{ color: "rgba(96,0,0,0.65)" }}>
                  Review your selected collection below. Complete your payment to confirm your booking.
                  We&apos;ll reach out within 24 hours to schedule your discovery call.
                </p>
              </>
            )}

            {submitError && (
              <div
                className="mt-4 rounded-xl p-4 text-sm"
                style={{
                  background: "rgba(96,0,0,0.06)",
                  border: "1px solid rgba(96,0,0,0.2)",
                  color: "var(--crimson)",
                }}
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="mt-8 w-full text-white py-4 rounded-full text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--crimson)" }}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  {isCanada ? "Submitting Request..." : "Processing Payment..."}
                </span>
              ) : isCanada ? (
                "Request Booking →"
              ) : (
                `Confirm & Pay ${formatPrice(displayPrice)} →`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--surface-warm)" }}>
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "2px solid var(--crimson)", borderTopColor: "transparent" }} />
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
