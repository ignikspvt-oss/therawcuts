"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";

gsap.registerPlugin(ScrollTrigger);

export default function Collections() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { prices, formatPrice } = useLocation();

  const collections = [
    {
      name: "Social Cuts",
      tag: "Shot on iPhone",
      bestFor: "Instagram reels, quick content, personal creators",
      deliverable: "Min 3-hour shoot session",
      pricing: `${formatPrice(prices["social-cuts"])} per cut`,
      slug: "social-cuts",
    },
    {
      name: "Signature Cuts",
      tag: "Professional Camera",
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

      // Horizontal scroll on desktop
      const container = scrollContainerRef.current;
      if (!container || window.innerWidth < 1024) return;
      const track = container.querySelector(".cards-track") as HTMLElement;
      if (!track) return;

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 200),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 8%",
          end: () => `+=${track.scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
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
    <section ref={sectionRef} id="collections" className="py-28 px-6 bg-white overflow-hidden">
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
      </div>

      <div ref={scrollContainerRef}>
        <div className="cards-track flex gap-5 lg:gap-6 lg:flex-nowrap lg:pl-[8vw] overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-pl-6 -mx-6 px-6 pb-4 lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Mobile layout uses horizontal snap-scroll for single-hand navigation */}
          {collections.map((col, i) => (
            <div
              key={i}
              onMouseMove={handleTilt}
              onMouseLeave={handleTiltReset}
              className="flex-shrink-0 w-[85vw] max-w-[400px] lg:w-[380px] snap-center lg:snap-align-none rounded-2xl p-8 sm:p-10 transition-transform duration-200"
              style={{
                transformStyle: "preserve-3d",
                backgroundColor: col.featured ? "var(--crimson)" : "#fff",
                border: col.featured ? "none" : "1.5px solid rgba(96,0,0,0.12)",
              }}
            >
              {/* Tag */}
              <p
                className="section-label mb-4"
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
                  marginBottom: "1.75rem",
                }}
              >
                {col.name}
              </h3>

              {/* Details */}
              <div className="space-y-5">
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
                className="mt-8 inline-block px-7 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.03]"
                style={
                  col.featured
                    ? { backgroundColor: "#fff", color: "var(--crimson)" }
                    : { backgroundColor: "var(--crimson)", color: "#fff" }
                }
              >
                Book This Collection →
              </Link>
            </div>
          ))}
        </div>
        <p
          className="lg:hidden text-center mt-4 text-xs"
          style={{ color: "rgba(8,8,8,0.4)", letterSpacing: "0.15em" }}
        >
          ← SWIPE →
        </p>
      </div>
    </section>
  );
}
