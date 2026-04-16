"use client"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

function V0Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
      <path d="M14.066 6.028v2.22h5.729q.075-.001.148.005l-5.853 5.752a2 2 0 01-.024-.309V8.247h-2.353v5.45c0 2.322 1.935 4.222 4.258 4.222h5.675v-2.22h-5.675q-.03 0-.059-.003l5.729-5.629q.006.082.006.166v5.465H24v-5.465a4.204 4.204 0 00-4.205-4.205zM0 8.245l8.28 9.266c.839.94 2.396.346 2.396-.914V8.245H8.19v5.44l-4.86-5.44z" />
    </svg>
  )
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
      <path d="M12 1.608l12 20.784H0z" />
    </svg>
  )
}

function ZeroToAgentLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 608 99" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.920054 81.0244V71.1489L43.5645 10.7733H2.37894V1.34664H54.5623V11.2222L11.9178 71.5977H55.6845V81.0244H0.920054ZM81.2396 82.3711C64.4063 82.3711 53.9696 70.1389 53.9696 51.2855C53.9696 32.4322 64.4063 20.2 80.7907 20.2C96.2774 20.2 107.051 31.4222 107.051 51.3977V54.2033H63.8452C64.5185 66.9966 70.9152 73.3933 81.2396 73.3933C88.9829 73.3933 94.0329 69.4655 96.0529 63.4055L106.153 64.1911C103.011 74.8522 93.8085 82.3711 81.2396 82.3711ZM63.8452 45.8989H96.7263C95.8285 34.4522 89.544 29.1777 80.7907 29.1777C71.5885 29.1777 65.4163 34.9011 63.8452 45.8989ZM112.525 81.0244V21.5466H120.829L121.166 32.5444C123.298 25.0255 128.012 21.5466 135.306 21.5466H141.142V30.5244H135.418C126.441 30.5244 121.952 35.35 121.952 45.1133V81.0244H112.525ZM167.611 82.3711C151.115 82.3711 140.341 70.2511 140.341 51.2855C140.341 32.32 151.115 20.2 167.611 20.2C183.996 20.2 194.769 32.32 194.769 51.2855C194.769 70.2511 183.996 82.3711 167.611 82.3711ZM167.611 73.3933C178.497 73.3933 184.893 65.0889 184.893 51.2855C184.893 37.4822 178.497 29.1777 167.611 29.1777C156.613 29.1777 150.217 37.4822 150.217 51.2855C150.217 65.0889 156.613 73.3933 167.611 73.3933ZM248.438 81.0244C237.665 81.0244 232.615 76.3111 232.615 65.7622V29.8511H223.862V21.5466H232.615V7.63108H242.042V21.5466H257.865V29.8511H242.042V65.5377C242.042 70.9244 244.398 72.72 249.336 72.72H257.865V81.0244H248.438ZM284.796 82.3711C268.299 82.3711 257.526 70.2511 257.526 51.2855C257.526 32.32 268.299 20.2 284.796 20.2C301.18 20.2 311.954 32.32 311.954 51.2855C311.954 70.2511 301.18 82.3711 284.796 82.3711ZM284.796 73.3933C295.681 73.3933 302.078 65.0889 302.078 51.2855C302.078 37.4822 295.681 29.1777 284.796 29.1777C273.798 29.1777 267.401 37.4822 267.401 51.2855C267.401 65.0889 273.798 73.3933 284.796 73.3933Z" fill="#ADAEB2" />
      <path d="M376.089 42.6444V29.8511H371.824V17.0577H363.295V29.8511H359.031V42.6444H354.767V46.9089H380.353V42.6444H376.089ZM337.709 81.0244V68.2311H341.973V55.4377H346.238V42.6444H350.502V29.8511H354.767V17.0577H359.031V8.52886H363.295V-3.12715e-05H371.824V8.52886H376.089V17.0577H380.353V29.8511H384.618V42.6444H388.882V55.4377H393.147V68.2311H397.411V81.0244H388.882V68.2311H384.618V55.4377H350.502V68.2311H346.238V81.0244H337.709ZM407.219 68.2311V63.9666H402.955V34.1155H407.219V29.8511H411.483V25.5866H415.748V21.3222H437.07V25.5866H441.335V29.8511H420.012V34.1155H415.748V38.38H411.483V59.7022H415.748V63.9666H420.012V68.2311H441.335V72.4955H437.07V76.76H415.748V72.4955H411.483V68.2311H407.219ZM402.955 89.5533V81.0244H411.483V85.2889H415.748V89.5533H441.335V85.2889H445.599V68.2311H441.335V59.7022H445.599V38.38H441.335V29.8511H445.599V21.3222H454.128V89.5533H449.863V93.8177H441.335V98.0822H415.748V93.8177H407.219V89.5533H402.955ZM470.445 38.38V46.9089H504.56V38.38H500.296V34.1155H496.032V29.8511H478.974V34.1155H474.709V38.38H470.445ZM466.18 72.4955V63.9666H461.916V38.38H466.18V29.8511H470.445V25.5866H474.709V21.3222H500.296V25.5866H504.56V29.8511H508.825V38.38H513.089V55.4377H470.445V63.9666H474.709V68.2311H478.974V72.4955H500.296V68.2311H504.56V63.9666H513.089V72.4955H508.825V76.76H500.296V81.0244H474.709V76.76H470.445V72.4955H466.18ZM520.858 81.0244V21.3222H529.387V29.8511H533.651V34.1155H529.387V81.0244H520.858ZM559.238 81.0244V34.1155H554.974V29.8511H533.651V25.5866H537.916V21.3222H559.238V25.5866H563.502V29.8511H567.767V81.0244H559.238ZM581.83 72.4955V29.8511H573.301V21.3222H581.83V8.52886H590.359V21.3222H607.416V29.8511H590.359V72.4955H607.416V81.0244H590.359V76.76H586.094V72.4955H581.83Z" fill="currentColor" />
    </svg>
  )
}

export function FeaturedZeroToAgent() {
  return (
    <section className="relative bg-black overflow-hidden min-h-dvh lg:h-dvh flex flex-col" data-bg-type="dark">
      {/* Top accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent shrink-0" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-16 pb-6 lg:pt-0 lg:py-10 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Intro text */}
          <div className="flex items-center gap-2 mb-6">
              <VercelLogo className="w-4 h-4 text-white" />
              <span className="font-geist-pixel-square text-xs font-medium uppercase tracking-[0.2em] text-white/70 leading-none">
                Vercel Community Event
              </span>
            </div>

          <div className="relative border border-white/10 overflow-hidden bg-black">
            {/* Content grid */}
            <div className="relative z-10 grid lg:grid-cols-2">
              {/* Left — branding */}
              <div className="relative overflow-hidden bg-black">
                
                {/* Content overlay */}
                <div className="relative z-10 flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-12 h-full">
                  <ZeroToAgentLogo className="w-full max-w-xl text-white" />
                  {/* Date + location */}
                  <div className="flex items-center justify-between w-full max-w-xl">
                    <span className="font-geist-mono text-sm sm:text-base text-white/50 tracking-wider">
                      04.25.26
                    </span>
                    <span className="font-geist-mono text-sm sm:text-base text-white/50 uppercase tracking-wider">
                      San Antonio/TX
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — event details */}
              <div className="relative border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-black/40 backdrop-blur-sm">
                <div className="space-y-3">
                {/* Top badge */}
                <div className="flex items-center gap-3 mb-8">
                  <VercelLogo className="w-3.5 h-3.5 text-white/50" />
                  <span className="font-geist-mono text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.25em] text-white/50 leading-none">
                    02A/Global Build Week
                  </span>
                </div>
                  <div className="space-y-1.5">
                    <p className="font-geist-pixel-square text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-white/50 leading-none">
                      Date &amp; Time
                    </p>
                    <p className="font-geist-mono text-white text-sm sm:text-base font-medium leading-relaxed">
                      April 25, 2026 &middot; 12:00 PM – 2:30 PM CT
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-geist-pixel-square text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-white/50 leading-none">
                      Location
                    </p>
                    <p className="font-geist-mono text-white text-sm sm:text-base font-medium leading-relaxed">
                      Geekdom &middot; 3rd Floor
                    </p>
                    <p className="font-geist-mono text-white/40 text-xs font-normal leading-relaxed">
                      San Antonio, TX
                    </p>
                  </div>

                  <div className="h-px w-full bg-white/10 my-4" />

                  <p className="text-white/60 text-sm font-normal leading-relaxed max-w-md">
                    DEVSA is the San Antonio community partner for{" "}
                    <span className="text-white font-medium">Zero to Agent</span>—a
                    10-day global build week. We&apos;re bringing{" "}
                    <V0Logo className="inline-block w-4 h-4 text-white align-text-bottom" />{" "}
                    powered by{" "}
                    <VercelLogo className="inline-block w-3 h-3 text-white" />{" "}
                    to the heart of downtown at{" "}
                    <span className="text-white font-medium">Geekdom</span>.
                  </p>
                  <p className="text-white/60 text-sm font-normal leading-relaxed max-w-md">
                    From idea to deployed agent, this is your chance to ship something real.
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="https://luma.com/hwfvt791"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex items-center gap-2.5 bg-white text-black text-sm font-medium uppercase tracking-wider px-6 py-3 transition-all hover:bg-white/90 active:scale-[0.98] w-fit"
                >
                  <span className="font-geist-pixel-square leading-none">Register</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <div className="mt-5 flex items-center gap-3">
                  <V0Logo className="w-4 h-4 text-white/30" />
                  <span className="font-geist-mono text-[10px] font-normal text-white/30 uppercase tracking-[0.15em] leading-none">
                    Powered by
                  </span>
                  <VercelLogo className="w-3 h-3 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent shrink-0" />
    </section>
  )
}
