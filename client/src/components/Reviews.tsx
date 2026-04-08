"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reviewsRow1 = [
  { quote: "I didn't think a 24-hour turnaround was even possible at this quality level. I was wrong.",     name: "Priya S.",    title: "Founder"             },
  { quote: "The discovery call made all the difference. They just got it.",                                  name: "Arjun M.",    title: "Content Creator"     },
  { quote: "Clean, sharp, and exactly on-brand. Will be booking every quarter.",                             name: "Neha R.",     title: "Brand Strategist"    },
  { quote: "We got the reel back the next morning. It was better than anything we imagined.",                name: "Rahul K.",    title: "Startup Founder"     },
  { quote: "They made us look like we had a production team of ten. It was just them.",                      name: "Sara T.",     title: "Event Organizer"     },
  { quote: "The edits were so clean — no filler, no fluff. Exactly what we wanted.",                        name: "Dev P.",      title: "Brand Manager"       },
];

const reviewsRow2 = [
  { quote: "From concept to reel in one day. These guys don't play around.",                                 name: "Ananya S.",   title: "Creator"             },
  { quote: "Our product launch reel got more engagement than anything else we've ever posted.",              name: "Vikram J.",   title: "Co-Founder"          },
  { quote: "They understood my vision better than I could explain it myself.",                               name: "Maya D.",     title: "Personal Brand Coach"},
  { quote: "Booking again for our next event. No question.",                                                 name: "Karthik N.",  title: "Event Planner"       },
  { quote: "The team made us feel so comfortable on camera. The reel shows it.",                             name: "Preethi L.",  title: "Fitness Creator"     },
  { quote: "Professional, fast, and the quality speaks for itself.",                                         name: "Rohan B.",    title: "Agency Director"     },
];

function ReviewCard({ quote, name, title }: { quote: string; name: string; title: string }) {
  return (
    <div
      className="flex-shrink-0 w-[320px] sm:w-[360px] rounded-xl p-6 mx-3"
      style={{ backgroundColor: "#fff", boxShadow: "0 4px 24px rgba(96,0,0,0.1)" }}
    >
      {/* Quote mark — crimson */}
      <svg className="w-6 h-6 mb-4" style={{ color: "var(--crimson)" }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.177 11 15c0 1.933-1.567 3.5-3.5 3.5-1.199 0-2.344-.611-2.917-1.179zM16.583 17.321C15.553 16.227 15 15 15 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C21.591 11.69 23 13.177 23 15c0 1.933-1.567 3.5-3.5 3.5-1.199 0-2.344-.611-2.917-1.179z" />
      </svg>

      <p className="text-sm leading-relaxed italic" style={{ color: "rgba(26,8,8,0.65)" }}>
        &ldquo;{quote}&rdquo;
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: "var(--crimson)" }}
        >
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--crimson)" }}>{name}</p>
          <p className="text-xs" style={{ color: "rgba(26,8,8,0.4)" }}>{title}</p>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".reviews-heading",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)", duration: 0.85, ease: "power4.inOut",
          scrollTrigger: { trigger: titleRef.current, start: "top 80%" },
        }
      );
      gsap.to(".marquee-row-1", { x: "-50%", ease: "none", duration: 30, repeat: -1 });
      gsap.fromTo(".marquee-row-2", { x: "-50%" }, { x: "0%",   ease: "none", duration: 30, repeat: -1 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="grain py-28 overflow-hidden"
      style={{ backgroundColor: "var(--crimson)" }}
    >
      {/* Header */}
      <div ref={titleRef} className="max-w-6xl mx-auto px-6 mb-14">
        <p className="section-label mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
          What Our Clients Say
        </p>
        <h2
          className="reviews-heading headline text-white"
          style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)", clipPath: "inset(0 100% 0 0)" }}
        >
          Real People.<br />
          Real Reels.<br />
          Real Results.
        </h2>
      </div>

      {/* Marquees */}
      <div
        onMouseEnter={() => gsap.globalTimeline.pause()}
        onMouseLeave={() => gsap.globalTimeline.resume()}
        className="space-y-5"
      >
        <div className="flex marquee-row-1 w-max">
          {[...reviewsRow1, ...reviewsRow1].map((r, i) => <ReviewCard key={`r1-${i}`} {...r} />)}
        </div>
        <div className="flex marquee-row-2 w-max">
          {[...reviewsRow2, ...reviewsRow2].map((r, i) => <ReviewCard key={`r2-${i}`} {...r} />)}
        </div>
      </div>
    </section>
  );
}
