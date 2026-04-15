import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

// Above-the-fold components remain statically imported for fastest paint.
// Below-the-fold components are code-split and rendered when they enter viewport.

const SectionFallback = () => <div aria-hidden="true" style={{ minHeight: "60vh" }} />;

const Collections = dynamic(() => import("@/components/Collections"), {
  loading: SectionFallback,
});
const Pillars = dynamic(() => import("@/components/Pillars"), {
  loading: SectionFallback,
});
const Features = dynamic(() => import("@/components/Features"), {
  loading: SectionFallback,
});
const Portfolio = dynamic(() => import("@/components/Portfolio"), {
  loading: SectionFallback,
});
const Reviews = dynamic(() => import("@/components/Reviews"), {
  loading: SectionFallback,
});
const FAQ = dynamic(() => import("@/components/FAQ"), {
  loading: SectionFallback,
});
const FooterCTA = dynamic(() => import("@/components/FooterCTA"), {
  loading: SectionFallback,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div aria-hidden="true" style={{ minHeight: "20vh" }} />,
});
const MobileStickyCTA = dynamic(() => import("@/components/MobileStickyCTA"));
const WhatsAppSticky = dynamic(() => import("@/components/WhatsAppSticky"));

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Collections />
      <Pillars />
      <Features />
      <Portfolio />
      <Reviews />
      <FAQ />
      <FooterCTA />
      <Footer />
      <MobileStickyCTA />
      <WhatsAppSticky />
    </main>
  );
}
