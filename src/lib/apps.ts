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
  /** "phones" shows two screenshots side by side; "call" stacks a caption over a question card. */
  panel: "phones" | "call";
  pictures: AppPicture[];
  /**
   * Where the project grid crops this app's wide banner (CSS object-position).
   * The banners put their words on the left, so cropping from the left keeps them.
   */
  cardPosition?: string;
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
    cardPosition: "left center",
    pictures: [
      {
        src: "/media/engine-miles/engine_miles_home.webp",
        width: 600,
        height: 1303,
      },
      {
        src: "/media/engine-miles/engine_miles_oil.webp",
        width: 600,
        height: 1303,
      },
    ],
  },
  relayreply: {
    icon: "/images/apps/relayreply-icon.svg",
    platform: "Web app",
    panel: "call",
    pictures: [
      {
        src: "/images/apps/relayreply_caption.webp",
        width: 720,
        height: 90,
      },
      {
        src: "/images/apps/relayreply_card.webp",
        width: 720,
        height: 441,
      },
    ],
  },
};
