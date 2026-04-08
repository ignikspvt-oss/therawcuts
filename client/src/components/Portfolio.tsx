"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HiChevronLeft, HiChevronRight, HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const reels = [
  { id: 1, src: null,              title: "Reel 01", alt: "Business reel 1 — The Raw Cuts" },
  { id: 2, src: "/reels/reel_2.mp4", title: "Reel 02", alt: "Business reel 2 — The Raw Cuts" },
  { id: 3, src: "/reels/reel_3.mp4", title: "Reel 03", alt: "Business reel 3 — The Raw Cuts" },
  { id: 4, src: "/reels/reel_4.mp4", title: "Reel 04", alt: "Business reel 4 — The Raw Cuts" },
  { id: 5, src: "/reels/reel_5.mp4", title: "Reel 05", alt: "Business reel 5 — The Raw Cuts" },
  { id: 6, src: "/reels/reel_6.mp4", title: "Reel 06", alt: "Business reel 6 — The Raw Cuts" },
];

export default function Portfolio() {
  const sectionRef      = useRef<HTMLElement>(null);
  const phoneWrapperRef = useRef<HTMLDivElement>(null);
  const phoneRef        = useRef<HTMLDivElement>(null);
  const sideTextRef     = useRef<HTMLDivElement>(null);
  const [current,      setCurrent]      = useState(0);
  const [isPaused,     setIsPaused]     = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [isMuted,      setIsMuted]      = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRefs   = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(phoneRef.current, {
        y: 480, opacity: 0, scale: 0.62, rotateX: 28,
        transformPerspective: 1200, transformOrigin: "center bottom",
      });
      gsap.set(".portfolio-arrow", { opacity: 0, x: (i) => (i === 0 ? -36 : 36) });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: phoneWrapperRef.current,
          start: "top 90%", end: "top 20%", scrub: 0.8,
          onLeave:     () => setPhoneVisible(true),
          onEnterBack: () => setPhoneVisible(true),
          onEnter:     () => setPhoneVisible(false),
        },
      });
      tl.to(phoneRef.current, { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: "power2.out" })
        .to(".portfolio-arrow", { opacity: 1, x: 0, stagger: 0.1, duration: 0.3, ease: "back.out(1.7)" }, "-=0.3");

      ScrollTrigger.create({
        trigger: phoneWrapperRef.current,
        start: "top 45%",
        onEnter: () => setPhoneVisible(true),
      });

      gsap.fromTo(sideTextRef.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: phoneWrapperRef.current, start: "top 55%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!phoneVisible || isPaused) { if (autoPlayRef.current) clearInterval(autoPlayRef.current); return; }
    autoPlayRef.current = setInterval(() => setCurrent((p) => (p + 1) % reels.length), 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isPaused, phoneVisible]);

  // Play active video, pause/reset others
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current) { vid.play().catch(() => {}); }
      else               { vid.pause(); vid.currentTime = 0; }
    });
  }, [current]);

  // Sync muted state directly on DOM elements (React's muted prop doesn't update after mount)
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      videoRefs.current.forEach((vid) => { if (vid) vid.muted = next; });
      return next;
    });
  }, []);

  const goNext = useCallback(() => { setCurrent((p) => (p + 1) % reels.length); setIsPaused(true); setTimeout(() => setIsPaused(false), 8000); }, []);
  const goPrev = useCallback(() => { setCurrent((p) => (p - 1 + reels.length) % reels.length); setIsPaused(true); setTimeout(() => setIsPaused(false), 8000); }, []);

  const arrowBase: React.CSSProperties = {
    border: "1.5px solid rgba(96,0,0,0.2)",
    color: "rgba(96,0,0,0.4)",
    borderRadius: "50%",
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
  };

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="grain relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "var(--surface-warm)", perspective: "1200px" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <p className="section-label mb-3" style={{ color: "var(--crimson-vivid)" }}>The Work</p>
          <h2 className="headline" style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)", color: "var(--foreground)" }}>
            Let the Reels<br />
            <span style={{ color: "var(--crimson)" }}>Do the Talking.</span>
          </h2>
        </div>

        {/* Phone + arrows */}
        <div
          ref={phoneWrapperRef}
          className="mt-24 flex items-center justify-center gap-8 sm:gap-16 min-h-[580px]"
        >
          <button
            onClick={goPrev}
            style={arrowBase}
            aria-label="Previous reel"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"; (e.currentTarget as HTMLElement).style.color = "var(--crimson)"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(96,0,0,0.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,0,0,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(96,0,0,0.4)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            className="portfolio-arrow"
          >
            <HiChevronLeft className="w-6 h-6" />
          </button>

          {/* Phone */}
          <div
            ref={phoneRef}
            className="relative flex-shrink-0"
            style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Crimson glow on warm bg */}
            <div
              className="absolute -inset-10 rounded-full pointer-events-none blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(96,0,0,0.12) 0%, transparent 70%)" }}
            />

            {/* Phone bezel — crimson red */}
            <div
              className="relative rounded-[44px] p-[10px]"
              style={{
                width: "clamp(270px,35vw,310px)",
                backgroundColor: "#0a0a0a",
                boxShadow: "0 40px 100px -20px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <div
                className="absolute z-20 rounded-full"
                style={{ top: "14px", left: "50%", transform: "translateX(-50%)", width: "88px", height: "28px", backgroundColor: "#0a0a0a" }}
              />

              <div
                className="relative rounded-[34px] overflow-hidden"
                style={{ aspectRatio: "9/19.5", backgroundColor: "var(--crimson)", transform: "translateZ(0)", isolation: "isolate" }}
              >
                <div className="relative w-full h-full" style={{ transform: "translateZ(0)" }}>
                  {reels.map((reel, i) => (
                    <div
                      key={reel.id}
                      className="absolute inset-0"
                      style={{
                        transform: `translateX(${(i - current) * 100}%) translateZ(0)`,
                        opacity: i === current ? 1 : 0.5,
                        transition: "transform 480ms cubic-bezier(0.4,0,0.2,1), opacity 480ms cubic-bezier(0.4,0,0.2,1)",
                        willChange: "transform, opacity",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {reel.src ? (
                        <video
                          ref={(el) => { videoRefs.current[i] = el; }}
                          src={reel.src}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-label={reel.alt}
                        />
                      ) : (
                        /* reel_1 is .MOV — convert to mp4 for browser support */
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--crimson)" }}>
                          <p className="text-white/60 text-xs text-center px-4">Reel 01<br/>(convert to mp4)</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Sound toggle */}
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="absolute top-12 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
                  >
                    {isMuted
                      ? <HiSpeakerXMark className="w-4 h-4 text-white" />
                      : <HiSpeakerWave  className="w-4 h-4 text-white" />
                    }
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <p className="text-white text-xs font-medium mb-2">{reels[current].title}</p>
                    <div className="flex gap-0.5">
                      {reels.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setCurrent(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 8000); }}
                          className="group flex items-center justify-center p-2 -m-2 min-w-[28px] min-h-[28px] touch-manipulation"
                          aria-label={`Go to reel ${i + 1}`}
                          aria-current={i === current ? "true" : undefined}
                        >
                          <span
                            className="block h-[3px] rounded-full transition-all duration-300"
                            style={{
                              width: i === current ? "24px" : "10px",
                              backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.35)",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-1 flex justify-center pb-1">
                <div className="w-24 h-[3px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
              </div>
            </div>
          </div>

          <button
            onClick={goNext}
            style={arrowBase}
            aria-label="Next reel"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"; (e.currentTarget as HTMLElement).style.color = "var(--crimson)"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(96,0,0,0.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,0,0,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(96,0,0,0.4)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            className="portfolio-arrow"
          >
            <HiChevronRight className="w-6 h-6" />
          </button>

          {/* Side text */}
          <div ref={sideTextRef} className="hidden xl:block absolute right-8 opacity-0" style={{ maxWidth: "200px" }}>
            <p className="section-label mb-3" style={{ color: "var(--crimson-vivid)" }}>Every reel</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(26,8,8,0.45)" }}>Shot and delivered within 24 hours. Quality over quantity — always.</p>
            <div className="mt-5 h-px w-10" style={{ backgroundColor: "var(--crimson)", opacity: 0.3 }} />
          </div>
        </div>

        {/* Counter */}
        <p className="mt-5 text-center font-mono text-sm" style={{ color: "rgba(26,8,8,0.3)" }}>
          {String(current + 1).padStart(2, "0")} / {String(reels.length).padStart(2, "0")}
        </p>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-lg font-semibold mb-5" style={{ color: "var(--foreground)" }}>Like What You See?</p>
          <Link
            href="/book"
            className="inline-block px-8 py-4 rounded-full font-semibold transition-all duration-200 hover:scale-[1.03]"
            style={{ backgroundColor: "var(--crimson)", color: "#fff" }}
          >
            Book a Shoot →
          </Link>
        </div>
      </div>
    </section>
  );
}
