import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Montserrat } from "next/font/google";
import { Stalinist_One } from "next/font/google";
import localFont from "next/font/local";
import { CurvedMenu } from "@/components/curved-menu";
import { RouteTransition } from "@/components/route-transition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const stalinistOne = Stalinist_One({
  variable: "--font-stalinist-one",
  weight: "400",
  subsets: ["latin"],
});

const boldonse = localFont({
  src: "./fonts/Boldonse-Regular.ttf",
  variable: "--font-boldonse",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${geistSans.variable} ${stalinistOne.variable} ${boldonse.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-geist-sans) bg-black text-zinc-100">
        {children}
        <RouteTransition />
        <CurvedMenu />
      </body>
    </html>
  );
}
