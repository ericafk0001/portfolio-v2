import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Stalinist_One } from "next/font/google";
import "./globals.css";
import { Crosshair } from "@deemlol/next-icons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const stalinistOne = Stalinist_One({
  variable: "--font-stalinist-one",
  weight: "400",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Eric Lin's Portfolio",
  description: "The one and only Eric Lin!!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${stalinistOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-geist-mono) bg-black text-zinc-100">
        <header className="fixed inset-x-0 top-0 z-20 border-b-2 border-white/25 bg-transparent backdrop-blur-sm">
          <div className="flex h-16 w-full items-center px-3 md:px-5">
            <div className="flex items-center">
              <a
                href="#"
                className="font-(family-name:--font-stalinist-one) shrink-0 text-lg font-semibold uppercase tracking-[0.24em] text-zinc-100 transition-colors hover:text-white px-5"
              >
                ERIC LIN
              </a>
              <span className="mx-3 h-16 w-px bg-white/20" />
              <nav className="hidden items-center gap-0 text-xs font-semibold uppercase tracking-[0.16em] font-(family-name:--font-geist-mono) text-zinc-300 lg:flex">
                <a href="#" className="px-5 transition-colors hover:text-white">
                  About Me
                </a>

                <span className="h-full w-px bg-white/20" />
                <a href="#" className="px-5 transition-colors hover:text-white">
                  Projects
                </a>
                <a href="#" className="px-5 transition-colors hover:text-white">
                  My Goal
                </a>
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
              <button
                type="button"
                className="hidden md:flex gap-2 items-center text-red-500"
              >
                Night Mode <Crosshair className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="hidden items-center gap-2 border border-zinc-700 bg-zinc-800 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:bg-zinc-700 md:inline-flex"
              >
                Contact
                <span className="inline-flex h-4 w-4 items-center justify-center border border-zinc-600 bg-zinc-700 text-[0.55rem] leading-none text-zinc-200">
                  &#8599;
                </span>
              </button>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
