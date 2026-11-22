import type { Metadata } from "next";

import { BlogList } from "@/components/blog-list";
import { Navbar } from "@/components/navbar";
import { PageIntro } from "@/components/page-intro";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Eric Lin's Portfolio",
  description:
    "Collection of thoughts and processes that would otherwise be lost to time.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const latestYear = posts[0]?.date.slice(0, 4) ?? new Date().getFullYear();

  return (
    <PageIntro className="flex min-h-screen flex-col overflow-x-clip bg-black font-(family-name:--font-geist-sans) text-zinc-100">
      <div data-intro="down">
        <Navbar />
      </div>

      <main className="mx-auto w-full max-w-520 flex-1 px-5 py-14 md:px-10 md:py-24">
        <div
          data-intro="up"
          className="mb-8 flex items-end justify-between md:mb-10"
        >
          <h1 className="font-(family-name:--font-montserrat) text-[clamp(2rem,3.2vw,3rem)] font-medium leading-none tracking-[-0.04em] text-white">
            {latestYear}
          </h1>
        </div>

        <BlogList posts={posts} />
      </main>
    </PageIntro>
  );
}
