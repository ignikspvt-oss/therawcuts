"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const valuePillars = [
  { title: "24-Hour Delivery", desc: "Shoot today. Reel in your hands by tomorrow." },
  { title: "Quality First", desc: "We'd rather do one reel perfectly than five reels poorly." },
  { title: "You're the Star", desc: "Every frame is framed around you. The camera loves what you love." },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const h2Line1Ref = useRef<HTMLDivElement>(null);
  const h2Line2Ref = useRef<HTMLDivElement>(null);
  const h2Line3Ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, x: -24 },
        {
          opacity: 1, x: 0, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );

      // Headline lines — clip-path reveal staggered
      [h2Line1Ref, h2Line2Ref, h2Line3Ref].forEach((ref, i) => {
        gsap.fromTo(
          ref.current,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.8,
            ease: "power4.inOut",
            delay: i * 0.12,
            scrollTrigger: { trigger: h2Line1Ref.current, start: "top 80%" },
          }
        );
      });

      // Body
      gsap.fromTo(
        bodyRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: bodyRef.current, start: "top 82%" },
        }
      );

      // Cards stagger up
      gsap.fromTo(
        ".value-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, stagger: 0.12, duration: 0.65, ease: "power3.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 82%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-28 px-6 bg-white overflow-hidden"
    >
      {/* Ghost background number */}
      <span
        className="headline absolute right-0 top-8 select-none pointer-events-none hidden lg:block"
        style={{
          fontSize: "22vw",
          color: "rgba(96,0,0,0.05)",
          lineHeight: 1,
          right: "-2vw",
        }}
      >
        01
      </span>

      <div className="relative max-w-5xl mx-auto">
        {/* Label */}
        <p
          ref={labelRef}
          className="section-label opacity-0"
          style={{ color: "var(--crimson)", marginBottom: "1.25rem" }}
        >
          Who We Are
        </p>

        {/* Headline — three clip-reveal lines */}
        <div
          className="headline"
          style={{
            fontSize: "clamp(2.2rem,6vw,5rem)",
            color: "var(--ink)",
          }}
        >
          <div ref={h2Line1Ref} style={{ clipPath: "inset(0 100% 0 0)" }}>
            We Don&apos;t Just Shoot.
          </div>
          <div ref={h2Line2Ref} style={{ clipPath: "inset(0 100% 0 0)" }}>
            We Tell Your Story
          </div>
          <div ref={h2Line3Ref} style={{ clipPath: "inset(0 100% 0 0)", color: "var(--crimson)" }}>
            In Under 24 Hours.
          </div>
        </div>

        {/* Body */}
        <p
          ref={bodyRef}
          className="mt-8 text-lg leading-relaxed max-w-3xl opacity-0"
          style={{ color: "rgba(8,8,8,0.55)" }}
        >
          We create for people who mean business — founders, creators, brands, and events
          that deserve to be seen clearly. We shoot, edit, and deliver reels within 24 hours,
          combining photography and videography with a clean, intentional approach. Across
          India and Canada, our work is fast, precise, and story-driven — no filler, no delays.
        </p>

        {/* Value cards */}
        <div ref={cardsRef} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-0">
          {valuePillars.map((pillar, i) => (
            <div
              key={i}
              className="value-card p-8 opacity-0 group"
              style={{
                borderTop: "3px solid var(--crimson)",
                borderRight: i < 2 ? "1px solid rgba(8,8,8,0.08)" : "none",
              }}
            >
              <span
                className="headline block mb-3"
                style={{ fontSize: "3rem", color: "rgba(8,8,8,0.06)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="headline"
                style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", color: "var(--crimson)" }}
              >
                {pillar.title}
              </h3>
              <p className="mt-3 leading-relaxed" style={{ color: "rgba(8,8,8,0.55)" }}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
