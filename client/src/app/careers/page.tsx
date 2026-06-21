import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HiArrowLeft, HiArrowTopRightOnSquare } from "react-icons/hi2";

const GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSefk6CIvXyjFm5XBt7UxNZQDEPdFZ-46kVZr5oLWvKgzWIKJw/viewform?embedded=true";
const GOOGLE_FORM_DIRECT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSefk6CIvXyjFm5XBt7UxNZQDEPdFZ-46kVZr5oLWvKgzWIKJw/viewform";
const INSTAGRAM_URL =
  "https://www.instagram.com/the_rawcuts?igsh=MXVzOWtneGh4YmF3Nw==";

const ROLES = ["Videographers", "Editors", "Creative Strategists", "Social Media"];

export const metadata: Metadata = {
  title: "Careers — Join the Crew",
  description:
    "Join The Raw Cuts. We're hiring videographers, editors, and creative storytellers to build the team behind the reels. Apply now.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers — Join the Crew | The Raw Cuts",
    description:
      "We're hiring videographers, editors, and creative storytellers. Show us what you've got.",
    url: "/careers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers — Join the Crew | The Raw Cuts",
    description:
      "We're hiring videographers, editors, and creative storytellers. Show us what you've got.",
  },
};

export default function CareersPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--surface-warm)" }}>
      {/* ── Crimson header strip ── */}
      <header className="grain px-6 pt-10 pb-20" style={{ backgroundColor: "var(--crimson)" }}>
        <div className="max-w-2xl mx-auto relative z-[2]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-7">
            <Image
              src="/logo_white.PNG"
              alt="the raw cuts"
              width={140}
              height={40}
              className="object-contain"
              style={{ height: "2rem", width: "auto" }}
              priority
            />
          </div>

          <p className="section-label mb-4" style={{ color: "var(--crimson-light)" }}>
            We&apos;re Hiring
          </p>

          <h1 className="headline text-white" style={{ fontSize: "clamp(2.4rem,7vw,4rem)" }}>
            Join the Crew
          </h1>

          <p className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed max-w-xl">
            Shooters. Editors. Storytellers. If you live for the frame and the cut,
            show us what you&apos;ve got — we&apos;re building the team behind the reels.
          </p>

          {/* Role chips */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            {ROLES.map((role) => (
              <span
                key={role}
                className="section-label px-3.5 py-2 rounded-full"
                style={{
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Application form card (overlaps header) ── */}
      <section className="relative z-[3] px-6 -mt-10 pb-20">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl bg-white overflow-hidden"
            style={{
              border: "1px solid rgba(96,0,0,0.08)",
              boxShadow: "0 24px 60px -24px rgba(96,0,0,0.35)",
            }}
          >
            {/* Card header label */}
            <div
              className="px-6 sm:px-8 py-5 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(96,0,0,0.08)" }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--crimson-vivid)" }}
              />
              <span className="section-label" style={{ color: "var(--crimson)" }}>
                Application Form
              </span>
            </div>

            {/* Embedded Google Form */}
            <iframe
              src={GOOGLE_FORM_EMBED_URL}
              title="The Raw Cuts — Careers Application Form"
              className="w-full block"
              style={{ height: "3923px", border: 0 }}
              loading="lazy"
            >
              Loading…
            </iframe>
          </div>

          {/* Fallback link */}
          <p className="mt-6 text-center text-sm" style={{ color: "rgba(26,8,8,0.5)" }}>
            Trouble loading the form?{" "}
            <a
              href={GOOGLE_FORM_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
              style={{ color: "var(--crimson)" }}
            >
              Open it in a new tab
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </section>

      {/* ── Slim footer ── */}
      <footer className="grain px-6 py-12" style={{ backgroundColor: "var(--crimson)" }}>
        <div className="max-w-2xl mx-auto relative z-[2] flex flex-col items-center gap-6 text-center">
          <Image
            src="/logo_white.PNG"
            alt="the raw cuts"
            width={120}
            height={34}
            className="object-contain"
            style={{ height: "1.6rem", width: "auto" }}
          />

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link
              href="/"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Home
            </Link>
            <Link
              href="/book"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Book a Shoot
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Instagram
            </a>
          </div>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} The Raw Cuts. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
