"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ContactButton } from "@/components/contact-button";
import { TextMask } from "@/components/text-mask";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/#featured-works" },
  { label: "Blog", href: "#" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="relative z-30 bg-black/40 backdrop-blur-sm">
      <div className="flex h-16 w-full items-center px-3 md:px-5">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center px-5 font-(family-name:--font-stalinist-one) text-lg font-semibold uppercase tracking-[0.24em] text-zinc-100 transition-colors hover:text-white"
        >
          <TextMask text="ERIC LIN" />
        </Link>

        <div className="ml-auto flex items-center gap-5">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-0 font-(family-name:--font-geist-sans) text-s font-semibold tracking-[0.16em] text-zinc-300 lg:flex"
          >
            {navLinks.map((link, index) => {
              const isActive =
                link.href !== "#" && pathname === link.href.split("#")[0];
              const linkClassName = `group inline-flex items-center px-5 transition-colors hover:text-white ${
                isActive ? "text-white" : ""
              }`;

              return (
                <Fragment key={link.label}>
                  {index > 0 ? (
                    <span className="h-full w-px bg-white/20" />
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
            <span className="h-full w-px bg-white/20" />
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center px-5 transition-colors hover:text-white"
            >
              <TextMask text="Resume" />
            </a>
          </nav>

          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
            <ContactButton active={pathname === "/contact"} />
          </div>
        </div>
      </div>
    </header>
  );
}
