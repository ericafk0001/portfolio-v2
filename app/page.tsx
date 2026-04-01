"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Boldonse } from "next/font/google";

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

import { GradFlow } from "gradflow";

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

const boldonse = Boldonse({
  weight: "400",
  subsets: ["latin"],
  adjustFontFallback: false,
});

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <GradFlow
        className="absolute z-0"
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
      <main className="relative z-10 flex min-h-screen items-end">
        <h1
          className={`${boldonse.className} z-67 m-0 px-3 pb-8 text-[clamp(4.25rem,20vw,17rem)] uppercase leading-[0.8] tracking-[0.04em] text-white mix-blend-screen md:px-5 md:pb-12`}
        >
          ERIC LIN
        </h1>
      </main>
    </div>
  );
}
