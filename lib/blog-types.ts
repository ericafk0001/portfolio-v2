export type BlogPostMeta = {
  /** URL segment, derived from the markdown filename. */
  slug: string;
  title: string;
  /** Short subtitle shown under the post title and in metadata. */
  description: string;
  /** ISO date (`YYYY-MM-DD`), used for ordering and display. */
  date: string;
  /** Estimated reading time in minutes. */
  readTime: number;
  tags: string[];
  /** Cover image used by the blog index preview. */
  image: string;
};

export type BlogPost = BlogPostMeta & {
  /** Rendered HTML generated from the markdown body. */
  content: string;
};
