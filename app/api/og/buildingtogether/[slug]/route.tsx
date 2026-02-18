import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { partners } from "@/data/partners"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"

export const runtime = "nodejs"

/* Shared header component style for OG images */
function OgHeader({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 48,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 6,
            height: 32,
            backgroundColor: "#ef426f",
            borderRadius: 3,
            display: "flex",
          }}
        />
        <span
          style={{
            color: dark ? "#ffffff" : "#111827",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          DEVSA
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: dark ? "rgba(239, 66, 111, 0.15)" : "#fef2f2",
          border: "2px solid #ef426f",
          borderRadius: 24,
          padding: "8px 22px",
        }}
      >
        <span
          style={{
            color: "#ef426f",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Check if it's a community (from Firestore)
  let community: { id: string; name: string; logo: string; description: string } | null = null
  try {
    const db = getDb()
    const doc = await db.collection(COLLECTIONS.COMMUNITIES).doc(slug).get()
    if (doc.exists) {
      const data = doc.data()
      community = { id: doc.id, name: data?.name, logo: data?.logo, description: data?.description }
    }
  } catch {}
  
  if (community) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#111827",
            padding: "56px 64px",
          }}
        >
          <OgHeader label="Tech Group" dark />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              gap: 48,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 200,
                height: 200,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 24,
                padding: 24,
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <img
                src={community.logo}
                alt={community.name}
                width={160}
                height={160}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: community.name.length > 25 ? 48 : 58,
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  margin: 0,
                  marginBottom: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                {community.name}
              </h1>

              <p
                style={{
                  fontSize: 21,
                  color: "#9ca3af",
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 400,
                  maxWidth: 650,
                }}
              >
                {community.description.slice(0, 200)}
                {community.description.length > 200 ? "..." : ""}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 24,
              borderTop: "2px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#9ca3af", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
                Building
              </span>
              <span style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
                Together
              </span>
            </div>
            <span style={{ color: "#6b7280", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
              devsa.community/buildingtogether/{slug}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Check if it's a partner
  const partner = partners.find((p) => p.id === slug)
  if (partner) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            padding: "56px 64px",
          }}
        >
          <OgHeader label="Partner" />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              gap: 48,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 200,
                height: 200,
                backgroundColor: "#f9fafb",
                borderRadius: 24,
                padding: 24,
                border: "1px solid #f3f4f6",
              }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={160}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: partner.name.length > 25 ? 48 : 58,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.2,
                  margin: 0,
                  marginBottom: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                {partner.name}
              </h1>

              <p
                style={{
                  fontSize: 21,
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 400,
                  maxWidth: 650,
                }}
              >
                {partner.description.slice(0, 200)}
                {partner.description.length > 200 ? "..." : ""}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 24,
              borderTop: "2px solid #f3f4f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#9ca3af", fontSize: 17, fontWeight: 400, lineHeight: 1.4 }}>
                Building
              </span>
              <span style={{ color: "#111827", fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
                Together
              </span>
            </div>
            <span style={{ color: "#9ca3af", fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
              devsa.community/buildingtogether/{slug}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Fallback for unknown slugs
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          gap: 16,
        }}
      >
        <span style={{ color: "#ef426f", fontSize: 28, fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.4 }}>
          DEVSA
        </span>
        <span style={{ color: "#ffffff", fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Community
        </span>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
