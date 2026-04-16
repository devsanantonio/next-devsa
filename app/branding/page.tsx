import type { Metadata } from "next"
import { BrandingKitPage } from "@/components/branding/branding-kit-page"

export const metadata: Metadata = {
  title: "Branding Kit",
  description:
    "Official DEVSA branding guidelines, logos, colors, and typography. Download assets for press, partnerships, and community use.",
}

export default function BrandingPage() {
  return <BrandingKitPage />
}
