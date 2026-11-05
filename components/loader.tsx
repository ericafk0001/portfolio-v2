"use client";

interface LoaderProps {
  currentStep: string;
  progress: number;
}

export function Loader({ currentStep, progress }: LoaderProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <div className="w-80 max-w-[70vw]">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
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
