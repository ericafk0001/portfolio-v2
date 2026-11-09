"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

import { gsap } from "gsap";

import { ProjectRow } from "@/components/project-row";
import type { Project } from "@/lib/projects";

const DIM_OPACITY = 0.2;
const DIM_DURATION = 0.3;
const COVER_DURATION = 0.7;
const COVER_FADE_DURATION = 0.35;
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

export function ProjectsList({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;

    const covers = Array.from(
      preview.querySelectorAll<HTMLElement>("[data-project-cover]"),
    );
    const coverImages = covers
      .map((cover) => cover.querySelector<HTMLElement>("img"))
      .filter((image): image is HTMLElement => image !== null);

    const frame = preview.querySelector<HTMLElement>("[data-project-frame]");
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

    const setActiveRow = (row: HTMLElement | null) => {
      if (activeRow === row) return;
      activeRow = row;

      ctx.add(() => {
        const rows = list.querySelectorAll<HTMLElement>(
          "[data-project-row]",
        );
        const duration = prefersReducedMotion() ? 0 : DIM_DURATION;

        rows.forEach((el) => {
          gsap.to(el, {
            autoAlpha:
              row === null || el === row ? 1 : DIM_OPACITY,
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

        gsap.killTweensOf([...covers, ...coverImages]);
        gsap.to(covers, {
          autoAlpha: 0,
          duration: reduced ? 0 : COVER_FADE_DURATION,
          ease: "power4.inOut",
          overwrite: "auto",
          onComplete: () => {
            covers.forEach((cover) => gsap.set(cover, { zIndex: 0 }));
            coverImages.forEach((image) => gsap.set(image, { yPercent: 0 }));
          },
        });
      });
    };

    const showCover = (index: number) => {
      if (activeCover === index) return;

      const previous = activeCover;
      const nextCover = covers[index];
      const nextImage = coverImages[index];
      if (!nextCover || !nextImage) return;

      activeCover = index;

      ctx.add(() => {
        const reduced = prefersReducedMotion();

        gsap.killTweensOf([...covers, ...coverImages]);

        // Keep the outgoing cover in place while every other hidden layer is
        // cleared away, then bring the new cover in above it.
        covers.forEach((cover, coverIndex) => {
          if (coverIndex !== previous && coverIndex !== index) {
            gsap.set(cover, { autoAlpha: 0, zIndex: 0 });
          }
        });

        if (previous !== null) {
          const previousCover = covers[previous];
          const previousImage = coverImages[previous];

          if (previousCover) {
            gsap.set(previousCover, { autoAlpha: 1, zIndex: 1 });
          }
          if (previousImage) {
            gsap.set(previousImage, { yPercent: 0 });
          }
        }

        gsap.set(nextCover, { autoAlpha: 1, zIndex: 2 });
        gsap.set(nextImage, { yPercent: 100 });

        gsap.to(nextImage, {
          yPercent: 0,
          duration: reduced ? 0 : COVER_DURATION,
          ease: "power4.inOut",
          overwrite: "auto",
          onComplete: () => {
            covers.forEach((cover, coverIndex) => {
              if (coverIndex !== index) {
                gsap.set(cover, { autoAlpha: 0, zIndex: 0 });
              }
            });
            gsap.set(nextCover, { zIndex: 1 });
          },
        });
      });
    };

    list.addEventListener(
      "pointerover",
      (event) => {
        if (!canHover()) return;

        const row = (event.target as Element).closest<HTMLElement>(
          "[data-project-row]",
        );

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
          list.querySelectorAll<HTMLElement>("[data-project-row]"),
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
          data-project-frame
          className="relative aspect-[4/5] overflow-hidden"
          style={{ width: "min(25vw, 40vh, 420px)" }}
        >
          {projects.map((project) => (
            <div
              key={project.title}
              data-project-cover
              className="absolute inset-0 overflow-hidden opacity-0"
              style={{ visibility: "hidden" }}
            >
              <Image
                src={project.image}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                draggable={false}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <ul ref={listRef} className="projects-list relative z-10">
        {projects.map((project) => (
          <ProjectRow key={project.title} project={project} />
        ))}
      </ul>
    </>
  );
}
