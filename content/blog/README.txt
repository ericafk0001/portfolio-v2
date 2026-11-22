Blog posts
==========

Every `.md` file in this folder becomes a page at `/blog/<filename>`.
For example, `my-post.md` is published at `/blog/my-post`.

Frontmatter
-----------

Start each file with this block:

    ---
    title: My post title
    description: A short subtitle for the post header and search results.
    date: 2026-10-12
    readTime: 8
    tags:
      - Next.js
      - GSAP
    image: /images/my-cover.jpg
    ---

- `date` must use `YYYY-MM-DD`.
- `readTime` is a number of minutes.
- `image` is the cover shown in the blog index preview. Put the file in
  `public/` and use a path beginning with `/`.
- `tags` can also be a comma-separated string.

Body
----

Write normal markdown below the frontmatter. A paragraph containing only an
image becomes a figure, and the alt text becomes the visible caption:

    ![A caption under the image](/images/photo.jpg)

The first `#` heading is not needed because the frontmatter title is rendered
as the page heading. Use `##` and `###` for sections inside the article.

Markdown cheat sheet: https://www.markdownguide.org/cheat-sheet/ 


