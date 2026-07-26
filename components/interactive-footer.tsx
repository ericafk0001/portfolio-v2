"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Cal_Sans, Space_Grotesk } from "next/font/google";
import type { IconType } from "react-icons";
import { FaSquareXTwitter, FaGithub, FaDiscord } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { IoLogoInstagram, IoCopyOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

const CalSans = Cal_Sans({
  weight: "400",
  subsets: ["latin"],
});

const SpaceGrotesk = Space_Grotesk({
  weight: "700",
  subsets: ["latin"],
});

const contactEmail = "contactericlin@gmail.com";
const starField = Array.from({ length: 90 }, (_, index) => {
  const left = (index * 13.7) % 100;
  const top = (index * 19.1) % 100;
  const size = 1 + (index % 4) * 0.8;
  const delay = (index % 8) * 0.35;
  const duration = 2.2 + (index % 5) * 0.8;

  return { left, top, size, delay, duration };
});
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const isHoveredRef = useRef(false);
  const defaultTextRef = useRef<HTMLSpanElement>(null);
  const copiedTextRef = useRef<HTMLSpanElement>(null);
  const isCopiedRef = useRef(false);

  useEffect(() => {
    const btn = btnRef.current;
    const line = lineRef.current;
    if (!btn || !line) return;

    gsap.set(line, { clipPath: "inset(0 100% 0 0)" });

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      gsap.to(line, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.35,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      gsap.to(line, {
        clipPath: "inset(0 0 0 100%)",
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(line, { clipPath: "inset(0 100% 0 0)" });
        },
      });
    };

    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      btn.removeEventListener("mouseenter", handleMouseEnter);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

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
        ref={btnRef}
        type="button"
        onClick={handleCopy}
        className="inline-flex w-fit items-center gap-2 rounded-full py-2 text-4xl text-white cursor-pointer transition-opacity duration-200 hover:opacity-75 relative"
      >
        <span
          className="relative overflow-hidden"
          style={{ display: "inline-block" }}
        >
          <span
            ref={lineRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "4px",
              background: "white",
              clipPath: "inset(0 100% 0 0)",
              zIndex: 1,
            }}
          />

          <span
            ref={defaultTextRef}
            style={{ display: "block", willChange: "transform" }}
          >
            Click to Copy
          </span>

          <span
            ref={copiedTextRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              display: "block",
              willChange: "transform",
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

  return (
    <div
      ref={footerRef}
      className="relative grid w-full min-h-screen grid-rows-[minmax(6rem,1fr)_auto] overflow-hidden bg-[#010208] text-zinc-300"
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
      </div>

      <div className="relative z-10 grid gap-32 px-6 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4">
          <p
            className={`text-2xl uppercase text-white ${SpaceGrotesk.className}`}
          >
            Socials
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {socialLinks.map((link) => (
              <MagneticWrapper key={link.label}>
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group inline-flex h-16 w-16 items-center justify-center rounded-full transition duration-200 hover:border-white/20 hover:bg-white/10"
                >
                  <link.icon
                    aria-hidden="true"
                    focusable="false"
                    className="h-10 w-10 transition text-white duration-200 group-hover:opacity-100"
                  />
                </a>
              </MagneticWrapper>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p
            className={`text-2xl uppercase text-white ${SpaceGrotesk.className}`}
          >
            Email Me
          </p>
          <CopyEmailButton email={contactEmail} />
        </div>

        <div className="space-y-4">
          <p
            className={`text-2xl uppercase text-white ${SpaceGrotesk.className}`}
          >
            Local Time
          </p>
          <p className="text-4xl text-white">
            {localDateText},&nbsp;
            {localTimeText}
          </p>
        </div>

        <div className="space-y-4">
          <p
            className={`text-2xl uppercase text-white ${SpaceGrotesk.className}`}
          >
            Version
          </p>
          <p className="text-4xl text-white">.v 2.0</p>
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center justify-center overflow-visible pb-[clamp(0.75rem,2vh,2rem)]">
        <h1
          className="w-full max-w-none text-center whitespace-nowrap text-[clamp(7rem,22vw,40rem)] font-bold leading-[0.78] tracking-[-0.02em] text-white select-none -ml-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
          style={{
            transform: "scaleY(1.6)",
            transformOrigin: "center bottom",
          }}
        >
          {Array.from("CONTACT").map((letter, index) => (
            <span
              onClick={() => router.push("/contact")}
              key={index}
              data-contact-letter
              className={`inline-block cursor-pointer ${CalSans.className}`}
              style={{
                display: "inline-block",
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>

      <style jsx global>{`
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
      `}</style>
    </div>
  );
}
