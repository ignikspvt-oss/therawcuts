"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "24H",  label: "Delivery"    },
  { value: "100+", label: "Reels Made"  },
  { value: "2",    label: "Countries"   },
];

export default function Hero() {
  const sectionRef  = useRef<HTMLElement>(null);
  const line1Ref    = useRef<HTMLDivElement>(null);
  const tagRef      = useRef<HTMLDivElement>(null);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const rulerRef    = useRef<HTMLDivElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice =
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Hero tag is revealed by IntroText's "introTextLanded" event.
    // If IntroText already ran (back-navigation), show immediately.
    gsap.set(tagRef.current, { opacity: 0 });
    if ((window as Window & { __introLanded?: boolean }).__introLanded) {
      gsap.to(tagRef.current, { opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.2 });
    }
    const onLanded = () => {
      gsap.to(tagRef.current, { opacity: 1, duration: 0.5, ease: "power3.out" });
    };
    window.addEventListener("introTextLanded", onLanded);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        // Simple fade-in for all hero elements
        gsap.set(line1Ref.current, { clipPath: "inset(0 0% 0 0)" });
        gsap.set(rulerRef.current, { scaleX: 1 });
        gsap.to([taglineRef.current, subRef.current], { opacity: 1, duration: 0.3, delay: 0.2 });
        if (ctaRef.current)
          gsap.to(Array.from(ctaRef.current.children), { opacity: 1, duration: 0.3, delay: 0.3 });
        if (statsRef.current)
          gsap.to(Array.from(statsRef.current.children), { opacity: 1, duration: 0.3, delay: 0.4 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(line1Ref.current,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power4.inOut" }, 1.5)
        .fromTo(taglineRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5 }, 2.3)
        .fromTo(rulerRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: "power3.inOut", transformOrigin: "left" }, 2.42)
        .fromTo(subRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.6 }, 2.58)
        .fromTo(ctaRef.current ? Array.from(ctaRef.current.children) : [],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, stagger: 0.12, duration: 0.55, ease: "back.out(1.4)" }, 2.75)
        .fromTo(statsRef.current ? Array.from(statsRef.current.children) : [],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }, 2.95);

      /* Scroll parallax */
      gsap.to(sectionRef.current, {
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
        y: 110, ease: "none",
      });
    }, sectionRef);

    /* Mouse-follow glow — desktop only, with rAF throttling */
    const glow = glowRef.current;
    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;
    const onMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        if (glow) {
          gsap.to(glow, {
            x: latestX - 240,
            y: latestY - 240,
            duration: 1,
            ease: "power2.out",
          });
        }
        rafId = null;
      });
    };
    if (!isTouchDevice && !reducedMotion) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("introTextLanded", onLanded);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToPortfolio = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="grain relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "var(--crimson)" }}
    >
      {/* Soft radial glow (deeper red) */}
      <div
        ref={glowRef}
        className="absolute w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", zIndex: 0, willChange: "transform" }}
      />

      {/* Ghost oversized "RAW" behind headline */}
      <span
        className="headline absolute right-0 bottom-0 select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "28vw", color: "rgba(255,255,255,0.04)", lineHeight: 1, zIndex: 0 }}
      >
        RAW
      </span>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 sm:pt-24 pb-24 sm:pb-40">
        {/* ── HELLO label — centered, letter-spacing tightened on mobile ── */}
        <div
          ref={tagRef}
          id="hero-hello-main"
          className="text-center mb-4 sm:mb-6"
          style={{ opacity: 0 }}
        >
          <p style={{
            fontSize: "clamp(0.65rem, 1.4vw, 1rem)",
            fontWeight: 600,
            letterSpacing: "clamp(0.1em, 0.5vw, 0.32em)",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--font-brand), Arial, sans-serif",
            textTransform: "uppercase",
          }}>
            HELLO MAIN CHARACTER ENERGY
          </p>
        </div>

        {/* Main headline — brand font, single-line, fits all screens */}
        <div
          ref={line1Ref}
          className="text-white text-center brand-logo"
          style={{
            // 77rem = max-w-7xl (80rem) − px-6 both sides (3rem) — cap prevents overflow on wide screens
            fontSize: "min(calc((100vw - 3rem) / 20), 3.85rem)",
            whiteSpace: "nowrap",
            clipPath: "inset(0 100% 0 0)",

          }}
        >
          #MainCharacterEnergy
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-center opacity-0"
          style={{
            fontSize: "clamp(0.7rem, 1.4vw, 1rem)",
            letterSpacing: "clamp(0.08em, 0.5vw, 0.2em)",
            color: "rgba(255,255,255,0.4)",
            marginTop: "0.5rem",
            fontFamily: "var(--font-brand), Arial, sans-serif",
          }}
        >
          #MainCharacterEnergy
        </p>

        {/* Crimson ruler — centered on mobile, left on desktop */}
        <div
          ref={rulerRef}
          className="mt-6 sm:mt-8 mb-6 sm:mb-8 h-[1px] w-16 sm:w-24 mx-auto sm:mx-0 origin-left"
          style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        />

        {/* Sub-copy */}
        <p
          ref={subRef}
          className="text-base sm:text-lg lg:text-xl max-w-xl leading-relaxed opacity-0"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          This is Your Moment. We shoot, edit, and deliver your reel — in under 24&nbsp;hours.
          No fluff. No filler. Just you, in your element.
        </p>

        {/* CTAs — full-width stacked on mobile, inline on sm+ */}
        <div ref={ctaRef} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
          <Link
            href="/book"
            className="px-8 py-4 rounded-full font-semibold text-center transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{ backgroundColor: "#fff", color: "var(--crimson)" }}
          >
            Book Your Shoot →
          </Link>
          <a
            href="#portfolio"
            onClick={scrollToPortfolio}
            className="px-8 py-4 rounded-full font-medium text-center transition-all duration-200 active:scale-[0.97]"
            style={{ border: "1.5px solid rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.85)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)")}
          >
            See Our Work ↓
          </a>
        </div>

        {/* Stats — tighter gap + smaller top margin on mobile */}
        <div
          ref={statsRef}
          className="mt-12 sm:mt-20 flex flex-wrap items-center gap-6 sm:gap-10 lg:gap-16"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "1.25rem" }}
        >
          {stats.map((s) => (
            <div key={s.value} className="opacity-0">
              <p className="headline text-white" style={{ fontSize: "clamp(1.3rem, 4vw, 2.4rem)" }}>
                {s.value}
              </p>
              <p className="section-label mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(96,0,0,0.4), transparent)" }}
      />
    </section>
  );
}
