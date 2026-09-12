import { getProfile } from "@/lib/content";
import { Container } from "./Container";

/**
 * Name and year on the left, the profile's own links on the right — as plain
 * text links, driven entirely by content/profile.json.
 *
 * This replaces the seven hand-coloured gradient social buttons (twenty brand
 * hexes between them) and the `.coming-soon` copyright box.
 */
export async function SiteFooter() {
  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border-default">
      <Container className="flex flex-col gap-4 py-10 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {profile.name}
        </p>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.links.map((link) => (
            <li key={link.href}>
              <a className="link" href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
          {profile.email ? (
            <li>
              <a className="link" href={`mailto:${profile.email}`}>
                Email
              </a>
            </li>
          ) : null}
        </ul>
      </Container>
    </footer>
  );
}
