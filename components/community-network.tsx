"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

/**
 * Every community group as a node, each wired to the DEVSA mark at the center
 * in the brand colors, with a few faint lines between groups because they
 * connect to each other too. On the homepage it is "The Orgs Behind the
 * Movement" shown connected rather than listed, and the same picture as the
 * LinkedIn banner, the Instagram and YouTube graphics and the poster.
 *
 * Live, like every other surface that shows communities: fetched from
 * /api/communities at request time, so a group added or removed in the admin
 * appears or disappears here on the next load. The rings size themselves to
 * however many groups there are.
 *
 * Logos render as uploaded, with the exceptions in NODE_LOGO: two marks drawn
 * in black that vanish on this ground, and AITX by its orange mark alone,
 * which reads at node size where the wordmark does not.
 */

export type Community = { id: string; name: string; logo: string }

const COLORS = ["#00b2a9", "#ef426f", "#ff8200"]

/**
 * Per-group treatment on the network's black ground, by community id.
 *
 * `white` draws the mark as a white silhouette through an SVG filter rather
 * than a CSS one — CSS filters on an SVG <image> are not reliable in Safari.
 * Unity's SVG sets no fill, so it renders black; Alamo Agents' mark is dark.
 * (public/community-logos/alamo-agents-light.webp is a thin gold line drawing,
 * not a white mark, so it is not the answer here.)
 *
 * Keyed by id, so a renamed group keeps its treatment; a group re-uploaded with
 * a light logo should come off this list.
 */
const NODE_LOGO: Record<string, { src?: string; white?: boolean }> = {
  aitx: { src: "/community-logos/aitx-mark.png" },
  "alamo-agents": { white: true },
  "alamo-city-unity-user-group": { white: true },
}
const W = 640
const H = 480
const CX = W / 2
const CY = H / 2
const NODE = 23 // radius, in viewBox units

/**
 * Two rings: about a third of the groups inside, the rest outside. A small,
 * fixed wobble per index keeps it reading as a network rather than a clock
 * face, and is deterministic so server and client agree.
 */
function layout(n: number) {
  const inner = Math.min(n, Math.max(3, Math.round(n * 0.36)))
  const outer = n - inner
  return Array.from({ length: n }, (_, i) => {
    const isInner = i < inner
    const count = isInner ? inner : outer
    const k = isInner ? i : i - inner
    const a = (k / Math.max(count, 1)) * Math.PI * 2 + (isInner ? 0.35 : 0) + Math.sin(i * 7.3) * 0.08
    const rx = isInner ? 128 : 262
    const ry = isInner ? 100 : 196
    return {
      x: CX + Math.cos(a) * rx * (1 + Math.sin(i * 3.1) * 0.04),
      y: CY + Math.sin(a) * ry * (1 + Math.cos(i * 2.3) * 0.04),
    }
  })
}

/** Group-to-group links: each inner node to the outer node nearest its angle, plus neighbours on the outer ring. */
function links(n: number) {
  const inner = Math.min(n, Math.max(3, Math.round(n * 0.36)))
  const out: [number, number][] = []
  for (let i = 0; i < inner && inner + i * 2 < n; i++) out.push([i, inner + Math.round((i / inner) * (n - inner))])
  for (let i = inner; i + 1 < n; i += 3) out.push([i, i + 1])
  return out
}

export function CommunityNetwork({
  className = "",
  communities,
}: {
  className?: string
  /** Pass when the parent already fetched /api/communities; otherwise this fetches its own. */
  communities?: Community[]
}) {
  const [fetched, setFetched] = useState<Community[]>([])
  const groups = useMemo(
    () => (communities ?? fetched).filter((c) => c.id && c.name && c.logo),
    [communities, fetched],
  )
  const reduce = useReducedMotion()
  // One trigger for the whole drawing. Per-element whileInView left the
  // bottom nodes waiting until they scrolled in on their own, so the network
  // assembled in pieces; this draws it as one thing once a quarter is visible.
  const ref = useRef<SVGSVGElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.25 })

  useEffect(() => {
    if (communities) return
    let live = true
    fetch("/api/communities")
      .then((r) => (r.ok ? r.json() : { communities: [] }))
      .then((d) => {
        if (!live) return
        setFetched((d.communities || []).map((c: Community) => ({ id: c.id, name: c.name, logo: c.logo })))
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [communities])

  const pts = useMemo(() => layout(groups.length), [groups.length])
  const edges = useMemo(() => links(groups.length), [groups.length])
  const draw = (i: number) =>
    reduce ? {} : { initial: { pathLength: 0, opacity: 0 }, animate: seen ? { pathLength: 1, opacity: 1 } : undefined, transition: { duration: 0.7, delay: 0.15 + i * 0.03 } }
  const pop = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, scale: 0.6 }, animate: seen ? { opacity: 1, scale: 1 } : undefined, transition: { duration: 0.45, delay: 0.25 + i * 0.03 } }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={
        groups.length
          ? `${groups.length} San Antonio tech community groups, all connected through DEVSA`
          : "San Antonio's tech community groups, connected through DEVSA"
      }
    >
      <defs>
        <clipPath id="cn-node">
          <circle r={NODE - 5} />
        </clipPath>
        {/* Every pixel white, alpha kept: a silhouette for dark marks. */}
        <filter id="cn-white">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
      </defs>

      {edges.map(([a, b], i) =>
        pts[a] && pts[b] ? (
          <motion.line key={`e${i}`} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke="#fff" strokeOpacity={0.14} strokeWidth={1} {...draw(i)} />
        ) : null,
      )}
      {pts.map((p, i) => (
        <motion.line key={`h${groups[i].id}`} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={COLORS[i % 3]} strokeOpacity={0.6} strokeWidth={1.4} {...draw(i)} />
      ))}

      {pts.map((p, i) => (
        <motion.g key={groups[i].id} style={{ transformOrigin: `${p.x}px ${p.y}px` }} {...pop(i)}>
          <a href={`/buildingtogether/${groups[i].id}`} aria-label={groups[i].name}>
            <title>{groups[i].name}</title>
            <g transform={`translate(${p.x} ${p.y})`}>
              <circle r={NODE} fill="#151515" stroke="#2c2c2c" strokeWidth={1} />
              <image
                href={NODE_LOGO[groups[i].id]?.src ?? groups[i].logo}
                filter={NODE_LOGO[groups[i].id]?.white ? "url(#cn-white)" : undefined}
                x={-(NODE - 6)}
                y={-(NODE - 6)}
                width={(NODE - 6) * 2}
                height={(NODE - 6) * 2}
                preserveAspectRatio="xMidYMid meet"
                clipPath="url(#cn-node)"
              />
            </g>
          </a>
        </motion.g>
      ))}

      {/* The hub: the mark on its own black disc, unaltered. */}
      <circle cx={CX} cy={CY} r={58} fill="#0a0a0a" />
      <image href="/branding/devsa-logo.svg" x={CX - 42} y={CY - 32} width={84} height={64} preserveAspectRatio="xMidYMid meet" />
    </svg>
  )
}
