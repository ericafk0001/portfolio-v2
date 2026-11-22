"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

import { gsap } from "gsap";

import { BlogRow } from "@/components/blog-row";
import type { BlogPostMeta } from "@/lib/blog-types";

const DIM_OPACITY = 0.2;
const DIM_DURATION = 0.3;
const COVER_DURATION = 0.75;
const COVER_SCALE = 1.25;
const COVER_FADE_DURATION = 0.3;
const FOLLOW_DURATION = 0.5;

function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function BlogList({ posts }: { posts: BlogPostMeta[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;

    const covers = Array.from(
      preview.querySelectorAll<HTMLElement>("[data-blog-cover]"),
    );
    const coverImages = covers
      .map((cover) => cover.querySelector<HTMLElement>("img"))
      .filter((image): image is HTMLElement => image !== null);

    const frame = preview.querySelector<HTMLElement>("[data-blog-frame]");
    if (!frame) return;

    // quickTo keeps retargeting from the frame's current position, so the
    // preview trails the pointer smoothly instead of snapping to every event.
    const followX = gsap.quickTo(frame, "x", {
      duration: FOLLOW_DURATION,
      ease: "power3.out",
    });
    const followY = gsap.quickTo(frame, "y", {
      duration: FOLLOW_DURATION,
      ease: "power3.out",
    });

    const setFramePosition = (
      clientX: number,
      clientY: number,
      immediate = false,
    ) => {
      const x = clientX - window.innerWidth / 2;
      const y = clientY - window.innerHeight / 2;

      if (immediate || prefersReducedMotion()) {
        gsap.set(frame, { x, y });
        return;
      }

      followX(x);
      followY(y);
    };

    const ctx = gsap.context(() => {}, preview);
    const controller = new AbortController();
    const { signal } = controller;

    let activeRow: HTMLElement | null = null;
    let activeCover: number | null = null;
    let coverZ = 0;
    const coverTimelines: Array<gsap.core.Timeline | null> = [];

    const setActiveRow = (row: HTMLElement | null) => {
      if (activeRow === row) return;
      activeRow = row;

      ctx.add(() => {
        const rows = list.querySelectorAll<HTMLElement>("[data-blog-row]");
        const duration = prefersReducedMotion() ? 0 : DIM_DURATION;

        rows.forEach((el) => {
          gsap.to(el, {
            autoAlpha: row === null || el === row ? 1 : DIM_OPACITY,
            duration,
            ease: "power4.inOut",
            overwrite: "auto",
          });
        });
      });
    };

    const hideCovers = () => {
      if (activeCover === null) return;
      activeCover = null;

      ctx.add(() => {
        const reduced = prefersReducedMotion();

        coverTimelines.forEach((timeline, index) => {
          timeline?.kill();
          coverTimelines[index] = null;
        });
        gsap.killTweensOf([...covers, ...coverImages]);
        gsap.to(covers, {
          autoAlpha: 0,
          duration: reduced ? 0 : COVER_FADE_DURATION,
          ease: "power4.inOut",
          overwrite: "auto",
          onComplete: () => {
            covers.forEach((cover) => {
              gsap.set(cover, { yPercent: 0, zIndex: 0 });
            });
            coverImages.forEach((image) => {
              gsap.set(image, { yPercent: 0, scale: 1 });
            });
          },
        });
      });
    };

    const showCover = (index: number) => {
      if (activeCover === index) return;

      const nextCover = covers[index];
      const nextImage = coverImages[index];
      if (!nextCover || !nextImage) return;

      // A null active cover means the preview was hidden (or never shown), so
      // the next hover starts from a clean slate. Otherwise this is a switch
      // between posts and the existing animations must keep running.
      const enteringFresh = activeCover === null;

      activeCover = index;

      ctx.add(() => {
        const reduced = prefersReducedMotion();
        const duration = reduced ? 0 : COVER_DURATION;

        if (enteringFresh) {
          coverTimelines.forEach((timeline, timelineIndex) => {
            timeline?.kill();
            coverTimelines[timelineIndex] = null;
          });
          gsap.killTweensOf([...covers, ...coverImages]);
          covers.forEach((cover) => {
            gsap.set(cover, { autoAlpha: 0, yPercent: 0, zIndex: 0 });
          });
          coverImages.forEach((image) => {
            gsap.set(image, { yPercent: 0, scale: 1 });
          });
        } else {
          // Restart only the incoming cover. Every in-flight transition below
          // it keeps playing, so rapid hovers queue up and each cover finishes
          // its own entrance even while they overlap.
          coverTimelines[index]?.kill();
          coverTimelines[index] = null;
        }

        coverZ += 1;

        // A full-height mask starts below the frame while the image
        // counter-translates to stay put and starts zoomed in. Moving the mask
        // and zoom back to rest wipes the cover in from the bottom.
        gsap.set(nextCover, { autoAlpha: 1, yPercent: 100, zIndex: coverZ });
        gsap.set(nextImage, { yPercent: -100, scale: COVER_SCALE });

        const timeline = gsap.timeline({
          onComplete: () => {
            coverTimelines[index] = null;

            // A newer cover may have taken over while this one was wiping in.
            // Only the current top cover is allowed to clean up the stack.
            if (activeCover !== index) return;

            covers.forEach((cover, coverIndex) => {
              if (coverIndex === index) return;
              gsap.set(cover, { autoAlpha: 0, yPercent: 0, zIndex: 0 });
              const image = coverImages[coverIndex];
              if (image) {
                gsap.set(image, { yPercent: 0, scale: 1 });
              }
            });
            gsap.set(nextCover, { zIndex: 1 });
          },
        });

        timeline.to(
          nextCover,
          { yPercent: 0, duration, ease: "power4.inOut" },
          0,
        );
        timeline.to(
          nextImage,
          { yPercent: 0, scale: 1, duration, ease: "power4.inOut" },
          0,
        );

        coverTimelines[index] = timeline;
      });
    };

    list.addEventListener(
      "pointerover",
      (event) => {
        if (!canHover()) return;

        const item = (event.target as Element).closest<HTMLElement>(
          "[data-blog-item]",
        );
        const row =
          item?.querySelector<HTMLElement>("[data-blog-row]") ?? null;

        // The first row after the preview was hidden should appear under the
        // pointer immediately, then follow it smoothly from there.
        if (row && activeCover === null) {
          setFramePosition(event.clientX, event.clientY, true);
        }

        setActiveRow(row);

        if (!row) {
          hideCovers();
          return;
        }

        const rows = Array.from(
          list.querySelectorAll<HTMLElement>("[data-blog-row]"),
        );
        const index = rows.indexOf(row);

        if (index !== -1) showCover(index);
      },
      { signal },
    );

    list.addEventListener(
      "pointermove",
      (event) => {
        if (!canHover()) return;
        setFramePosition(event.clientX, event.clientY);
      },
      { signal },
    );

    list.addEventListener(
      "pointerleave",
      () => {
        if (!canHover()) return;
        setActiveRow(null);
        hideCovers();
      },
      { signal },
    );

    return () => {
      controller.abort();
      gsap.killTweensOf(frame);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 hidden items-center justify-center md:flex"
      >
        <div
          data-blog-frame
          className="relative aspect-4/3 overflow-hidden"
          style={{ width: "min(20vw, 28vh, 320px)" }}
        >
          {posts.map((post) => (
            <div
              key={post.slug}
              data-blog-cover
              className="absolute inset-0 overflow-hidden opacity-0"
              style={{ visibility: "hidden" }}
            >
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(min-width: 768px) 20vw, 100vw"
                draggable={false}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <ul ref={listRef} className="blog-list relative z-10">
        {posts.map((post) => (
          <BlogRow key={post.slug} post={post} />
        ))}
      </ul>
    </>
  );
}
