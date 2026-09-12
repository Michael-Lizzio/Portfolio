import Link from "next/link";
import { getProfile } from "@/lib/content";
import { Container } from "./Container";
import { NavLinks, type NavItem } from "./NavLinks";

/**
 * The site's only navigation.
 *
 * The legacy site's fatal flaw was hand-promoting one project into the global
 * chrome while seven others had no route in from anywhere. Nothing project-
 * specific belongs here: /work is the single door to every project, and it is
 * generated from the content, so a new project folder is reachable the moment
 * it is published.
 *
 * Rendered on the server as part of the layout — never fetched at runtime,
 * so it cannot flash unstyled the way the injected navbar did.
 */
const ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteNav() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-surface/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-6">
        <Link
          href="/"
          className="rounded-sm text-sm font-semibold tracking-tight text-fg motion-safe:transition hover:text-accent"
        >
          {profile.name}
        </Link>

        <NavLinks items={ITEMS} resume={profile.resume} />
      </Container>
    </header>
  );
}
