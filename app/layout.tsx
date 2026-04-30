import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Boldonse } from "next/font/google";
import { Stalinist_One } from "next/font/google";
import "./globals.css";

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

const boldonse = Boldonse({
  variable: "--font-boldonse",
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
      className={`${geistSans.variable} ${geistMono.variable} ${stalinistOne.variable} ${boldonse.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-geist-mono) bg-black text-zinc-100">
        {children}
      </body>
    </html>
  );
}
