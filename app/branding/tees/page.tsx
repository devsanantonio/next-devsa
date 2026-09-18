import type { Metadata } from "next"
import { TeeStudio } from "@/components/branding/tee-studio"

export const metadata: Metadata = {
  title: "T-Shirt Designs",
  description:
    "DEVSA apparel artwork — print-ready designs for black and white tees, with PNG and SVG exports for Printify.",
  robots: { index: false, follow: false },
}

export default function TeesPage() {
  return <TeeStudio />
}
