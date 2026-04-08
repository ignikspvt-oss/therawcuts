"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = ["About", "Features", "Collections", "Process", "Portfolio", "FAQs"];

export default function Footer() {
  const linkStyle: React.CSSProperties = { color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" };

  return (
    <footer className="grain py-16 px-6" style={{ backgroundColor: "var(--crimson)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/logo.jpeg"
                alt="The Raw Cuts"
                width={32}
                height={32}
                style={{ height: "auto" }}
                className="rounded opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span
                className="brand-logo text-white"
                style={{ fontSize: "1rem", letterSpacing: "0.16em" }}
              >
                the raw cuts
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              We shoot, edit, and deliver your reel — in under 24 hours.
              India &amp; Canada.
            </p>
            <div className="mt-6 h-[1px] w-10" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </div>

          {/* Links */}
          <div className="flex gap-14 sm:gap-20">
            <div>
              <h4 className="section-label text-white mb-5">Pages</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      style={linkStyle}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
                      className="transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="section-label text-white mb-5">Get Started</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/book"
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
                    className="transition-colors duration-200"
                  >
                    Book a Shoot
                  </Link>
                </li>
                <li>
                  <a
                    href="#reviews"
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
                    className="transition-colors duration-200"
                  >
                    Reviews
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-label text-white mb-5">Contact</h4>
            <a
              href="mailto:hello@therawcuts.com"
              className="text-sm flex items-center gap-2 transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              hello@therawcuts.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} The Raw Cuts. All rights reserved.
          </p>
          <p className="headline text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            #HelloMainCharacter
          </p>
        </div>
      </div>
    </footer>
  );
}
