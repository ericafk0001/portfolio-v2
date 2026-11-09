"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import type { IconType } from "react-icons";
import { FaSquareXTwitter, FaGithub, FaDiscord } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import {
  IoLogoInstagram,
  IoCopyOutline,
  IoArrowUpOutline,
} from "react-icons/io5";

import { useRouter } from "next/navigation";

const contactEmail = "contactericlin@gmail.com";

const V1_URL = "https://ericafk0001.github.io/Portfolio/";

const previousVersions = [
  {
    version: ".v 1.0",
    href: V1_URL,
  },
] as const;
const starField = Array.from({ length: 90 }, (_, index) => {
  const left = (index * 13.7) % 100;
  const top = (index * 19.1) % 100;
  const size = 1 + (index % 4) * 0.8;
  const delay = (index % 8) * 0.35;
  const duration = 2.2 + (index % 5) * 0.8;

  return { left, top, size, delay, duration };
});
const shootingStarField = [
  { left: "7%", top: "18%", angle: -32, delay: "1.5s", duration: "7.5s" },
  { left: "42%", top: "8%", angle: -38, delay: "4.8s", duration: "9s" },
  { left: "76%", top: "28%", angle: -28, delay: "8.2s", duration: "8s" },
  { left: "23%", top: "54%", angle: -42, delay: "12s", duration: "10s" },
  { left: "88%", top: "66%", angle: -35, delay: "15.5s", duration: "8.5s" },
] as const;
const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/ericafk0001",
    icon: FaGithub,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/eric_l.8",
    icon: IoLogoInstagram,
  },
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/in/eric-lin-b13baa393",
    icon: FaLinkedin,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/eric_lin55757",
    icon: FaSquareXTwitter,
  },
  {
    label: "Discord",
    href: "https://discord.com/users/1187851772828590174",
    icon: FaDiscord,
  },
] satisfies Array<{ label: string; href: string; icon: IconType }>;

function MagneticWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const inner = el.firstElementChild as HTMLElement | null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      gsap.to(el, {
        x: dx * 0.35,
        y: dy * 0.35,
        duration: 0.4,
        ease: "power2.out",
      });

      if (inner) {
        gsap.to(inner, {
          x: dx * 0.2,
          y: dy * 0.2,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      if (inner) {
        gsap.to(inner, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)",
        });
      }
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ display: "inline-flex" }}
    >
      {children}
    </div>
  );
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const defaultTextRef = useRef<HTMLSpanElement>(null);
  const copiedTextRef = useRef<HTMLSpanElement>(null);
  const isCopiedRef = useRef(false);

  useEffect(() => {
    if (copiedTextRef.current) {
      gsap.set(copiedTextRef.current, { y: "100%" });
    }
  }, []);

  const handleCopy = async () => {
    if (isCopiedRef.current) return;

    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
    }

    isCopiedRef.current = true;

    gsap.to(defaultTextRef.current, {
      y: "-100%",
      duration: 0.4,
      ease: "power3.out",
    });
    gsap.to(copiedTextRef.current, {
      y: "0%",
      duration: 0.4,
      ease: "power3.out",
    });

    setTimeout(() => {
      gsap.to(defaultTextRef.current, {
        y: "0%",
        duration: 0.4,
        ease: "power3.inOut",
      });
      gsap.to(copiedTextRef.current, {
        y: "100%",
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          isCopiedRef.current = false;
        },
      });
    }, 2000);
  };

  return (
    <MagneticWrapper>
      <button
        type="button"
        onClick={handleCopy}
        className="group relative inline-flex w-fit cursor-pointer items-center gap-2 rounded-full py-2 text-2xl text-white transition-opacity duration-200 hover:opacity-75 sm:text-4xl"
      >
        <span
          className="relative overflow-hidden"
          style={{ display: "inline-grid" }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 z-[1] h-1 w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />

          <span
            ref={defaultTextRef}
            style={{
              display: "block",
              willChange: "transform",
              gridArea: "1/1",
              whiteSpace: "nowrap",
            }}
          >
            Click to Copy
          </span>

          <span
            ref={copiedTextRef}
            aria-hidden="true"
            style={{
              display: "block",
              willChange: "transform",
              gridArea: "1/1",
              whiteSpace: "nowrap",
            }}
          >
            Copied!
          </span>
        </span>
        <IoCopyOutline aria-hidden="true" />
      </button>
    </MagneticWrapper>
  );
}

function ResumeLink() {
  return (
    <MagneticWrapper>
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noreferrer"
        className="group inline-flex w-fit items-center gap-2 rounded-full py-2 text-2xl text-white transition-opacity duration-200 hover:opacity-75 sm:text-4xl"
      >
        <span className="relative inline-grid">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 z-[1] h-1 w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
          Résumé
        </span>
        <IoArrowUpOutline
          aria-hidden="true"
          className="h-6 w-6 rotate-45 transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-9 sm:w-9"
        />
      </a>
    </MagneticWrapper>
  );
}

const emptySubscribe = () => () => {};

function VersionHistoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const smoother = ScrollSmoother.get();
    smoother?.paused(true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      smoother?.paused(false);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !overlayRef.current || !panelRef.current) return;

    const timeline = gsap.timeline();
    timeline
      .fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
      )
      .fromTo(
        panelRef.current,
        { opacity: 0, y: 0, scale: 0.5 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power3.out" },
        "<",
      );

    return () => {
      timeline.kill();
    };
  }, [open]);

  if (!mounted || !open) return null;

  const handleSelectVersion = (href: string) => {
    onClose();
    window.location.assign(href);
  };

  return createPortal(
    <div
      ref={overlayRef}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#000000] p-8 text-white shadow-[0_0_60px_rgba(255,255,255,0.15)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close version history"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>

        <p
          id="version-history-title"
          className={`text-2xl uppercase font-(family-name:--font-geist-sans)`}
        >
          Version History
        </p>

        <ul className="mt-6 space-y-2">
          {previousVersions.map((entry) => (
            <li key={entry.version}>
              <button
                type="button"
                onClick={() => handleSelectVersion(entry.href)}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition duration-200 hover:border-white/25 hover:bg-white/10"
              >
                <span>
                  <span className="block text-2xl">{entry.version}</span>
                </span>
                <IoArrowUpOutline
                  aria-hidden="true"
                  className="h-6 w-6 rotate-45 text-white/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

export function InteractiveFooter() {
  const footerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const activeTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [localTime, setLocalTime] = useState(() => new Date());

  useEffect(() => {
    if (!footerRef.current) return;

    const activeTimeouts = activeTimeoutsRef.current;
    const letters = Array.from(
      footerRef.current.querySelectorAll<HTMLSpanElement>(
        "[data-contact-letter]",
      ),
    );

    lettersRef.current = letters;

    gsap.set(letters, {
      scaleY: 1,
      transformOrigin: "50% 95%",
      willChange: "transform",
    });

    // Hover effects only make sense on devices with a real pointer. On touch
    // screens a tap fires mouseenter without a matching mouseleave, which
    // leaves letters stuck in the squashed state.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return () => {
        activeTimeouts.forEach((timeout) => clearTimeout(timeout));
        activeTimeouts.clear();
      };
    }

    letters.forEach((letter, index) => {
      const handleMouseEnter = () => {
        const existingTimeout = activeTimeouts.get(index);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          activeTimeouts.delete(index);
        }

        gsap.to(letter, {
          scaleY: 0.75,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        const existingTimeout = activeTimeouts.get(index);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
          gsap.to(letter, {
            scaleY: 1,
            duration: 0.4,
            ease: "power2.out",
          });
          activeTimeouts.delete(index);
        }, 67);

        activeTimeouts.set(index, timeout);
      };

      letter.addEventListener("mouseenter", handleMouseEnter);
      letter.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        letter.removeEventListener("mouseenter", handleMouseEnter);
        letter.removeEventListener("mouseleave", handleMouseLeave);
      };
    });

    return () => {
      activeTimeouts.forEach((timeout) => clearTimeout(timeout));
      activeTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    const updateLocalTime = () => {
      setLocalTime(new Date());
    };

    updateLocalTime();

    const intervalId = window.setInterval(updateLocalTime, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const [copied, setCopied] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  const closeVersionModal = useCallback(() => {
    setVersionModalOpen(false);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  const localTimeText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(localTime);

  const localDateText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(localTime);

  const router = useRouter();

  const handleBackToTop = () => {
    const smoother = ScrollSmoother.get();

    if (smoother) {
      smoother.scrollTo(0, true);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      ref={footerRef}
      className="relative grid min-h-svh w-full grid-rows-[minmax(6rem,1fr)_auto] overflow-hidden bg-[#010208] text-zinc-300"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />
        {starField.map((star, index) => (
          <span
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: `0 0 ${star.size * 2.5}px rgba(255, 255, 255, 0.7)`,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
        {shootingStarField.map((star, index) => (
          <span
            key={`shooting-star-${index}`}
            aria-hidden="true"
            className="shooting-star"
            style={{
              left: star.left,
              top: star.top,
              rotate: `${-star.angle}deg`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grid gap-8 px-5 py-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 sm:px-6 sm:py-10 lg:px-10 xl:grid-cols-4 xl:gap-x-16">
        <div className="space-y-4">
          <p
            className={`text-lg uppercase text-white sm:text-2xl font-(family-name:--font-geist-sans) font-semibold`}
          >
            Socials
          </p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {socialLinks.map((link) => (
              <MagneticWrapper key={link.label}>
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group inline-flex h-14 w-14 items-center justify-center rounded-full transition duration-200 hover:border-white/20 hover:bg-white/10 sm:h-16 sm:w-16"
                >
                  <link.icon
                    aria-hidden="true"
                    focusable="false"
                    className="h-9 w-9 text-white transition duration-200 group-hover:opacity-100 sm:h-10 sm:w-10"
                  />
                </a>
              </MagneticWrapper>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p
            className={`text-lg uppercase text-white sm:text-2xl font-(family-name:--font-geist-sans) font-semibold`}
          >
            Email Me
          </p>
          <div className="flex flex-col items-start gap-1">
            <CopyEmailButton email={contactEmail} />
            <ResumeLink />
          </div>
        </div>

        <div className="space-y-4">
          <p
            className={`text-lg uppercase text-white sm:text-2xl font-(family-name:--font-geist-sans) font-semibold`}
          >
            Local Time
          </p>
          <p className="text-2xl text-white sm:text-4xl">
            {localDateText},&nbsp;
            {localTimeText}
          </p>
        </div>

        <div className="space-y-4">
          <p
            className={`text-lg uppercase text-white sm:text-2xl font-(family-name:--font-geist-sans) font-semibold`}
          >
            Version
          </p>
          <button
            type="button"
            onClick={() => setVersionModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={versionModalOpen}
            className="inline-flex w-fit cursor-pointer items-center gap-2 text-2xl text-white transition-opacity duration-200 hover:opacity-75 sm:text-4xl"
          >
            .v 2.0b
          </button>
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center justify-center overflow-visible pb-14 lg:pb-[clamp(0.75rem,2vh,2rem)]">
        <h1 className="contact-heading w-full max-w-none text-center text-[clamp(4.5rem,20.5vw,40rem)] leading-[0.78] font-bold tracking-[-0.02em] whitespace-nowrap text-white select-none drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] sm:-ml-8">
          {Array.from("CONTACT").map((letter, index) => (
            <span
              onClick={() => router.push("/contact")}
              key={index}
              data-contact-letter
              className={`inline-block cursor-pointer font-(family-name:--font-geist-sans)`}
              style={{
                display: "inline-block",
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-1 z-20 h-24 w-56 sm:right-4">
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Back to top"
          className="group pointer-events-auto absolute bottom-3 right-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/70 transition-colors duration-200 hover:text-white sm:bottom-5 sm:right-4"
        >
          <span>Back to top</span>
          <IoArrowUpOutline
            aria-hidden="true"
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1"
          />
        </button>
      </div>

      <VersionHistoryModal
        open={versionModalOpen}
        onClose={closeVersionModal}
      />

      <style jsx global>{`
        .contact-heading {
          transform: scaleY(1.3);
          transform-origin: center bottom;
        }

        @media (min-width: 640px) {
          .contact-heading {
            transform: scaleY(1.6);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .shooting-star {
          position: absolute;
          width: 0.35rem;
          height: 0.35rem;
          border-radius: 9999px;
          background: #fff;
          box-shadow:
            0 0 0.45rem 0.1rem rgba(255, 255, 255, 0.95),
            0 0 1.25rem 0.25rem rgba(179, 214, 255, 0.55);
          animation: shooting-star 9s linear infinite both;
          opacity: 0;
        }

        .shooting-star::before,
        .shooting-star::after {
          position: absolute;
          right: 0.1rem;
          bottom: 50%;
          display: block;
          height: 1px;
          content: "";
          transform-origin: right center;
          transform: translateY(50%);
          pointer-events: none;
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent,
            #000 18%,
            #000 68%,
            transparent
          );
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 18%,
            #000 68%,
            transparent
          );
        }

        .shooting-star::before {
          width: clamp(5rem, 13vw, 12rem);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(182, 214, 255, 0.18) 45%,
            rgba(255, 255, 255, 0.85)
          );
          filter: blur(1px);
        }

        .shooting-star::after {
          width: clamp(2.5rem, 7vw, 6rem);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.95)
          );
          filter: blur(0.5px);
        }

        @keyframes shooting-star {
          0% {
            opacity: 0;
            transform: translateX(2rem) scale(0.55);
          }
          7% {
            opacity: 1;
          }
          18% {
            opacity: 0.95;
            transform: translateX(5rem) scale(1);
          }
          58% {
            opacity: 0.8;
          }
          78% {
            opacity: 0.45;
          }
          92% {
            opacity: 0.16;
          }
          100% {
            opacity: 0.1;
            transform: translateX(34rem) scale(0.35);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shooting-star {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
