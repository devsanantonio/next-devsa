import { ImageResponse } from "next/og"

export const runtime = "nodejs"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          padding: "0",
          position: "relative",
          fontFamily: "monospace",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* Main layout — two columns */}
        <div
          style={{
            display: "flex",
            flex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          {/* LEFT COLUMN — logo + event info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "52px 48px 44px 56px",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Top badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Vercel triangle */}
              <svg width="16" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 1.608l12 20.784H0z" />
              </svg>
              <span
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase" as const,
                }}
              >
                Pop-Up Event · DEVSA
              </span>
            </div>

            {/* Wordmark SVG — actual logo */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <svg
                viewBox="0 0 608 99"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 460, height: 75 }}
              >
                {/* "zero to" portion — muted grey */}
                <path
                  d="M0.920054 81.0244V71.1489L43.5645 10.7733H2.37894V1.34664H54.5623V11.2222L11.9178 71.5977H55.6845V81.0244H0.920054ZM81.2396 82.3711C64.4063 82.3711 53.9696 70.1389 53.9696 51.2855C53.9696 32.4322 64.4063 20.2 80.7907 20.2C96.2774 20.2 107.051 31.4222 107.051 51.3977V54.2033H63.8452C64.5185 66.9966 70.9152 73.3933 81.2396 73.3933C88.9829 73.3933 94.0329 69.4655 96.0529 63.4055L106.153 64.1911C103.011 74.8522 93.8085 82.3711 81.2396 82.3711ZM63.8452 45.8989H96.7263C95.8285 34.4522 89.544 29.1777 80.7907 29.1777C71.5885 29.1777 65.4163 34.9011 63.8452 45.8989ZM112.525 81.0244V21.5466H120.829L121.166 32.5444C123.298 25.0255 128.012 21.5466 135.306 21.5466H141.142V30.5244H135.418C126.441 30.5244 121.952 35.35 121.952 45.1133V81.0244H112.525ZM167.611 82.3711C151.115 82.3711 140.341 70.2511 140.341 51.2855C140.341 32.32 151.115 20.2 167.611 20.2C183.996 20.2 194.769 32.32 194.769 51.2855C194.769 70.2511 183.996 82.3711 167.611 82.3711ZM167.611 73.3933C178.497 73.3933 184.893 65.0889 184.893 51.2855C184.893 37.4822 178.497 29.1777 167.611 29.1777C156.613 29.1777 150.217 37.4822 150.217 51.2855C150.217 65.0889 156.613 73.3933 167.611 73.3933ZM248.438 81.0244C237.665 81.0244 232.615 76.3111 232.615 65.7622V29.8511H223.862V21.5466H232.615V7.63108H242.042V21.5466H257.865V29.8511H242.042V65.5377C242.042 70.9244 244.398 72.72 249.336 72.72H257.865V81.0244H248.438ZM284.796 82.3711C268.299 82.3711 257.526 70.2511 257.526 51.2855C257.526 32.32 268.299 20.2 284.796 20.2C301.18 20.2 311.954 32.32 311.954 51.2855C311.954 70.2511 301.18 82.3711 284.796 82.3711ZM284.796 73.3933C295.681 73.3933 302.078 65.0889 302.078 51.2855C302.078 37.4822 295.681 29.1777 284.796 29.1777C273.798 29.1777 267.401 37.4822 267.401 51.2855C267.401 65.0889 273.798 73.3933 284.796 73.3933Z"
                  fill="#6B6C70"
                />
                {/* "agent" pixel portion — white */}
                <path
                  d="M376.089 42.6444V29.8511H371.824V17.0577H363.295V29.8511H359.031V42.6444H354.767V46.9089H380.353V42.6444H376.089ZM337.709 81.0244V68.2311H341.973V55.4377H346.238V42.6444H350.502V29.8511H354.767V17.0577H359.031V8.52886H363.295V-3.12715e-05H371.824V8.52886H376.089V17.0577H380.353V29.8511H384.618V42.6444H388.882V55.4377H393.147V68.2311H397.411V81.0244H388.882V68.2311H384.618V55.4377H350.502V68.2311H346.238V81.0244H337.709ZM407.219 68.2311V63.9666H402.955V34.1155H407.219V29.8511H411.483V25.5866H415.748V21.3222H437.07V25.5866H441.335V29.8511H420.012V34.1155H415.748V38.38H411.483V59.7022H415.748V63.9666H420.012V68.2311H441.335V72.4955H437.07V76.76H415.748V72.4955H411.483V68.2311H407.219ZM402.955 89.5533V81.0244H411.483V85.2889H415.748V89.5533H441.335V85.2889H445.599V68.2311H441.335V59.7022H445.599V38.38H441.335V29.8511H445.599V21.3222H454.128V89.5533H449.863V93.8177H441.335V98.0822H415.748V93.8177H407.219V89.5533H402.955ZM470.445 38.38V46.9089H504.56V38.38H500.296V34.1155H496.032V29.8511H478.974V34.1155H474.709V38.38H470.445ZM466.18 72.4955V63.9666H461.916V38.38H466.18V29.8511H470.445V25.5866H474.709V21.3222H500.296V25.5866H504.56V29.8511H508.825V38.38H513.089V55.4377H470.445V63.9666H474.709V68.2311H478.974V72.4955H500.296V68.2311H504.56V63.9666H513.089V72.4955H508.825V76.76H500.296V81.0244H474.709V76.76H470.445V72.4955H466.18ZM520.858 81.0244V21.3222H529.387V29.8511H533.651V34.1155H529.387V81.0244H520.858ZM559.238 81.0244V34.1155H554.974V29.8511H533.651V25.5866H537.916V21.3222H559.238V25.5866H563.502V29.8511H567.767V81.0244H559.238ZM581.83 72.4955V29.8511H573.301V21.3222H581.83V8.52886H590.359V21.3222H607.416V29.8511H590.359V72.4955H607.416V81.0244H590.359V76.76H586.094V72.4955H581.83Z"
                  fill="white"
                />
              </svg>

              {/* Date + location row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  marginTop: 18,
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 14,
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  04.25.26
                </span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                  /
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 14,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    fontWeight: 500,
                  }}
                >
                  San Antonio/TX
                </span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                  /
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 14,
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                  }}
                >
                  Geekdom · 3F
                </span>
              </div>
            </div>

            {/* Tagline + perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p
                style={{
                  fontSize: 26,
                  color: "rgba(255,255,255,0.85)",
                  margin: 0,
                  lineHeight: 1.35,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                Find Your People.
                <br />
                Build Your Future.
              </p>

              {/* Perk chips */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                {[
                  "$30 v0 Credits",
                  "$6K+ Prize Pool",
                  "Limited Edition Swag",
                ].map((perk) => (
                  <div
                    key={perk}
                    style={{
                      display: "flex",
                      padding: "6px 14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — three track cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 340,
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                padding: "18px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                }}
              >
                Choose Your Track
              </span>
            </div>

            {/* Track 1 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "22px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  fontWeight: 600,
                }}
              >
                WDK
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  The Efficiency Win
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  Durable agents that never sleep
                </span>
              </div>
            </div>

            {/* Track 2 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "22px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  fontWeight: 600,
                }}
              >
                v0 + MCP
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  The UI Breakthrough
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  Real-world data in minutes
                </span>
              </div>
            </div>

            {/* Track 3 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "22px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  fontWeight: 600,
                }}
              >
                ChatSDK
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  The Connection Spark
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  Agents that live where you work
                </span>
              </div>
            </div>

            {/* Powered by footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "16px 28px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* v0 logo */}
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="rgba(255,255,255,0.25)"
              >
                <path d="M14.066 6.028v2.22h5.729q.075-.001.148.005l-5.853 5.752a2 2 0 01-.024-.309V8.247h-2.353v5.45c0 2.322 1.935 4.222 4.258 4.222h5.675v-2.22h-5.675q-.03 0-.059-.003l5.729-5.629q.006.082.006.166v5.465H24v-5.465a4.204 4.204 0 00-4.205-4.205zM0 8.245l8.28 9.266c.839.94 2.396.346 2.396-.914V8.245H8.19v5.44l-4.86-5.44z" />
              </svg>
              <span
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  fontWeight: 500,
                }}
              >
                Powered by
              </span>
              {/* Vercel triangle */}
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="rgba(255,255,255,0.25)"
              >
                <path d="M12 1.608l12 20.784H0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Vercel triangle */}
            <svg width="20" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 1.608l12 20.784H0z" />
            </svg>
            <span
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
              }}
            >
              Vercel Community Event
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              04.25.26
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 16,
              }}
            >
              |
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}
            >
              San Antonio/TX
            </span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Zero to Agent wordmark */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 300,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              zero to
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                textTransform: "uppercase" as const,
              }}
            >
              AGENT
            </div>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.6)",
              margin: 0,
              marginTop: 32,
              maxWidth: 700,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Find Your People. Build Your Future.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>
                $30 v0 Credits
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>
              $6K+ Prize Pool
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>
              Limited Edition Swag
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
              }}
            >
              Powered by
            </span>
            <svg width="16" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
              <path d="M12 1.608l12 20.784H0z" />
            </svg>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
