"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { gsap } from "gsap";

const FADE_IN_DURATION = 0.3;
const FADE_OUT_DURATION = 0.45;
const NAVIGATION_FALLBACK = 3000;

/**
 * Fades to black before client-side navigation and fades back in when the new
 * route commits. Listening in the capture phase lets us stop Next's <Link>
 * navigation (Next bails when `defaultPrevented` is set) so the overlay can
 * finish covering the screen first.
 */
export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const transitioningRef = useRef(false);
  const fallbackRef = useRef<number | null>(null);

  // Reveal the new page once the route actually changes.
  useEffect(() => {
    if (!transitioningRef.current) {
      return;
    }

    transitioningRef.current = false;

    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    gsap.to(overlay, {
      autoAlpha: 0,
      duration: FADE_OUT_DURATION,
      ease: "power2.out",
      delay: 0.05,
      onComplete: () => {
        overlay.style.pointerEvents = "none";
      },
    });
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      if (anchor.dataset.noRouteTransition !== undefined) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      // Same route: let the browser / Next handle anchors, scroll, and queries.
      if (url.pathname === window.location.pathname) {
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay || transitioningRef.current) {
        return;
      }

      event.preventDefault();
      transitioningRef.current = true;
      overlay.style.pointerEvents = "auto";

      gsap.killTweensOf(overlay);
      gsap.to(overlay, {
        autoAlpha: 1,
        duration: FADE_IN_DURATION,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(`${url.pathname}${url.search}${url.hash}`);
        },
      });

      if (fallbackRef.current !== null) {
        window.clearTimeout(fallbackRef.current);
      }

      // If navigation never completes, don't leave the screen black.
      fallbackRef.current = window.setTimeout(() => {
        fallbackRef.current = null;

        if (!transitioningRef.current) {
          return;
        }

        transitioningRef.current = false;

        gsap.to(overlay, {
          autoAlpha: 0,
          duration: FADE_OUT_DURATION,
          ease: "power2.out",
          onComplete: () => {
            overlay.style.pointerEvents = "none";
          },
        });
      }, NAVIGATION_FALLBACK);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);

      if (fallbackRef.current !== null) {
        window.clearTimeout(fallbackRef.current);
      }
    };
  }, [router]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[180] bg-black opacity-0"
      style={{ visibility: "hidden" }}
    />
  );
}
