require("dotenv").config();

const { sendBookingConfirmation } = require("../lib/email");

const recipient = process.argv[2];

if (!recipient) {
  console.error("Usage: node src/scripts/testEmail.js <recipient@example.com>");
  process.exit(1);
}

console.log("RESEND_API_KEY present:", Boolean(process.env.RESEND_API_KEY));
console.log("EMAIL_SENDER:", process.env.EMAIL_SENDER || "(falling back to test@igniks.com)");
console.log("Sending test email to:", recipient);
console.log("");

const booking = {
  fullName: "Test User",
  email: recipient,
  selectedCollection: "social-cuts",
  quantity: 3,
  createdAt: new Date(),
};

const transaction = {
  amount: 14999,
  originalAmount: 19999,
  discountAmount: 5000,
  couponCode: "TEST20",
  razorpayPaymentId: "pay_TEST1234567890",
};

(async () => {
  const result = await sendBookingConfirmation({ booking, transaction });
  console.log("");
  console.log("Result:", JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
})();
