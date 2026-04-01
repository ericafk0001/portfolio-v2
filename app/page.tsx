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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    };
    // shader configurations labeled with comments
    // lines 112, 115, 124, 125, 126, 128, 129, 130, 137, 138, 139, 144, 196
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);

          float a = hash(i + vec2(0.0, 0.0));
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;

          for (int i = 0; i < 4; i++) { //noise octaves
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }

          return value;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / uResolution.xy;
          vec2 p = uv - 0.5;
          p.x *= uResolution.x / uResolution.y;
          float t = uTime * 0.11; //general animation speed

          vec2 q = vec2(
            fbm(p * 1.6 + vec2(t * 0.9, -t * 0.9)), //flow direction, flow density, speed xy axis
            fbm(p * 1.4 + vec2(-t * 0.7, t * 0.9) + 4.0)
          );

          vec2 r = vec2(
            fbm(p * 3.0 + q * 1.8 + vec2(1.7, 9.2) + t * 0.9), //R LAYER
            fbm(p * 2.4 + q * 1.5 + vec2(8.3, 2.8) - t * 0.8)
          );

          float bands = sin((p.x * 1.6 + p.y * 1.9 + r.x * 2.2 + r.y * 1.3 + t * 2.6) * 3.14159265); //streak freq and angle
          float ridged = pow(abs(bands), 1.65);
          float detail = fbm(p * 4.4 + r * 1.2 + t * 0.22); //detail

          float field = mix(ridged, detail, 0.22);
          float body = smoothstep(0.34, 0.9, field);
          float highlight = smoothstep(0.9, 1.0, field) * 0.95; //brightness highlights
          float lum = clamp(body * 0.9 + highlight, 0.0, 1.0);

          float blackMix = smoothstep(0.03, 0.34, lum);
          float midMix = smoothstep(0.33, 0.78, lum);
          float highMix = smoothstep(0.74, 1.0, lum);

          vec3 dark = vec3(0.0, 0.0, 0.0);
          vec3 mid = vec3(0.55, 0.55, 0.55);
          vec3 bright = vec3(1.0, 1.0, 1.0);

          //vec3 dark = vec3(0.015, 0.0, 0.0);
          //vec3 mid = vec3(1.0, 0.44, 0.40);
          //vec3 bright = vec3(1.0, 0.975, 0.97);

          vec3 base = mix(dark, mid, midMix);
          vec3 color = mix(base, bright, highMix) * blackMix;

          float vignette = smoothstep(1.25, 0.45, length(p));
          color *= mix(0.82, 1.0, vignette);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height, false);

      const pixelRatio = renderer.getPixelRatio();
      uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
    };

    const timer = new THREE.Timer();
    timer.connect(document);

    const renderFrame = (timestamp?: number) => {
      timer.update(timestamp);
      uniforms.uTime.value = timer.getElapsed();
      renderer.render(scene, camera);
    };

    resize();

    if (reduceMotion) {
      renderFrame();
    } else {
      renderer.setAnimationLoop(renderFrame);
    }

    window.addEventListener("resize", resize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      timer.dispose();

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full blur-[3px] saturate-125 contrast-125"
      />

      <main className="relative z-10 flex min-h-screen items-end">
        <h1
          className={`${boldonse.className} m-0 px-3 pb-8 text-[clamp(4.25rem,20vw,17rem)] uppercase leading-[0.8] tracking-[0.04em] text-white mix-blend-screen md:px-5 md:pb-12`}
        >
          ERIC LIN
        </h1>
      </main>
    </div>
  );
}
