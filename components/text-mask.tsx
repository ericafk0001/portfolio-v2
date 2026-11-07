import type { CSSProperties } from "react";

type TextMaskProps = {
  text: string;
  className?: string;
};

const STAGGER_MS = 30;

/**
 * Per-letter masked text roll for navbar hover states.
 *
 * Each character gets its own `overflow-hidden` mask with two stacked copies.
 * On hover/focus the visible copy slides up and out while the duplicate slides
 * up into view. A small delay per character produces a left-to-right wave.
 *
 * The parent link must carry the `group` class so the hover/focus states reach
 * every letter.
 */
export function TextMask({ text, className }: TextMaskProps) {
  const characters = Array.from(text);

  const copyClassName =
    "block will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0";

  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      {characters.map((character, index) => {
        const style = {
          transitionDelay: `${index * STAGGER_MS}ms`,
        } satisfies CSSProperties;

        return (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            className="relative inline-block overflow-hidden align-middle"
          >
            <span className={copyClassName} style={style}>
              {character === " " ? "\u00A0" : character}
            </span>
            <span
              aria-hidden="true"
              className={`${copyClassName} absolute top-full left-0`}
              style={style}
            >
              {character === " " ? "\u00A0" : character}
            </span>
          </span>
        );
      })}
    </span>
  );
}
