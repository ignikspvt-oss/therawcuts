"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: "About",       href: "#about"       },
  { label: "Features",    href: "#features"    },
  { label: "Collections", href: "#collections" },
  { label: "Process",     href: "#process"     },
  { label: "Portfolio",   href: "#portfolio"   },
];

export default function Navbar() {
  const navRef   = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { country, openModal } = useLocation();

  useEffect(() => {
    const heroEl = document.querySelector("#hero");

    const ctx = gsap.context(() => {
      // Hero is now crimson — when we leave it, swap to white navbar
      if (heroEl) {
        ScrollTrigger.create({
          trigger: heroEl as Element,
          start: "bottom top+=80",
          onEnter:     () => setScrolled(true),
          onLeaveBack: () => setScrolled(false),
        });
      } else {
        // No hero on this page (e.g. /book) — always show solid navbar
        setScrolled(true);
      }

      if (linksRef.current) {
        gsap.fromTo(
          linksRef.current.children,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, delay: 1.6, ease: "power2.out" }
        );
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── dynamic styles ── */
  const navStyle: React.CSSProperties = scrolled
    ? {
        backgroundColor: "rgba(255,255,255,0.97)",
        backdropFilter:  "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(96,0,0,0.12)",
      }
    : {};

  const textColor     = scrolled ? "var(--foreground)"              : "#ffffff";
  const mutedColor    = scrolled ? "rgba(26,8,8,0.45)"              : "rgba(255,255,255,0.6)";
  const logoTextColor = scrolled ? "var(--crimson)"                 : "#ffffff";

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span
              className="brand-logo tracking-widest"
              style={{ fontSize: "1.5rem", color: logoTextColor, transition: "color 0.4s ease" }}
            >
              the raw cuts
            </span>
          </Link>

          {/* Desktop links */}
          <div ref={linksRef} className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="section-label transition-colors duration-200"
                style={{ color: mutedColor }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = scrolled ? "var(--crimson)" : "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = mutedColor)}
              >
                {link.label}
              </a>
            ))}
            {country && (
              <button
                onClick={openModal}
                className="section-label px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5"
                style={{ border: `1px solid ${scrolled ? "rgba(96,0,0,0.25)" : "rgba(255,255,255,0.35)"}`, color: mutedColor }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = scrolled ? "var(--crimson)" : "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = mutedColor)}
              >
                {country === "india" ? "🇮🇳 India" : "🇨🇦 Canada"}
              </button>
            )}
            <Link
              href="/book"
              className="section-label px-5 py-2.5 rounded-full transition-all duration-200"
              style={
                scrolled
                  ? { backgroundColor: "var(--crimson)", color: "#fff" }
                  : { backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }
              }
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--crimson-vivid)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = scrolled ? "var(--crimson)" : "rgba(255,255,255,0.15)")}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden relative z-50 w-11 h-11 flex flex-col justify-center items-center gap-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-6 h-[1.5px] transition-all duration-300 origin-center"
                style={{
                  backgroundColor: textColor,
                  opacity:    i === 1 && mobileOpen ? 0 : 1,
                  transform:
                    i === 0 && mobileOpen ? "rotate(45deg) translateY(5px)"
                    : i === 2 && mobileOpen ? "rotate(-45deg) translateY(-5px)"
                    : "none",
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay — crimson bg */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 lg:hidden transition-all duration-500"
        style={{
          backgroundColor: "var(--crimson)",
          opacity:        mobileOpen ? 1 : 0,
          pointerEvents:  mobileOpen ? "auto" : "none",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href)}
            className="headline text-white hover:opacity-70 transition-opacity"
            style={{ fontSize: "clamp(2rem,8vw,3rem)", transitionDelay: mobileOpen ? `${i * 0.04}s` : "0s" }}
          >
            {link.label}
          </a>
        ))}

        <Link
          href="/book"
          className="mt-4 bg-white px-10 py-3.5 rounded-full font-semibold transition-colors duration-200"
          style={{ color: "var(--crimson)" }}
          onClick={() => setMobileOpen(false)}
        >
          Book Your Shoot →
        </Link>
      </div>
    </>
  );
}
