"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function PageLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const lineRef   = useRef<HTMLDivElement>(null);
  const wordRef   = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      // Skip the loader sequence entirely — go straight to page
      setDone(true);
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setDone(true) });

    tl.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.55, ease: "power3.inOut" }
      )
      .fromTo(wordRef.current,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        "-=0.15"
      )
      .to({}, { duration: 0.4 })
      .to([wordRef.current, lineRef.current], {
        opacity: 0, y: -16, duration: 0.28, ease: "power2.in", stagger: 0.04,
      })
      .to(loaderRef.current, {
        yPercent: -100, duration: 0.85, ease: "power4.inOut",
      });
  }, []);

  if (done) return null;

  return (
    <div ref={loaderRef} className="page-loader">
      {/* White accent line */}
      <div
        ref={lineRef}
        style={{
          position: "absolute",
          width: "120px",
          height: "2px",
          backgroundColor: "rgba(255,255,255,0.6)",
          transformOrigin: "center",
          top: "calc(50% - 44px)",
        }}
      />
      {/* Brand name + tagline */}
      <div ref={wordRef} style={{ textAlign: "center", opacity: 0 }}>
        <p
          className="brand-logo text-white"
          style={{ fontSize: "clamp(1.8rem,5vw,2.5rem)", letterSpacing: "0.18em" }}
        >
          the raw cuts
        </p>
        <p
          id="loader-tagline"
          className="section-label"
          style={{
            color: "rgba(255,255,255,0.45)",
            marginTop: "0.75rem",
            letterSpacing: "0.38em",
          }}
        >
          Hello Main Character
        </p>
      </div>
    </div>
  );
}
