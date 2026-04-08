import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Book Your Reel Shoot",
  description:
    "Book your business reel shoot with The Raw Cuts. Choose Social Cuts (₹2,999 / CA$79.99) or Signature Cuts (₹4,999 / CA$149.99). Delivered in 24 hours.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book Your Reel Shoot | The Raw Cuts",
    description:
      "Book your business reel shoot — Social Cuts or Signature Cuts. Delivered in 24 hours.",
    url: "/book",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Your Reel Shoot | The Raw Cuts",
    description:
      "Book your business reel shoot — Social Cuts or Signature Cuts. Delivered in 24 hours.",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
