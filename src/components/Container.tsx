import type { ReactNode } from "react";

/**
 * The only horizontal rhythm on the site.
 *
 * `page`  — 72rem, the wide column: nav, footer, card grids, page headers.
 * `prose` — 45rem, the reading column: body copy, media inside an article.
 *
 * The legacy site had a 1200px container, an 800px container, and an 800px
 * container nested inside the 1200px one. There are two here and they never nest.
 */
export function Container({
  children,
  size = "page",
  className,
}: {
  children: ReactNode;
  size?: "page" | "prose";
  className?: string;
}) {
  return (
    <div
      className={["mx-auto w-full px-6", size === "prose" ? "max-w-prose" : "max-w-page", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
