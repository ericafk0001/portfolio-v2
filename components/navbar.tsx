"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import { ContactButton } from "@/components/contact-button";
import { TextMask } from "@/components/text-mask";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
];

type NavbarProps = {
  /** The light variant is used on cream pages such as blog posts. */
  variant?: "dark" | "light";
};

export function Navbar({ variant = "dark" }: NavbarProps) {
  const pathname = usePathname();
  const light = variant === "light";
  const headerRef = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Match the home-page navbar: drop in from above the viewport, then ease
    // into place with the same delay as the main navigation bar.
    gsap.set(header, { y: -500 });
    gsap.to(header, {
      y: 0,
      duration: 1,
      ease: "power4.out",
      delay: 0.55,
      clearProps: "transform",
    });
  });

  return (
    <header
      ref={headerRef}
      className={
        light
          ? "relative z-30 bg-transparent font-(family-name:--font-montserrat) text-[#1f1f1f]"
          : "relative z-30 bg-black/40 backdrop-blur-sm"
      }
    >
      <div className={`flex w-full items-center px-3 ${"h-16 md:px-5"}`}>
        <Link
          href="/"
          className={`group inline-flex shrink-0 items-center px-5 font-(family-name:--font-stalinist-one) text-lg font-semibold uppercase tracking-[0.24em] transition-colors ${
            light
              ? "text-[#1f1f1f] hover:text-black"
              : "text-zinc-100 hover:text-white "
          }`}
        >
          <TextMask text="ERIC LIN" />
        </Link>

        <div className="ml-auto flex items-center gap-5">
          <nav
            aria-label="Primary"
            className={`hidden items-center gap-0 font-semibold tracking-[0.16em] lg:flex ${
              light
                ? "font-(family-name:--font-montserrat) text-[#5f615c]"
                : "font-(family-name:--font-montserrat) text-s text-zinc-300"
            }`}
          >
            {navLinks.map((link, index) => {
              const isActive =
                link.href !== "#" &&
                (pathname === link.href ||
                  pathname.startsWith(`${link.href}/`));
              const linkClassName = `group inline-flex items-center px-5 transition-colors ${
                light ? "hover:text-[#1f1f1f]" : "hover:text-white"
              } ${isActive ? (light ? "text-[#1f1f1f]" : "text-white") : ""}`;

              return (
                <Fragment key={link.label}>
                  {index > 0 ? (
                    <span
                      className={`h-full w-px ${
                        light ? "bg-black/15" : "bg-white/20"
                      }`}
                    />
                  ) : null}
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClassName}
                    >
                      <TextMask text={link.label} />
                    </Link>
                  ) : (
                    <a href={link.href} className={linkClassName}>
                      <TextMask text={link.label} />
                    </a>
                  )}
                </Fragment>
              );
            })}
            <span
              className={`h-full w-px ${light ? "bg-black/15" : "bg-white/20 "}`}
            />
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className={`group inline-flex items-center px-5 transition-colors ${
                light ? "hover:text-[#1f1f1f]" : "hover:text-white"
              }`}
            >
              <TextMask text="Resume" />
            </a>
          </nav>

          <div
            className={`flex items-center text-xs font-semibold uppercase tracking-[0.14em] ${
              light ? "text-[#1f1f1f]" : "text-zinc-300"
            }`}
          >
            <ContactButton
              active={pathname === "/contact"}
              variant={light ? "light" : "dark"}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
