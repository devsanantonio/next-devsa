"use client"

import { track } from "@vercel/analytics"

/** A link on /fm that reports its click to Vercel Analytics as `event`, with `props`. */
export function FmLink({
  event,
  props,
  ...a
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; props?: Record<string, string | number | boolean> }) {
  return <a {...a} onClick={(e) => { track(event, props); a.onClick?.(e) }} />
}
