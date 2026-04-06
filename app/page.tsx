"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/dist/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// ScrollSmoother requires ScrollTrigger
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
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  const [gradientReady, setGradientReady] = useState(false);
  const [settleReady, setSettleReady] = useState(false);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const domReady = true;

  const handleGradientReady = useCallback(() => {
    setGradientReady(true);
  }, []);

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
      } catch {
        // If the browser cannot resolve fonts readiness, proceed anyway.
      }

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
      <div
        ref={pageRef}
        className="relative min-h-screen overflow-hidden bg-black"
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
    </>
  );
}
