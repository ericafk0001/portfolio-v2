"use client";

import { useEffect, useRef } from "react";

import Link from "next/link";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { formatPostDate, formatPostReadTime } from "@/lib/blog-format";
import type { BlogPost as BlogPostData } from "@/lib/blog-types";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

export function BlogPost({ post }: { post: BlogPostData }) {
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);

  const titleWords = post.title.trim().split(/\s+/);
  const descriptionWords = post.description.trim().split(/\s+/).filter(Boolean);

  useEffect(() => {
    const wrapper = smoothWrapperRef.current;
    const content = smoothContentRef.current;
    if (!wrapper || !content) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    ScrollSmoother.get()?.kill();
    ScrollTrigger.config({ ignoreMobileResize: true });

    let smoother: ScrollSmoother | null = null;
    if (!prefersReducedMotion && ScrollTrigger.isTouch !== 1) {
      smoother = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 1.2,
        effects: false,
      });
    }

    return () => {
      smoother?.kill();
    };
  }, []);

  useEffect(() => {
    const body = rootRef.current?.querySelector<HTMLElement>(
      "[data-blog-content]",
    );
    const progress = progressRef.current;
    if (!body || !progress) return;

    const getDocumentTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };

    const updateProgress = () => {
      const bodyTop = getDocumentTop(body);
      const start = Math.max(
        0,
        bodyTop - Math.min(window.innerHeight * 0.7, 420),
      );
      const end = bodyTop + body.offsetHeight - window.innerHeight;
      const smoother = ScrollSmoother.get();
      const scrollTop = smoother ? smoother.scrollTop() : window.scrollY;
      const amount =
        end <= start
          ? 1
          : Math.min(1, Math.max(0, (scrollTop - start) / (end - start)));

      progress.style.transform = `scaleX(${amount})`;
    };

    updateProgress();
    gsap.ticker.add(updateProgress);

    return () => {
      gsap.ticker.remove(updateProgress);
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const title = gsap.utils.toArray<HTMLElement>(
        "[data-blog-title-word]",
        root,
      );
      const description = gsap.utils.toArray<HTMLElement>(
        "[data-blog-description-word]",
        root,
      );
      const pills = gsap.utils.toArray<HTMLElement>("[data-blog-pill]", root);
      const meta = root.querySelector<HTMLElement>("[data-blog-meta]");
      const divider = root.querySelector<HTMLElement>("[data-blog-divider]");
      const content = root.querySelector<HTMLElement>("[data-blog-content]");

      const revealTargets = [...pills, meta].filter(
        (element): element is HTMLElement => element !== null,
      );

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...title, ...description], {
          yPercent: 0,
          clearProps: "transform",
        });
        gsap.set(revealTargets, {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform,opacity,visibility",
        });
        if (divider) {
          gsap.set(divider, { scaleX: 1, clearProps: "transform" });
        }
        if (content) {
          gsap.set(content, {
            autoAlpha: 1,
            y: 0,
            clearProps: "transform,opacity,visibility",
          });
        }
        return;
      }

      gsap.set(title, { yPercent: 110, y: 0 });
      gsap.set(description, { yPercent: 110, y: 0 });
      gsap.set(pills, { autoAlpha: 0, y: 25 });
      if (meta) {
        gsap.set(meta, { autoAlpha: 0, y: 25 });
      }
      if (divider) {
        gsap.set(divider, { scaleX: 0, transformOrigin: "left center" });
      }
      if (content) {
        gsap.set(content, { autoAlpha: 0, y: 25 });
      }

      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .to(title, {
          yPercent: 0,
          duration: 1,
          stagger: 0.06,
        })
        .to(
          description,
          {
            yPercent: 0,
            duration: 0.8,
            stagger: 0.02,
          },
          "-=0.85",
        )
        .to(
          pills,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.06,
          },
          "-=0.8",
        )
        .to(
          meta,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.75",
        )
        .to(
          divider,
          {
            scaleX: 1,
            duration: 0.7,
            ease: "power4.inOut",
          },
          "-=1",
        )
        .to(
          content,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.65",
        );

      return () => {
        timeline.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-100 h-3 w-full origin-left bg-[#1f1f1f]"
        ref={progressRef}
        style={{ transform: "scaleX(0)", transformOrigin: "left top" }}
      />
      <div ref={smoothWrapperRef} id="blog-smooth-wrapper" className="relative">
        <div ref={smoothContentRef} id="blog-smooth-content">
          <main
            ref={rootRef}
            className="relative mt-[8vh] flex w-full flex-col items-center bg-[#f7f6f2] pb-24 pt-28 font-(family-name:--font-geist-sans) text-[#1f1f1f] md:pb-50"
          >
            <noscript>
              <style>{`
                [data-blog-title-word],
                [data-blog-description-word] { transform: none !important; }
                [data-blog-pill],
                [data-blog-meta] { opacity: 1 !important; transform: none !important; }
                [data-blog-divider] { transform: none !important; }
                [data-blog-content] { opacity: 1 !important; transform: none !important; }
              `}</style>
            </noscript>

            <header className="relative z-1 flex w-[88%] max-w-170 flex-col items-center">
              <h1 className="mb-5 flex w-full flex-wrap justify-center font-(family-name:--font-montserrat) text-center text-[2.75rem] font-extrabold leading-[1.2] tracking-[-0.02em] md:text-[3rem]">
                {titleWords.map((word, index) => (
                  <span key={`${word}-${index}`} className="overflow-hidden">
                    <span
                      data-blog-title-word
                      className="block px-1.75"
                      style={{ transform: "translateY(110%)" }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              {descriptionWords.length > 0 ? (
                <p className="mb-5 flex w-full flex-wrap justify-center font-(family-name:--font-montserrat) text-center text-[1.1rem] font-semibold leading-[1.2] text-[#949690]">
                  {descriptionWords.map((word, index) => (
                    <span key={`${word}-${index}`} className="overflow-hidden">
                      <span
                        data-blog-description-word
                        className="block px-0.5"
                        style={{ transform: "translateY(110%)" }}
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </p>
              ) : null}

              {post.tags.length > 0 ? (
                <div className="mb-5 flex flex-wrap justify-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      data-blog-pill
                      className="rounded-sm bg-[#ffffff] px-3 py-1.75 font-(family-name:--font-montserrat) text-[0.9rem] leading-[1.2] text-[#1f1f1f] shadow-[0_0px_14px_rgba(0,0,0,0.35)]"
                      style={{ opacity: 0, transform: "translateY(25px)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <p
                data-blog-meta
                className="mb-5 font-(family-name:--font-montserrat) text-center text-[0.9rem] italic text-[#949690]"
                style={{ opacity: 0, transform: "translateY(25px)" }}
              >
                {formatPostDate(post.date)}
                <span className="mx-1.5">•</span>
                {formatPostReadTime(post.readTime, true)}
              </p>
            </header>

            <div className="relative mb-12.5 mt-5 w-[90%] max-w-190">
              <hr
                data-blog-divider
                className="h-0 border-0 border-b border-[#1f1f1f]"
                style={{
                  transform: "scaleX(0)",
                  transformOrigin: "left center",
                }}
              />
            </div>

            <div
              data-blog-content
              className="blog-content flex w-[88%] max-w-170 flex-col gap-6.25"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{ opacity: 0, transform: "translateY(25px)" }}
            />

            <div className="mt-15 flex w-full justify-center">
              <Link
                href="/blog"
                className="group relative flex h-12.5 w-42.5 items-center justify-center overflow-hidden rounded-full border-2 border-[#1f1f1f] bg-[#f7f6f2]/75 text-[#1f1f1f] backdrop-blur-[10px] transition-colors duration-300 ease-out hover:text-[#f7f6f2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1f1f] md:w-58.75"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-full h-[300%] w-[140%] -translate-x-1/2 rounded-full bg-[#1f1f1f] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[72%] group-focus-visible:-translate-y-[72%]"
                />
                <span className="relative z-10 text-[0.8rem] font-medium md:text-base">
                  Back to All Blogs
                </span>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
