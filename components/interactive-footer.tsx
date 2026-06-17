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
      className="grid w-full min-h-screen grid-rows-[1fr_auto] bg-zinc-900 text-zinc-300 border-t border-white/5 "
    >
      <div className="flex items-start justify-center">
        <p className="text-lg text-zinc-400">Get in touch</p>
      </div>

      <div className="flex w-full items-end justify-center overflow-visible">
        <h1
          className="w-full max-w-none text-center whitespace-nowrap text-[clamp(7rem,22vw,30rem)] font-bold leading-[0.78] tracking-[-0.07em] text-white select-none"
          style={{
            transform: "scaleY(1.5)",
            transformOrigin: "center bottom",
          }}
        >
          {Array.from("CONTACT").map((letter, index) => (
            <span
              key={index}
              data-contact-letter
              className="inline-block cursor-pointer"
              style={{
                display: "inline-block",
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}
