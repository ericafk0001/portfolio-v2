"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

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
  const pageRef = useRef<HTMLDivElement | null>(null);
  const smoothWrapperRef = useRef<HTMLDivElement | null>(null);
  const smoothContentRef = useRef<HTMLDivElement | null>(null);
  const secondSectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const shadowPathRef = useRef<SVGPathElement | null>(null);
  const fillPathRef = useRef<SVGPathElement | null>(null);
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

  const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

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

    const tl = gsap.timeline({
      onComplete: () => setIsLoaderVisible(false),
    });

    tl.fromTo(
      pageRef.current,
      { autoAlpha: 0, y: 48 },
      { autoAlpha: 1, y: 0, duration: 0.95, ease: "power3.out" },
      0,
    )
      .fromTo(
        titleRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" },
        0.15,
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
              <h1
                ref={titleRef}
                className="relative z-20 ml-4 mr-20 md:mr-28 lg:mr-32 mb-8 whitespace-nowrap text-white uppercase leading-none font-(family-name:--font-boldonse) text-[clamp(3rem,18vw,20rem)]"
              >
                Eric Lin
              </h1>
            </main>
          </div>
          <section
            ref={secondSectionRef}
            className="relative min-h-screen w-full overflow-visible"
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
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </section>
        </div>
      </div>
    </>
  );
}
