"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

/**
 * The link list inside SiteNav.
 *
 * This is the site's only client component, and it is one because marking the
 * current route needs the current route: `usePathname` has no server
 * equivalent. Everything else here — including the below-`md` disclosure — is
 * plain HTML that works with JavaScript switched off.
 */
export function NavLinks({ items, resume }: { items: NavItem[]; resume: string | null }) {
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const link = (item: NavItem) => {
    const current = isCurrent(item.href);
    return (
      <Link
        href={item.href}
        aria-current={current ? "page" : undefined}
        className={[
          "relative block rounded-sm py-2 text-sm md:py-0",
          current ? "text-fg" : "text-fg-muted hover:text-fg",
          "motion-safe:transition",
          // The current route is marked with a 2px rule under the label.
          current
            ? "after:absolute after:inset-x-0 after:-bottom-1 after:hidden after:h-0.5 after:bg-accent after:content-[''] md:after:block"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {item.label}
      </Link>
    );
  };

  const resumeLink = resume ? (
    <a
      href={resume}
      className="block rounded-sm py-2 text-sm text-fg-muted hover:text-fg md:py-0 motion-safe:transition"
    >
      Resume
    </a>
  ) : null;

  return (
    <nav aria-label="Main">
      {/* md and up: the links sit in the bar. */}
      <ul className="hidden items-center gap-6 md:flex">
        {items.map((item) => (
          <li key={item.href}>{link(item)}</li>
        ))}
        {resumeLink ? <li>{resumeLink}</li> : null}
      </ul>

      {/* Below md: a disclosure. No JavaScript, no scroll lock, no overlay.
          Keying on the pathname remounts it closed after a navigation. */}
      <details key={pathname} className="group relative md:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-sm py-2 text-sm text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
          Menu
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="h-3 w-3 motion-safe:transition group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </summary>

        <ul className="absolute right-0 top-full z-10 mt-2 w-44 rounded-md border border-border-default bg-surface p-2 shadow-raised">
          {items.map((item) => (
            <li key={item.href} className="px-2">
              {link(item)}
            </li>
          ))}
          {resumeLink ? <li className="px-2">{resumeLink}</li> : null}
        </ul>
      </details>
    </nav>
  );
}
