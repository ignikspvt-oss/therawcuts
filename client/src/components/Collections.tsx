"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";

gsap.registerPlugin(ScrollTrigger);

export default function Collections() {
  const sectionRef = useRef<HTMLElement>(null);
  const { prices, formatPrice } = useLocation();

  const collections = [
    {
      name: "Social Cuts",
      tag: "Shot on iPhone",
      tagline: "Fast. Real. Made for the scroll.",
      description: "Social Cuts are shot on iPhone — perfect for authentic, everyday content that performs on Instagram and beyond.",
      bestFor: "Instagram reels, quick content, personal creators",
      deliverable: "Min 3-hour shoot session",
      pricing: `${formatPrice(prices["social-cuts"])} per cut`,
      slug: "social-cuts",
    },
    {
      name: "Signature Cuts",
      tag: "Shot on Camera",
      tagline: "Premium. Polished. Built to impress.",
      description: "Signature Cuts are shot on a professional camera — cinematic quality for brands, founders, and premium content.",
      bestFor: "Brands, founders, premium content",
      deliverable: "Min 2 reels required",
      pricing: `${formatPrice(prices["signature-cuts"])} per reel`,
      slug: "signature-cuts",
      featured: true,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title entrance
      gsap.fromTo(
        ".collections-title",
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );

      // Simple fade-up for each card — no horizontal scroll
      gsap.utils.toArray<HTMLElement>(".collection-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 48 },
          {
            opacity: 1, y: 0, duration: 0.75, ease: "power3.out",
            delay: i * 0.12,
            scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;
  };

  const handleTiltReset = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <section ref={sectionRef} id="collections" className="py-28 px-6 bg-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-14 collections-title opacity-0">
        <p className="section-label mb-3" style={{ color: "var(--crimson)" }}>
          Find Your Collection
        </p>
        <h2
          className="headline"
          style={{ fontSize: "clamp(2.2rem,6vw,5rem)", color: "var(--ink)" }}
        >
          Every Story Deserves<br />
          <span style={{ color: "var(--crimson)" }}>the Right Frame.</span>
        </h2>
        <p className="mt-4 text-lg max-w-xl" style={{ color: "rgba(8,8,8,0.52)" }}>
          Our collections are designed around what you need — not the clock.
        </p>

        {/* What's the difference */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(96,0,0,0.05)", border: "1px solid rgba(96,0,0,0.10)" }}>
            <span className="text-xl">📱</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--crimson)" }}>Social Cuts</p>
              <p className="text-xs" style={{ color: "rgba(8,8,8,0.5)" }}>Shot on iPhone</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(96,0,0,0.05)", border: "1px solid rgba(96,0,0,0.10)" }}>
            <span className="text-xl">🎥</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--crimson)" }}>Signature Cuts</p>
              <p className="text-xs" style={{ color: "rgba(8,8,8,0.5)" }}>Shot on Professional Camera</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards — simple responsive grid, no horizontal scroll */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col, i) => (
          <div
            key={i}
            className="collection-card opacity-0"
            onMouseMove={handleTilt}
            onMouseLeave={handleTiltReset}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="rounded-2xl p-8 sm:p-10 h-full flex flex-col transition-transform duration-200"
              style={{
                backgroundColor: col.featured ? "var(--crimson)" : "#fff",
                border: col.featured ? "none" : "1.5px solid rgba(96,0,0,0.12)",
              }}
            >
              {/* Tag */}
              <p
                className="section-label mb-2"
                style={{ color: col.featured ? "rgba(255,255,255,0.5)" : "var(--crimson)" }}
              >
                {col.tag}
              </p>

              {/* Name */}
              <h3
                className="headline"
                style={{
                  fontSize: "clamp(2rem,4vw,2.8rem)",
                  color: col.featured ? "#fff" : "var(--crimson)",
                  marginBottom: "0.5rem",
                }}
              >
                {col.name}
              </h3>

              {/* Tagline */}
              <p
                className="text-sm mb-4 italic"
                style={{ color: col.featured ? "rgba(255,255,255,0.65)" : "rgba(96,0,0,0.55)" }}
              >
                {col.tagline}
              </p>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: col.featured ? "rgba(255,255,255,0.72)" : "rgba(8,8,8,0.55)" }}
              >
                {col.description}
              </p>

              {/* Details */}
              <div className="space-y-4 flex-1">
                {[
                  { label: "Best For", value: col.bestFor },
                  { label: "Deliverable", value: col.deliverable },
                  { label: "Pricing", value: col.pricing },
                ].map((row) => (
                  <div key={row.label}>
                    <p
                      className="section-label mb-1"
                      style={{ color: col.featured ? "rgba(255,255,255,0.45)" : "rgba(96,0,0,0.45)" }}
                    >
                      {row.label}
                    </p>
                    <p style={{ color: col.featured ? "rgba(255,255,255,0.85)" : "var(--crimson)" }}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={`/book?collection=${col.slug}`}
                className="mt-8 inline-block px-7 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.03] self-start"
                style={
                  col.featured
                    ? { backgroundColor: "#fff", color: "var(--crimson)" }
                    : { backgroundColor: "var(--crimson)", color: "#fff" }
                }
              >
                Book This Collection →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
