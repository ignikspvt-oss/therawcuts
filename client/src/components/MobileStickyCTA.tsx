"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sticky "Book Now" CTA for mobile viewports.
 * - Hidden on desktop (shown only < 768px)
 * - Appears after scrolling past the hero
 * - Auto-hides when the user is near the bottom (FooterCTA already has a big CTA)
 */
export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show on home page
    if (pathname !== "/") {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      const scrolled = window.scrollY;
      const viewport = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const nearBottom = scrolled + viewport > fullHeight - 800;
      const pastHero = scrolled > viewport * 0.6;
      setVisible(pastHero && !nearBottom);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <div
      aria-hidden={!visible}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none"
      style={{
        background:
          "linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <Link
        href="/book"
        tabIndex={visible ? 0 : -1}
        className="pointer-events-auto flex items-center justify-center gap-2 w-full rounded-full font-semibold text-[15px] py-4 shadow-lg"
        style={{ backgroundColor: "var(--crimson)", color: "#fff", minHeight: 52 }}
      >
        Book Your Shoot
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
