"use client"

import * as React from "react"

/**
 * Check-ins that haven't reached the server yet, for the check-in screen
 * (components/admin/checkin-door.tsx). Ported from next-sasw, where it was built
 * for the same door.
 *
 * Venue wifi drops. Without this every tap failed, the row snapped back, and
 * whoever was on the door couldn't tell whether it had saved. Failed writes are
 * held in localStorage instead and replayed when the network returns: on the
 * browser's `online` event and on a slow timer, since `online` also fires for a
 * connected-but-useless network. It doesn't survive a reload while offline
 * (Next can't serve the page without a connection), only a flaky few minutes.
 *
 * Every operation is safe to send twice: a check-in sets or clears a timestamp,
 * and a walk-in carries a clientId the server turns into its document id.
 */
const KEY = "devsa.checkin.queue.v1"
const EVENT = "devsa:checkin-queue"

export type QueuedOp =
  | { kind: "checkIn"; clientId: string; rsvpId: string; came: boolean; name: string }
  | { kind: "walkIn"; clientId: string; eventId: string; firstName: string; lastName: string; email: string }

let cachedRaw: string | null = null
let cachedOps: QueuedOp[] = []
const EMPTY: QueuedOp[] = []

function rawQueue(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null // private mode or blocked storage: the door still works, it just can't hold a queue
  }
}

function read(): QueuedOp[] {
  const raw = rawQueue()
  if (raw === cachedRaw) return cachedOps
  cachedRaw = raw
  try {
    cachedOps = raw ? (JSON.parse(raw) as QueuedOp[]) : EMPTY
  } catch {
    cachedOps = EMPTY
  }
  return cachedOps
}

function write(ops: QueuedOp[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ops))
  } catch {
    /* see rawQueue */
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribeQueue(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange) // a second tab on the same device
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange)
  window.addEventListener("offline", onChange)
  return () => {
    window.removeEventListener("online", onChange)
    window.removeEventListener("offline", onChange)
  }
}

export function newClientId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * `send` resolves with the server's answer, and throws only when the network
 * itself failed: that is what gets queued. A refusal is an answer, not a retry.
 */
export function useCheckinQueue(send: (op: QueuedOp) => Promise<{ ok: boolean; error?: string }>) {
  const queue = React.useSyncExternalStore(subscribeQueue, read, () => EMPTY)
  const online = React.useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)

  const draining = React.useRef(false)
  const sendRef = React.useRef(send)
  React.useEffect(() => {
    sendRef.current = send
  })

  const drain = React.useCallback(async () => {
    if (draining.current) return
    draining.current = true
    try {
      let ops = read()
      while (ops.length > 0) {
        const [head, ...rest] = ops
        try {
          await sendRef.current(head)
        } catch {
          break // still offline: keep everything, try later
        }
        ops = rest // answered, refusal included, so one bad op can't block the rest
        write(ops)
      }
    } finally {
      draining.current = false
    }
  }, [])

  React.useEffect(() => {
    const up = () => void drain()
    window.addEventListener("online", up)
    const timer = setInterval(() => void drain(), 15000)
    return () => {
      window.removeEventListener("online", up)
      clearInterval(timer)
    }
  }, [drain])

  /** Try now; keep it for later if the network is what refused. */
  const run = React.useCallback(async (op: QueuedOp): Promise<{ ok: boolean; queued: boolean; error?: string }> => {
    try {
      const res = await sendRef.current(op)
      return { ok: res.ok, queued: false, error: res.error }
    } catch {
      write([...read(), op])
      return { ok: false, queued: true }
    }
  }, [])

  return { queue, online, run, retry: drain }
}
