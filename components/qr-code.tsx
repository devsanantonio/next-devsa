"use client"

import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

/**
 * Branded QR code rendered on a white card so it scans reliably off a glowing
 * booth monitor or a printout. Codes are generated client-side (no network),
 * which matters for a conference table on flaky wifi.
 *
 * `value` should be a fully-qualified URL. Add a `?src=` tag at the call site
 * so scan sources can be told apart in analytics.
 */
export function QRCode({
  value,
  label,
  size = 160,
  className,
}: {
  value: string
  label?: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5",
        className
      )}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        marginSize={2}
        className="h-auto w-full max-w-full rounded-lg"
      />
      {label && (
        <span className="text-center text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
          {label}
        </span>
      )}
    </div>
  )
}
