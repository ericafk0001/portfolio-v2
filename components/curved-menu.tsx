"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
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
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const curveRef = useRef<SVGPathElement | null>(null);
  const curveState = useRef({ q: -100 });
  const heightRef = useRef(0);
  const linkRefs = useRef<Array<HTMLDivElement | null>>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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
      <button
        ref={toggleRef}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="curved-menu"
        aria-hidden={!showButton}
        tabIndex={showButton ? 0 : -1}
        onClick={() => setIsOpen((open) => !open)}
        style={{
          opacity: showButton ? 1 : 0,
          transform: showButton ? "scale(1)" : "scale(0.9)",
          transition:
            "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1), background-color 300ms ease-out",
          willChange: "opacity, transform",
        }}
        className={`fixed right-4 top-4 z-[120] flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-black/10 hover:bg-white sm:right-6 sm:top-6 sm:h-18 sm:w-18 ${
          showButton
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        <span className="flex h-[18px] w-9 flex-col items-center justify-center gap-[6px]">
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
              {footerLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="group/footer inline-flex items-center gap-1 transition-opacity hover:opacity-75"
                  >
                    <IoArrowUpOutline
                      aria-hidden="true"
                      className="h-4 w-4 rotate-45"
                    />
                    {link.title}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => handleLinkClick(event, link.href)}
                    className="group/footer inline-flex items-center gap-1 transition-opacity hover:opacity-75"
                  >
                    <IoArrowUpOutline
                      aria-hidden="true"
                      className="h-4 w-4 rotate-45"
                    />
                    {link.title}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
