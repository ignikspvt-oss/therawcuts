"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import Link from "next/link";
import { HiCheckCircle } from "react-icons/hi2";

function ConfirmationContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isRequest = searchParams.get("type") === "request";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".confirm-icon",
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", delay: 0.3 }
      );
      gsap.fromTo(
        ".confirm-text",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power2.out", delay: 0.8 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--crimson)" }}
    >
      <div className="text-center max-w-lg">
        <HiCheckCircle className="confirm-icon w-20 h-20 text-white mx-auto" />

        {isRequest ? (
          <>
            <h1
              className="confirm-text headline text-white mt-8"
              style={{ fontSize: "clamp(2.4rem,7vw,4rem)" }}
            >
              Request Received.
            </h1>
            <p className="confirm-text mt-4 text-white/65 text-lg leading-relaxed">
              Your booking request is in. We&apos;ll reach out within 24 hours
              to confirm your session and send you payment details in CA$.
            </p>
          </>
        ) : (
          <>
            <h1
              className="confirm-text headline text-white mt-8"
              style={{ fontSize: "clamp(2.4rem,7vw,4rem)" }}
            >
              You&apos;re In, Main Character.
            </h1>
            <p className="confirm-text mt-4 text-white/65 text-lg leading-relaxed">
              Your booking is confirmed. Check your inbox — we&apos;ll be in touch
              within 24 hours to set up your discovery call.
            </p>
          </>
        )}

        <Link
          href="/"
          className="confirm-text inline-block mt-8 px-8 py-4 rounded-full font-semibold transition-colors"
          style={{ backgroundColor: "#fff", color: "var(--crimson)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-warm)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--crimson)" }}>
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "2px solid #fff", borderTopColor: "transparent" }} />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
