import type { Metadata } from "next";

import { Navbar } from "@/components/navbar";
import { PageIntro } from "@/components/page-intro";
import { ProjectsList } from "@/components/projects-list";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects | Eric Lin's Portfolio",
  description:
    "Selected software and design projects by Eric Lin, including Death Note Mod, Anime identifier, and PocketDoc.",
};

export default function ProjectsPage() {
  return (
    <PageIntro className="flex min-h-screen flex-col overflow-x-clip bg-black font-(family-name:--font-geist-sans) text-zinc-100">
      <div data-intro="down">
        <Navbar />
      </div>

      <main className="mx-auto w-full max-w-520 flex-1 px-5 py-[64px] md:px-[40px] md:py-[120px]">
        <h1 className="sr-only">Projects</h1>

        <ProjectsList projects={projects} />
      </main>
    </PageIntro>
  );
}
