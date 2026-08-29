/**
 * San Antonio Tech Summit — config for the `/summit` TV backdrop.
 *
 * The key art carries every piece of copy: title, presenter, date, venue and
 * the sponsor row. So the page displays the artwork and nothing else. There is
 * deliberately no text layer and no clock — anything laid over the top would
 * only compete with a design that is already finished.
 *
 * A one-off for a single day. `/summit`, this file, public/summit/hero.png and
 * one entry in components/layout-chrome.tsx are the whole footprint.
 */

/** 1080x1080, so it lands pixel-for-pixel on a 1080p panel. */
export const SUMMIT_ART = "/summit/hero.png"

export const SUMMIT_ALT =
  "San Antonio Tech Summit, presented by Gentry Media — 29 August 2026, 10:30 AM to 1 PM, Geekdom, 110 E. Houston St, San Antonio, Texas"
