"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function FooterCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background shifts white → deep crimson as section scrolls into view
      gsap.fromTo(
        sectionRef.current,
        { backgroundColor: "#ffffff" },
        {
          backgroundColor: "var(--crimson)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            end: "top 15%",
            scrub: true,
          },
        }
      );

      // Headline text color shifts foreground → white
      gsap.fromTo(
        headlineRef.current,
        { color: "var(--foreground)" },
        {
          color: "#ffffff",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            end: "top 15%",
            scrub: true,
          },
        }
      );

      // Sub text color
      gsap.fromTo(
        subRef.current,
        { color: "rgba(8,8,8,0.52)" },
        {
          color: "rgba(255,255,255,0.55)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            end: "top 15%",
            scrub: true,
          },
        }
      );

      // Headline scale-up reveal on scroll
      gsap.fromTo(
        headlineRef.current,
        { scale: 0.78, opacity: 0.2 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: true,
          },
        }
      );

      // Button bounce in
      gsap.fromTo(
        btnRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.65, ease: "back.out(1.5)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 38%" },
        }
      );

      // Sub text fade in
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 55%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-36 px-6 text-center"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="section-label mb-6" style={{ color: "var(--crimson-vivid)" }}>
          Ready?
        </p>
        <h2
          ref={headlineRef}
          className="headline"
          style={{
            fontSize: "clamp(3rem,9vw,8.5rem)",
            color: "var(--ink)",
            willChange: "transform, opacity, color",
          }}
        >
          Ready to Be<br />the Main Character?
        </h2>

        <p
          ref={subRef}
          className="mt-6 text-lg max-w-lg mx-auto leading-relaxed opacity-0"
          style={{ color: "rgba(8,8,8,0.52)" }}
        >
          One shoot. Delivered in 24 hours. Your story, your way.
        </p>

        <Link
          href="/book"
          ref={btnRef}
          className="inline-block mt-10 px-12 py-5 rounded-full text-lg font-semibold transition-all duration-200 hover:scale-[1.04] opacity-0"
          style={{ backgroundColor: "var(--foreground)", color: "#fff" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#fff";
            (e.currentTarget as HTMLElement).style.color = "var(--crimson)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--foreground)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
        >
          Explore Collections →
        </Link>
      </div>
    </section>
  );
}
