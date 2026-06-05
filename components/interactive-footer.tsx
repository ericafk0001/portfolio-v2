"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function InteractiveFooter() {
  const footerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const activeTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!footerRef.current) return;

    const letters = Array.from(
      footerRef.current.querySelectorAll<HTMLSpanElement>(
        "[data-contact-letter]",
      ),
    );

    lettersRef.current = letters;

    gsap.set(letters, {
      scaleY: 1,
      transformOrigin: "50% 100%",
      willChange: "transform",
    });

    letters.forEach((letter, index) => {
      const handleMouseEnter = () => {
        const existingTimeout = activeTimeoutsRef.current.get(index);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          activeTimeoutsRef.current.delete(index);
        }

        gsap.to(letter, {
          scaleY: 0.75,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        const existingTimeout = activeTimeoutsRef.current.get(index);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
          gsap.to(letter, {
            scaleY: 1,
            duration: 0.4,
            ease: "power2.out",
          });
          activeTimeoutsRef.current.delete(index);
        }, 150);

        activeTimeoutsRef.current.set(index, timeout);
      };

      letter.addEventListener("mouseenter", handleMouseEnter);
      letter.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        letter.removeEventListener("mouseenter", handleMouseEnter);
        letter.removeEventListener("mouseleave", handleMouseLeave);
      };
    });

    return () => {
      activeTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      activeTimeoutsRef.current.clear();

      letters.forEach((letter, index) => {
        const existingTimeout = activeTimeoutsRef.current.get(index);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
      });
    };
  }, []);

  return (
    <div
      ref={footerRef}
      className="w-full min-h-screen bg-zinc-900 text-zinc-300 border-t border-white/5 py-32 flex flex-col items-center justify-center"
    >
      <p className="mb-8 text-center text-lg text-zinc-400">Get in touch</p>

      <h1 className="text-[clamp(8rem,20vw,25rem)] font-bold leading-none tracking-tight text-white select-none">
        {Array.from("CONTACT").map((letter, index) => (
          <span
            key={index}
            data-contact-letter
            className="inline-block cursor-pointer"
            style={{
              display: "inline-block",
              minWidth: "0.2em",
            }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <p className="mt-8 text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} Eric Lin. Built with Next.js.
      </p>
    </div>
  );
}
