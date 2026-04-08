"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Shared-element carry from loader → hero.
 *
 * Stays fully invisible while the loader shows.
 * At 1.28s (when loader fades) it teleports to the exact pixel
 * position of #loader-tagline and appears instantly — looks like
 * the loader text itself starts growing.
 *
 * Timeline:
 *   0.00s  invisible
 *   1.28s  snap to loader-tagline position → opacity 1 instantly
 *           simultaneously: grow to scale 5 + drift to center (0.5s)
 *   1.78s  big, centered — curtain is already rising
 *   1.98s  shrink + fly to #hero-hello-main center (0.9s)
 *   2.65s  fade out → dispatch "introTextLanded"
 */
export default function IntroText() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [done, setDone]   = useState(false);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      // Skip intro — dispatch landed event immediately so Hero reveals
      (window as Window & { __introLanded?: boolean }).__introLanded = true;
      window.dispatchEvent(new Event("introTextLanded"));
      setDone(true);
      return;
    }

    gsap.set(text, { opacity: 0, scale: 1, x: 0, y: 0 });

    const tl = gsap.timeline();

    /* ── Snap + swell at 1.28s ── */
    tl.add(() => {
      const loaderTag = document.getElementById("loader-tagline");
      if (!loaderTag) return;

      const lr  = loaderTag.getBoundingClientRect();
      const cx  = window.innerWidth  / 2;
      const cy  = window.innerHeight / 2;

      // Teleport to loader label position, appear instantly
      gsap.set(text, {
        x:       lr.left + lr.width  / 2 - cx,
        y:       lr.top  + lr.height / 2 - cy,
        opacity: 1,
      });

      // Grow toward center
      gsap.to(text, {
        x:        0,
        y:        0,
        scale:    5,
        duration: 0.5,
        ease:     "power2.inOut",
      });
    }, 1.28);

    /* ── Fly to hero-hello-main + shrink ── */
    tl.add(() => {
      const target = document.getElementById("hero-hello-main");
      if (!target) return;

      const tr = target.getBoundingClientRect();
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;

      gsap.to(text, {
        x:        tr.left + tr.width  / 2 - cx,
        y:        tr.top  + tr.height / 2 - cy,
        scale:    1,
        duration: 0.9,
        ease:     "power4.inOut",
      });
    }, 1.98);

    /* ── Fade out + hand off ── */
    tl.to(text, { opacity: 0, duration: 0.35, ease: "power2.in" }, 2.65);
    tl.call(() => {
      (window as Window & { __introLanded?: boolean }).__introLanded = true;
      window.dispatchEvent(new Event("introTextLanded"));
      setDone(true);
    }, [], 2.72);

    return () => { tl.kill(); };
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position:       "fixed",
        inset:          0,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         10001,
        pointerEvents:  "none",
      }}
    >
      {/* Matches loader-tagline exactly so the snap is invisible */}
      <p
        ref={textRef}
        className="section-label"
        style={{
          color:       "rgba(255,255,255,0.55)",
          letterSpacing: "0.38em",
          whiteSpace:  "nowrap",
        }}
      >
        Hello Main Character
      </p>
    </div>
  );
}
