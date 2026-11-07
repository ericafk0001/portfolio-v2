import Link from "next/link";

type ContactButtonProps = {
  /** Target route. Defaults to the contact page. */
  href?: string;
  /** Marks the link as the current page for assistive tech. */
  active?: boolean;
};

/**
 * Navbar "Contact" burst button.
 *
 * The base styles live in `globals.css` (`.contact-fill`): the white pill and
 * the expanding black burst are painted as one background image so the
 * rounded clip can never reveal a white sliver at the edges.
 */
export function ContactButton({
  href = "/contact",
  active = false,
}: ContactButtonProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="contact-fill group relative hidden cursor-pointer items-center gap-3 overflow-hidden rounded-[100px] px-5 py-2.5 text-xs font-semibold tracking-[0.18em] text-zinc-900 md:inline-flex"
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-black" />
      <span className="relative z-[2] transition-all duration-300 ease-out group-hover:-translate-x-[25px] group-hover:text-white group-focus-visible:-translate-x-[25px] group-focus-visible:text-white">
        Contact
      </span>
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-full z-[2] -mt-2 transition-all duration-300 ease-out group-hover:-translate-x-[36px] group-focus-visible:-translate-x-[36px]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M15.7071 8.70711C16.0976 8.31658 16.0976 7.68342 15.7071 7.29289L9.34315 0.928932C8.95262 0.538408 8.31946 0.538408 7.92893 0.928932C7.53841 1.31946 7.53841 1.95262 7.92893 2.34315L13.5858 8L7.92893 13.6569C7.53841 14.0474 7.53841 14.6805 7.92893 15.0711C8.31946 15.4616 8.95262 15.4616 9.34315 15.0711L15.7071 8.70711ZM0 9H15V7H0V9Z"
            fill="white"
          />
        </svg>
      </span>
    </Link>
  );
}
