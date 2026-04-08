"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { q: "How does the 24-hour delivery work?", a: "Simple — we shoot your reel, our edit team works on it the same day, and you receive the final file within 24 hours of wrapping your shoot. No delays, no excuses." },
  { q: "Is the 24-hour delivery guaranteed?", a: "Yes. It's not a promise we throw around lightly. It's the foundation of how we work." },
  { q: "Why is pricing per reel and not per hour?", a: "Because your outcome matters more than the clock. You're paying for a final deliverable — a complete, polished reel — not for someone's time on set." },
  { q: "Do I need to come with a concept?", a: "Not at all. The discovery call is designed to help us understand your vision. If you have references, bring them. If not, we'll build the concept together." },
  { q: "Can I send a reference reel?", a: "Absolutely — and we encourage it. It helps us understand your style, your energy, and the feeling you're after." },
  { q: "What kind of events or shoots do you cover?", a: "Personal brand shoots, product launches, founder stories, creator content, event recaps, brand campaigns — if you need a reel, we've got you." },
  { q: "What happens after I book a collection?", a: "You'll fill in your details, complete your payment, and we'll reach out to schedule your discovery call within 24 hours of booking." },
  { q: "What format is the final reel delivered in?", a: "High-resolution MP4, optimised for mobile-first platforms. Ready for Instagram Reels, YouTube Shorts, LinkedIn, and beyond." },
  { q: "Can I request revisions?", a: "Yes. One round of revisions is included. We'll discuss the scope during your discovery call." },
  { q: "Where are you based?", a: "We operate across India and Canada. Get in touch to discuss your location." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-heading",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.85,
          ease: "power4.inOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );

      gsap.fromTo(
        ".faq-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          stagger: 0.07,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: { trigger: ".faq-item", start: "top 82%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faqs"
      className="relative py-28 px-6 bg-white overflow-hidden"
    >
      {/* Ghost background number */}
      <span
        className="headline absolute right-0 top-8 select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "22vw", color: "rgba(96,0,0,0.05)", lineHeight: 1 }}
      >
        FAQ
      </span>

      <div className="relative max-w-3xl mx-auto">
        <p className="section-label mb-4" style={{ color: "var(--crimson)" }}>
          Frequently Asked Questions
        </p>
        <h2
          className="faq-heading headline"
          style={{
            fontSize: "clamp(2.2rem,6vw,5rem)",
            color: "var(--ink)",
            clipPath: "inset(0 100% 0 0)",
          }}
        >
          Everything You<br />
          <span style={{ color: "var(--crimson)" }}>Wanted to Ask.</span>
        </h2>

        <div className="mt-14 space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="faq-item rounded-lg overflow-hidden transition-all duration-300 opacity-0"
                style={{
                  border: isOpen ? "1px solid rgba(96,0,0,0.25)" : "1px solid rgba(8,8,8,0.08)",
                  backgroundColor: isOpen ? "rgba(96,0,0,0.02)" : "#fff",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span
                    className="font-semibold pr-4 transition-colors duration-200"
                    style={{ color: isOpen ? "var(--crimson)" : "var(--ink)" }}
                  >
                    {faq.q}
                  </span>

                  {/* Animated +/− */}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: isOpen ? "var(--crimson)" : "rgba(8,8,8,0.06)",
                      color: isOpen ? "#fff" : "var(--ink)",
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-5 pb-5 leading-relaxed"
                        style={{ color: "rgba(8,8,8,0.58)" }}
                      >
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
