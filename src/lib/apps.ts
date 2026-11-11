/**
 * How the three apps are presented on the home page: the hero carousel and the
 * "Apps I've shipped" cards. The words (title, tagline, status) still come from
 * each app's project.json; this file only holds what the cards need on top of
 * that: the icon, the platform line, and the pictures in the coloured half.
 *
 * To add an app, give its project `featured: true`, rank it in
 * project-order.ts, and add an entry here. A featured project with no entry
 * still gets a card, just without an icon or pictures.
 *
 * The pictures are decoration inside a card that is one big link to the
 * project page, so they render with empty alt text: the link's name stays
 * "Burrow ..." instead of three screenshots' worth of description.
 */

export type AppPicture = {
  /** Public URL. */
  src: string;
  width: number;
  height: number;
};

export type AppShowcase = {
  /** Path to the app icon in public/. */
  icon: string;
  /** "iPhone", "Web app"... shown before the status. */
  platform: string;
  /** "phones" shows two screenshots side by side; "shot" shows one wide screenshot rising from the bottom. */
  panel: "phones" | "shot";
  pictures: AppPicture[];
  /**
   * Where the project grid crops this app's wide banner (CSS object-position).
   * The banners put their words on the left, so cropping from the left keeps them.
   */
  cardPosition?: string;
  /**
   * A version of the banner laid out for the project cards' 16:10 frame, used
   * instead of the cover when cropping the wide banner would cut off its words.
   * Public URL, about 720px wide.
   */
  cardSrc?: string;
};

export const APP_SHOWCASE: Record<string, AppShowcase> = {
  burrow: {
    icon: "/images/apps/burrow-icon.webp",
    platform: "iPhone",
    panel: "phones",
    cardPosition: "left center",
    pictures: [
      {
        src: "/media/burrow/burrow_timer.webp",
        width: 600,
        height: 1303,
      },
      {
        src: "/media/burrow/burrow_reflect.webp",
        width: 600,
        height: 1303,
      },
    ],
  },
  "engine-miles": {
    icon: "/images/apps/engine-miles-icon.svg",
    platform: "iPhone",
    panel: "phones",
    // The plug-in hybrid banner (November 11, 2026) puts its numbers on the right,
    // so a crop would cut them off. This is the same banner laid out at 16:10.
    cardSrc: "/images/apps/engine-miles-banner-card.webp",
    pictures: [
      {
        src: "/media/engine-miles/engine_miles_home.webp",
        width: 600,
        height: 1304,
      },
      {
        src: "/media/engine-miles/engine_miles_oil.webp",
        width: 600,
        height: 1304,
      },
    ],
  },
  relayreply: {
    icon: "/images/apps/relayreply-icon.svg",
    platform: "Web app",
    panel: "shot",
    pictures: [
      {
        // A crop of the project's hero: relayreply.com's home page with the typing box filled in.
        src: "/images/apps/relayreply_home.webp",
        width: 960,
        height: 600,
      },
    ],
  },
};

/**
 * The hero carousel: the three apps' hero pictures, then these two projects.
 * Michael asked for CalCardo and KURT next to the apps (November 9, 2026).
 *
 * On a phone the carousel is narrow, so its pictures are cropped to 4:3 instead
 * of the banners' 1200:630. That makes a banner's headline almost half as big
 * again. `phonePosition` says which part of the picture that crop keeps
 * (CSS object-position); `position` does the same for the wide crop.
 */
export type SlideArt = {
  phonePosition?: string;
  position?: string;
  /**
   * A 4:3 version of the picture for phones, used instead of cropping the wide
   * one. Public URL, 1200 x 900.
   */
  phoneSrc?: string;
};

/** Crops for the apps' own hero pictures. Their banners put the words on the left. */
export const APP_SLIDE_ART: Record<string, SlideArt> = {
  burrow: { phonePosition: "left center" },
  // The same plug-in hybrid banner laid out at 4:3, so the phone shows all of it.
  "engine-miles": { phoneSrc: "/images/apps/engine-miles-banner-phone.webp" },
  relayreply: { phonePosition: "center top" },
};

export type ExtraSlide = SlideArt & {
  slug: string;
  /** Shown instead of the project's title ("KURT" rather than "Automated Foosball Goalie"). */
  title?: string;
  /** The small line next to the title. */
  label: string;
  /** Public URL. */
  src: string;
  width: number;
  height: number;
};

export const EXTRA_SLIDES: ExtraSlide[] = [
  {
    slug: "calcardo",
    label: "AI calendar assistant",
    src: "/media/calcardo/calcardo_cover.webp",
    width: 1600,
    height: 900,
  },
  {
    slug: "foosball",
    title: "KURT",
    label: "My automated foosball goalie",
    // The project's cover photo, made 1200 x 900 for the carousel.
    src: "/images/slides/kurt.webp",
    width: 1200,
    height: 900,
    position: "50% 55%",
  },
];
