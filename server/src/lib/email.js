const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const COLLECTION_NAMES = {
  "social-cuts": "Social Cuts",
  "signature-cuts": "Signature Cuts",
};

const sendBookingConfirmation = async ({ booking, transaction }) => {
  const collectionName = COLLECTION_NAMES[booking.selectedCollection] || booking.selectedCollection;
  const bookingDate = new Date(booking.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasDiscount = transaction.discountAmount > 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#600000;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">THE RAW CUTS</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Business Reel Shoot Studio</p>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="padding:40px;">
              <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;width:56px;height:56px;background:#e8f5e9;border-radius:50%;line-height:56px;text-align:center;">
                  <span style="font-size:28px;">✓</span>
                </div>
                <h2 style="margin:16px 0 4px;color:#111;font-size:22px;font-weight:700;">Payment Confirmed</h2>
                <p style="margin:0;color:#666;font-size:15px;">You're in, Main Character.</p>
              </div>

              <!-- Customer -->
              <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi <strong>${booking.fullName}</strong>,<br/>
                Thank you for booking with The Raw Cuts. Here's your payment receipt.
              </p>

              <!-- Receipt Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #eee;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;">Collection</td>
                        <td style="padding:8px 0;color:#111;font-size:14px;font-weight:600;text-align:right;">${collectionName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;">${booking.selectedCollection === "social-cuts" ? "Cuts" : "Reels"}</td>
                        <td style="padding:8px 0;color:#111;font-size:14px;text-align:right;">${booking.quantity || 1}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;">Booking Date</td>
                        <td style="padding:8px 0;color:#111;font-size:14px;text-align:right;">${bookingDate}</td>
                      </tr>
                      ${hasDiscount ? `
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;">Original Amount</td>
                        <td style="padding:8px 0;color:#111;font-size:14px;text-align:right;">₹${transaction.originalAmount.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;">Discount ${transaction.couponCode ? `(${transaction.couponCode})` : ""}</td>
                        <td style="padding:8px 0;color:#16a34a;font-size:14px;text-align:right;">-₹${transaction.discountAmount.toLocaleString("en-IN")}</td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td colspan="2" style="border-top:1px solid #e5e5e5;padding:0;"></td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 8px;color:#111;font-size:15px;font-weight:700;">Amount Paid</td>
                        <td style="padding:12px 0 8px;color:#DC143C;font-size:18px;font-weight:700;text-align:right;">₹${transaction.amount.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#666;font-size:12px;">Transaction ID</td>
                        <td style="padding:4px 0;color:#888;font-size:12px;text-align:right;font-family:monospace;">${transaction.razorpayPaymentId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="margin-top:32px;padding:20px;background:#fff8f8;border-left:3px solid #DC143C;border-radius:0 8px 8px 0;">
                <h3 style="margin:0 0 8px;color:#111;font-size:15px;font-weight:600;">What Happens Next?</h3>
                <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
                  Our team will reach out to you within <strong>24 hours</strong> to schedule your discovery call and finalize the shoot details.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0 0 4px;color:#999;font-size:12px;">The Raw Cuts — Business Reel Shoot Studio</p>
              <p style="margin:0;color:#bbb;font-size:11px;">Questions? Reply to this email or contact us at support@therawcuts.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_SENDER || "The Raw Cuts <test@igniks.com>",
      to: [booking.email],
      subject: `Payment Confirmed — ${collectionName} Collection | The Raw Cuts`,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    console.log("Confirmation email sent:", data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBookingConfirmation };
