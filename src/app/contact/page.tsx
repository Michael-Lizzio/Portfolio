import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, resume and every account worth linking to.",
};

/**
 * "github.com/michael-lizzio" under the label, so a link says where it goes
 * before you click it. zod already guarantees these parse as URLs; the guard
 * is here because a build must not die over a decoration.
 */
function displayHref(href: string): string | null {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/$/, "");
    return `${url.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <>
      <PageHeader
        title="Contact"
        tagline="Email is the surest way to reach me. Everything else below works too."
      />

      <section className="py-14 md:py-20">
        <Container size="prose">
          <div className="flex flex-wrap gap-3">
            {profile.email ? (
              <a className="btn btn-primary" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            ) : null}

            {profile.resume ? (
              <a
                className="btn btn-outline"
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume (PDF)
              </a>
            ) : null}
          </div>

          {profile.links.length > 0 ? (
            <>
              <h2 className="mt-14 text-2xl font-semibold tracking-tight text-fg">Elsewhere</h2>

              {/* The legacy Connect page rendered these as seven gradient
                  buttons in twenty brand colours. They are links; they look
                  like links. */}
              <ul className="mt-6 border-t border-border-default">
                {profile.links.map((link) => {
                  const where = displayHref(link.href);

                  return (
                    <li
                      key={link.href}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border-default py-3"
                    >
                      <a
                        className="link"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>

                      {where ? (
                        <span className="font-mono text-xs text-fg-faint">{where}</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          <p className="mt-10 text-sm text-fg-muted">
            There is no contact form here on purpose: there is no backend behind it yet, and a
            form that quietly drops what you wrote is worse than no form at all.
          </p>
        </Container>
      </section>
    </>
  );
}
