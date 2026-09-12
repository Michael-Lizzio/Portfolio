import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getProfile } from "@/lib/content";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

/**
 * Both faces are self-hosted by next/font and exposed as CSS variables that
 * globals.css picks up as --font-sans / --font-mono. Nothing is fetched from a
 * third party at runtime, and no @import url() sits in front of first paint.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/**
 * Set NEXT_PUBLIC_SITE_URL to the production origin before deploying; without
 * it, Open Graph image URLs resolve against localhost.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} — ${profile.headline}`,
      template: `%s · ${profile.name}`,
    },
    description: profile.headline,
    openGraph: {
      type: "website",
      siteName: profile.name,
      title: `${profile.name} — ${profile.headline}`,
      description: profile.headline,
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} — ${profile.headline}`,
      description: profile.headline,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <a
          href="#main"
          className="sr-only rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
        >
          Skip to content
        </a>

        <SiteNav />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
