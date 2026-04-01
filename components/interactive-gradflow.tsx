"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type RGB = {
  r: number;
  g: number;
  b: number;
};

export type GradientType =
  | "linear"
  | "conic"
  | "animated"
  | "wave"
  | "silk"
  | "smoke"
  | "stripe";

export type GradientConfigInput = {
  color1?: string | RGB;
  color2?: string | RGB;
  color3?: string | RGB;
  speed?: number;
  scale?: number;
  type?: GradientType;
  noise?: number;
};

export type InteractiveGradFlowProps = {
  config?: GradientConfigInput;
  className?: string;
};

const DEFAULT_CONFIG = {
  color1: { r: 226, g: 98, b: 75 },
  color2: { r: 255, g: 255, b: 255 },
  color3: { r: 30, g: 34, b: 159 },
  speed: 0.4,
  scale: 1,
  type: "stripe" as GradientType,
  noise: 0.08,
};

const GRADIENT_TYPE_NUMBER: Record<GradientType, number> = {
  linear: 0,
  conic: 1,
  animated: 2,
  wave: 3,
  silk: 4,
  smoke: 5,
  stripe: 6,
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_speed;
  uniform float u_scale;
  uniform int u_type;
  uniform float u_noise;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_pointerStrength;
  uniform float u_pointerVelocity;
  uniform vec2 u_trail0;
  uniform vec2 u_trail1;
  uniform vec2 u_trail2;
  uniform vec2 u_trail3;
  uniform float u_trailStrength0;
  uniform float u_trailStrength1;
  uniform float u_trailStrength2;
  uniform float u_trailStrength3;

  varying vec2 vUv;

  #define PI 3.14159265359

  float noise(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec2 warpSample(vec2 uv, vec2 pointer, float strength, float velocity, float time) {
    vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
    vec2 delta = uv - pointer;
    vec2 deltaNorm = delta * aspect;
    float dist = length(deltaNorm);
    float ringRadius = mix(0.11, 0.075, velocity);
    float ringWidth = mix(0.045, 0.028, velocity);
    float ring = exp(-pow((dist - ringRadius) / ringWidth, 2.0));
    float core = smoothstep(0.16, 0.02, dist);
    float ripple = sin((dist - ringRadius) * 58.0 - time * 10.0) * ring;
    float lens = (core * 0.11 + ring * 0.24 + ripple * 0.05) * strength;

    deltaNorm *= (1.0 + lens);
    delta = vec2(deltaNorm.x / aspect.x, deltaNorm.y);
    uv = pointer + delta;
    return uv;
  }

  vec2 interactiveWarp(vec2 uv, float time) {
    uv = warpSample(uv, u_pointer, u_pointerStrength, u_pointerVelocity, time);
    uv = warpSample(uv, u_trail0, u_trailStrength0, u_pointerVelocity * 0.85, time);
    uv = warpSample(uv, u_trail1, u_trailStrength1, u_pointerVelocity * 0.7, time);
    uv = warpSample(uv, u_trail2, u_trailStrength2, u_pointerVelocity * 0.55, time);
    uv = warpSample(uv, u_trail3, u_trailStrength3, u_pointerVelocity * 0.4, time);
    return uv;
  }

  vec3 linearGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    float t = (uv.y * u_scale) + sin(uv.x * PI + time) * 0.1;
    t = clamp(t, 0.0, 1.0);

    return t < 0.5
      ? mix(u_color1, u_color2, t * 2.0)
      : mix(u_color2, u_color3, (t - 0.5) * 2.0);
  }

  vec3 conicGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    vec2 center = vec2(0.5);
    vec2 pos = uv - center;

    float angle = atan(pos.y, pos.x);
    float normalizedAngle = (angle + PI) / (2.0 * PI);

    float t = fract(normalizedAngle * u_scale + time * 0.3);
    vec3 color;
    if (t < 0.33) {
      color = mix(u_color1, u_color2, smoothstep(0.0, 0.33, t));
    } else if (t < 0.66) {
      color = mix(u_color2, u_color3, smoothstep(0.33, 0.66, t));
    } else {
      color = mix(u_color3, u_color1, smoothstep(0.66, 1.0, t));
    }

    float dist = length(pos);
    color += sin(dist * 8.0 + time * 1.5) * 0.03;
    return color;
  }

  mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
    return fract(sin(p) * 43758.5453);
  }

  float advancedNoise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                  mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    return 0.5 + 0.5 * n;
  }

  vec3 animatedGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    float ratio = u_resolution.x / u_resolution.y;
    vec2 tuv = uv - 0.5;

    float degree = advancedNoise(vec2(time * 0.1 * u_speed, tuv.x * tuv.y));
    tuv.y *= 1.0 / ratio;
    tuv *= Rot(radians((degree - 0.5) * 720.0 * u_scale + 180.0));
    tuv.y *= ratio;

    float frequency = 5.0 * u_scale;
    float amplitude = 30.0;
    float speed = time * 2.0 * u_speed;
    tuv.x += sin(tuv.y * frequency + speed) / amplitude;
    tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * 0.5);

    vec3 layer1 = mix(u_color1, u_color2, smoothstep(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));
    vec3 layer2 = mix(u_color2, u_color3, smoothstep(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));

    return mix(layer1, layer2, smoothstep(0.05, -0.2, tuv.y));
  }

  vec3 waveGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    float y = uv.y;

    float wave1 = sin(uv.x * PI * u_scale * 0.8 + time * u_speed * 0.5) * 0.1;
    float wave2 = sin(uv.x * PI * u_scale * 0.5 + time * u_speed * 0.3) * 0.15;
    float wave3 = sin(uv.x * PI * u_scale * 1.2 + time * u_speed * 0.8) * 0.2;

    float flowingY = y + wave1 + wave2 + wave3;
    float pattern = smoothstep(0.0, 1.0, clamp(flowingY, 0.0, 1.0));

    vec3 color;
    if (pattern < 0.33) {
      color = mix(u_color1, u_color2, smoothstep(0.0, 0.33, pattern));
    } else if (pattern < 0.66) {
      color = mix(u_color2, u_color3, smoothstep(0.33, 0.66, pattern));
    } else {
      color = mix(u_color3, u_color1, smoothstep(0.66, 1.0, pattern));
    }

    color += sin(uv.x * PI * 2.0 + time * u_speed) *
                      cos(uv.y * PI * 1.5 + time * u_speed * 0.7) * 0.02;

    return clamp(color, 0.0, 1.0);
  }

  vec3 silkGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    vec2 fragCoord = uv * u_resolution;
    vec2 invResolution = 1.0 / u_resolution.xy;
    vec2 centeredUv = (fragCoord * 2.0 - u_resolution.xy) * invResolution;

    centeredUv *= u_scale;

    float dampening = 1.0 / (1.0 + u_scale * 0.1);

    float d = -time * u_speed * 0.5;
    float a = 0.0;

    for (float i = 0.0; i < 8.0; ++i) {
      a += cos(i - d - a * centeredUv.x) * dampening;
      d += sin(centeredUv.y * i + a) * dampening;
    }

    d += time * u_speed * 0.5;

    vec3 patterns = vec3(
      cos(centeredUv.x * d + a) * 0.5 + 0.5,
      cos(centeredUv.y * a + d) * 0.5 + 0.5,
      cos((centeredUv.x + centeredUv.y) * (d + a) * 0.5) * 0.5 + 0.5
    );

    vec3 color1Mix = mix(u_color1, u_color2, patterns.x);
    vec3 color2Mix = mix(u_color2, u_color3, patterns.y);
    vec3 color3Mix = mix(u_color3, u_color1, patterns.z);

    vec3 finalColor = mix(color1Mix, color2Mix, patterns.z);
    finalColor = mix(finalColor, color3Mix, patterns.x * 0.5);

    vec3 originalPattern = vec3(cos(centeredUv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    originalPattern = cos(originalPattern * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

    return mix(finalColor, originalPattern * finalColor, 0.3);
  }

  vec3 smokeGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    float mr = min(u_resolution.x, u_resolution.y);
    vec2 fragCoord = uv * u_resolution;
    vec2 p = (2.0 * fragCoord.xy - u_resolution.xy) / mr;

    p *= u_scale;

    float iTime = time * u_speed;

    for(int i = 1; i < 10; i++) {
      vec2 newp = p;
      float fi = float(i);
      newp.x += 0.6 / fi * sin(fi * p.y + iTime + 0.3 * fi) + 1.0;
      newp.y += 0.6 / fi * sin(fi * p.x + iTime + 0.3 * (fi + 10.0)) - 1.4;
      p = newp;
    }

    float greenPattern = 1.0 - sin(p.y);
    float bluePattern = sin(p.x + p.y);

    greenPattern = clamp(greenPattern, 0.0, 1.0);
    bluePattern = bluePattern * 0.5 + 0.5;

    vec3 color12 = mix(u_color1, u_color2, greenPattern);
    vec3 color = mix(color12, u_color3, bluePattern);

    return clamp(color, 0.0, 1.0);
  }

  vec3 stripeGradient(vec2 uv, float time) {
    uv = interactiveWarp(uv, time);
    vec2 p = ((uv * u_resolution * 2.0 - u_resolution.xy) / (u_resolution.x + u_resolution.y) * 2.0) * u_scale;
    float t = time * 0.7;
    float a = 4.0 * p.y - sin(-p.x * 3.0 + p.y - t);
    a = smoothstep(cos(a) * 0.7, sin(a) * 0.7 + 1.0, cos(a - 4.0 * p.y) - sin(a + 3.0 * p.x));

    vec2 warped = (cos(a) * p + sin(a) * vec2(-p.y, p.x)) * 0.5 + 0.5;
    vec3 color = mix(u_color1, u_color2, warped.x);

    color = mix(color, u_color3, warped.y);
    color *= color + 0.6 * sqrt(color);

    return clamp(color, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    float time = u_time * u_speed;

    vec3 color;

    if (u_type == 0) {
      color = linearGradient(uv, time);
    } else if (u_type == 1) {
      color = conicGradient(uv, time);
    } else if (u_type == 2) {
      color = animatedGradient(uv, time);
    } else if (u_type == 3) {
      color = waveGradient(uv, time);
    } else if (u_type == 4) {
      color = silkGradient(uv, time);
    } else if (u_type == 5) {
      color = smokeGradient(uv, time);
    } else if (u_type == 6) {
      color = stripeGradient(uv, time);
    } else {
      color = animatedGradient(uv, time);
    }

    if (u_noise > 0.001) {
      float grain = noise(uv * 200.0 + time * 0.1);
      color *= (1.0 - u_noise * 0.4 + u_noise * grain * 0.4);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

function normalizeColor(color: string | RGB): RGB {
  if (typeof color !== "string") {
    return color;
  }

  const hex = color.replace("#", "");
  const parsed = Number.parseInt(hex, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function toVec3(color: RGB): [number, number, number] {
  return [color.r / 255, color.g / 255, color.b / 255];
}

export function InteractiveGradFlow({
  config,
  className = "",
}: InteractiveGradFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const normalizedConfig = useMemo(() => {
    const merged = { ...DEFAULT_CONFIG };

    if (config) {
      if (config.color1) merged.color1 = normalizeColor(config.color1);
      if (config.color2) merged.color2 = normalizeColor(config.color2);
      if (config.color3) merged.color3 = normalizeColor(config.color3);
      if (config.speed !== undefined) merged.speed = config.speed;
      if (config.scale !== undefined) merged.scale = config.scale;
      if (config.type) merged.type = config.type;
      if (config.noise !== undefined) merged.noise = config.noise;
    }

    return {
      color1: toVec3(merged.color1),
      color2: toVec3(merged.color2),
      color3: toVec3(merged.color3),
      speed: merged.speed,
      scale: merged.scale,
      type: GRADIENT_TYPE_NUMBER[merged.type],
      noise: merged.noise,
    };
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      u_time: { value: 0 },
      u_color1: { value: normalizedConfig.color1 },
      u_color2: { value: normalizedConfig.color2 },
      u_color3: { value: normalizedConfig.color3 },
      u_speed: { value: normalizedConfig.speed },
      u_scale: { value: normalizedConfig.scale },
      u_type: { value: normalizedConfig.type },
      u_noise: { value: normalizedConfig.noise },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
      u_pointerStrength: { value: 0.0 },
      u_pointerVelocity: { value: 0.0 },
      u_trail0: { value: new THREE.Vector2(0.5, 0.5) },
      u_trail1: { value: new THREE.Vector2(0.5, 0.5) },
      u_trail2: { value: new THREE.Vector2(0.5, 0.5) },
      u_trail3: { value: new THREE.Vector2(0.5, 0.5) },
      u_trailStrength0: { value: 0.0 },
      u_trailStrength1: { value: 0.0 },
      u_trailStrength2: { value: 0.0 },
      u_trailStrength3: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId = 0;
    let disposed = false;
    let isHovering = false;
    let targetPointer = new THREE.Vector2(0.5, 0.5);
    let currentPointer = new THREE.Vector2(0.5, 0.5);
    let trailPointers = [
      new THREE.Vector2(0.5, 0.5),
      new THREE.Vector2(0.5, 0.5),
      new THREE.Vector2(0.5, 0.5),
      new THREE.Vector2(0.5, 0.5),
    ];
    let pointerStrength = 0;
    let targetStrength = 0;
    let pointerVelocity = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let lastMoveTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;

      if (!parent) {
        return;
      }

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      renderer.setSize(width, height, false);
      uniforms.u_resolution.value.set(width, height);
    };

    const applyPointer = (clientX: number, clientY: number, force = 0.0) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      const now = performance.now();
      const elapsed = Math.max(12, now - lastMoveTime);
      const velocity =
        Math.hypot(clientX - lastClientX, clientY - lastClientY) / elapsed;

      targetPointer.set(x, y);
      pointerVelocity = Math.min(1, velocity * 0.02);
      targetStrength = Math.min(4.8, force + 1.8 + pointerVelocity * 2.8);
      lastClientX = clientX;
      lastClientY = clientY;
      lastMoveTime = now;
    };

    const handlePointerEnter = (event: PointerEvent) => {
      isHovering = true;
      applyPointer(event.clientX, event.clientY, 1.6);
      targetStrength = Math.max(targetStrength, 1.8);
    };

    const handlePointerMove = (event: PointerEvent) => {
      isHovering = true;
      applyPointer(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      isHovering = false;
      pointerStrength = 0;
      targetStrength = 0;
    };

    const handlePointerCancel = () => {
      isHovering = false;
      pointerStrength = 0;
      targetStrength = 0;
    };

    resize();
    const parent = canvas.parentElement;
    parent?.addEventListener("pointerenter", handlePointerEnter);
    parent?.addEventListener("pointermove", handlePointerMove);
    parent?.addEventListener("pointerleave", handlePointerLeave);
    parent?.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      if (disposed) {
        return;
      }

      const elapsed = (currentTime - startTime) / 1000;

      currentPointer.lerp(targetPointer, 0.14);
      if (isHovering) {
        pointerStrength += (targetStrength - pointerStrength) * 0.2;
      } else {
        pointerStrength *= 0.92;
      }
      pointerVelocity *= 0.92;

      trailPointers[0].lerp(currentPointer, 0.12);
      trailPointers[1].lerp(trailPointers[0], 0.08);
      trailPointers[2].lerp(trailPointers[1], 0.06);
      trailPointers[3].lerp(trailPointers[2], 0.045);

      uniforms.u_time.value = elapsed;
      uniforms.u_pointer.value.copy(currentPointer);
      uniforms.u_pointerStrength.value = pointerStrength;
      uniforms.u_pointerVelocity.value = pointerVelocity;
      uniforms.u_trail0.value.copy(trailPointers[0]);
      uniforms.u_trail1.value.copy(trailPointers[1]);
      uniforms.u_trail2.value.copy(trailPointers[2]);
      uniforms.u_trail3.value.copy(trailPointers[3]);
      uniforms.u_trailStrength0.value = pointerStrength * 1.15;
      uniforms.u_trailStrength1.value = pointerStrength * 0.92;
      uniforms.u_trailStrength2.value = pointerStrength * 0.7;
      uniforms.u_trailStrength3.value = pointerStrength * 0.5;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("pointerenter", handlePointerEnter);
      parent?.removeEventListener("pointermove", handlePointerMove);
      parent?.removeEventListener("pointerleave", handlePointerLeave);
      parent?.removeEventListener("pointercancel", handlePointerCancel);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [normalizedConfig]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
