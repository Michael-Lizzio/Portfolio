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
 * Renders a project `date` ("YYYY" or "YYYY-MM") the one way it is rendered
 * anywhere on the site: "2022" or "December 2022".
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
