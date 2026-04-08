import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description:
    "Your booking with The Raw Cuts has been confirmed. We'll reach out within 24 hours to schedule your discovery call.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
