"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: "01", title: "Book Your Collection", desc: "Choose the collection that fits your vision. Fill in your details — it takes under two minutes." },
  { num: "02", title: "Discovery Call", desc: "We get on a quick call before the shoot. No scripts. Just a real conversation about you, your brand, and what story we're telling." },
  { num: "03", title: "The Shoot", desc: "Show up. We handle the rest. Clean setup, intentional direction, and a team that makes you look like you've done this a hundred times." },
  { num: "04", title: "The Edit", desc: "Our edit team gets to work the moment we wrap. Every cut, every transition, every colour grade — done with one goal: making you look incredible." },
  { num: "05", title: "Delivered in 24 Hours", desc: "Your reel lands in your inbox within 24 hours of the shoot. Watch it. Post it. Own it." },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(
        ".process-h2",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.9,
          ease: "power4.inOut",
          scrollTrigger: { trigger: titleRef.current, start: "top 80%" },
        }
      );

      // Crimson line draws downward on scroll
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 35%",
            end: "bottom 65%",
            scrub: true,
          },
        }
      );

      // Each step slides in from alternating sides (desktop only); fade in on mobile
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      gsap.utils.toArray<HTMLElement>(".process-step").forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: isMobile ? 0 : i % 2 === 0 ? -48 : 48, y: isMobile ? 16 : 0 },
          {
            opacity: 1, x: 0, y: 0,
            duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 85%" },
          }
        );

        const num = step.querySelector(".step-num");
        if (num) {
          gsap.fromTo(
            num,
            { scale: 1.6, opacity: 0 },
            {
              scale: 1, opacity: 1,
              duration: 0.6, ease: "power3.out",
              scrollTrigger: { trigger: step, start: "top 80%" },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "var(--crimson)" }}
    >
      {/* Ghost background text */}
      <span
        className="headline absolute right-0 bottom-0 select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "20vw", color: "rgba(255,255,255,0.05)", lineHeight: 1 }}
      >
        24H
      </span>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-20">
          <p className="section-label mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
            How It Works
          </p>
          <div
            className="process-h2 headline text-white"
            style={{ fontSize: "clamp(2.2rem,6vw,5rem)", clipPath: "inset(0 100% 0 0)" }}
          >
            Discovery Call to<br />
            Delivered Reel — One Day.
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            ref={lineRef}
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1.5px] origin-top"
            style={{ background: "rgba(255,255,255,0.25)" }}
          />

          <div className="space-y-10 md:space-y-14">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`process-step relative flex items-start gap-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot on line */}
                <div
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10 border-2"
                  style={{ backgroundColor: "#fff", borderColor: "var(--crimson)" }}
                />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 md:w-[45%] ${
                    i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12 md:ml-auto"
                  }`}
                >
                  <span className="step-num headline block" style={{ fontSize: "3.5rem", color: "rgba(255,255,255,0.14)" }}>
                    {step.num}
                  </span>
                  <h3 className="headline text-white mt-1" style={{ fontSize: "clamp(1.4rem,3vw,2rem)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
