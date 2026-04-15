"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";

gsap.registerPlugin(ScrollTrigger);

const INSTAGRAM_URL = "https://www.instagram.com/the_rawcuts?igsh=MXVzOWtneGh4YmF3Nw==";

const navLinks = [
  { label: "Collections", href: "#collections" },
  { label: "Portfolio",   href: "#portfolio"   },
  { label: "Reviews",     href: "#reviews"     },
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
      if (heroEl) {
        ScrollTrigger.create({
          trigger: heroEl as Element,
          start: "bottom top+=80",
          onEnter:     () => setScrolled(true),
          onLeaveBack: () => setScrolled(false),
        });
      } else {
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
          {/* Logo — text only */}
          <Link href="/" className="flex items-center gap-3 group">
            <span
              className="brand-logo tracking-normal"
              style={{ fontSize: "1.5rem", color: logoTextColor, transition: "color 0.4s ease" }}
            >
              the raw cuts.
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

            {/* Instagram icon */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-colors duration-200"
              style={{ color: mutedColor }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = scrolled ? "var(--crimson)" : "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = mutedColor)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

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

        {/* Instagram in mobile menu */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="section-label">Instagram</span>
        </a>

        {/* Currency / country switcher — mirrors desktop pill */}
        {country && (
          <button
            onClick={() => { setMobileOpen(false); openModal(); }}
            className="section-label px-5 py-2.5 rounded-full flex items-center gap-2 transition-opacity duration-200 active:opacity-60"
            style={{ border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.75)" }}
          >
            {country === "india" ? "🇮🇳 India · ₹ INR" : "🇨🇦 Canada · CA$"}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>— Change</span>
          </button>
        )}

        <Link
          href="/book"
          className="mt-2 bg-white px-10 py-3.5 rounded-full font-semibold transition-colors duration-200"
          style={{ color: "var(--crimson)" }}
          onClick={() => setMobileOpen(false)}
        >
          Book Your Shoot →
        </Link>
      </div>
    </>
  );
}
