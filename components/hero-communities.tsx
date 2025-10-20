"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { useState, useRef } from "react"
import { X, ExternalLink, MessageCircle } from "lucide-react"
import { GlowingEffect } from "./glowing-effect"

interface TechCommunity {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  discord?: string
  instagram?: string
  twitter?: string
  meetup?: string
}

interface CommunityModalProps {
  community: TechCommunity | null
  isOpen: boolean
  onClose: () => void
}

function CommunityModal({ community, isOpen, onClose }: CommunityModalProps) {
  if (!community || !isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-70 flex items-center justify-center p-4"
      >
        <div className="relative w-80 h-96">
          <GlowingEffect
            disabled={false}
            proximity={100}
            spread={40}
            blur={1}
            movementDuration={2}
            borderWidth={2}
            className="rounded-2xl"
          />
          <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl flex flex-col overflow-hidden h-full shadow-2xl">
            <div className="relative h-32 bg-gradient-to-br from-neutral-50 to-neutral-100">
              <img
                src={community.logo || "/placeholder.svg"}
                alt={community.name}
                className="w-full h-full object-contain p-4"
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-600 hover:text-neutral-900 transition-colors bg-white/80 hover:bg-white rounded-full p-2 backdrop-blur-sm shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="text-neutral-900 text-xl font-bold">{community.name}</h3>
              <p className="text-neutral-700 leading-relaxed text-base font-normal">{community.description}</p>

              <div className="space-y-3 pt-2">
                {community.website && (
                  <a
                    href={community.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors text-base font-medium hover:bg-blue-50 rounded-lg p-2 -m-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Website
                  </a>
                )}
                {community.discord && (
                  <a
                    href={community.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors text-base font-medium hover:bg-indigo-50 rounded-lg p-2 -m-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Discord
                  </a>
                )}
                {community.instagram && (
                  <a
                    href={community.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-pink-600 hover:text-pink-700 transition-colors text-base font-medium hover:bg-pink-50 rounded-lg p-2 -m-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Instagram
                  </a>
                )}
                {community.twitter && (
                  <a
                    href={community.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sky-600 hover:text-sky-700 transition-colors text-base font-medium hover:bg-sky-50 rounded-lg p-2 -m-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Twitter
                  </a>
                )}
                {community.meetup && (
                  <a
                    href={community.meetup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-orange-600 hover:text-orange-700 transition-colors text-base font-medium hover:bg-orange-50 rounded-lg p-2 -m-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Meetup
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function HeroCommunities() {
  const [selectedCommunity, setSelectedCommunity] = useState<TechCommunity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const lineProgress = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 1, 1])
  const extensionLineHeight = useTransform(scrollYProgress, [0.3, 0.8], [0, 400])

  const techCommunities: TechCommunity[] = [
    {
      id: "alamo-python",
      name: "Alamo Python",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/alamo-py.svg",
      description:
        "Alamo Python is part of the PyTexas network of Python user groups. We are focused at providing in person training and social events to help grow the San Antonio Python community. We are proud to be a part of the DEVSA community of San Antonio technology user groups.",
      meetup: "https://www.meetup.com/alamo-python-learners/",
    },
    {
      id: "acm-sa",
      name: "ACM SA",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-acm-sa.png",
      description:
        "ACM is short for the Association for Computing Machinery. ACM National is classified as a non-profit and that makes us one too! ACMs main goal is advancing computing as a science and a profession. Together, sharing and creating technology is the best way towards that goal!",
      website: "https://acmsa.org/",
    },
    {
      id: "defcongroup-sa",
      name: "DEFCON Group",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-dcg-satx.png",
      description:
        "Inspired by the global DEF CON conference, our mission is to build a vibrant, collaborative community in San Antonio where members can learn, innovate, and advance their skills. We aim to create an inclusive environment that encourages exploration, ethical hacking, and the exchange of ideas to enhance the collective understanding of cybersecurity and technology.",
      website: "https://dcgsatx.com/",
    },
    {
      id: "greater-gaming-society",
      name: "Greater Gaming Society",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/ggs.svg",
      description:
        "We provide support, collaboration, and connection for game developers and gamers in San Antonio, hosting monthly meetings, networking, socials and anything to help grow the local game industry.",
      meetup: "https://www.meetup.com/greater-gaming-society-of-san-antonio/",
    },
    {
      id: "atc",
      name: "Alamo Tech Collective",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/atc-logo.png",
      description:
        "The Alamo Tech Collective is backed by Zelifcam, a local software company deeply committed to creating jobs, developing talent, and building resources right here in San Antonio.",
      website: "https://alamotechcollective.com/",
    },
    {
      id: "gdg",
      name: "Google Developer Groups",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/gdg-sa.svg",
      description:
        "GDG San Antonio is a group of passionate developers and technologists excited to connect, learn, and grow together. Whether you're a seasoned programmer or just starting your coding journey, GDG San Antonio is a welcoming space for all.",
      website: "https://gdg.community.dev/gdg-san-antonio/",
    },
    {
      id: "geeks-and-drinks",
      name: "Geeks and Drinks",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-geeks.png",
      description:
        "At Geeks and Drinks, our mission is to create a safe and inclusive space for developers and geeks to share ideas, get inspired and build community. We do this by creating and hosting events that are both social and educational.",
      website: "https://geeksanddrinks.tech/",
    },
    {
      id: "uxsa",
      name: "UXSA",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-uxsa.png",
      description:
        "UXSA supports the UX community in San Antonio by creating ways for people to connect, explore, and grow. Our goal is to serve as an active, responsive community for people interested or working in user experience. Support learning and growth for all levels of expertise.",
      meetup: "https://www.meetup.com/uxsanantonio-public/",
    },
    {
      id: "aitx",
      name: "AITX",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-aitx.png",
      description:
        "AITX is a community for AI Engineers, Entrepreneurs, and Explorers across Texas. At AITX, we're passionate about fostering a diverse and thriving AI community where like-minded individuals can connect with each other, share ideas, and inspire innovation. Each month, we bring together a dynamic mix of people to explore the latest advancements in AI technology, real-world applications, and the future of this rapidly growing field. Whether you're an AI veteran or a curious newcomer, AITX offers something for everyone.",
      twitter: "https://x.com/aitxcommunity",
    },
    {
      id: "dotnet-user-group",
      name: ".NET User Group",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-net.png",
      description:
        "The San Antonio .NET User group is for anyone interested in a wide range of .NET topics around the San Antonio, Texas area. We welcome all skill levels and are open to discussion for a wide range of .NET-related topics, including development, cloud, testing, game dev, CI/CD, and more.",
      meetup: "https://www.meetup.com/sadnug/",
    },
    {
      id: "aws",
      name: "AWS User Group",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-aws+(1).png",
      description:
        "The AWS User Group is a community of AWS enthusiasts and professionals who come together to share knowledge, best practices, and the latest developments in AWS technologies.",
      meetup: "https://www.meetup.com/san-antonio-aws-users-group/",
    },
    {
      id: "datanauts",
      name: "Datanauts",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-datanauts.png",
      description:
        "Welcome Datanauts — San Antonio's grassroots gang of data scientists, engineers, analysts, and curious humans who think turning chaos into insight is a good time. Whether you're shipping production models, debugging dashboards at midnight, or just figured out what MLOps actually means (no judgment), you belong here.",
      meetup: "https://www.meetup.com/datanauts/",
    },
    {
      id: "bitcoin-club",
      name: "Bitcoin Club",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-bitcoin.png",
      description:
        "We are a local San Antonio Bitcoin Club for the plebs.   We want to build a space for Bitcoiners in the Count Down City, to make connections, stir up ideas, and to most importantly create a foundation to build a strong community one where we can all draw support from!",
      website: "https://www.sanantoniobitcoinclub.com/",
    },
    {
      id: "owasp",
      name: "OWASP San Antonio",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-owasp.png",
      description:
        "Welcome to OWASP San Antonio Chapter, a regional city chapter within OWASP. Our Chapter serves San Antonio region as a platform to discuss and share topics all around information and application security. Anyone with an interested and enthusiastic about application security is welcome. All meetings are free and open. You do not have to be an OWASP member.",
      meetup: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-owasp.png",
    },
    {
      id: "redhat",
      name: "Red Hat User Group",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-redhat.png",
      description:
        "This group is focused on bringing together the San Antonio Red Hat User Community for technical presentations, conversations, good food and drinks in a very laid-back setting. Membership includes Red Hat Customers, Partners, Employees, and Enthusiasts.",
      meetup: "https://www.meetup.com/san-antonio-rhug/",
    },
    {
      id: "atlassian",
      name: "Atlassian User Group",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/logo_atlassian_footer.svg",
      description:
        "The Atlassian User Group is a community of users and enthusiasts of Atlassian products who come together to share knowledge, best practices, and the latest developments in the Atlassian ecosystem.",
      website: "https://ace.atlassian.com/san-antonio/",
    },
    {
      id: "bsides",
      name: "BSides San Antonio",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-bsides+(1).png",
      description:
        "Each BSides event is a community-driven framework for building events for and by information security community members. The goal is to expand the spectrum of conversation beyond the traditional confines of space and time. It creates opportunities for individuals to both present and participate in an intimate atmosphere that encourages collaboration. It is an intense event with discussions, demos, and interaction from participants. It is where conversations for the next-big-thing are happening.",
      website: "https://www.bsidessatx.com/",
    },
    {
      id: "arda",
      name: "Alamo Regional Data Alliance",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-arda.png",
      description:
        "The Alamo Regional Data Alliance (ARDA) is a vibrant network of data professionals, leaders, and change-makers who share the common belief that individuals and organizations throughout the community should be informed by timely quality data when making decisions that impact their lives or the lives of those they serve.",
      website: "https://alamodata.org/",
    },
    {
      id: "emergeandrise",
      name: "Emerge and Rise",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-emerge.png",
      description:
        "At Emerge and Rise™, we strengthen our San Antonio community by building up the businesses within it. We work with small and mid-sized companies (SMEs) that are ready to grow but may not know where to start, or even what's possible. From uncovering funding opportunities and improving digital skills to navigating hiring, mindset, and strategy, we meet business owners where they are.",
      website: "https://emergeandrise.org/",
    },
    {
      id: "launchsa",
      name: "LaunchSA",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-launchsa.png",
      description:
        "Launch SA is San Antonio's Resource Center for connecting small business owners and entrepreneurs to essential resources for success! Connect with us!",
      website: "https://www.launchsa.org/",
    },
    {
      id: "aicowboys",
      name: "The AI Cowboys",
      logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/cowboys.svg",
      description:
        "Founded in 2024 by former Air Force leader Michael J. Pendleton, The AI Cowboys has rapidly become one of Texas' hottest tech startups, currently ranked #6 among AI companies in the state. Headquartered in San Antonio—the nation's 6th largest city and a thriving hub within Texas's vibrant tech corridor. We're uniquely positioned at the intersection of national security, professional sports, healthcare, and academic research.",
      website: "https://www.theaicowboys.com/",
    },
  ]

  const handleCommunityClick = (community: TechCommunity) => {
    setSelectedCommunity(community)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCommunity(null)
  }

  const featuredCommunities = [
    techCommunities.find((c) => c.id === "gdg"),
    techCommunities.find((c) => c.id === "alamo-python"),
    techCommunities.find((c) => c.id === "dotnet-user-group"),
    techCommunities.find((c) => c.id === "aitx"),
    techCommunities.find((c) => c.id === "aws"),
    techCommunities.find((c) => c.id === "geeks-and-drinks"),
  ].filter(Boolean) as TechCommunity[]

  const lineColors = ["#9CA3AF", "#3B82F6", "#10B981", "#EF4444", "#A855F7", "#F59E0B"]

  return (
    <>
      <section ref={containerRef} className="min-h-[200vh] bg-white">
        <div
          ref={heroRef}
          className="sticky top-0 min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 px-4 md:px-8 bg-white overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-5xl mx-auto mb-20 md:mb-24 z-10"
          >
            <h1 className="text-neutral-900 tracking-tight text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
              Your direct connection to <span className="text-neutral-600">San Antonio&apos;s tech community.</span>
            </h1>
            <p className="text-neutral-600 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
              DevSA bridges developers, innovators, and communities—connecting you to opportunities, events, and the
              people shaping San Antonio&apos;s tech future.
            </p>
          </motion.div>

          <div className="relative w-full max-w-7xl mx-auto mb-auto z-10">
            <div className="flex items-center justify-center gap-6 md:gap-12 lg:gap-16 xl:gap-20 px-4">
              {featuredCommunities.map((community, index) => (
                <motion.button
                  key={community.id}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
                  onClick={() => handleCommunityClick(community)}
                  className="group relative flex-shrink-0"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white rounded-full border border-neutral-200 shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-300 hover:border-neutral-300">
                    <img
                      src={community.logo || "/placeholder.svg"}
                      alt={community.name}
                      className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ top: 0, left: 0 }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {lineColors.map((color, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`line-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </linearGradient>
              ))}
            </defs>

            {featuredCommunities.map((_, index) => {
              const totalItems = featuredCommunities.length
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200

              // Calculate positions based on viewport
              const spacing = viewportWidth > 1024 ? 140 : viewportWidth > 768 ? 100 : 70
              const startOffset = (viewportWidth - (totalItems - 1) * spacing) / 2
              const startX = startOffset + index * spacing
              const startY = viewportWidth > 768 ? 280 : 240

              const endX = viewportWidth / 2
              const endY = viewportWidth > 768 ? 620 : 560

              // Bezier curve control points for smooth convergence
              const controlY1 = startY + 120
              const controlY2 = endY - 80

              return (
                <motion.path
                  key={`connection-${index}`}
                  d={`M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`}
                  fill="none"
                  stroke={`url(#line-gradient-${index})`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    pathLength: lineProgress,
                  }}
                  initial={{ pathLength: 0 }}
                />
              )
            })}
          </svg>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 200 }}
            className="relative z-20 mt-auto"
          >
            <div className="relative">
              <div className="bg-neutral-900 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-3 border border-neutral-800">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-2xl md:text-3xl font-bold tracking-tight">DevSA</span>
              </div>

              {/* Pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border-2 border-neutral-900"
              />
            </div>
          </motion.div>

          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-neutral-900 origin-top z-10"
            style={{
              top: "calc(100% - 120px)",
              height: extensionLineHeight,
            }}
          />
        </div>

        <div className="relative bg-gradient-to-b from-white to-neutral-50 py-20 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-neutral-900 text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Explore All Communities
              </h2>
              <p className="text-neutral-600 text-lg md:text-xl max-w-2xl mx-auto">
                Connect with <span className="text-[#FACB11] font-bold">{techCommunities.length} communities</span>{" "}
                across San Antonio&apos;s tech ecosystem
              </p>
            </div>

            <div className="relative">
              <GlowingEffect
                disabled={false}
                proximity={100}
                spread={40}
                blur={2}
                movementDuration={2}
                borderWidth={2}
                className="rounded-3xl"
              />

              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden border border-neutral-200 shadow-xl p-6 md:p-8 lg:p-10">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
                  {techCommunities.map((community, index) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.03,
                        ease: "easeOut",
                      }}
                      className="relative"
                    >
                      <button
                        onClick={() => handleCommunityClick(community)}
                        className="w-full aspect-square flex flex-col items-center justify-center gap-2 p-3 md:p-4 hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100 transition-all duration-300 rounded-2xl group cursor-pointer relative overflow-hidden border border-transparent hover:border-neutral-200 hover:shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FACB11]/0 via-transparent to-[#FACB11]/0 group-hover:from-[#FACB11]/10 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

                        <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center">
                          <img
                            src={community.logo || "/placeholder.svg"}
                            alt={community.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <span className="text-neutral-800 text-[10px] md:text-xs font-semibold text-center leading-tight opacity-90 group-hover:opacity-100 transition-opacity relative z-10 text-balance line-clamp-2">
                          {community.name}
                        </span>

                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.03 }}
                          className="absolute top-2 right-2 w-2 h-2 bg-[#FACB11] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <CommunityModal community={selectedCommunity} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  )
}
