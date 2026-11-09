export type Project = {
  title: string;
  period: string;
  description: string;
  href: string;
  image: string;
  tags: string[];
  category: string;
};

/**
 * Shared project data used by the homepage's featured list and the dedicated
 * projects page. Keep the tags/category copy here so both views stay in sync.
 */
export const projects: Project[] = [
  {
    title: "Death Note Mod",
    period: "Jan 2025 - Present",
    description: "An interactive Death Note-inspired mod.",
    href: "https://github.com/ericafk0001/Death-Note-1.21.X",
    image: "/images/deathnote.webp",
    tags: ["Java", "Game Mod", "UI"],
    category: "Minecraft Mod",
  },
  {
    title: "Anime identifier",
    period: "Nov 2024 - Nov 2024",
    description:
      "An image recognition tool that identifies anime from a single frame or screenshot.",
    href: "https://github.com/ericafk0001/anime-identifier",
    image: "/images/anime.png",
    tags: ["Python", "Computer Vision", "API"],
    category: "AI Tool",
  },
  {
    title: "PocketDoc",
    period: "April 2026 - April 2026",
    description:
      "An application that allows users to quickly identify injuries and receive first aid instructions.",
    href: "https://github.com/ericafk0001/PocketDoc",
    image: "/images/pocketdoc.png",
    tags: ["AI", "Product Design", "Web"],
    category: "Health App",
  },
];
