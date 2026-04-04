"use client";

interface LoaderProps {
  currentStep: string;
  progress: number;
}

export function Loader({ currentStep, progress }: LoaderProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex w-70 flex-col items-center gap-6">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-white"
              style={{
                animation: "loader-pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="h-6 text-center">
          <p className="text-sm text-white/70 transition-all duration-300">
            {currentStep}
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded bg-white/15">
          <div
            className="h-full rounded bg-white transition-[width] duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
      <style>{`
        @keyframes loader-pulse {
          0%, 80%, 100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
