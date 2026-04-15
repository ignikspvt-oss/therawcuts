"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { num: "01", title: "Per Reel Pricing",            desc: "Pay for exactly what you create. No mystery fees. Every collection is priced per reel."                               },
  { num: "02", title: "Discovery Call First",        desc: "We learn your story, your brand, your vibe — so the final reel feels unmistakably you."                               },
  { num: "03", title: "Reference-Friendly Process",  desc: "Got a reel you love? Share it. We use your references as a creative springboard."                                     },
  { num: "04", title: "Clean, Intentional Edits",    desc: "No over-filtering. No gimmicky transitions. Just tight editing that keeps the viewer watching."                       },
  { num: "05", title: "Private Online Delivery",     desc: "Your final reel is delivered directly to you — discreet, fast, and in full quality."                                  },
  { num: "06", title: "Story-Driven Direction",      desc: "We don't just capture moments — we shape them into a story that holds attention."                                     },
];

const cardOffsets: { ml: string; mr: string; maxW: string; variant: "crimson" | "white" }[] = [
  { ml: "0",    mr: "auto", maxW: "520px", variant: "crimson" },
  { ml: "auto", mr: "0",    maxW: "480px", variant: "white"   },
  { ml: "8%",   mr: "auto", maxW: "500px", variant: "crimson" },
  { ml: "auto", mr: "5%",   maxW: "500px", variant: "white"   },
  { ml: "5%",   mr: "auto", maxW: "480px", variant: "crimson" },
  { ml: "auto", mr: "8%",   maxW: "520px", variant: "white"   },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".features-h2",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power4.inOut",
          scrollTrigger: { trigger: titleRef.current, start: "top 78%" },
        }
      );
      gsap.fromTo(".features-sub",
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3,
          scrollTrigger: { trigger: titleRef.current, start: "top 78%" },
        }
      );
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card) => {
        gsap.fromTo(card,
          { rotateX: -80, opacity: 0, y: 60, scale: 0.88, transformPerspective: 1000, transformOrigin: "center bottom" },
          {
            rotateX: 0, opacity: 1, y: 0, scale: 1,
            duration: 0.9, ease: "power4.out",
            scrollTrigger: { trigger: card, start: "top 92%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "var(--surface-warm)", perspective: "1200px" }}
    >
      {/* Ghost background text — crimson tint */}
      <span
        className="headline absolute left-0 top-16 select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "18vw", color: "rgba(96,0,0,0.04)", lineHeight: 1 }}
      >
        BOLD
      </span>

      <div className="max-w-6xl mx-auto">
        <div className="lg:flex lg:gap-16 lg:items-start">
          {/* Sticky left title */}
          <div ref={titleRef} className="lg:w-[38%] lg:sticky lg:top-32 mb-16 lg:mb-0">
            <p className="section-label mb-4" style={{ color: "var(--crimson-vivid)" }}>
              What Makes Us Different
            </p>
            <div
              className="features-h2 headline"
              style={{
                fontSize: "clamp(2.8rem,5.5vw,4.5rem)",
                color: "var(--foreground)",
                clipPath: "inset(0 100% 0 0)",
              }}
            >
              Built for<br />
              <span style={{ color: "var(--crimson)" }}>the Bold.</span>
            </div>
            <p
              className="features-sub mt-6 text-lg leading-relaxed opacity-0"
              style={{ color: "rgba(26,8,8,0.45)" }}
            >
              Speed, precision, and story-driven reel production — that&apos;s the standard.
            </p>

            <svg
              className="mt-10 w-14 h-14 hidden lg:block"
              style={{ color: "var(--crimson)", opacity: 0.5 }}
              viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <path d="M8 32 C20 28, 36 20, 52 24" strokeLinecap="round" />
              <path d="M46 18 L52 24 L44 28" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Scattered cards */}
          <div className="lg:w-[62%] space-y-5" style={{ perspective: "1200px" }}>
            {features.map((feature, i) => {
              const offset    = cardOffsets[i];
              const isCrimson = offset.variant === "crimson";

              return (
                <div
                  key={feature.num}
                  className="feature-card"
                  style={{
                    marginLeft:  offset.ml,
                    marginRight: offset.mr,
                    maxWidth:    offset.maxW,
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity",
                  }}
                >
                  <div
                    className="rounded-2xl p-7 sm:p-8"
                    style={
                      isCrimson
                        ? { backgroundColor: "var(--crimson)", color: "#fff" }
                        : {
                            backgroundColor: "#fff",
                            color: "var(--foreground)",
                            boxShadow: "0 2px 20px rgba(96,0,0,0.07)",
                            border: "1px solid rgba(96,0,0,0.08)",
                          }
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold mb-5"
                      style={
                        isCrimson
                          ? { borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)" }
                          : { borderColor: "rgba(96,0,0,0.2)",     color: "var(--crimson)"        }
                      }
                    >
                      {feature.num}
                    </div>
                    <h3
                      className="headline"
                      style={{
                        fontSize: "clamp(1.3rem,2.5vw,1.75rem)",
                        color: isCrimson ? "#fff" : "var(--foreground)",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="mt-2 leading-relaxed text-[15px]"
                      style={{ color: isCrimson ? "rgba(255,255,255,0.72)" : "rgba(26,8,8,0.52)" }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
