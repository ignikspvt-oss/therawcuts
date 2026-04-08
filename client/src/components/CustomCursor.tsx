"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only show on desktop, non-admin pages, non-touch devices, non-reduced-motion
    if (typeof window === "undefined" || window.innerWidth < 768) return;
    if (pathname.startsWith("/admin")) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.classList.add("custom-cursor-active");

    // rAF-throttled mousemove handler
    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;
    const moveCursor = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        gsap.to(cursor, {
          x: latestX - 6,
          y: latestY - 6,
          duration: 0.15,
          ease: "power2.out",
        });
        rafId = null;
      });
    };

    const handleMouseEnter = () => cursor.classList.add("hover");
    const handleMouseLeave = () => cursor.classList.remove("hover");

    document.addEventListener("mousemove", moveCursor, { passive: true });

    // Track currently-bound elements so we can clean up reliably
    const boundElements = new WeakSet<Element>();

    const bindInteractive = () => {
      const els = document.querySelectorAll("a, button, [data-cursor-hover]");
      els.forEach((el) => {
        if (boundElements.has(el)) return;
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
        boundElements.add(el);
      });
    };

    bindInteractive();

    // Debounced observer — only re-scan DOM after 150ms of quiet
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(bindInteractive, 150);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", moveCursor);
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      // Remove listeners from all bound elements
      document
        .querySelectorAll("a, button, [data-cursor-hover]")
        .forEach((el) => {
          el.removeEventListener("mouseenter", handleMouseEnter);
          el.removeEventListener("mouseleave", handleMouseLeave);
        });
    };
  }, [pathname]);

  return <div ref={cursorRef} className="custom-cursor" />;
}
