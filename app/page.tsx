"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [svgActive, setSvgActive] = useState(false);
  const [isAnimationUnlocked, setIsAnimationUnlocked] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [gradientReady, setGradientReady] = useState(false);
  const [settleReady, setSettleReady] = useState(false);
  const domReady = true;

  const handleGradientReady = useCallback(() => {
    setGradientReady(true);
  }, []);

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

    const unlockTimer = window.setTimeout(() => {
      setIsAnimationUnlocked(true);
    }, 320);

    return () => window.clearTimeout(unlockTimer);
  }, [allReady]);

  useEffect(() => {
    if (isAnimationUnlocked) {
      const frame = window.requestAnimationFrame(() => {
        setSvgActive(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [isAnimationUnlocked]);

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
  const isLoading = !allReady;

  return (
    <>
      {isLoading && <Loader currentStep={currentStep} progress={progress} />}
      <div
        className={`relative min-h-screen overflow-hidden bg-black ${allReady ? "page-visible" : "page-hidden"}`}
      >
        <InteractiveGradFlow
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          paused={!isAnimationUnlocked}
          onReady={handleGradientReady}
          config={{
            color1: { r: 0, g: 0, b: 0 },
            color2: { r: 12, g: 12, b: 12 },
            color3: { r: 59, g: 59, b: 59 },
            speed: 0.5,
            scale: 1.6,
            type: "silk",
            noise: 0.05,
          }}
        />
        <main className="pointer-events-none relative z-10 flex min-h-screen items-end">
          <svg
            width="1143.8399658203125"
            height="290.4079895019531"
            viewBox="0 0 1143.84 290.408"
            xmlns="http://www.w3.org/2000/svg"
            className={`relative ml-8 mr-80 z-20 ${svgActive ? "active" : ""}`}
          >
            <g
              id="svgGroup"
              strokeLinecap="round"
              fillRule="evenodd"
              fontSize="9pt"
              stroke="#ffffff"
              strokeWidth="1.00"
              fill="#ffffff"
              style={{
                stroke: "#ffffff",
                strokeWidth: "1.00",
                fill: "#ffffff",
              }}
            >
              <path
                d="M 1035.84 218.167 L 1035.84 288.007 L 979.44 288.007 L 979.44 2.407 L 1045.44 2.407 L 1066.8 79.207 Q 1069.68 89.047 1072.8 101.167 Q 1075.92 113.287 1078.8 125.407 Q 1081.68 137.527 1083.6 146.887 Q 1087.92 166.807 1091.28 183.847 Q 1094.64 200.887 1098 218.887 Q 1099.44 227.527 1100.64 235.687 Q 1101.84 244.087 1103.04 252.007 L 1107.84 252.007 Q 1105.92 239.287 1104.24 229.087 Q 1102.56 218.887 1100.88 208.087 Q 1099.2 197.287 1097.28 182.407 Q 1095.6 171.847 1093.92 158.527 Q 1092.24 145.207 1090.8 132.127 Q 1089.36 119.047 1088.88 108.967 Q 1088.16 100.087 1087.8 91.567 Q 1087.44 83.047 1087.44 75.127 L 1087.44 2.407 L 1143.84 2.407 L 1143.84 288.007 L 1081.44 288.007 L 1059.36 213.847 Q 1056.96 206.167 1053.84 194.647 Q 1050.72 183.127 1047.24 170.047 Q 1043.76 156.967 1040.88 144.247 Q 1036.8 126.727 1032.72 108.127 Q 1028.64 89.527 1025.52 71.527 Q 1023.84 62.887 1022.4 54.487 Q 1020.96 46.087 1019.76 38.407 L 1014.96 38.407 Q 1017.36 54.007 1020.24 71.407 Q 1023.12 88.807 1026 108.247 Q 1028.4 126.967 1030.8 146.047 Q 1033.2 165.127 1034.64 183.367 Q 1035.12 192.487 1035.48 201.247 Q 1035.84 210.007 1035.84 218.167 Z M 615.84 174.247 L 673.44 174.247 Q 671.52 195.127 663.96 212.167 Q 656.4 229.207 644.64 243.367 Q 619.92 273.127 581.76 284.647 Q 562.56 290.407 541.68 290.407 Q 520.8 290.407 499.56 283.927 Q 478.32 277.447 458.4 262.567 Q 440.88 249.607 428.16 231.007 Q 415.44 212.407 408.96 191.287 Q 405.6 180.487 403.8 168.967 Q 402 157.447 402 145.207 Q 402 120.247 409.08 98.527 Q 416.16 76.807 428.4 59.047 Q 442.08 39.607 460.32 26.527 Q 478.56 13.447 496.8 7.207 Q 507.36 3.847 518.64 1.927 Q 529.92 0.007 541.68 0.007 Q 582.96 0.007 616.56 21.847 Q 632.64 32.407 644.88 47.167 Q 657.12 61.927 664.32 78.727 Q 671.52 96.007 673.44 116.167 L 615.84 116.167 Q 613.92 105.367 609 95.647 Q 604.08 85.927 597.6 78.727 Q 590.88 71.527 582.24 66.127 Q 573.6 60.727 563.28 57.847 Q 552.48 55.207 541.2 55.207 Q 525.84 55.207 513.12 59.887 Q 500.4 64.567 491.28 71.527 Q 470.4 88.087 462.48 115.687 Q 460.32 122.647 459.36 130.207 Q 458.4 137.767 458.4 145.687 Q 458.4 160.327 462.12 174.007 Q 465.84 187.687 473.76 199.927 Q 480.72 210.727 491.16 218.887 Q 501.6 227.047 514.08 230.887 Q 527.04 235.207 541.2 235.207 Q 564.48 235.207 582.24 224.407 Q 599.76 213.607 609.12 194.647 Q 611.28 190.087 612.96 184.927 Q 614.64 179.767 615.84 174.247 Z M 243.12 139.687 L 243.12 143.527 Q 251.76 143.527 260.64 149.047 Q 269.04 154.567 273.84 163.687 Q 275.04 166.087 275.88 168.487 Q 276.72 170.887 277.44 173.287 L 306 288.007 L 249.6 288.007 L 216.24 167.287 L 198 167.287 L 198 288.007 L 141.6 288.007 L 141.6 2.407 L 225.6 2.407 Q 237.12 2.407 247.8 5.887 Q 258.48 9.367 267.12 16.087 Q 275.76 23.047 281.64 31.927 Q 287.52 40.807 290.88 52.327 Q 294 64.087 294 76.807 Q 294 98.167 285.12 113.287 Q 281.04 120.487 275.16 126.007 Q 269.28 131.527 260.64 135.367 Q 252.48 138.727 243.12 139.687 Z M 120 235.207 L 120 288.007 L 0 288.007 L 0 2.407 L 118.8 2.407 L 118.8 55.207 L 56.4 55.207 L 56.4 109.687 L 114 109.687 L 114 162.487 L 56.4 162.487 L 56.4 235.207 L 120 235.207 Z M 872.64 288.007 L 757.44 288.007 L 757.44 2.407 L 813.84 2.407 L 813.84 235.207 L 872.64 235.207 L 872.64 288.007 Z M 380.4 288.007 L 324 288.007 L 324 2.407 L 380.4 2.407 L 380.4 288.007 Z M 950.64 288.007 L 894.24 288.007 L 894.24 2.407 L 950.64 2.407 L 950.64 288.007 Z M 198 55.207 L 211.2 55.207 Q 223.68 55.207 230.64 63.247 Q 237.6 71.287 237.6 84.967 Q 237.6 90.967 236.64 95.047 Q 234 104.407 227.76 109.447 Q 224.16 112.087 219.96 113.287 Q 215.76 114.487 211.2 114.487 L 198 114.487 L 198 55.207 Z"
                vectorEffect="non-scaling-stroke"
                className="svg-elem-1"
              ></path>
            </g>
          </svg>
        </main>
      </div>
    </>
  );
}
