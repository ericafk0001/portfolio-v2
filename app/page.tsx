"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Space_Grotesk, Montserrat } from "next/font/google";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/dist/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

import { Loader } from "@/components/loader";
import { ContactButton } from "@/components/contact-button";
import { InteractiveFooter } from "@/components/interactive-footer";

const InteractiveGradFlow = dynamic(
  () =>
    import("@/components/interactive-gradflow").then(
      (module) => module.InteractiveGradFlow,
    ),
  { ssr: false },
);

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: "400",
  subsets: ["latin"],
});

type StackItem = {
  label: string;
  iconSrc: string;
};

gsap.registerPlugin(
  useGSAP,
  DrawSVGPlugin,
  Flip,
  MorphSVGPlugin,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText,
);

// Module scope survives client-side route changes, so the loader and intro
// reveal only play when the home page is first mounted. A full reload resets
// this and shows the loader again, which is expected.
let hasPlayedIntro = false;

export default function Home() {
  const thirdSectionCopy =
    "I specialize in building optimized websites and automated systems, spanning both software and hardware. As a developer who enjoys end-to-end product development, I focus on bringing ideas to life from scratch while navigating obscure requirements and tight timelines. My priorities are fast execution, rigorous system logic, and efficient problem solving.";
  const techHeaderText = "Tech Stacks";
  const techProgrammingText = "Programming";
  const techWorkflowText = "Workflow";
  const techWebDevText = "Web Dev";
  const techDesignText = "Design";

  const featuredWorks = useMemo(
    () => [
      {
        title: "Death Note Mod",
        period: "Jan 2025 - Present",
        description:
          "An interactive Death Note-inspired mod with custom visuals, animations, and game logic.",
        href: "#",
        image: "images/deathnote.webp",
      },
      {
        title: "Anime identifier",
        period: "Nov 2024 - Nov 2024",
        description:
          "An image recognition tool that identifies anime characters along with the series they appear in.",
        href: "#",
        image: "images/anime.png",
      },
      {
        title: "PocketDoc",
        period: "April 2026 - April 2026",
        description:
          "A pocket-sized document tool built to keep files organized and easy to access on the go.",
        href: "#",
        image: "images/pocketdoc.png",
      },
    ],
    [],
  );

  const thirdSectionWords = useMemo(
    () => thirdSectionCopy.trim().split(/\s+/),
    [thirdSectionCopy],
  );

  const programmingStackItems = useMemo<StackItem[]>(
    () => [
      { label: "Python", iconSrc: "/stack-icons/python.svg" },
      { label: "Java", iconSrc: "/stack-icons/java.png" },
    ],
    [],
  );

  const workflowStackItems = useMemo<StackItem[]>(
    () => [
      { label: "Git", iconSrc: "/stack-icons/git.png" },
      { label: "GitHub", iconSrc: "/stack-icons/github.svg" },
      { label: "Milanote", iconSrc: "/stack-icons/milanote.png" },
      { label: "Supabase", iconSrc: "/stack-icons/supabase.png" },
      { label: "Vercel", iconSrc: "/stack-icons/vercel.png" },
      { label: "Google Cloud", iconSrc: "/stack-icons/cloud.png" },
    ],
    [],
  );

  const webDevStackItems = useMemo<StackItem[]>(
    () => [
      { label: "HTML", iconSrc: "/stack-icons/html.png" },
      { label: "CSS", iconSrc: "/stack-icons/css.png" },
      { label: "Javascript", iconSrc: "/stack-icons/javascript.png" },
      { label: "React", iconSrc: "/stack-icons/react.png" },
      { label: "TypeScript", iconSrc: "/stack-icons/typescript.png" },
      { label: "Tailwind CSS", iconSrc: "/stack-icons/tailwindcss.png" },
      { label: "Node.js", iconSrc: "/stack-icons/node.png" },
      { label: "Next.js", iconSrc: "/stack-icons/next.png" },
      { label: "Socket.io", iconSrc: "/stack-icons/socket-io.png" },
      { label: "Locomotive", iconSrc: "/stack-icons/locomotive.png" },
      { label: "Framer Motion", iconSrc: "/stack-icons/framer-motion.svg" },
      { label: "GSAP", iconSrc: "/stack-icons/gsap.png" },
    ],
    [],
  );

  const designStackItems = useMemo<StackItem[]>(
    () => [
      { label: "Figma", iconSrc: "/stack-icons/figma.png" },
      { label: "GIMP", iconSrc: "/stack-icons/gimp.png" },
      { label: "Inkspace", iconSrc: "/stack-icons/inkspace.png" },
    ],
    [],
  );

  const techHeaderChars = useMemo(
    () => Array.from(techHeaderText),
    [techHeaderText],
  );
  const techProgrammingChars = useMemo(
    () => Array.from(techProgrammingText),
    [techProgrammingText],
  );
  const techWorkflowChars = useMemo(
    () => Array.from(techWorkflowText),
    [techWorkflowText],
  );
  const techWebDevChars = useMemo(
    () => Array.from(techWebDevText),
    [techWebDevText],
  );
  const techDesignChars = useMemo(
    () => Array.from(techDesignText),
    [techDesignText],
  );

  const SECOND_SECTION_BG = "#000000";
  const CURVE_BASELINE_Y = 300;
  const DIVIDER_HEIGHT = 480;
  const DIVIDER_OVERLAP = 180;
  const MAX_CURVE_AMOUNT = 600;
  const SHADOW_MIN_OPACITY = 0.24;
  const SHADOW_MAX_OPACITY = 0.72;

  const TECH_CURVE_START_PERCENT = 70;
  const TECH_CURVE_END_PERCENT = 100;
  const TECH_CURVE_SCRUB = 0.6;

  const [skipIntro] = useState(hasPlayedIntro);
  const [isLoaderVisible, setIsLoaderVisible] = useState(!skipIntro);
  const [fontsReady, setFontsReady] = useState(false);
  const [gradientReady, setGradientReady] = useState(false);
  const [settleReady, setSettleReady] = useState(false);
  const [hoverPreview, setHoverPreview] = useState({
    visible: false,
    image: "",
    title: "",
  });
  const pageRef = useRef<HTMLDivElement | null>(null);
  const smoothWrapperRef = useRef<HTMLDivElement | null>(null);
  const smoothContentRef = useRef<HTMLDivElement | null>(null);
  const secondSectionRef = useRef<HTMLElement | null>(null);
  const thirdSectionRef = useRef<HTMLElement | null>(null);
  const thirdSectionTextRef = useRef<HTMLParagraphElement | null>(null);
  const techSectionRef = useRef<HTMLElement | null>(null);
  const titleMaskRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const shadowPathRef = useRef<SVGPathElement | null>(null);
  const fillPathRef = useRef<SVGPathElement | null>(null);
  const invertedPathRef = useRef<SVGPathElement | null>(null);
  const invertedShadowPathRef = useRef<SVGPathElement | null>(null);
  const invertedFillPathRef = useRef<SVGPathElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewPosRef = useRef({ x: 0, y: 0 });
  const previewRafRef = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const headerIntroRef = useRef<HTMLDivElement | null>(null);
  const moreProjectsButtonRef = useRef<HTMLAnchorElement | null>(null);
  const moreProjectsTextRef = useRef<HTMLSpanElement | null>(null);
  const moreProjectsRafRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const moreProjectsMotionRef = useRef({
    current: { x: 0, y: 0, rotation: 0, scale: 1 },
    target: { x: 0, y: 0, rotation: 0, scale: 1 },
    velocity: { x: 0, y: 0, rotation: 0, scale: 0 },
  });
  const domReady = true;

  const curveSettleRafRef = useRef<number | null>(null);
  const animationState = useRef({
    curveAmount: 0,
    targetCurveAmount: 0,
    shadowOpacity: SHADOW_MIN_OPACITY,
    targetShadowOpacity: SHADOW_MIN_OPACITY,
  });
  const invertedAnimationState = useRef({
    curveAmount: 0,
    targetCurveAmount: 0,
    shadowOpacity: SHADOW_MIN_OPACITY,
    targetShadowOpacity: SHADOW_MIN_OPACITY,
  });
  const [windowWidth, setWindowWidth] = useState(0);

  const handleGradientReady = useCallback(() => {
    setGradientReady(true);
  }, []);

  const updatePreviewPosition = useCallback((x: number, y: number) => {
    previewPosRef.current = { x, y };

    if (previewRafRef.current !== null) {
      return;
    }
    // Inverted curve scroll trigger settings (in percentages)
    const TECH_CURVE_START_PERCENT = 50; // 0 = bottom of viewport, 50 = center, 100 = top
    const TECH_CURVE_END_PERCENT = 50;
    const TECH_CURVE_SCRUB = 0.6;

    previewRafRef.current = window.requestAnimationFrame(() => {
      previewRafRef.current = null;

      if (!previewRef.current) {
        return;
      }

      previewRef.current.style.left = `${previewPosRef.current.x}px`;
      previewRef.current.style.top = `${previewPosRef.current.y}px`;
    });
  }, []);

  const renderMoreProjectsMotion = useCallback(() => {
    const button = moreProjectsButtonRef.current;
    const text = moreProjectsTextRef.current;

    if (!button || !text) {
      return;
    }

    const { x, y, rotation, scale } = moreProjectsMotionRef.current.current;

    button.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    text.style.transform = `translate3d(${x * 0.64}px, ${y * 0.64}px, 0) rotate(${rotation * 0.42}deg) scale(${1 + (scale - 1) * 0.52})`;
    button.style.boxShadow = `0 ${Math.max(10, scale * 16)}px ${Math.max(24, scale * 32)}px rgba(0, 0, 0, ${0.16 + (scale - 1) * 1.8})`;
  }, []);

  const stepMoreProjectsMotion = useCallback(() => {
    const state = moreProjectsMotionRef.current;

    const stiffness = 0.14;
    const damping = state.target.scale > 1.001 ? 0.74 : 0.7;

    const advance = (key: "x" | "y" | "rotation" | "scale") => {
      state.velocity[key] +=
        (state.target[key] - state.current[key]) * stiffness;
      state.velocity[key] *= damping;
      state.current[key] += state.velocity[key];
    };

    advance("x");
    advance("y");
    advance("rotation");
    advance("scale");

    renderMoreProjectsMotion();

    const isSettled =
      Math.abs(state.current.x) < 0.15 &&
      Math.abs(state.current.y) < 0.15 &&
      Math.abs(state.current.rotation) < 0.15 &&
      Math.abs(state.current.scale - 1) < 0.002 &&
      Math.abs(state.velocity.x) < 0.05 &&
      Math.abs(state.velocity.y) < 0.05 &&
      Math.abs(state.velocity.rotation) < 0.05 &&
      Math.abs(state.velocity.scale) < 0.0006;

    if (isSettled) {
      const button = moreProjectsButtonRef.current;
      const text = moreProjectsTextRef.current;

      if (button) {
        button.style.transform = "";
        button.style.boxShadow = "";
      }

      if (text) {
        text.style.transform = "";
      }

      moreProjectsRafRef.current = null;
      return;
    }

    moreProjectsRafRef.current = window.requestAnimationFrame(
      stepMoreProjectsMotion,
    );
  }, [renderMoreProjectsMotion]);

  const startMoreProjectsMotion = useCallback(() => {
    if (moreProjectsRafRef.current !== null) {
      return;
    }

    moreProjectsRafRef.current = window.requestAnimationFrame(
      stepMoreProjectsMotion,
    );
  }, [stepMoreProjectsMotion]);

  const updateMoreProjectsButtonPosition = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
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

      const state = moreProjectsMotionRef.current;
      state.target = { x: translateX, y: translateY, rotation, scale };

      startMoreProjectsMotion();
    },
    [startMoreProjectsMotion],
  );

  const resetMoreProjectsButtonPosition = useCallback(() => {
    const state = moreProjectsMotionRef.current;

    if (moreProjectsRafRef.current === null) {
      return;
    }

    state.target = { x: 0, y: 0, rotation: 0, scale: 1 };
    state.velocity.x += state.current.x * 0.36;
    state.velocity.y += state.current.y * 0.36;
    state.velocity.rotation += state.current.rotation * 0.28;
    state.velocity.scale -= (state.current.scale - 1) * 0.48;

    startMoreProjectsMotion();
  }, []);

  const lerp = useCallback(
    (x: number, y: number, a: number) => x * (1 - a) + y * a,
    [],
  );

  const setPath = useCallback(
    (curveAmount: number) => {
      if (!pathRef.current || !fillPathRef.current || !shadowPathRef.current)
        return;
      const width = windowWidth || window.innerWidth;

      const controlY = CURVE_BASELINE_Y - curveAmount;
      const curvePath = `M0 ${CURVE_BASELINE_Y} Q${width / 2} ${controlY}, ${width} ${CURVE_BASELINE_Y}`;

      pathRef.current.setAttributeNS(null, "d", curvePath);
      shadowPathRef.current.setAttributeNS(null, "d", curvePath);

      fillPathRef.current.setAttributeNS(
        null,
        "d",
        `M0 ${CURVE_BASELINE_Y} Q${width / 2} ${controlY}, ${width} ${CURVE_BASELINE_Y} L${width} ${DIVIDER_HEIGHT} L0 ${DIVIDER_HEIGHT} Z`,
      );
    },
    [windowWidth, CURVE_BASELINE_Y, DIVIDER_HEIGHT],
  );

  const setInvertedPath = useCallback(
    (curveAmount: number) => {
      if (
        !invertedPathRef.current ||
        !invertedFillPathRef.current ||
        !invertedShadowPathRef.current
      )
        return;
      const width = windowWidth || window.innerWidth;

      const invertedBaseline = 0;
      const controlY = invertedBaseline + curveAmount;
      const curvePath = `M0 ${invertedBaseline} Q${width / 2} ${controlY}, ${width} ${invertedBaseline}`;

      invertedPathRef.current.setAttributeNS(null, "d", curvePath);
      invertedShadowPathRef.current.setAttributeNS(null, "d", curvePath);

      invertedFillPathRef.current.setAttributeNS(
        null,
        "d",
        `M0 ${invertedBaseline} Q${width / 2} ${controlY}, ${width} ${invertedBaseline} L0 ${invertedBaseline} Z`,
      );
    },
    [windowWidth],
  );

  // Scroll callbacks are not guaranteed to keep firing until the eased curve
  // values reach their targets. iOS Safari in particular can jump straight to
  // the top on a programmatic scroll, which delivers only a single update and
  // leaves both dividers stuck part-way through their curve. So the scroll
  // trigger only sets targets and this loop eases them home on its own frames.
  const settleCurveAnimations = useCallback(() => {
    let unsettled = false;

    const state = animationState.current;
    if (
      Math.abs(state.targetCurveAmount - state.curveAmount) > 0.05 ||
      Math.abs(state.targetShadowOpacity - state.shadowOpacity) > 0.001
    ) {
      unsettled = true;
      state.curveAmount = lerp(
        state.curveAmount,
        state.targetCurveAmount,
        0.18,
      );
      state.shadowOpacity = lerp(
        state.shadowOpacity,
        state.targetShadowOpacity,
        0.2,
      );

      if (shadowPathRef.current) {
        shadowPathRef.current.setAttributeNS(
          null,
          "opacity",
          state.shadowOpacity.toFixed(3),
        );
      }

      setPath(state.curveAmount);
    }

    const invertedState = invertedAnimationState.current;
    if (
      Math.abs(invertedState.targetCurveAmount - invertedState.curveAmount) >
        0.05 ||
      Math.abs(
        invertedState.targetShadowOpacity - invertedState.shadowOpacity,
      ) > 0.001
    ) {
      unsettled = true;
      invertedState.curveAmount = lerp(
        invertedState.curveAmount,
        invertedState.targetCurveAmount,
        0.35,
      );
      invertedState.shadowOpacity = lerp(
        invertedState.shadowOpacity,
        invertedState.targetShadowOpacity,
        0.35,
      );

      if (invertedShadowPathRef.current) {
        invertedShadowPathRef.current.setAttributeNS(
          null,
          "opacity",
          invertedState.shadowOpacity.toFixed(3),
        );
      }

      setInvertedPath(invertedState.curveAmount);
    }

    return unsettled;
  }, [lerp, setInvertedPath, setPath]);

  const startCurveSettleLoop = useCallback(() => {
    if (curveSettleRafRef.current !== null) {
      return;
    }

    const tick = () => {
      curveSettleRafRef.current = null;

      if (settleCurveAnimations()) {
        curveSettleRafRef.current = window.requestAnimationFrame(tick);
      }
    };

    curveSettleRafRef.current = window.requestAnimationFrame(tick);
  }, [settleCurveAnimations]);

  const updatePathForScroll = useCallback(
    (scrollProgress: number) => {
      const state = animationState.current;

      state.targetCurveAmount = Math.min(
        scrollProgress * MAX_CURVE_AMOUNT,
        MAX_CURVE_AMOUNT,
      );
      state.targetShadowOpacity =
        SHADOW_MIN_OPACITY +
        (SHADOW_MAX_OPACITY - SHADOW_MIN_OPACITY) * scrollProgress;

      startCurveSettleLoop();
    },
    [
      startCurveSettleLoop,
      MAX_CURVE_AMOUNT,
      SHADOW_MAX_OPACITY,
      SHADOW_MIN_OPACITY,
    ],
  );

  const updateInvertedPathForScroll = useCallback(
    (scrollProgress: number) => {
      const invertedProgress = 1 - scrollProgress;
      const invertedState = invertedAnimationState.current;

      invertedState.targetCurveAmount = Math.min(
        invertedProgress * MAX_CURVE_AMOUNT,
        MAX_CURVE_AMOUNT,
      );
      invertedState.targetShadowOpacity =
        SHADOW_MIN_OPACITY +
        (SHADOW_MAX_OPACITY - SHADOW_MIN_OPACITY) * invertedProgress;

      startCurveSettleLoop();
    },
    [
      startCurveSettleLoop,
      MAX_CURVE_AMOUNT,
      SHADOW_MAX_OPACITY,
      SHADOW_MIN_OPACITY,
    ],
  );

  const gradientConfig = useMemo(
    () => ({
      color1: { r: 0, g: 0, b: 0 },
      color2: { r: 12, g: 12, b: 12 },
      color3: { r: 59, g: 59, b: 59 },
      speed: 0.5,
      scale: 1.6,
      type: "silk" as const,
      noise: 0.05,
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const waitForFonts = async () => {
      try {
        await document.fonts.ready;
      } catch {}

      if (!cancelled) {
        setFontsReady(true);
      }
    };

    waitForFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!domReady || !fontsReady || !gradientReady) {
      return;
    }

    let raf1 = 0;
    let raf2 = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setSettleReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [domReady, fontsReady, gradientReady]);

  const allReady =
    skipIntro || (domReady && fontsReady && gradientReady && settleReady);

  useEffect(() => {
    if (!allReady) {
      return;
    }

    // Returning to the home page from another route should feel instant:
    // skip the loader and the intro reveal, leaving the page visible as-is.
    if (skipIntro) {
      setIsLoaderVisible(false);
      return;
    }

    hasPlayedIntro = true;

    let split: SplitText | null = null;

    if (titleRef.current) {
      split = new SplitText(titleRef.current, { type: "chars" });
      gsap.set(split.chars, { yPercent: 150, willChange: "transform" });
    }

    const tl = gsap.timeline({
      onComplete: () => setIsLoaderVisible(false),
    });

    tl.fromTo(
      pageRef.current,
      { autoAlpha: 0, y: 48 },
      { autoAlpha: 1, y: 0, duration: 0.95, ease: "power3.out" },
      0,
    )
      .to(
        split?.chars ?? [],
        {
          yPercent: 0,
          stagger: 0.065,
          delay: 0.24,
          duration: 0.42,
          ease: "power3.out",
        },
        0,
      )
      .to(
        loaderRef.current,
        { autoAlpha: 0, duration: 0.12, ease: "power1.out" },
        0,
      )
      .to(
        loaderRef.current,
        {
          yPercent: -220,
          duration: 0.5,
          ease: "power4.in",
        },
        0,
      )
      // Wait for the loader overlay to finish sliding away, then drop the
      // navbar in from above the viewport. It lives on its own wrapper so this
      // never fights the scroll-triggered header fade on the <header> itself.
      .fromTo(
        headerIntroRef.current ?? [],
        { y: -500 },
        {
          y: 0,
          duration: 1,
          ease: "power4.out",
          clearProps: "transform",
        },
        0.55,
      );

    return () => {
      tl.kill();
      split?.revert();
    };
  }, [allReady, skipIntro]);

  useEffect(() => {
    if (!allReady || !smoothWrapperRef.current || !smoothContentRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    ScrollSmoother.get()?.kill();

    // Avoid refreshes (and the resulting jumps) when mobile browser chrome
    // such as the address bar shows/hides.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Smooth scrolling works by transforming the content to lag behind native
    // scroll. That is what caused the flicker/jitter on phones, so touch
    // devices use the browser's native scrolling instead. ScrollTriggers still
    // work normally because they fall back to the window scroller.
    if (ScrollTrigger.isTouch === 1 || prefersReducedMotion) {
      return;
    }

    const smoother = ScrollSmoother.create({
      wrapper: smoothWrapperRef.current,
      content: smoothContentRef.current,
      smooth: 1.2,
      effects: false,
    });

    return () => {
      smoother.kill();
    };
  }, [allReady]);

  useEffect(() => {
    if (!allReady || !headerRef.current || !smoothContentRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 0, opacity: 1 },
        {
          y: -36,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: smoothContentRef.current,
            start: "top top",
            end: "top+=220 top",
            scrub: 0.8,
          },
        },
      );
    }, smoothContentRef);

    return () => {
      ctx.revert();
    };
  }, [allReady]);

  useEffect(() => {
    if (!secondSectionRef.current) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: secondSectionRef.current,
      start: "top bottom+=35%",
      end: "bottom top-=10%",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        updatePathForScroll(self.progress);
      },
    });

    updatePathForScroll(0);

    return () => {
      trigger.kill();
    };
  }, [updatePathForScroll]);

  useEffect(() => {
    const text = thirdSectionTextRef.current;
    if (!text) {
      return;
    }

    const letters = Array.from(
      text.querySelectorAll<HTMLElement>("[data-letter]"),
    );

    if (letters.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      // Per-letter blur filters are very expensive to composite on mobile,
      // so touch devices only animate opacity.
      const useBlur = !window.matchMedia("(pointer: coarse)").matches;

      gsap.set(
        letters,
        useBlur
          ? {
              opacity: 0.22,
              y: 18,
              filter: "blur(9px)",
              willChange: "opacity, transform, filter",
            }
          : {
              opacity: 0.22,
              willChange: "opacity",
            },
      );

      gsap.to(letters, {
        opacity: 1,
        ...(useBlur ? { y: 0, filter: "blur(0px)" } : {}),
        ease: "none",
        stagger: {
          each: 0.035,
          from: "start",
        },
        scrollTrigger: {
          // Trigger on the paragraph itself so the reveal stays tied to the
          // text the user is looking at, regardless of section padding.
          trigger: text,
          start: "top 90%",
          end: "center center",
          scrub: 0.9,
        },
      });
    }, thirdSectionRef);

    return () => {
      ctx.revert();
    };
  }, [allReady]);

  useEffect(() => {
    if (!techSectionRef.current) {
      return;
    }

    const headerChars = Array.from(
      techSectionRef.current.querySelectorAll<HTMLElement>("[data-tech-char]"),
    );
    const iconCards = Array.from(
      techSectionRef.current.querySelectorAll<HTMLElement>(
        "[data-tech-icon-card]",
      ),
    );
    const designIconCards = Array.from(
      techSectionRef.current.querySelectorAll<HTMLElement>(
        "[data-tech-design-icon-card]",
      ),
    );

    if (
      headerChars.length === 0 &&
      iconCards.length === 0 &&
      designIconCards.length === 0
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(headerChars, {
        opacity: 0,
      });

      gsap.set(iconCards, {
        autoAlpha: 0,
        scale: 0,
        y: 16,
        transformOrigin: "50% 50%",
      });

      gsap.set(designIconCards, {
        autoAlpha: 0,
        scale: 0,
        y: 16,
        transformOrigin: "50% 50%",
      });

      const iconRows = iconCards.reduce<HTMLElement[][]>((rows, card) => {
        const cardTop = Math.round(card.offsetTop);
        const lastRow = rows[rows.length - 1];
        const lastRowTop = lastRow ? Math.round(lastRow[0].offsetTop) : -1;

        if (!lastRow || lastRowTop !== cardTop) {
          rows.push([card]);
        } else {
          lastRow.push(card);
        }

        return rows;
      }, []);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: techSectionRef.current,
          start: "top 80%",
          end: "bottom 85%",
          scrub: 0.2,
        },
      });

      tl.to(headerChars, {
        opacity: 1,
        duration: 0.45,
        stagger: 0.024,
        ease: "none",
      });

      iconRows.forEach((row) => {
        tl.to(row, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: {
            each: 0.12,
            from: "start",
          },
          ease: "none",
        });
      });

      if (designIconCards.length > 0) {
        tl.to(designIconCards, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: {
            each: 0.12,
            from: "start",
          },
          ease: "none",
        });
      }
    }, techSectionRef);

    return () => {
      ctx.revert();
    };
  }, [allReady]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeTimeoutRef.current = null;
        setWindowWidth(window.innerWidth);
      }, 120);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (windowWidth === 0) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [windowWidth]);

  useEffect(() => {
    setPath(animationState.current.curveAmount);
  }, [setPath, windowWidth]);

  useEffect(() => {
    setInvertedPath(invertedAnimationState.current.curveAmount);
  }, [setInvertedPath, windowWidth]);

  useEffect(() => {
    if (!techSectionRef.current) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: techSectionRef.current,
      start: `top ${100 - TECH_CURVE_START_PERCENT}%`,
      end: `bottom ${100 - TECH_CURVE_END_PERCENT}%`,
      scrub: TECH_CURVE_SCRUB,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        updateInvertedPathForScroll(self.progress);
      },
    });

    updateInvertedPathForScroll(0);

    return () => {
      trigger.kill();
    };
  }, [updateInvertedPathForScroll]);

  useEffect(() => {
    const preloadedImages = featuredWorks.map((project) => {
      const image = new Image();
      image.src = project.image;
      return image;
    });

    return () => {
      preloadedImages.forEach((image) => {
        image.src = "";
      });
    };
  }, [featuredWorks]);

  useEffect(() => {
    return () => {
      if (previewRafRef.current !== null) {
        window.cancelAnimationFrame(previewRafRef.current);
      }
      if (curveSettleRafRef.current !== null) {
        window.cancelAnimationFrame(curveSettleRafRef.current);
        curveSettleRafRef.current = null;
      }
    };
  }, []);
  const steps = [
    { label: "Initializing page...", done: domReady },
    { label: "Loading fonts...", done: fontsReady },
    { label: "Preparing gradient...", done: gradientReady },
    { label: "Final render pass...", done: settleReady },
  ];

  const completedSteps = steps.filter((step) => step.done).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const pendingStep = steps.find((step) => !step.done);
  const currentStep = pendingStep?.label ?? "Ready";
  const isLoading = !skipIntro && (!allReady || isLoaderVisible);
  const isCompactViewport = windowWidth > 0 && windowWidth < 768;

  return (
    <>
      {isLoading && (
        <div ref={loaderRef}>
          <Loader currentStep={currentStep} progress={progress} />
        </div>
      )}
      <div ref={smoothWrapperRef} id="smooth-wrapper" className="relative">
        <div ref={smoothContentRef} id="smooth-content">
          <div
            ref={pageRef}
            className="relative min-h-[130vh] overflow-hidden bg-black"
          >
            <div ref={headerIntroRef} className="relative z-20">
              <header
                ref={headerRef}
                className="relative z-20 bg-transparent backdrop-blur-sm"
              >
                <div className="flex h-16 w-full items-center px-3 md:px-5">
                  <a
                    href="#"
                    className="font-(family-name:--font-stalinist-one) shrink-0 text-lg font-semibold uppercase tracking-[0.24em] text-zinc-100 transition-colors hover:text-white px-5"
                  >
                    ERIC LIN
                  </a>

                  <div className="ml-auto flex items-center gap-5">
                    <nav className="hidden items-center gap-0 text-xs font-semibold uppercase tracking-[0.16em] font-(family-name:--font-montserrat) text-zinc-300 lg:flex">
                      <Link
                        href="/about"
                        className="px-5 transition-colors hover:text-white"
                      >
                        About
                      </Link>

                      <span className="h-full w-px bg-white/20" />
                      <a
                        href="#"
                        className="px-5 transition-colors hover:text-white"
                      >
                        Projects
                      </a>
                      <span className="h-full w-px bg-white/20" />

                      <a
                        href="#"
                        className="px-5 transition-colors hover:text-white"
                      >
                        Blog
                      </a>
                      <span className="h-full w-px bg-white/20" />
                      <a
                        href="/resume.pdf"
                        target="_blank"
                        className="px-5 transition-colors hover:text-white"
                      >
                        Resume
                      </a>
                    </nav>

                    <div className="flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
                      <ContactButton />
                    </div>
                  </div>
                </div>
              </header>
            </div>
            <InteractiveGradFlow
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              paused={false}
              onReady={handleGradientReady}
              config={gradientConfig}
            />
            <main className="pointer-events-none relative z-10 flex min-h-screen w-full items-end">
              <div
                ref={titleMaskRef}
                className="relative z-20 ml-4 mr-20 md:mr-36 lg:mr-36 mb-16 pt-[3em] pb-[2em]"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
              >
                <h1
                  ref={titleRef}
                  className="whitespace-nowrap text-white uppercase leading-none font-(family-name:--font-boldonse) text-[clamp(3rem,18vw,20rem)]"
                >
                  Eric Lin
                </h1>
              </div>
            </main>
          </div>
          <section
            ref={secondSectionRef}
            id="featured-works"
            className={`relative w-full overflow-visible bg-black text-zinc-100 ${spaceGrotesk.className}`}
            style={{ backgroundColor: SECOND_SECTION_BG }}
          >
            <svg
              className="pointer-events-none absolute left-0 z-20 w-full overflow-visible"
              style={{
                top: `-${CURVE_BASELINE_Y + DIVIDER_OVERLAP}px`,
                height: `${DIVIDER_HEIGHT}px`,
                overflow: "visible",
                display: "block",
              }}
              viewBox={`0 0 ${windowWidth || 1} ${DIVIDER_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="curve-shadow"
                  x="-20%"
                  y="-80%"
                  width="140%"
                  height="220%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation={isCompactViewport ? 4 : 11}
                  />
                </filter>
              </defs>
              <path
                ref={fillPathRef}
                stroke="none"
                fill={SECOND_SECTION_BG}
                fillOpacity="1"
              />
              <path
                ref={shadowPathRef}
                stroke="white"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                filter="url(#curve-shadow)"
                opacity={SHADOW_MIN_OPACITY}
              />
              <path
                ref={pathRef}
                stroke="none"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div className="relative z-10 px-4 pb-24 pt-8 sm:px-6 md:px-8 lg:px-10">
              <h2 className="text-[clamp(2.75rem,4.4vw,4.6rem)] font-medium tracking-[-0.06em] text-zinc-100">
                Featured Works
              </h2>

              <div className="mt-10 border-y border-white/20">
                {featuredWorks.map((project) => (
                  <a
                    key={project.title}
                    href={project.href}
                    className="group relative block border-b border-white/20 px-0 py-6 last:border-b-0 sm:py-7 md:py-8"
                    aria-label={project.title}
                    onMouseEnter={(event) => {
                      updatePreviewPosition(event.clientX, event.clientY);
                      setHoverPreview({
                        visible: true,
                        image: project.image,
                        title: project.title,
                      });
                    }}
                    onMouseMove={(event) => {
                      updatePreviewPosition(event.clientX, event.clientY);
                    }}
                    onMouseLeave={() => {
                      setHoverPreview((prev) => ({
                        ...prev,
                        visible: false,
                      }));
                    }}
                  >
                    <div className="md:hidden">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                        <img
                          src={project.image}
                          alt={`${project.title} preview`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <h3 className="mt-4 text-xl leading-tight tracking-[-0.04em] text-zinc-100">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {project.description}
                      </p>
                      <p className="mt-3 text-xs tracking-[0.16em] text-zinc-500 uppercase">
                        {project.period}
                      </p>
                    </div>

                    <div className="hidden items-center justify-between gap-6 md:flex">
                      <span className="text-[clamp(1.25rem,1.7vw,2rem)] leading-tight tracking-[-0.04em] text-zinc-100 transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:text-white">
                        {project.title}
                      </span>
                      <span className="shrink-0 text-sm tracking-[-0.02em] text-zinc-400 sm:text-base">
                        {project.period}
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex justify-center pt-10">
                <a
                  ref={moreProjectsButtonRef}
                  href="#"
                  className="inline-flex items-center justify-center rounded-full border border-white/70 px-10 py-4 text-sm font-medium tracking-[0.01em] text-zinc-100 transition-[background-color,color,border-color] duration-200 ease-out will-change-transform hover:bg-white hover:text-black"
                  onPointerEnter={updateMoreProjectsButtonPosition}
                  onPointerMove={updateMoreProjectsButtonPosition}
                  onPointerLeave={resetMoreProjectsButtonPosition}
                >
                  <span
                    ref={moreProjectsTextRef}
                    className="inline-block will-change-transform"
                  >
                    More Projects
                  </span>
                </a>
              </div>
            </div>
          </section>
          <section
            ref={thirdSectionRef}
            className="flex w-full items-center justify-center bg-black px-6 pt-32 pb-40 text-center text-zinc-100 md:pt-48 md:pb-64"
          >
            <p
              ref={thirdSectionTextRef}
              className={`w-full max-w-6xl text-[clamp(2rem,3vw,3.4rem)] leading-[0.98] tracking-[-0.06em] text-zinc-200 ${spaceGrotesk.className}`}
            >
              {thirdSectionWords.flatMap((word, wordIndex) => {
                const isLastWord = wordIndex === thirdSectionWords.length - 1;

                return [
                  <span key={`word-${wordIndex}`} className="whitespace-nowrap">
                    {Array.from(word).map((letter, letterIndex) => (
                      <span
                        key={`letter-${wordIndex}-${letterIndex}`}
                        data-letter
                        aria-hidden="true"
                        className="inline-block will-change-transform"
                      >
                        {letter}
                      </span>
                    ))}
                  </span>,
                  isLastWord ? "" : " ",
                ];
              })}
            </p>
          </section>
          <section
            ref={techSectionRef}
            className={`relative min-h-screen w-full bg-black px-6 py-20 text-zinc-100 ${spaceGrotesk.className}`}
          >
            <div className="mr-auto ml-0 w-full max-w-5xl">
              <h2 className="text-left text-[clamp(2.5rem,6vw,5rem)] font-medium tracking-[-0.06em] text-zinc-100">
                {techHeaderChars.map((char, index) => (
                  <span
                    key={`tech-header-char-${index}`}
                    data-tech-char
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h2>

              <div className="mt-12 space-y-10">
                <div className="text-left">
                  <h3 className="text-4xl font-semibold text-zinc-200">
                    {techProgrammingChars.map((char, index) => (
                      <span
                        key={`tech-programming-char-${index}`}
                        data-tech-char
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </h3>
                  <div className="mt-5 flex flex-wrap justify-start gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
                    {programmingStackItems.map(({ label, iconSrc }) => (
                      <div
                        key={label}
                        data-tech-icon-card
                        className="flex w-24 flex-col items-center gap-1 text-center sm:w-28"
                      >
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt={`${label} icon`}
                            className="h-11 w-11 object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                        <span className="text-[1.15rem] tracking-[-0.02em] text-zinc-200">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-4xl font-semibold text-zinc-200">
                    {techWorkflowChars.map((char, index) => (
                      <span
                        key={`tech-workflow-char-${index}`}
                        data-tech-char
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </h3>
                  <div className="mt-5 flex flex-wrap justify-start gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
                    {workflowStackItems.map(({ label, iconSrc }) => (
                      <div
                        key={label}
                        data-tech-icon-card
                        className="flex w-24 flex-col items-center gap-1 text-center sm:w-28"
                      >
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt={`${label} icon`}
                            className="h-11 w-11 object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                        <span className="text-[1.15rem] tracking-[-0.02em] text-zinc-200">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-4xl font-semibold text-zinc-200">
                    {techWebDevChars.map((char, index) => (
                      <span
                        key={`tech-web-dev-char-${index}`}
                        data-tech-char
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </h3>
                  <div className="mt-5 flex flex-wrap justify-start gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
                    {webDevStackItems.map(({ label, iconSrc }) => (
                      <div
                        key={label}
                        data-tech-icon-card
                        className="flex w-24 flex-col items-center gap-1 text-center sm:w-28"
                      >
                        <img
                          src={iconSrc}
                          alt={`${label} icon`}
                          className="h-11 w-11 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="text-[1.15rem] tracking-[-0.02em] text-zinc-200">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-4xl font-semibold text-zinc-200">
                    {techDesignChars.map((char, index) => (
                      <span
                        key={`tech-design-char-${index}`}
                        data-tech-char
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </h3>
                  <div className="mt-5 flex flex-wrap justify-start gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
                    {designStackItems.map(({ label, iconSrc }) => (
                      <div
                        key={label}
                        data-tech-design-icon-card
                        className="flex w-24 flex-col items-center gap-1 text-center sm:w-28"
                      >
                        <img
                          src={iconSrc}
                          alt={`${label} icon`}
                          className="h-11 w-11 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="text-[1.15rem] tracking-[-0.02em] text-zinc-200">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <svg
              className="pointer-events-none absolute left-0 z-20 w-full overflow-visible"
              style={{
                top: `100%`,
                height: `${DIVIDER_HEIGHT}px`,
                overflow: "visible",
                display: "block",
              }}
              viewBox={`0 0 ${windowWidth || 1} ${DIVIDER_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="inverted-curve-shadow"
                  x="-20%"
                  y="-80%"
                  width="140%"
                  height="220%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation={isCompactViewport ? 4 : 11}
                  />
                </filter>
              </defs>
              <path
                ref={invertedFillPathRef}
                stroke="none"
                fill={SECOND_SECTION_BG}
                fillOpacity="1"
              />
              <path
                ref={invertedShadowPathRef}
                stroke="white"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                filter="url(#inverted-curve-shadow)"
                opacity={SHADOW_MIN_OPACITY}
              />
              <path
                ref={invertedPathRef}
                stroke="none"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </section>

          <InteractiveFooter />
        </div>
      </div>
      <div
        ref={previewRef}
        className={`pointer-events-none fixed left-0 top-0 z-50 hidden h-52 w-80 overflow-hidden rounded-xl border border-white/25 bg-zinc-900/80 shadow-2xl transition-all duration-200 ease-out md:block ${hoverPreview.visible ? "opacity-100" : "opacity-0"}`}
        style={{
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden="true"
      >
        {hoverPreview.image && (
          <img
            key={hoverPreview.image}
            src={hoverPreview.image}
            alt={`${hoverPreview.title} preview`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            style={{
              animation:
                "preview-image-slide 240ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        )}
      </div>
      <style jsx global>{`
        @keyframes preview-image-slide {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
