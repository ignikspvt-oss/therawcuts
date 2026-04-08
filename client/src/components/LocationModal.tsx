"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLocation } from "@/context/LocationContext";

export default function LocationModal() {
  const { showModal, setCountry } = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showModal || !overlayRef.current || !cardRef.current) return;

    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.92, y: 24 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.5)", delay: 0.1 }
    );
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(26,8,8,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        ref={cardRef}
        className="bg-white rounded-3xl p-10 w-full max-w-sm text-center shadow-2xl"
      >
        <p className="section-label mb-3" style={{ color: "var(--crimson)" }}>
          Welcome to The Raw Cuts
        </p>
        <h2
          className="headline"
          style={{ fontSize: "clamp(1.8rem,5vw,2.4rem)", color: "var(--crimson)", lineHeight: 1.1 }}
        >
          Where are<br />you based?
        </h2>
        <p className="mt-3 text-sm" style={{ color: "rgba(26,8,8,0.45)" }}>
          We&apos;ll show you the right pricing for your region.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {[
            { key: "india" as const, flag: "🇮🇳", label: "India", sub: "Pay in ₹ INR" },
            { key: "canada" as const, flag: "🇨🇦", label: "Canada", sub: "Pay in CA$ CAD" },
          ].map(({ key, flag, label, sub }) => (
            <button
              key={key}
              onClick={() => setCountry(key)}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] active:scale-100"
              style={{ borderColor: "rgba(96,0,0,0.15)", backgroundColor: "var(--surface-warm)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--crimson)";
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--surface-rose)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(96,0,0,0.15)";
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--surface-warm)";
              }}
            >
              <span className="text-4xl leading-none">{flag}</span>
              <div>
                <p className="font-bold text-base" style={{ color: "var(--crimson)" }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(96,0,0,0.5)" }}>
                  {sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
