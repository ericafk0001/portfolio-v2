import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { parse as parseYaml } from "yaml";

import type { BlogPost, BlogPostMeta } from "@/lib/blog-types";

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog");
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

type Frontmatter = Record<string, unknown>;

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

type ParsedPost = {
  meta: BlogPostMeta;
  content: string;
};

function isElement(node: HastNode): node is HastNode & { tagName: string } {
  return node.type === "element" && typeof node.tagName === "string";
}

/**
 * Adds lazy loading to every image, turns a paragraph that contains only an
 * image into a figure with the alt text as its caption.
 */
function rehypeBlogContent() {
  return (tree: unknown) => {
    const root = tree as HastNode;
    if (!Array.isArray(root.children)) return;

    root.children = root.children.map(prepareNode);
  };
}

function prepareNode(node: HastNode): HastNode {
  if (!isElement(node)) return node;

  if (node.children) {
    node.children = node.children.map(prepareNode);
  }

  if (node.tagName === "img") {
    node.properties = {
      ...node.properties,
      loading: "lazy",
      decoding: "async",
    };
    return node;
  }

  if (node.tagName !== "p" || !node.children) {
    return node;
  }

  const meaningfulChildren = node.children.filter(
    (child) => !(child.type === "text" && (child.value ?? "").trim() === ""),
  );

  if (
    meaningfulChildren.length !== 1 ||
    !isElement(meaningfulChildren[0]) ||
    meaningfulChildren[0].tagName !== "img"
  ) {
    return node;
  }

  const image = meaningfulChildren[0];
  const alt =
    typeof image.properties?.alt === "string"
      ? image.properties.alt.trim()
      : "";

  // The caption is rendered visibly below the image, so clear the duplicate
  // alt text on the image itself. The figcaption carries the description.
  if (alt) {
    image.properties = { ...image.properties, alt: "" };
  }

  return {
    type: "element",
    tagName: "figure",
    properties: {},
    children: [
      image,
      ...(alt
        ? [
            {
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: [{ type: "text", value: alt }],
            },
          ]
        : []),
    ],
  };
}

const markdownProcessor = remark()
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeBlogContent)
  .use(rehypeStringify);

function renderMarkdown(source: string) {
  return markdownProcessor.processSync(source).toString();
}

function readFrontmatter(source: string, fileName: string) {
  const match = source.match(FRONTMATTER_PATTERN);

  if (!match) {
    throw new Error(
      `[blog] ${fileName} is missing a frontmatter block. Start the file with ---.`,
    );
  }

  const parsed = parseYaml(match[1]);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`[blog] ${fileName} has an invalid frontmatter block.`);
  }

  return {
    data: parsed as Frontmatter,
    content: source.slice(match[0].length).trimStart(),
  };
}

function readRequiredString(
  data: Frontmatter,
  key: string,
  fileName: string,
) {
  const value = data[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `[blog] ${fileName} is missing "${key}" in its frontmatter.`,
    );
  }

  return value.trim();
}

function readOptionalString(data: Frontmatter, key: string) {
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function readTags(data: Frontmatter, fileName: string) {
  const value = data.tags;

  if (value === undefined || value === null) {
    return [];
  }

  const rawTags = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : null;

  if (!rawTags) {
    throw new Error(
      `[blog] ${fileName} must use a list or comma-separated string for "tags".`,
    );
  }

  return rawTags
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 0);
}

function readDate(data: Frontmatter, fileName: string) {
  const value = data.date;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const date = value.trim();
    const match = date.match(/^\d{4}-\d{2}-\d{2}/);

    if (match) {
      return match[0];
    }
  }

  throw new Error(
    `[blog] ${fileName} is missing a valid "date" (use YYYY-MM-DD).`,
  );
}

function readReadTime(data: Frontmatter, fileName: string) {
  const value = data.readTime ?? data.time;

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const match = value.match(/\d+/);

    if (match) {
      return Number.parseInt(match[0], 10);
    }
  }

  throw new Error(
    `[blog] ${fileName} is missing "readTime" (for example: readTime: 8).`,
  );
}

function normalizeImagePath(value: string, fileName: string) {
  if (/^https?:\/\//i.test(value)) {
    throw new Error(
      `[blog] ${fileName} uses an external cover image. Put the image in public/ and use a path such as /images/my-cover.jpg.`,
    );
  }

  return value.startsWith("/") ? value : `/${value.replace(/^\.?\//, "")}`;
}

function parsePostFile(fileName: string): ParsedPost {
  const slug = fileName.replace(/\.md$/i, "");
  const source = readFileSync(path.join(BLOG_DIRECTORY, fileName), "utf8");
  const { data, content } = readFrontmatter(source, fileName);

  return {
    meta: {
      slug,
      title: readRequiredString(data, "title", fileName),
      description: readOptionalString(data, "description"),
      date: readDate(data, fileName),
      readTime: readReadTime(data, fileName),
      tags: readTags(data, fileName),
      image: normalizeImagePath(
        readRequiredString(data, "image", fileName),
        fileName,
      ),
    },
    content,
  };
}

/** Reads every markdown post and returns their metadata, newest first. */
export function getAllPosts(): BlogPostMeta[] {
  if (!existsSync(BLOG_DIRECTORY)) {
    return [];
  }

  return readdirSync(BLOG_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("."))
    .map((fileName) => parsePostFile(fileName).meta)
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
    );
}

/** Reads a single markdown post and renders its body to HTML. */
export function getPostBySlug(slug: string): BlogPost | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }

  const fileName = `${slug}.md`;

  if (!existsSync(path.join(BLOG_DIRECTORY, fileName))) {
    return null;
  }

  const post = parsePostFile(fileName);

  return {
    ...post.meta,
    content: renderMarkdown(post.content),
  };
}
