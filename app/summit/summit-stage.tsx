"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SUMMIT } from "@/data/summit"

const START = new Date(SUMMIT.start).getTime()
const END = new Date(SUMMIT.end).getTime()

type Phase = "before" | "live" | "after"

function phaseAt(now: number): Phase {
  if (now < START) return "before"
  if (now <= END) return "live"
  return "after"
}

const pad = (n: number) => String(n).padStart(2, "0")

/** H:MM:SS, with hours allowed to run past 24 — the page goes up the day before. */
function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

const clockFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: SUMMIT.timeZone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

export function SummitStage() {
  /**
   * `null` until mounted. The clock and the phase both depend on the current
   * time, which the server cannot know — rendering them during SSR would
   * guarantee a hydration mismatch on every load. The frame is identical
   * either way; only the status block waits.
   */
  const [now, setNow] = useState<number | null>(null)
  const [idle, setIdle] = useState(true)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  /* Cursor and the fullscreen button disappear once nobody is touching the
     machine, so what is left on the screen is only the artwork. */
  useEffect(() => {
    const wake = () => {
      setIdle(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdle(true), 2500)
    }
    window.addEventListener("mousemove", wake)
    window.addEventListener("touchstart", wake)
    return () => {
      window.removeEventListener("mousemove", wake)
      window.removeEventListener("touchstart", wake)
      clearTimeout(idleTimer.current)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  /* `f` toggles fullscreen. Whoever sets the TV up is unlikely to have a
     mouse, and every TV browser and streaming stick has a keyboard somewhere. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggleFullscreen])

  const phase = now === null ? null : phaseAt(now)

  const current =
    now === null
      ? undefined
      : SUMMIT.segments.find(
          (s) => now >= new Date(s.start).getTime() && now <= new Date(s.end).getTime(),
        )
  const upcoming =
    now === null
      ? undefined
      : SUMMIT.segments.find((s) => new Date(s.start).getTime() > now)

  return (
    <div className={`smt${idle ? " smt-idle" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="smt-bg" />
      <div className="smt-rays" />
      <div className="smt-core" />
      <div className="smt-sweep" />
      <div className="smt-vignette" />
      <div className="smt-grain" />

      <div className="smt-frame">
        <div className="smt-top">
          {phase !== null && (
            <div className="smt-status">
              {phase === "before" && (
                <>
                  <span className="smt-label">Doors open in</span>
                  <span className="smt-count">{countdown(START - now!)}</span>
                </>
              )}
              {phase === "live" && (
                <>
                  <span className="smt-label">
                    <i className="smt-dot" />
                    Live now
                  </span>
                  <span className="smt-count">{clockFmt.format(now!)}</span>
                </>
              )}
              {phase === "after" && (
                <>
                  <span className="smt-label">That&apos;s a wrap</span>
                  <span className="smt-count smt-count-sm">Thank you, San Antonio</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="smt-lockup">
          <p className="smt-eyebrow">{SUMMIT.eyebrow}</p>
          <h1 className="smt-title">{SUMMIT.title}</h1>
          <p className="smt-presenter">{SUMMIT.presenter}</p>
        </div>

        <div className="smt-foot">
          {(current || upcoming) && (
            <div className="smt-agenda">
              {current && (
                <span className="smt-seg">
                  <b>Now</b>
                  {current.label}
                  {current.detail && <i>{current.detail}</i>}
                </span>
              )}
              {upcoming && (
                <span className="smt-seg smt-seg-next">
                  <b>Next</b>
                  {upcoming.label}
                </span>
              )}
            </div>
          )}

          <p className="smt-when">
            {SUMMIT.dateLabel}
            <span>|</span>
            {SUMMIT.timeLabel}
          </p>
          <p className="smt-where">{SUMMIT.venueLine}</p>

          <div className="smt-sponsors">
            {SUMMIT.sponsors.map((s) => (
              <span key={s.name} className="smt-sponsor">
                {s.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a fixed
                  // backdrop at a known size; next/image adds nothing here.
                  <img
                    src={s.logo}
                    alt={s.name}
                    className={s.wide ? "smt-logo smt-logo-wide" : "smt-logo"}
                  />
                ) : (
                  s.name
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className="smt-fs" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
        Fullscreen <kbd>F</kbd>
      </button>
    </div>
  )
}

/**
 * Scoped to `.smt` and injected here rather than living in globals.css, so the
 * whole page deletes with its folder.
 *
 * `--u` is the unit everything is sized in: `min(1vw, 1.7778vh)` is 1% of the
 * width of the largest 16:9 box that fits the screen. Every size is a multiple
 * of it, so the composition is identical on a 1080p TV, a 4K panel and a
 * laptop, and it letterboxes instead of reflowing. That is the right trade for
 * a backdrop, where the layout is the artwork.
 */
const CSS = `
.smt {
  --u: min(1vw, 1.7778vh);
  --blue: #2f6fff;
  --ice: #cfe4ff;
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #02030a;
  color: #fff;
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.smt-idle { cursor: none; }

/* ---- light field, back to front ---- */

.smt-bg, .smt-rays, .smt-core, .smt-sweep, .smt-vignette, .smt-grain {
  position: absolute;
  pointer-events: none;
}
.smt-bg, .smt-core, .smt-sweep, .smt-vignette, .smt-grain { inset: 0; }

.smt-bg {
  background:
    radial-gradient(ellipse 38% 34% at 1% 84%, rgba(255,61,139,.50), transparent 66%),
    radial-gradient(ellipse 44% 40% at 13% 18%, rgba(124,58,237,.34), transparent 70%),
    radial-gradient(ellipse 125% 98% at 9% 56%, #0d2670 0%, #08123a 46%, #02030a 100%);
}

/* The fan. A conic gradient centred just off the left edge throws blades that
   widen as they cross the screen, which is the motif from the key art. It is
   blurred because a hard conic aliases badly once it is 55 inches wide, and
   masked to an ellipse so the blades resolve into a beam rather than filling
   the frame. */
.smt-rays {
  inset: -25%;
  background: repeating-conic-gradient(
    from 152deg at 22% 56%,
    rgba(120,180,255,0)    0deg,
    rgba(150,205,255,.17)  1.1deg,
    rgba(214,236,255,.34)  1.9deg,
    rgba(150,205,255,.17)  2.7deg,
    rgba(120,180,255,0)    3.9deg
  );
  transform-origin: 22% 56%;
  filter: blur(calc(var(--u) * .22));
  -webkit-mask-image: radial-gradient(ellipse 62% 30% at 34% 56%, #000 14%, rgba(0,0,0,.5) 52%, transparent 84%);
  mask-image: radial-gradient(ellipse 62% 30% at 34% 56%, #000 14%, rgba(0,0,0,.5) 52%, transparent 84%);
  animation: smt-fan 54s ease-in-out infinite alternate;
}

.smt-core {
  background:
    radial-gradient(ellipse 44% 8% at 41% 56%, rgba(255,255,255,.92), rgba(180,215,255,.40) 38%, transparent 74%),
    radial-gradient(ellipse 64% 26% at 34% 56%, rgba(50,115,255,.42), transparent 72%);
  animation: smt-pulse 9s ease-in-out infinite;
}

/* A soft highlight tracking along the beam. This is the element doing the
   burn-in work: on a panel showing one image for three hours, the bright band
   is the part at risk, and this keeps it moving. */
.smt-sweep {
  background: radial-gradient(ellipse 20% 26% at 50% 56%, rgba(255,255,255,.15), transparent 70%);
  animation: smt-sweep 21s ease-in-out infinite;
}

.smt-vignette {
  background: radial-gradient(ellipse 90% 94% at 45% 52%, transparent 36%, rgba(0,0,0,.66) 100%);
}

/* Dither. Wide dark gradients band visibly on a large 8-bit panel; a little
   noise over the top breaks the steps up. */
.smt-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .05;
  mix-blend-mode: overlay;
}

@keyframes smt-fan   { from { transform: rotate(-1.15deg); } to { transform: rotate(1.15deg); } }
@keyframes smt-pulse { 0%,100% { opacity: .84; } 50% { opacity: 1; } }
@keyframes smt-sweep { 0%,100% { transform: translateX(-17%); } 50% { transform: translateX(25%); } }
/* Whole-frame drift, ~1.5px at 1080p. Invisible to a viewer, enough to keep
   the type off one fixed set of pixels for three hours. */
@keyframes smt-drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(calc(var(--u) * .09), calc(var(--u) * -.07), 0); } }

/* ---- content ---- */

.smt-frame {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: calc(var(--u) * 4.4) calc(var(--u) * 5.6);
  animation: smt-drift 96s ease-in-out infinite;
}

.smt-top { display: flex; justify-content: flex-end; min-height: calc(var(--u) * 7); }

.smt-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--u) * .5);
  padding: calc(var(--u) * 1.1) calc(var(--u) * 1.8);
  border: 1px solid rgba(255,255,255,.16);
  border-radius: calc(var(--u) * .7);
  background: rgba(4,10,30,.42);
  backdrop-filter: blur(calc(var(--u) * .5));
}
.smt-label {
  display: inline-flex; align-items: center; gap: calc(var(--u) * .6);
  font-size: calc(var(--u) * 1.05);
  font-weight: 600;
  letter-spacing: .26em;
  text-transform: uppercase;
  color: rgba(255,255,255,.62);
}
.smt-dot {
  width: calc(var(--u) * .6); height: calc(var(--u) * .6);
  border-radius: 50%; background: #ff3d8b;
  box-shadow: 0 0 calc(var(--u) * .9) #ff3d8b;
  animation: smt-pulse 2s ease-in-out infinite;
}
.smt-count {
  font-size: calc(var(--u) * 2.5);
  font-weight: 700;
  letter-spacing: .01em;
  font-variant-numeric: tabular-nums;
}
.smt-count-sm { font-size: calc(var(--u) * 1.5); letter-spacing: .06em; }

.smt-lockup {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: skewX(-9deg);   /* the key art's oblique, set rather than synthesised */
}
.smt-eyebrow {
  font-size: calc(var(--u) * 3.5);
  font-weight: 500;
  letter-spacing: .055em;
  text-transform: uppercase;
  color: rgba(255,255,255,.94);
  line-height: 1;
}
.smt-title {
  font-size: calc(var(--u) * 8.9);
  font-weight: 800;
  letter-spacing: -.012em;
  text-transform: uppercase;
  line-height: .95;
  margin: calc(var(--u) * .5) 0 calc(var(--u) * 1.5);
  text-shadow: 0 0 calc(var(--u) * 3.4) rgba(80,150,255,.42);
}
.smt-presenter {
  font-size: calc(var(--u) * 1.62);
  font-weight: 600;
  letter-spacing: .17em;
  text-transform: uppercase;
  color: rgba(255,255,255,.9);
}

.smt-foot { display: flex; flex-direction: column; align-items: center; gap: calc(var(--u) * 1.15); }

.smt-agenda {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: calc(var(--u) * .7) calc(var(--u) * 2.4);
  margin-bottom: calc(var(--u) * .6);
}
.smt-seg {
  display: inline-flex; align-items: baseline; gap: calc(var(--u) * .75);
  font-size: calc(var(--u) * 1.5); font-weight: 600; letter-spacing: .02em;
}
.smt-seg b {
  font-size: calc(var(--u) * .95); font-weight: 700;
  letter-spacing: .24em; text-transform: uppercase;
  color: var(--ice);
}
.smt-seg i { font-style: normal; font-weight: 400; color: rgba(255,255,255,.55); }
.smt-seg-next { opacity: .5; }

.smt-when {
  font-size: calc(var(--u) * 2.02);
  font-weight: 700; letter-spacing: .085em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: calc(var(--u) * 1.15);
}
.smt-when span { color: rgba(255,255,255,.32); font-weight: 400; }
.smt-where {
  font-size: calc(var(--u) * 1.62);
  font-weight: 600; letter-spacing: .105em; text-transform: uppercase;
  color: rgba(255,255,255,.82);
}

.smt-sponsors {
  display: flex; align-items: center; flex-wrap: wrap; justify-content: center;
  gap: calc(var(--u) * 3);
  margin-top: calc(var(--u) * 1.5);
  padding-top: calc(var(--u) * 1.9);
  border-top: 1px solid rgba(255,255,255,.14);
  width: 100%;
}
.smt-sponsor {
  display: inline-flex; align-items: center;
  font-size: calc(var(--u) * 1.55);
  font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
  color: rgba(255,255,255,.72);
}
.smt-logo { height: calc(var(--u) * 2.4); width: auto; object-fit: contain; }
.smt-logo-wide { height: calc(var(--u) * 2.9); }

.smt-fs {
  position: absolute;
  right: calc(var(--u) * 1.6); bottom: calc(var(--u) * 1.6);
  display: inline-flex; align-items: center; gap: calc(var(--u) * .6);
  padding: calc(var(--u) * .7) calc(var(--u) * 1.2);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: calc(var(--u) * .5);
  background: rgba(4,10,30,.6);
  color: rgba(255,255,255,.8);
  font: inherit; font-size: calc(var(--u) * .95);
  letter-spacing: .16em; text-transform: uppercase;
  cursor: pointer;
  transition: opacity .4s ease;
}
.smt-fs kbd {
  font: inherit; font-size: calc(var(--u) * .8);
  padding: 0 calc(var(--u) * .35);
  border: 1px solid rgba(255,255,255,.28); border-radius: calc(var(--u) * .25);
}
.smt-idle .smt-fs { opacity: 0; pointer-events: none; }

@media (prefers-reduced-motion: reduce) {
  .smt-rays, .smt-core, .smt-sweep, .smt-frame, .smt-dot { animation: none; }
}
`
