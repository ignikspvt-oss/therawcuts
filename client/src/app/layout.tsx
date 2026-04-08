import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Barlow_Condensed, League_Spartan } from "next/font/google";
import localFont from "next/font/local";

/* ── Font toggle: set to false to revert headlines to Barlow Condensed ── */
const USE_NEW_FONTS = true;
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ConditionalPageEffects from "@/components/ConditionalPageEffects";
import { LocationProvider } from "@/context/LocationContext";
import LocationModal from "@/components/LocationModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const tanHarmoni = localFont({
  src: "../../public/fonts/TAN-Harmoni-Regular.woff2",
  variable: "--font-headline",
  weight: "400",
});

const leagueSpartan = League_Spartan({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const headlineFont = USE_NEW_FONTS ? tanHarmoni : barlowCondensed;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://therawcuts.com";
const SITE_NAME = "The Raw Cuts";
const DEFAULT_TITLE = "The Raw Cuts | Business Reel Shoot Studio";
const DEFAULT_DESCRIPTION =
  "We shoot, edit, and deliver your reel — in under 24 hours. Business reel production in India and Canada. No fluff. No filler. Just you, in your element.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | The Raw Cuts",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "The Raw Cuts" }],
  generator: "Next.js",
  keywords: [
    "business reel shoot",
    "reel production",
    "video production studio",
    "instagram reels",
    "social media reels",
    "reel editing",
    "India video production",
    "Canada video production",
    "24 hour reel delivery",
    "branded content",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description:
      "Business reel production — shot, edited, and delivered in 24 hours. India & Canada.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Raw Cuts — Business Reel Shoot Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description:
      "Business reel production — shot, edited, and delivered in 24 hours.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "Business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#DC143C",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.jpeg`,
        width: 512,
        height: 512,
      },
      description:
        "Business reel shoot studio operating in India and Canada. We shoot, edit, and deliver reels in 24 hours.",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#india`,
      name: "The Raw Cuts — India",
      url: SITE_URL,
      priceRange: "₹₹",
      areaServed: { "@type": "Country", name: "India" },
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#canada`,
      name: "The Raw Cuts — Canada",
      url: SITE_URL,
      priceRange: "CA$$",
      areaServed: { "@type": "Country", name: "Canada" },
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/#social-cuts`,
      name: "Social Cuts",
      description:
        "Shot on iPhone. 3-hour shoot session. Delivered in 24 hours.",
      brand: { "@id": `${SITE_URL}/#organization` },
      offers: [
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "2999",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/book?collection=social-cuts`,
          areaServed: "IN",
        },
        {
          "@type": "Offer",
          priceCurrency: "CAD",
          price: "79.99",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/book?collection=social-cuts`,
          areaServed: "CA",
        },
      ],
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/#signature-cuts`,
      name: "Signature Cuts",
      description:
        "Professional camera shoot. Minimum 2 reels. Delivered in 24 hours.",
      brand: { "@id": `${SITE_URL}/#organization` },
      offers: [
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "4999",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/book?collection=signature-cuts`,
          areaServed: "IN",
        },
        {
          "@type": "Offer",
          priceCurrency: "CAD",
          price: "149.99",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/book?collection=signature-cuts`,
          areaServed: "CA",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${headlineFont.variable} ${leagueSpartan.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://lumberjack.razorpay.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LocationProvider>
          <ConditionalPageEffects />
          <CustomCursor />
          <LocationModal />
          <SmoothScroll>{children}</SmoothScroll>
        </LocationProvider>
      </body>
    </html>
  );
}
