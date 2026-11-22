import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPost } from "@/components/blog-post";
import { Navbar } from "@/components/navbar";
import { getPostBySlug, getAllPosts } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found | Eric Lin's Portfolio" };
  }

  return {
    title: `${post.title} | Eric Lin's Portfolio`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7f6f2] font-(family-name:--font-geist-sans) text-[#1f1f1f]">
      <Navbar variant="light" />
      <BlogPost post={post} />
    </div>
  );
}
