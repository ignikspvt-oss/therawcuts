"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  { num: "01", title: "Delivered in 24 Hrs",          subtitle: "Always. No exceptions."              },
  { num: "02", title: "Quality Over Quantity",         subtitle: "Every single time."                  },
  { num: "03", title: "You're the Main Character",     subtitle: "We just make sure it shows."         },
];

const tickerItems = Array(6).fill([
  "DELIVERED IN 24HRS",
  "QUALITY OVER QUANTITY",
  "YOU'RE THE MAIN CHARACTER",
  "INDIA & CANADA",
  "NO FLUFF · NO FILLER",
]).flat();

export default function Pillars() {
  const sectionRef  = useRef<HTMLElement>(null);
  const pillarsRef  = useRef<HTMLDivElement>(null);
  const quoteRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".pillar-row",
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, stagger: 0.13, duration: 0.72, ease: "power3.out",
          scrollTrigger: { trigger: pillarsRef.current, start: "top 78%" },
        }
      );
      gsap.fromTo(quoteRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.65, ease: "power2.out",
          scrollTrigger: { trigger: quoteRef.current, start: "top 88%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white"
    >
      {/* Top ticker — crimson text on white */}
      <div
        className="ticker-pause overflow-hidden py-5"
        style={{ borderBottom: "1px solid rgba(96,0,0,0.12)" }}
      >
        <div className="ticker-track flex whitespace-nowrap">
          {tickerItems.map((item, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span
                className="headline px-8"
                style={{ fontSize: "clamp(0.85rem,2vw,1.1rem)", color: "var(--crimson)", opacity: 0.75 }}
              >
                {item}
              </span>
              <span
                className="w-[5px] h-[5px] rounded-full shrink-0"
                style={{ backgroundColor: "rgba(96,0,0,0.25)" }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Editorial pillars */}
      <div ref={pillarsRef} className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        {pillars.map((pillar, i) => (
          <div
            key={i}
            className="pillar-row flex items-baseline gap-6 sm:gap-12 opacity-0 group"
            style={{
              borderBottom: "1px solid rgba(96,0,0,0.1)",
              paddingBottom: "2rem",
              marginBottom:  "2rem",
            }}
          >
            {/* Ghost number */}
            <span
              className="headline select-none shrink-0"
              style={{
                fontSize: "clamp(3rem,8vw,6.5rem)",
                color: "rgba(96,0,0,0.08)",
                minWidth: "4.5rem",
                lineHeight: 1,
              }}
            >
              {pillar.num}
            </span>

            <div className="flex-1">
              <h3
                className="headline transition-colors duration-200 group-hover:text-crimson"
                style={{ fontSize: "clamp(1.8rem,5vw,4rem)", color: "var(--foreground)" }}
              >
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base" style={{ color: "rgba(26,8,8,0.45)" }}>
                {pillar.subtitle}
              </p>
            </div>

            <svg
              className="hidden sm:block shrink-0 w-7 h-7 transition-colors duration-200 group-hover:stroke-crimson"
              style={{ color: "rgba(96,0,0,0.25)" }}
              fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div
        ref={quoteRef}
        className="opacity-0 text-center pb-16 px-6 max-w-2xl mx-auto"
      >
        <p className="text-xl leading-relaxed italic" style={{ color: "rgba(26,8,8,0.55)" }}>
          &ldquo;We got the reel back the next morning. It was better than anything we imagined.&rdquo;
        </p>
        <p className="section-label mt-4" style={{ color: "var(--crimson)", opacity: 0.6 }}>
          — Happy Client
        </p>
      </div>

      {/* Bottom ticker — reverse */}
      <div
        className="ticker-pause overflow-hidden py-5"
        style={{ borderTop: "1px solid rgba(96,0,0,0.12)" }}
      >
        <div className="ticker-track-reverse flex whitespace-nowrap">
          {tickerItems.map((item, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span
                className="headline px-8"
                style={{ fontSize: "clamp(0.85rem,2vw,1.1rem)", color: "var(--crimson)", opacity: 0.75 }}
              >
                {item}
              </span>
              <span
                className="w-[5px] h-[5px] rounded-full shrink-0"
                style={{ backgroundColor: "rgba(96,0,0,0.25)" }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
