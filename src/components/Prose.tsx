/**
 * Body copy: 18px / 1.7 in the 45rem reading column — the old site's own
 * measure, minus the four different line-heights it used to reach it.
 *
 * Content is plain text by contract (no HTML, no markdown), one string per
 * paragraph, so there is nothing to sanitise and nothing to parse.
 */
export function Prose({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null;

  return (
    <div className="max-w-prose text-lg text-fg">
      {paragraphs.map((paragraph, i) => (
        // Index keys are safe here: the array is static content, never reordered.
        <p key={i} className={i === 0 ? undefined : "mt-5"}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
