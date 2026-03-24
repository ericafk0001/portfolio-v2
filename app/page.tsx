"use client";

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
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <main className="relative flex min-h-screen items-end">
        <h1 className="m-0 px-3 pb-8 text-[clamp(4.25rem,18vw,14rem)] font-black uppercase leading-[0.8] tracking-[0.04em] text-white md:px-5 md:pb-12">
          ERIC LIN
        </h1>
      </main>
    </div>
  );
}
