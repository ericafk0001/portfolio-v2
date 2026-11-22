"use client";

import { useEffect, useRef } from "react";

import Link from "next/link";

import { gsap } from "gsap";

import { formatPostReadTime } from "@/lib/blog-format";
import type { BlogPostMeta } from "@/lib/blog-types";

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

const TITLE_STAGGER = 0.018;
const DURATION = 0.5;
const SHIFT_PX = 40;

/**
 * Per-letter masked title roll, matching the projects page at a smaller scale.
 * The parent wrapper handles the clipping so the italic incoming copy is not
 * cropped to each letter's advance width.
 */
function RollTitle({ text }: { text: string }) {
  const characters = Array.from(text);

  return (
    <span className="flex">
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="blog-title-letter relative block"
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
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function BlogRow({ post }: { post: BlogPostMeta }) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const ctx = gsap.context(() => {
      gsap.set(arrowRef.current, { x: -8, y: 14, autoAlpha: 0 });
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
          row.querySelectorAll<HTMLElement>(".blog-title-letter"),
        );

        gsap.to(letters, {
          yPercent: active ? -100 : 0,
          duration,
          stagger,
          ease: "power4.inOut",
          overwrite: "auto",
        });

        gsap.to([tagsRef.current, timeRef.current], {
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
          x: active ? 0 : 8,
          y: active ? 0 : -14,
          autoAlpha: active ? 1 : 0,
          duration,
          ease: "power4.inOut",
          overwrite: "auto",
          onComplete: active
            ? undefined
            : () => {
                // Park it back below-left, invisible, so the next hover
                // enters from the bottom again.
                gsap.set(arrowRef.current, { x: -8, y: 14, autoAlpha: 0 });
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
    <li data-intro="up" data-blog-item className="block pb-px">
      <Link
        ref={rowRef}
        data-blog-row
        href={`/blog/${post.slug}`}
        prefetch={false}
        aria-label={`${post.title} — ${formatPostReadTime(post.readTime)}`}
        className="flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <div className="grid w-full grid-cols-12 items-center gap-x-4 pt-4.5 md:gap-x-6 md:pt-5.5">
          <h2 className="relative col-span-9 font-(family-name:--font-montserrat) text-[18px] font-medium leading-tight tracking-[-0.03em] text-zinc-100 md:col-span-9 md:text-[clamp(1.25rem,1.8vw,2rem)] md:leading-[1.15] lg:col-span-7">
            <span className="sr-only">{post.title}</span>
            <span aria-hidden="true" className="block md:hidden">
              {post.title}
            </span>
            <span
              aria-hidden="true"
              className="hidden overflow-hidden md:block"
            >
              <RollTitle text={post.title} />
            </span>
          </h2>

          <div className="col-span-3 flex justify-end md:hidden">
            <span className="block w-3.5 translate-y-px text-zinc-100">
              <ArrowIcon />
            </span>
          </div>

          <div className="col-span-3 hidden text-[16px] leading-[1.4] text-zinc-100 lg:block">
            <div ref={tagsRef} data-blog-tags>
              <ul>
                {post.tags.map((tag, index) => (
                  <li key={tag} className="inline-block">
                    {tag}
                    {index < post.tags.length - 1 ? (
                      <span className="mx-[0.4em] text-zinc-500">/</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative col-span-3 hidden text-right text-[16px] leading-[1.4] text-zinc-100 md:block lg:col-span-2">
            <span ref={timeRef} data-blog-time className="inline-block">
              {formatPostReadTime(post.readTime)}
            </span>
            <span className="pointer-events-none absolute right-0 bottom-1 block w-6">
              <span
                ref={arrowRef}
                data-blog-arrow
                className="block"
                style={{ transform: "translate(-8px, 14px)", opacity: 0 }}
              >
                <ArrowIcon />
              </span>
            </span>
          </div>

          <div className="col-span-full mt-2 flex flex-wrap items-center text-[11px] uppercase leading-[1.4] tracking-[0.12em] text-zinc-100 md:hidden">
            <span>{formatPostReadTime(post.readTime)}</span>
            <span className="mx-[0.6em] text-zinc-600">•</span>
            <ul>
              {post.tags.map((tag, index) => (
                <li key={tag} className="inline-block">
                  {tag}
                  {index < post.tags.length - 1 ? (
                    <span className="mx-[0.4em] text-zinc-600">/</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={underlineRef}
            data-blog-underline
            className="col-span-full mt-3.5 h-0.5 bg-zinc-100 md:mt-4"
            style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
          />
        </div>
      </Link>
    </li>
  );
}
