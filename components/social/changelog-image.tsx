export function ChangelogImage() {
  return (
    <div
      style={{
        width: "1080px",
        height: "1350px",
        background: "#ffffff",
        fontFamily: "'Geist Sans', 'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          pointerEvents: "none",
        }}
      />

      {/* Top accent gradient bar */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #4d8eff, #ff4d9a, #ff6b35)",
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "40px 56px 0 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
            alt="DEVSA"
            style={{ width: "44px", height: "44px" }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#111111",
              letterSpacing: "-0.02em",
            }}
          >
            devsa.community
          </span>
        </div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#999999",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          Changelog
        </span>
      </div>

      {/* Title section */}
      <div
        style={{
          padding: "32px 56px 0 56px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 900,
            color: "#0a0a0a",
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            margin: 0,
          }}
        >
          What&apos;s New
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#777777",
            marginTop: "10px",
            fontWeight: 500,
            letterSpacing: "0.01em",
            lineHeight: 1.5,
          }}
        >
          Platform updates across devsa.community
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          margin: "28px 56px 0 56px",
          height: "1px",
          background: "linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 100%)",
        }}
      />

      {/* Changelog items */}
      <div
        style={{
          padding: "24px 56px 0 56px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 1. Community Calendar */}
        <ChangelogEntry
          tag="Events"
          tagColor="#4d8eff"
          title="Community Calendar"
          highlight={false}
          items={[
            "RSS feed — subscribe in any reader",
            "Embeddable calendar widget for your website",
            "iCal subscribe or add individual events",
            "Organizer tools — dedicated slug pages with bio, links, and RSVP management",
          ]}
        />

        {/* 2. Coworking Space — milestone */}
        <ChangelogEntry
          tag="Coworking"
          tagColor="#ff4d9a"
          title="Coworking Space — Web to Discord Messaging"
          highlight={true}
          items={[
            "Discord bot monitors #coworking-space channel in real time",
            "Live open / closed status updates on the website",
            "Message an admin directly from the web — delivered straight to Discord",
          ]}
        />

        {/* 3. Shop — milestone */}
        <ChangelogEntry
          tag="Shop"
          tagColor="#ff6b35"
          title="Shop is Back — Printify API + Stripe Checkout"
          highlight={true}
          items={[
            "Printify API powers the product catalog and order fulfillment",
            "Stripe Checkout with webhook-driven order processing",
            "PSF granted commercial use of the Python logo — thank you!",
          ]}
        />

        {/* 4. Job Board — milestone */}
        <ChangelogEntry
          tag="Job Board"
          tagColor="#4d8eff"
          title="Job Board — The Opportunity Pipeline"
          highlight={true}
          items={[
            "Post once — auto-shared to Discord and LinkedIn",
            "Full applicant pipeline — apply, track, message, hire",
            "Employer dashboard with application status management",
            "Saved jobs, in-app notifications, and comment threads",
          ]}
        />

        {/* 5. Building Together */}
        <ChangelogEntry
          tag="Community"
          tagColor="#ff4d9a"
          title="Building Together"
          highlight={false}
          items={[
            "Meet the Team — a 501(c)(3) nonprofit built on education",
            "20+ community groups in one ecosystem",
          ]}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "28px 56px 40px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: "#aaaaaa",
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          devsa.community
        </span>
        <span
          style={{
            fontSize: "14px",
            color: "#aaaaaa",
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          San Antonio&apos;s Tech Community
        </span>
      </div>

      {/* Bottom accent gradient bar */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #ff6b35, #ff4d9a, #4d8eff)",
          flexShrink: 0,
        }}
      />
    </div>
  )
}

function ChangelogEntry({
  tag,
  tagColor,
  title,
  items,
  highlight,
}: {
  tag: string
  tagColor: string
  title: string
  items: string[]
  highlight: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: highlight ? "22px 24px 20px 24px" : "18px 24px 16px 24px",
        borderRadius: "14px",
        background: highlight ? "#fafafa" : "#fdfdfd",
        border: highlight
          ? `1px solid ${tagColor}30`
          : "1px solid #f0f0f0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Highlight accent bar */}
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "3px",
            background: tagColor,
          }}
        />
      )}

      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: highlight ? "20px" : "18px",
            fontWeight: 800,
            color: "#111111",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            color: tagColor,
            background: `${tagColor}14`,
            padding: "3px 10px",
            borderRadius: "5px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {tag}
        </span>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span
              style={{
                color: tagColor,
                fontSize: "14px",
                lineHeight: "24px",
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              ▸
            </span>
            <span
              style={{
                fontSize: "15px",
                color: highlight ? "#444444" : "#666666",
                lineHeight: "24px",
                fontWeight: 500,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
