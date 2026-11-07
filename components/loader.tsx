"use client";

interface LoaderProps {
  currentStep: string;
}

// Four sprite layers, mirroring the original CodePen loader: two body layers,
// a tail and a head. Each layer shows one quadrant of the cat sprite and spins
// into place with its own delay.
const catParts = [
  { className: "cat-loader__body", delay: "0.1s" },
  { className: "cat-loader__body", delay: "0.2s" },
  { className: "cat-loader__tail", delay: "0.2s" },
  { className: "cat-loader__head", delay: "0s" },
];

export function Loader({ currentStep }: LoaderProps) {
  return (
    <div className="cat-loader-shell fixed inset-0 z-[200] flex items-center justify-center">
      <div className="cat-loader" aria-hidden="true">
        {catParts.map((part, index) => (
          <div
            key={`${part.className}-${index}`}
            className={`cat-loader__part ${part.className}`}
            style={{ animationDelay: part.delay }}
          />
        ))}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="absolute bottom-6 left-6 text-xs uppercase tracking-[0.18em] text-white/60 sm:bottom-8 sm:left-8 sm:text-sm"
      >
        {currentStep}
      </p>
    </div>
  );
}
