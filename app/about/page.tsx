import type { Metadata } from "next";
import Image from "next/image";

import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "About | Eric Lin's Portfolio",
  description:
    "Learn more about Eric Lin, a student at the Academy at Palumbo interested in computer science, artificial intelligence, and software development.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black font-sans text-zinc-100">
      <Navbar />

      <main className="mx-auto w-full max-w-[1680px] flex-1 px-5 pb-24 pt-12 sm:px-8 sm:pt-16 md:px-12 lg:px-[7vw] lg:pt-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-[clamp(3rem,6vw,7rem)]">
          <div className="mx-auto w-full max-w-[30rem] shrink-0 lg:mx-0 lg:w-[46%] lg:max-w-[44rem] lg:pt-28">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900 sm:aspect-[3/4]">
              <Image
                src="/images/eric-portrait.webp"
                alt="Eric Lin"
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                loading="eager"
                className="object-cover"
              />
            </div>
          </div>

          <section
            aria-labelledby="about-heading"
            className="flex w-full flex-col lg:w-[45%] lg:max-w-[43rem] lg:pt-28"
          >
            <p className="text-[0.8rem] tracking-[0.02em] text-zinc-500">
              Eric Lin — EST 2010
            </p>

            <h1
              id="about-heading"
              className="mt-4 flex flex-col text-[clamp(2.6rem,4.8vw,4.75rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.045em] text-white"
            >
              <span>About Me</span>
            </h1>

            <div className="mt-8 flex flex-col gap-6 text-pretty text-[1.02rem] leading-[1.7] text-zinc-200 sm:text-[1.08rem] lg:mt-10 [&_a]:text-zinc-200 [&_a]:underline [&_a]:decoration-zinc-600 [&_a]:decoration-1 [&_a]:underline-offset-[5px] [&_a]:transition-colors [&_a:hover]:text-white [&_a:hover]:decoration-white [&_strong]:font-semibold [&_strong]:text-zinc-100">
              <p>
                Hi! I am Eric, currently a junior high school student at
                the&nbsp;
                <a
                  href="https://palumbo.philasd.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Academy at Palumbo
                </a>{" "}
                wanting to pursue a field in{" "}
                <strong>computer science and artificial intelligence</strong>. I
                was born in Brooklyn, moved to Fuzhou, came back to the States
                and went back and forth from the Bronx and Brooklyn, and now
                living in Philadelphia.
              </p>

              <p>
                I enjoy designing and building{" "}
                <strong>optimized websites and automated systems</strong>, both
                on the software and hardware end. Many of my projects involve{" "}
                <strong>
                  developing software products and systems from scratch to
                  finish
                </strong>
                . Dealing with obscure requirements and hitting tight timelines
                are things I&apos;m experienced at.
              </p>

              <p>
                I&apos;m the{" "}
                <strong>
                  lead programmer for my school&apos;s FTC robotics team
                </strong>
                , teaching programming to other team members and working on both
                the software and hardware ends of our competition robot. I was
                an{" "}
                <strong>
                  Electrical Engineering Intern at Temple University
                </strong>
                , where I collaborated with a three-person research team to
                improve upon a{" "}
                <strong>Multi-Label ECG classification system</strong> capable
                of identifying overlapping cardiac abnormalities.
              </p>

              <p>
                When I&apos;m away from screens, I love playing basketball and
                badminton, hiking, cooking, taking long walks at the park, and
                going to cat cafes.
              </p>

              <p>
                Favorite games? Modded{" "}
                <a
                  href="https://www.minecraft.net/en-us"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Minecraft
                </a>{" "}
                and{" "}
                <a
                  href="https://polytopia.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Polytopia
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
