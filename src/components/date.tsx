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
];

/**
 * Renders one project date as "2022" or "December 2022".
 *
 * Lives here rather than inside a component so the card and the project detail
 * page cannot drift apart. The raw string is already a valid `datetime`
 * attribute, so callers should wrap the result in
 * `<time dateTime={project.date}>`.
 */
export function formatProjectDate(date: string | null): string | null {
  if (!date) return null;

  const [year, month] = date.split("-");
  if (!month) return year;

  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : year;
}

/**
 * Renders a project's date range without repeating a shared year:
 * "June–August 2024", "2020–August 2025", or "March 2026–Present".
 */
export function formatProjectDateRange(
  startDate: string | null,
  endDate: string | "present" | null,
): string | null {
  const start = formatProjectDate(startDate);
  if (!start) return null;
  if (!endDate || endDate === startDate) return start;
  if (endDate === "present") return `${start}–Present`;

  const end = formatProjectDate(endDate);
  if (!end) return start;

  const [startYear, startMonth] = startDate!.split("-");
  const [endYear, endMonth] = endDate.split("-");
  if (startYear === endYear && startMonth && endMonth) {
    return `${MONTHS[Number(startMonth) - 1]}–${MONTHS[Number(endMonth) - 1]} ${startYear}`;
  }

  if (startYear !== endYear) {
    return `${startYear}–${end}`;
  }

  return `${start}–${end}`;
}
