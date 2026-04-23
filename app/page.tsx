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
import { Space_Grotesk } from "next/font/google";

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

export default function Home() {
  const thirdSectionCopy =
    "I’m a versatile developer specializing in full-stack systems, data-driven applications, scalable architectures, and interactive, real-world projects. I enjoy bringing ideas to life through end-to-end product development, combining strong system design with practical execution. My work emphasizes fast iteration, rigorous logic, and clean, maintainable code, while also exploring areas like machine learning and game development to create both intelligent and engaging experiences.";
  const techHeaderText = "Tech Stacks";
  const techProgrammingText = "Programming";
  const techWorkflowText = "Workflow";
  const techWebDevText = "Web Dev";
  const techDesignText = "Design";

  const featuredWorks = useMemo(
    () => [
      {
        title: "PocketDoc",
        period: "April 2026 - Present",
        href: "#",
        image: "images/pocketdoc.png",
      },
      {
        title: "Shadow Kittens TD",
        period: "March 2026 - Present",
        href: "#",
        image: "images/cat.png",
      },
      {
        title: "CentMetrics",
        period: "February 2026 - Present",
        href: "#",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
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
    ],
    [],
  );

  const designStackItems = useMemo<StackItem[]>(
    () => [{ label: "Figma", iconSrc: "/stack-icons/figma.png" }],
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
  const MAX_CURVE_AMOUNT = 1400;
  const SHADOW_MIN_OPACITY = 0.24;
  const SHADOW_MAX_OPACITY = 0.72;

  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
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
  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewPosRef = useRef({ x: 0, y: 0 });
  const previewRafRef = useRef<number | null>(null);
  const moreProjectsButtonRef = useRef<HTMLAnchorElement | null>(null);
  const moreProjectsTextRef = useRef<HTMLSpanElement | null>(null);
  const moreProjectsRafRef = useRef<number | null>(null);
  const moreProjectsMotionRef = useRef({
    current: { x: 0, y: 0, rotation: 0, scale: 1 },
    target: { x: 0, y: 0, rotation: 0, scale: 1 },
    velocity: { x: 0, y: 0, rotation: 0, scale: 0 },
  });
  const domReady = true;

  const animationState = useRef({
    curveAmount: 0,
    targetCurveAmount: 0,
    shadowOpacity: SHADOW_MIN_OPACITY,
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

  const updatePathForScroll = useCallback(
    (scrollProgress: number) => {
      animationState.current.targetCurveAmount = Math.min(
        scrollProgress * MAX_CURVE_AMOUNT,
        MAX_CURVE_AMOUNT,
      );

      animationState.current.curveAmount = lerp(
        animationState.current.curveAmount,
        animationState.current.targetCurveAmount,
        0.18,
      );

      const targetShadowOpacity =
        SHADOW_MIN_OPACITY +
        (SHADOW_MAX_OPACITY - SHADOW_MIN_OPACITY) * scrollProgress;
      animationState.current.shadowOpacity = lerp(
        animationState.current.shadowOpacity,
        targetShadowOpacity,
        0.2,
      );

      if (shadowPathRef.current) {
        shadowPathRef.current.setAttributeNS(
          null,
          "opacity",
          animationState.current.shadowOpacity.toFixed(3),
        );
      }

      setPath(animationState.current.curveAmount);
    },
    [setPath, MAX_CURVE_AMOUNT, SHADOW_MAX_OPACITY, SHADOW_MIN_OPACITY, lerp],
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

  const allReady = domReady && fontsReady && gradientReady && settleReady;

  useEffect(() => {
    if (!allReady) {
      return;
    }

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
      );

    return () => {
      tl.kill();
      split?.revert();
    };
  }, [allReady]);

  useEffect(() => {
    if (!allReady || !smoothWrapperRef.current || !smoothContentRef.current) {
      return;
    }

    ScrollSmoother.get()?.kill();

    const smoother = ScrollSmoother.create({
      wrapper: smoothWrapperRef.current,
      content: smoothContentRef.current,
      smooth: 2.2,
      smoothTouch: 0.1,
      normalizeScroll: true,
      effects: false,
    });

    return () => {
      smoother.kill();
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
    if (!thirdSectionRef.current || !thirdSectionTextRef.current) {
      return;
    }

    const letters = Array.from(
      thirdSectionTextRef.current.querySelectorAll<HTMLElement>(
        "[data-letter]",
      ),
    );

    if (letters.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(letters, {
        opacity: 0.22,
        y: 18,
        filter: "blur(9px)",
        willChange: "opacity, transform, filter",
      });

      gsap.to(letters, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        ease: "none",
        stagger: {
          each: 0.035,
          from: "start",
        },
        scrollTrigger: {
          trigger: thirdSectionRef.current,
          start: "top 100%",
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

    if (headerChars.length === 0 && iconCards.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(headerChars, {
        opacity: 0,
      });

      gsap.set(iconCards, {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: techSectionRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(headerChars, {
        opacity: 1,
        duration: 0.34,
        stagger: 0.024,
        ease: "power2.out",
      }).to(
        iconCards,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "back.out(1.9)",
        },
        "-=0.22",
      );
    }, techSectionRef);

    return () => {
      ctx.revert();
    };
  }, [allReady]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setPath(animationState.current.curveAmount);
  }, [setPath, windowWidth]);

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
  const isLoading = !allReady || isLoaderVisible;

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
            <InteractiveGradFlow
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              paused={false}
              onReady={handleGradientReady}
              config={gradientConfig}
            />
            <main className="pointer-events-none relative z-10 flex min-h-screen w-full items-end">
              <div
                ref={titleMaskRef}
                className="relative z-20 ml-4 mr-20 md:mr-36 lg:mr-36 mb-8 overflow-hidden pt-[3em] pb-[2em]"
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
            className={`relative min-h-screen w-full overflow-visible bg-black text-zinc-100 ${spaceGrotesk.className}`}
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
                  <feGaussianBlur in="SourceGraphic" stdDeviation="11" />
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
            <div className="relative z-10 px-4 pb-12 pt-8 sm:px-6 md:px-8 lg:px-10">
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
                    <div className="flex items-center justify-between gap-6">
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
            className="pb-150 flex max-h-[20vh] w-full items-center justify-center bg-black px-6 text-center text-zinc-100"
          >
            <p
              ref={thirdSectionTextRef}
              className={`w-full max-w-6xl text-[clamp(2rem,3vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.06em] text-zinc-200 ${spaceGrotesk.className}`}
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
            className={`min-h-screen w-full bg-black px-6 py-20 text-zinc-100 ${spaceGrotesk.className}`}
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
              </div>
            </div>
          </section>
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
