"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { gsap } from "gsap";
import { IoArrowUpOutline } from "react-icons/io5";

const PANEL_BG = "#141414";
/** Show the trigger once the page header has scrolled away. */
const SCROLL_THRESHOLD = 160;
/** Below this width the trigger is always visible (the inline nav is hidden). */
const MOBILE_QUERY = "(max-width: 767.98px)";
/** Routes without a top navbar should always expose the trigger. */
const ALWAYS_VISIBLE_ROUTES = new Set(["/contact"]);

/** Matches the original demo's cubic-bezier(0.76, 0, 0.24, 1). */
const MENU_EASE = "power4.inOut";

const navItems = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Projects", href: "/#featured-works" },
  { title: "Contact", href: "/contact" },
];

const footerLinks = [
  {
    title: "GitHub",
    href: "https://github.com/ericafk0001",
    external: true,
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/eric_l.8",
    external: true,
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/eric-lin-b13baa393",
    external: true,
  },
  { title: "Contact", href: "/contact", external: false },
];

function buildCurvePath(height: number, controlX: number) {
  return `M100 0 L200 0 L200 ${height} L100 ${height} Q${controlX} ${height / 2} 100 0`;
}

/** Shared spring state for cursor-tracking (magnetic) hover elements. */
type MagnetMotionState = {
  current: { x: number; y: number; rotation: number; scale: number };
  target: { x: number; y: number; rotation: number; scale: number };
  velocity: { x: number; y: number; rotation: number; scale: number };
};

type MagnetKey = "x" | "y" | "rotation" | "scale";
const MAGNET_KEYS: Array<MagnetKey> = ["x", "y", "rotation", "scale"];
const MAGNET_STIFFNESS = 0.14;

function createMagnetState(): MagnetMotionState {
  return {
    current: { x: 0, y: 0, rotation: 0, scale: 1 },
    target: { x: 0, y: 0, rotation: 0, scale: 1 },
    velocity: { x: 0, y: 0, rotation: 0, scale: 0 },
  };
}

/** Integrates one frame of the magnetic spring; returns true once settled. */
function advanceMagnet(motion: MagnetMotionState) {
  const damping = motion.target.scale > 1.001 ? 0.74 : 0.7;

  for (const key of MAGNET_KEYS) {
    motion.velocity[key] +=
      (motion.target[key] - motion.current[key]) * MAGNET_STIFFNESS;
    motion.velocity[key] *= damping;
    motion.current[key] += motion.velocity[key];
  }

  return (
    Math.abs(motion.current.x) < 0.15 &&
    Math.abs(motion.current.y) < 0.15 &&
    Math.abs(motion.current.rotation) < 0.15 &&
    Math.abs(motion.current.scale - 1) < 0.002 &&
    Math.abs(motion.velocity.x) < 0.05 &&
    Math.abs(motion.velocity.y) < 0.05 &&
    Math.abs(motion.velocity.rotation) < 0.05 &&
    Math.abs(motion.velocity.scale) < 0.0006
  );
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function CurvedMenu() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [indicator, setIndicator] = useState(pathname);

  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const toggleWrapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const curveRef = useRef<SVGPathElement | null>(null);
  const curveState = useRef({ q: -100 });
  const heightRef = useRef(0);
  const linkRefs = useRef<Array<HTMLDivElement | null>>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const toggleInnerRef = useRef<HTMLSpanElement | null>(null);
  const toggleRafRef = useRef<number | null>(null);
  const toggleMotionRef = useRef({
    current: { x: 0, y: 0, rotation: 0, scale: 1 },
    target: { x: 0, y: 0, rotation: 0, scale: 1 },
    velocity: { x: 0, y: 0, rotation: 0, scale: 0 },
  });

  // The inline transform keeps the panel off-screen before hydration; GSAP
  // reads that percentage as an extra pixel offset, so clear it here and let
  // xPercent + x be the single source of truth. The extra 100px clears the
  // curved SVG, matching the original calc(100% + 100px) closed offset.
  useIsomorphicLayoutEffect(() => {
    if (!panelRef.current) return;
    gsap.set(panelRef.current, { x: 100, xPercent: 100, autoAlpha: 0 });
  }, []);

  const ready = viewportHeight > 0;
  const showButton =
    isOpen || isMobile || scrolled || ALWAYS_VISIBLE_ROUTES.has(pathname);

  // Pop the trigger in/out with a springy overshoot. The animation lives on a
  // wrapper element so it never fights the magnetic hover transform that is
  // written directly onto the button itself.
  useEffect(() => {
    const wrapper = toggleWrapRef.current;
    if (!wrapper) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wrapper, {
        autoAlpha: showButton ? 1 : 0,
        scale: showButton ? 1 : 0,
      });
      return;
    }

    gsap.killTweensOf(wrapper);

    if (showButton) {
      gsap.fromTo(
        wrapper,
        { autoAlpha: 0, scale: 0 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(2)",
          overwrite: true,
        },
      );
    } else {
      gsap.to(wrapper, {
        autoAlpha: 0,
        scale: 0,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true,
      });
    }
  }, [showButton]);

  // Magnetic hover for the curved menu trigger, mirroring the More Projects
  // button on the homepage: pointer-anchored translate/rotate/scale spring
  // with a lagging inner element and a springy return on leave.
  const renderToggleMotion = useCallback(() => {
    const button = toggleRef.current;
    const inner = toggleInnerRef.current;

    if (!button || !inner) {
      return;
    }

    const { x, y, rotation, scale } = toggleMotionRef.current.current;

    button.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    inner.style.transform = `translate3d(${x * 0.64}px, ${y * 0.64}px, 0) rotate(${rotation * 0.42}deg) scale(${1 + (scale - 1) * 0.52})`;
    button.style.boxShadow = `0 ${Math.max(10, scale * 16)}px ${Math.max(24, scale * 32)}px rgba(0, 0, 0, ${0.16 + (scale - 1) * 1.8})`;
  }, []);

  const stepToggleMotion = useCallback(() => {
    const isSettled = advanceMagnet(toggleMotionRef.current);

    renderToggleMotion();

    if (isSettled) {
      const button = toggleRef.current;
      const inner = toggleInnerRef.current;

      if (button) {
        button.style.transform = "";
        button.style.boxShadow = "";
      }

      if (inner) {
        inner.style.transform = "";
      }

      toggleRafRef.current = null;
      return;
    }

    toggleRafRef.current = window.requestAnimationFrame(stepToggleMotion);
  }, [renderToggleMotion]);

  const startToggleMotion = useCallback(() => {
    if (toggleRafRef.current !== null) {
      return;
    }

    toggleRafRef.current = window.requestAnimationFrame(stepToggleMotion);
  }, [stepToggleMotion]);

  const updateTogglePosition = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      const translateX = Math.max(-36, Math.min(36, deltaX * 0.5));
      const translateY = Math.max(-24, Math.min(24, deltaY * 0.5));
      const rotation = Math.max(-14, Math.min(14, deltaX * 0.085));
      const scale = 1.08 + Math.min(0.09, Math.hypot(deltaX, deltaY) * 0.00065);

      const state = toggleMotionRef.current;
      state.target = { x: translateX, y: translateY, rotation, scale };

      startToggleMotion();
    },
    [startToggleMotion],
  );

  const resetTogglePosition = useCallback(() => {
    const state = toggleMotionRef.current;

    if (toggleRafRef.current === null) {
      return;
    }

    state.target = { x: 0, y: 0, rotation: 0, scale: 1 };
    state.velocity.x += state.current.x * 0.36;
    state.velocity.y += state.current.y * 0.36;
    state.velocity.rotation += state.current.rotation * 0.28;
    state.velocity.scale -= (state.current.scale - 1) * 0.48;

    startToggleMotion();
  }, [startToggleMotion]);

  // Magnetic hover for the footer links: shares the menu trigger's spring,
  // tuned down for small text links (gentler pull, tiny rotation/scale) so
  // they trail the cursor without colliding with their neighbours.
  const footerLinkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const footerInnerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const footerRafRefs = useRef<Array<number | null>>(
    footerLinks.map(() => null),
  );
  const footerMotionRef = useRef(
    footerLinks.map(() => createMagnetState()),
  );
  const footerMagnetEnabledRef = useRef(false);

  // Magnetism only makes sense on fine-pointer devices without reduced
  // motion; on touch a tap fires pointerenter with no matching leave.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      footerMagnetEnabledRef.current = fine.matches && !reduced.matches;
    };
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  const renderFooterLinkMotion = useCallback((index: number) => {
    const link = footerLinkRefs.current[index];
    const inner = footerInnerRefs.current[index];

    if (!link || !inner) {
      return;
    }

    const { x, y, rotation, scale } = footerMotionRef.current[index].current;

    link.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    inner.style.transform = `translate3d(${x * 0.64}px, ${y * 0.64}px, 0) rotate(${rotation * 0.42}deg) scale(${1 + (scale - 1) * 0.52})`;
  }, []);

  const stepFooterLinkMotion = useCallback(
    (index: number) => {
      const isSettled = advanceMagnet(footerMotionRef.current[index]);

      renderFooterLinkMotion(index);

      if (isSettled) {
        const link = footerLinkRefs.current[index];
        const inner = footerInnerRefs.current[index];

        if (link) {
          link.style.transform = "";
        }

        if (inner) {
          inner.style.transform = "";
        }

        footerRafRefs.current[index] = null;
        return;
      }

      footerRafRefs.current[index] = window.requestAnimationFrame(() =>
        stepFooterLinkMotion(index),
      );
    },
    [renderFooterLinkMotion],
  );

  const startFooterLinkMotion = useCallback(
    (index: number) => {
      if (footerRafRefs.current[index] !== null) {
        return;
      }

      footerRafRefs.current[index] = window.requestAnimationFrame(() =>
        stepFooterLinkMotion(index),
      );
    },
    [stepFooterLinkMotion],
  );

  const updateFooterLinkPosition = useCallback(
    (index: number, event: ReactPointerEvent<HTMLAnchorElement>) => {
      if (!footerMagnetEnabledRef.current) {
        return;
      }

      const link = footerLinkRefs.current[index];
      if (!link) {
        return;
      }

      const rect = link.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      const motion = footerMotionRef.current[index];
      motion.target = {
        x: Math.max(-10, Math.min(10, deltaX * 0.5)),
        y: Math.max(-6, Math.min(6, deltaY * 0.5)),
        rotation: Math.max(-3, Math.min(3, deltaX * 0.05)),
        scale: 1.05 + Math.min(0.03, Math.hypot(deltaX, deltaY) * 0.00035),
      };

      startFooterLinkMotion(index);
    },
    [startFooterLinkMotion],
  );

  const resetFooterLinkPosition = useCallback(
    (index: number) => {
      if (footerRafRefs.current[index] === null) {
        return;
      }

      const motion = footerMotionRef.current[index];

      motion.target = { x: 0, y: 0, rotation: 0, scale: 1 };
      motion.velocity.x += motion.current.x * 0.36;
      motion.velocity.y += motion.current.y * 0.36;
      motion.velocity.rotation += motion.current.rotation * 0.28;
      motion.velocity.scale -= (motion.current.scale - 1) * 0.48;

      startFooterLinkMotion(index);
    },
    [startFooterLinkMotion],
  );

  const drawCurve = () => {
    const path = curveRef.current;
    if (!path) return;
    const height = heightRef.current || window.innerHeight;
    path.setAttribute("d", buildCurvePath(height, curveState.current.q));
  };

  // Track viewport size for the curved edge and mobile trigger rules.
  useEffect(() => {
    const update = () => {
      heightRef.current = window.innerHeight;
      setViewportHeight(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Reveal the trigger once the header is out of view.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Keep the active indicator in sync with the current route.
  useEffect(() => {
    setIndicator(pathname);
    setIsOpen(false);
  }, [pathname]);

  // Redraw the curve at the current progress when the viewport changes.
  useEffect(() => {
    if (!viewportHeight) return;
    drawCurve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportHeight]);

  // Lock background scrolling while the menu is open.
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  // Open / close animation.
  useEffect(() => {
    if (!ready) return;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    timelineRef.current?.kill();
    drawCurve();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(panel, {
        x: isOpen ? 0 : 100,
        xPercent: isOpen ? 0 : 100,
        autoAlpha: isOpen ? 1 : 0,
      });
      gsap.set(linkRefs.current, {
        x: isOpen ? 0 : 80,
        autoAlpha: isOpen ? 1 : 0,
      });
      gsap.set(footerRef.current, {
        y: isOpen ? 0 : 20,
        autoAlpha: isOpen ? 1 : 0,
      });
      gsap.set(overlay, { pointerEvents: isOpen ? "auto" : "none" });
      curveState.current.q = isOpen ? 100 : -100;
      drawCurve();
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        if (!isOpen) {
          gsap.set(overlay, { pointerEvents: "none" });
          // Fully hide the closed panel so neither the curved edge nor its
          // shadow can bleed along the viewport edge.
          gsap.set(panel, { autoAlpha: 0 });
        }
      },
    });
    timelineRef.current = timeline;

    if (isOpen) {
      gsap.set(overlay, { pointerEvents: "auto" });
      // The panel is visibility:hidden while closed; reveal it before sliding.
      gsap.set(panel, { autoAlpha: 1 });
      timeline
        .to(panel, { x: 0, xPercent: 0, duration: 0.8, ease: MENU_EASE }, 0)
        .to(
          curveState.current,
          { q: 100, duration: 1, ease: MENU_EASE, onUpdate: drawCurve },
          0,
        )
        .to(
          linkRefs.current,
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: MENU_EASE,
            stagger: 0.05,
          },
          0.05,
        )
        .to(
          footerRef.current,
          { y: 0, autoAlpha: 1, duration: 0.6, ease: MENU_EASE },
          0.4,
        );
    } else {
      timeline
        .to(
          linkRefs.current,
          {
            x: 80,
            autoAlpha: 0,
            duration: 0.4,
            ease: MENU_EASE,
            stagger: { each: 0.03, from: "end" },
          },
          0,
        )
        .to(
          footerRef.current,
          { y: 20, autoAlpha: 0, duration: 0.3, ease: MENU_EASE },
          0,
        )
        .to(
          curveState.current,
          { q: -100, duration: 0.8, ease: MENU_EASE, onUpdate: drawCurve },
          0,
        )
        .to(
          panel,
          { x: 100, xPercent: 100, duration: 0.8, ease: MENU_EASE },
          0,
        );
    }

    return () => {
      timeline.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ready]);

  // Escape closes the menu and returns focus to the trigger.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Focus the panel when it opens.
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  // Reset every footer link's magnet when the menu closes: closing via the
  // overlay or Escape skips pointerleave, which would otherwise leave the
  // links offset when the panel opens again.
  useEffect(() => {
    if (isOpen) return;

    footerRafRefs.current.forEach((raf) => {
      if (raf !== null) {
        window.cancelAnimationFrame(raf);
      }
    });

    footerMotionRef.current = footerLinks.map(() => createMagnetState());
    footerRafRefs.current = footerLinks.map(() => null);

    footerLinkRefs.current.forEach((link) => {
      if (link) link.style.transform = "";
    });
    footerInnerRefs.current.forEach((inner) => {
      if (inner) inner.style.transform = "";
    });
  }, [isOpen]);

  // Stop the magnetic motion when the trigger hides so its inline transform
  // does not fight the show/hide scale transition.
  useEffect(() => {
    if (showButton) return;
    toggleMotionRef.current.target = { x: 0, y: 0, rotation: 0, scale: 1 };
    toggleMotionRef.current.current = { x: 0, y: 0, rotation: 0, scale: 1 };
    toggleMotionRef.current.velocity = { x: 0, y: 0, rotation: 0, scale: 0 };
    if (toggleRafRef.current !== null) {
      window.cancelAnimationFrame(toggleRafRef.current);
      toggleRafRef.current = null;
    }
    if (toggleRef.current) {
      toggleRef.current.style.transform = "";
      toggleRef.current.style.boxShadow = "";
    }
    if (toggleInnerRef.current) {
      toggleInnerRef.current.style.transform = "";
    }
  }, [showButton]);

  // Keep keyboard focus inside the open menu.
  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === panelRef.current) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setIsOpen(false);

    // Same-page hash links need to wait for the scroll lock to lift.
    if (pathname === "/" && href.startsWith("/#")) {
      event.preventDefault();
      const id = href.slice(2);
      window.setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", href);
      }, 500);
    }
  };

  return (
    <>
      <div
        ref={toggleWrapRef}
        style={{
          opacity: 0,
          transform: "scale(0)",
          transformOrigin: "50% 50%",
          willChange: "opacity, transform",
        }}
        className="fixed right-4 top-4 z-[120] sm:right-6 sm:top-6"
      >
        <button
          ref={toggleRef}
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="curved-menu"
          aria-hidden={!showButton}
          tabIndex={showButton ? 0 : -1}
          onClick={() => setIsOpen((open) => !open)}
          onPointerEnter={updateTogglePosition}
          onPointerMove={updateTogglePosition}
          onPointerLeave={resetTogglePosition}
          className={`flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition-colors duration-300 ease-out will-change-transform hover:bg-white sm:h-18 sm:w-18 ${
            showButton ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <span
            ref={toggleInnerRef}
            className="flex h-[18px] w-9 flex-col items-center justify-center gap-[6px] will-change-transform"
          >
            <span
              className={`h-[2px] w-9 bg-current transition-transform duration-300 ease-out ${
                isOpen ? "translate-y-[3.25px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-9 bg-current transition-transform duration-300 ease-out ${
                isOpen ? "-translate-y-[3.25px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        ref={overlayRef}
        id="curved-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}
        style={{
          backdropFilter: isOpen ? "blur(3px)" : "blur(0px)",
          WebkitBackdropFilter: isOpen ? "blur(3px)" : "blur(0px)",
        }}
        className={`fixed inset-0 z-[100] flex justify-end transition-[backdrop-filter] duration-500 ease-out ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          style={{ transform: "translateX(calc(100% + 100px))" }}
          className="relative flex h-[100dvh] w-[calc(100%_-_12px)] max-w-[34rem] flex-col bg-[#141414] text-zinc-100 shadow-[-30px_0_70px_rgba(0,0,0,0.45)] outline-none"
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -left-[99px] h-full w-[100px]"
          >
            <path ref={curveRef} fill={PANEL_BG} />
          </svg>

          <div className="flex h-full flex-col justify-between px-5 pb-12 pt-20 sm:px-10 sm:pb-14 sm:pt-28 lg:px-14">
            <nav aria-label="Menu" onMouseLeave={() => setIndicator(pathname)}>
              <ul className="mt-7 flex flex-col gap-1 sm:mt-9 sm:gap-2">
                {navItems.map((item, index) => (
                  <li key={item.href}>
                    <div
                      ref={(element) => {
                        linkRefs.current[index] = element;
                      }}
                      onMouseEnter={() => setIndicator(item.href)}
                      className="group/link relative flex items-center"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute -left-4 h-2 w-2 rounded-full bg-white transition-transform duration-300 ease-out sm:-left-7 ${
                          indicator === item.href ? "scale-100" : "scale-0"
                        }`}
                      />
                      <Link
                        href={item.href}
                        onClick={(event) => handleLinkClick(event, item.href)}
                        className="block py-1 text-[clamp(2.5rem,7vw,4rem)] font-normal uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100 transition-transform duration-300 ease-out group-hover/link:translate-x-2"
                      >
                        {item.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              ref={footerRef}
              className="flex w-full flex-col items-start gap-y-4 whitespace-nowrap text-[0.8rem] uppercase tracking-[0.12em] text-white sm:flex-row sm:items-center sm:justify-between sm:gap-x-8 sm:gap-y-0 sm:text-[0.7rem]"
            >
              {footerLinks.map((link, index) => {
                const shared = {
                  className:
                    "group/footer relative inline-flex items-center pl-[2px] pr-[3px] transition-colors duration-300 ease-out hover:text-black",
                  ref: (element: HTMLAnchorElement | null) => {
                    footerLinkRefs.current[index] = element;
                  },
                  onPointerEnter: (
                    event: ReactPointerEvent<HTMLAnchorElement>,
                  ) => updateFooterLinkPosition(index, event),
                  onPointerMove: (
                    event: ReactPointerEvent<HTMLAnchorElement>,
                  ) => updateFooterLinkPosition(index, event),
                  onPointerLeave: () => resetFooterLinkPosition(index),
                };
                const content = (
                  <>
                    {/* White fill that sweeps in from the left edge. Negative
                        z keeps it behind the inherited text/arrow. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover/footer:scale-x-100"
                    />
                    {/* Inner layer lags the link box during the magnetic
                        hover, mirroring the menu trigger's hamburger. */}
                    <span
                      ref={(element) => {
                        footerInnerRefs.current[index] = element;
                      }}
                      className="relative z-10 flex items-center gap-1 will-change-transform"
                    >
                      <IoArrowUpOutline
                        aria-hidden="true"
                        className="h-4 w-4 rotate-45"
                      />
                      {link.title}
                    </span>
                  </>
                );

                return link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsOpen(false)}
                    {...shared}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => handleLinkClick(event, link.href)}
                    {...shared}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
