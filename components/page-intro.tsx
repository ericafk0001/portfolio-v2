"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

type IntroPreset = "up" | "down" | "left" | "right" | "fade";

type IntroPresetConfig = {
  from: gsap.TweenVars;
  duration: number;
  ease: string;
};

const INTRO_PRESETS: Record<IntroPreset, IntroPresetConfig> = {
  up: {
    from: { y: 24 },
    duration: 0.8,
    ease: "power3.out",
  },
  down: {
    from: { y: -20 },
    duration: 0.7,
    ease: "power3.out",
  },
  left: {
    from: { x: -60, scale: 0.95 },
    duration: 1.2,
    ease: "power2.inOut",
  },
  right: {
    from: { x: 50 },
    duration: 0.9,
    ease: "power3.out",
  },
  fade: {
    from: {},
    duration: 0.7,
    ease: "power2.out",
  },
};

const STAGGER = 0.1;

type PageIntroProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Page-level entry animation.
 *
 * Mark elements with `data-intro="left" | "right" | "up" | "down" | "fade"` to
 * animate them in DOM order. Optional `data-intro-delay` (in seconds) offsets a
 * single element. If nothing is marked, the wrapper's direct children are
 * animated instead. Drop it around any future page to reuse the same entrance
 * choreography.
 */
export function PageIntro({ children, className }: PageIntroProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const marked = gsap.utils.toArray<HTMLElement>("[data-intro]", root);
      const targets =
        marked.length > 0
          ? marked
          : (Array.from(root.children) as HTMLElement[]);

      if (targets.length === 0) {
        return;
      }

      const timeline = gsap.timeline();

      targets.forEach((element, index) => {
        const presetName =
          (element.dataset.intro as IntroPreset | undefined) ?? "up";
        const preset = INTRO_PRESETS[presetName] ?? INTRO_PRESETS.up;
        const customDelay = Number.parseFloat(element.dataset.introDelay ?? "");
        const delay = Number.isFinite(customDelay) ? customDelay : 0;

        timeline.fromTo(
          element,
          {
            autoAlpha: 0,
            ...preset.from,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: preset.duration,
            ease: preset.ease,
            clearProps: "transform,opacity,visibility",
          },
          index * STAGGER + delay,
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
