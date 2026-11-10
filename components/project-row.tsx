"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";

import type { Project } from "@/lib/projects";

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-auto w-full"
    >
      <path d="M3.2 23.3.7 20.8 17.5 4h-15V.5h21v21H20v-15L3.2 23.3Z" />
    </svg>
  );
}

const TITLE_STAGGER = 0.026;
const DURATION = 0.6;
const SHIFT_PX = 140;

/**
 * Per-letter masked title roll. The clipping is handled by the parent <h2> so
 * the italic incoming copy has room for its slant instead of being cropped to
 * each letter's advance width. GSAP animates each wrapper, moving both copies
 * together.
 */
function RollTitle({ text }: { text: string }) {
  const characters = Array.from(text);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="flex">
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            className="project-title-letter relative block"
          >
            <span className="block">
              {character === " " ? "\u00A0" : character}
            </span>
            <span className="absolute left-0 top-full block italic">
              {character === " " ? "\u00A0" : character}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ProjectRow({ project }: { project: Project }) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const ctx = gsap.context(() => {
      gsap.set(arrowRef.current, { x: -12, y: 20, autoAlpha: 0 });
      gsap.set(underlineRef.current, {
        scaleY: 0.5,
        transformOrigin: "bottom",
      });
    }, row);

    const controller = new AbortController();
    const { signal } = controller;

    let isHovered = false;
    let isFocused = false;
    let isActive = false;

    const applyState = (active: boolean) => {
      ctx.add(() => {
        const reduced = prefersReducedMotion();
        const duration = reduced ? 0 : DURATION;
        const stagger = reduced ? 0 : TITLE_STAGGER;

        const letters = Array.from(
          row.querySelectorAll<HTMLElement>(".project-title-letter"),
        );

        gsap.to(letters, {
          yPercent: active ? -100 : 0,
          duration,
          stagger,
          ease: "power4.inOut",
          overwrite: "auto",
        });

        gsap.to([tagsRef.current, categoryRef.current], {
          x: active ? -SHIFT_PX : 0,
          duration,
          ease: "power4.inOut",
          overwrite: "auto",
        });

        gsap.to(underlineRef.current, {
          scaleY: active ? 1 : 0.5,
          duration,
          ease: "power4.inOut",
          overwrite: "auto",
        });

        gsap.to(arrowRef.current, {
          x: active ? 0 : 12,
          y: active ? 0 : -20,
          autoAlpha: active ? 1 : 0,
          duration,
          ease: "power4.inOut",
          overwrite: "auto",
          onComplete: active
            ? undefined
            : () => {
                // Park it back below-left, invisible, so the next hover
                // enters from the bottom again.
                gsap.set(arrowRef.current, { x: -12, y: 20, autoAlpha: 0 });
              },
        });
      });
    };

    const syncActive = () => {
      const shouldBeActive = isHovered || isFocused;
      if (shouldBeActive === isActive) return;
      isActive = shouldBeActive;
      applyState(shouldBeActive);
    };

    row.addEventListener(
      "pointerenter",
      () => {
        isHovered = true;
        syncActive();
      },
      { signal },
    );

    row.addEventListener(
      "pointerleave",
      () => {
        isHovered = false;
        syncActive();
      },
      { signal },
    );

    row.addEventListener(
      "focus",
      () => {
        if (!row.matches(":focus-visible")) return;
        isFocused = true;
        syncActive();
      },
      { signal },
    );

    row.addEventListener(
      "blur",
      () => {
        isFocused = false;
        syncActive();
      },
      { signal },
    );

    return () => {
      controller.abort();
      ctx.revert();
    };
  }, []);

  return (
    <li data-intro="up" data-project-item className="block pb-[1px]">
      <a
        ref={rowRef}
        data-project-row
        href={project.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${project.title} — ${project.category}`}
        className="flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <div className="grid w-full grid-cols-12 items-center gap-x-[24px] pt-[24px] md:pt-[40px]">
          <h2 className="relative col-span-10 overflow-hidden text-[24px] font-medium leading-[1.1] tracking-[-0.03em] text-zinc-100 md:col-span-6 md:text-6xl">
            <RollTitle text={project.title} />
          </h2>

          <div className="col-span-4 hidden text-[24px] leading-[1.4] text-zinc-100 md:block">
            <div ref={tagsRef} data-project-tags>
              <ul>
                {project.tags.map((tag, index) => (
                  <li key={tag} className="inline-block">
                    {tag}
                    {index < project.tags.length - 1 ? (
                      <span className="mx-[0.4em] text-zinc-100">/</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative col-span-2 hidden text-right text-2xl leading-[1.4] text-zinc-100 md:block">
            <span
              ref={categoryRef}
              data-project-category
              className="inline-block"
            >
              {project.category}
            </span>
            <span className="pointer-events-none absolute right-0 bottom-0 block w-10">
              <span
                ref={arrowRef}
                data-project-arrow
                className="block"
                style={{ transform: "translate(-12px, 20px)", opacity: 0 }}
              >
                <ArrowIcon />
              </span>
            </span>
          </div>

          <div className="col-span-2 flex justify-end md:hidden">
            <span className="w-[16px] translate-y-[2px] text-zinc-100">
              <ArrowIcon />
            </span>
          </div>

          <div className="col-span-full mt-[10px] flex items-center text-[13px] leading-[1.4] text-zinc-100 md:hidden">
            <span className="whitespace-nowrap text-zinc-100">
              {project.category}
            </span>
            <span className="mx-[0.6em] text-zinc-100">•</span>
            <ul>
              {project.tags.map((tag, index) => (
                <li key={tag} className="inline-block">
                  {tag}
                  {index < project.tags.length - 1 ? (
                    <span className="mx-[0.4em] text-zinc-100">/</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={underlineRef}
            data-project-underline
            className="col-span-full mt-[20px] h-[4px] bg-zinc-100 md:mt-[38px]"
            style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
          />
        </div>
      </a>
    </li>
  );
}
