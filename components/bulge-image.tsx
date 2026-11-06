"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import {
  MathUtils,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from "three";
import type { Texture } from "three";

type BulgeImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  loading?: "eager" | "lazy";
  className?: string;
};

/**
 * Extra room around the card that the WebGL canvas can draw into, so the
 * bulged edges can spill out over the page instead of being cut off flush.
 */
const BLEED = 80;

const VERTEX_SHADER = /* glsl */ `
  uniform vec2 uHoveredUv;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uDepth;
  uniform float uPush;
  uniform float uStrength;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Work in aspect-corrected, centered plane coordinates so the bulge is
    // circular regardless of the image container's shape.
    vec2 point = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
    vec2 center = vec2(
      (uHoveredUv.x - 0.5) * uAspect,
      uHoveredUv.y - 0.5
    );

    vec2 delta = point - center;
    float dist = length(delta);
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);

    vec3 newPosition = position;

    // Expand the surface outward from the cursor. Scaling by distance keeps
    // the displacement zero at the center, so the sheet stretches into a dome
    // instead of folding in on itself.
    vec2 push = delta * falloff * uPush * uStrength;
    newPosition.x += push.x / uAspect;
    newPosition.y += push.y;

    // Raise the lifted area toward the camera for the dome-like magnification.
    newPosition.z += falloff * uDepth * uStrength;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uCoverScale;
  uniform vec2 uCoverOffset;

  varying vec2 vUv;

  void main() {
    vec2 imageUv = clamp(vUv * uCoverScale + uCoverOffset, 0.0, 1.0);
    gl_FragColor = texture2D(uTexture, imageUv);

    #include <colorspace_fragment>
  }
`;

/**
 * Renders an image on a WebGL plane that bulges toward the cursor.
 *
 * The original image is kept underneath as the loading state, accessibility
 * layer, and no-WebGL fallback. The canvas fades in once the texture is ready.
 * Reduced-motion users get the flat image with no cursor deformation.
 */
export function BulgeImage({
  src,
  alt,
  sizes,
  loading,
  className,
}: BulgeImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      // Keep the plain <Image> fallback with no WebGL overhead.
      return;
    }

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // Keep the plain <Image> fallback.
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 700ms ease";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.z = 5;

    const uniforms = {
      uTexture: { value: null as Texture | null },
      uHoveredUv: { value: new Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
      uCoverScale: { value: new Vector2(1, 1) },
      uCoverOffset: { value: new Vector2(0, 0) },
      uRadius: { value: 0.34 },
      uDepth: { value: 0.55 },
      uPush: { value: 0.3 },
      uStrength: { value: 0 },
    };

    const geometry = new PlaneGeometry(1, 1, 100, 100);
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const pointerTarget = new Vector2(0.5, 0.5);
    let planeAspect = 1;
    let hovering = false;
    let texture: Texture | null = null;
    let textureReady = false;
    let disposed = false;
    let frameId = 0;

    const render = () => renderer.render(scene, camera);

    const applyCover = () => {
      if (!texture?.image) {
        return;
      }

      const image = texture.image as { width?: number; height?: number };
      const imageAspect = (image.width ?? 1) / (image.height ?? 1);

      if (imageAspect > planeAspect) {
        const scale = planeAspect / imageAspect;
        uniforms.uCoverScale.value.set(scale, 1);
        uniforms.uCoverOffset.value.set((1 - scale) / 2, 0);
      } else {
        const scale = imageAspect / planeAspect;
        uniforms.uCoverScale.value.set(1, scale);
        uniforms.uCoverOffset.value.set(0, (1 - scale) / 2);
      }
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) {
        return;
      }

      planeAspect = width / height;

      const canvasWidth = width + BLEED * 2;
      const canvasHeight = height + BLEED * 2;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvasWidth, canvasHeight, false);
      renderer.domElement.style.left = `${-BLEED}px`;
      renderer.domElement.style.top = `${-BLEED}px`;
      renderer.domElement.style.width = `${canvasWidth}px`;
      renderer.domElement.style.height = `${canvasHeight}px`;

      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();

      const visibleHeight =
        2 *
        Math.tan(MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z;
      const unitsPerPixel = visibleHeight / canvasHeight;

      // The plane itself matches the card exactly; the surrounding bleed is
      // empty canvas reserved for the deformed edges to spill into.
      mesh.scale.set(width * unitsPerPixel, height * unitsPerPixel, 1);
      uniforms.uAspect.value = planeAspect;
      applyCover();

      if (!frameId) {
        render();
      }
    };

    const tick = () => {
      uniforms.uHoveredUv.value.lerp(pointerTarget, 0.1);
      uniforms.uStrength.value = MathUtils.lerp(
        uniforms.uStrength.value,
        hovering ? 1 : 0,
        0.08,
      );

      render();

      // Once the bulge has fully collapsed, stop burning frames until the
      // pointer comes back or the layout changes.
      if (!hovering && uniforms.uStrength.value < 0.001) {
        uniforms.uStrength.value = 0;
        frameId = 0;
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!textureReady || frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frameId) {
        return;
      }

      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const loader = new TextureLoader();
    loader.load(
      src,
      (loaded) => {
        if (disposed) {
          loaded.dispose();
          return;
        }

        loaded.colorSpace = SRGBColorSpace;
        loaded.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy(),
        );

        texture = loaded;
        textureReady = true;
        uniforms.uTexture.value = loaded;

        applyCover();
        renderer.domElement.style.opacity = "1";
        start();
      },
      undefined,
      () => {
        // Keep the plain <Image> fallback.
      },
    );

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      const rect = container.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;

      pointerTarget.set(
        MathUtils.clamp(x, 0, 1),
        MathUtils.clamp(y, 0, 1),
      );
      hovering = true;
      start();
    };

    const handlePointerLeave = () => {
      hovering = false;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      renderer.domElement.style.opacity = "0";
    };

    renderer.domElement.addEventListener(
      "webglcontextlost",
      handleContextLost,
    );

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { rootMargin: "100px" },
    );
    intersectionObserver.observe(container);

    resize();

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost,
      );

      texture?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full bg-black ${
        className ?? ""
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={loading}
        draggable={false}
        className="object-cover"
      />
    </div>
  );
}
