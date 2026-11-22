const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Formats `2026-10-12` as `October, 2026`, matching the reference post. */
export function formatPostDate(date: string) {
  const [year, month] = date.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return date;
  }

  return `${MONTHS[month - 1]}, ${year}`;
}

/** Formats `8` as `8 min read` (or `8 min Read` for the post header). */
export function formatPostReadTime(minutes: number, capitalized = false) {
  const safeMinutes =
    Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 1;

  return `${safeMinutes} min ${capitalized ? "Read" : "read"}`;
}
