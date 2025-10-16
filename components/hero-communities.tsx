"use client"

import { motion } from "motion/react"
import { useState } from "react"
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
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
          <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/30 rounded-2xl flex flex-col overflow-hidden h-full">
            <div className="relative h-32 bg-gradient-to-br from-neutral-800 to-neutral-900">
              <img
                src={community.logo || "/placeholder.svg"}
                alt={community.name}
                className="w-full h-full object-contain p-4"
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors bg-black/60 hover:bg-black/80 rounded-full p-2 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="text-white text-xl font-bold">{community.name}</h3>
              <p className="text-neutral-200 leading-relaxed text-base font-normal">{community.description}</p>

              <div className="space-y-3 pt-2">
                {community.website && (
                  <a
                    href={community.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors text-base font-medium hover:bg-blue-400/10 rounded-lg p-2 -m-2"
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
                    className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 transition-colors text-base font-medium hover:bg-indigo-400/10 rounded-lg p-2 -m-2"
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
                    className="flex items-center gap-3 text-pink-400 hover:text-pink-300 transition-colors text-base font-medium hover:bg-pink-400/10 rounded-lg p-2 -m-2"
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
                    className="flex items-center gap-3 text-sky-400 hover:text-sky-300 transition-colors text-base font-medium hover:bg-sky-400/10 rounded-lg p-2 -m-2"
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
                    className="flex items-center gap-3 text-orange-400 hover:text-orange-300 transition-colors text-base font-medium hover:bg-orange-400/10 rounded-lg p-2 -m-2"
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

  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center py-24 md:py-32 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 md:mb-16 lg:mb-20 flex flex-col items-center gap-6 md:gap-8 max-w-7xl w-full"
        >
          <div className="md:hidden flex-shrink-0 relative">
            {/* Glowing shadow effect */}
            <div className="absolute inset-0 blur-2xl bg-[#FACB11]/30 scale-110" />
            <img
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
              alt="DEVSA - Community"
              className="w-32 h-auto md:w-40 lg:w-48 xl:w-56 relative z-10"
            />
          </div>

          <div className="flex-1 text-center max-w-5xl mx-auto">
            <h1 className="text-white tracking-tight text-balance text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
              YOUR <span className="text-[#FACB11]">DIRECT CONNECTION</span> TO THE TECH COMMUNITY IN SAN ANTONIO
            </h1>
          </div>
        </motion.div>

        {/* Communities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative max-w-7xl w-full"
        >
          <GlowingEffect
            disabled={false}
            proximity={80}
            spread={40}
            blur={2}
            movementDuration={2}
            borderWidth={3}
            className="rounded-2xl"
          />

          {/* Grid container */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 relative bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden">
            {/* Vertical lines */}
            <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pointer-events-none">
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10 hidden md:block" />
              <div className="border-r border-white/10 hidden lg:block" />
              <div className="border-r border-white/10 hidden xl:block" />
              <div />
            </div>

            {/* Horizontal lines */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              <div className="flex flex-col h-full md:hidden">
                {Array.from({ length: Math.ceil(techCommunities.length / 3) }).map((_, i) => (
                  <div key={i} className="flex-1 border-b border-white/10 last:border-b-0" />
                ))}
              </div>
              <div className="hidden md:flex md:flex-col md:h-full lg:hidden">
                {Array.from({ length: Math.ceil(techCommunities.length / 4) }).map((_, i) => (
                  <div key={i} className="flex-1 border-b border-white/10 last:border-b-0" />
                ))}
              </div>
              <div className="hidden lg:flex lg:flex-col lg:h-full xl:hidden">
                {Array.from({ length: Math.ceil(techCommunities.length / 5) }).map((_, i) => (
                  <div key={i} className="flex-1 border-b border-white/10 last:border-b-0" />
                ))}
              </div>
              <div className="hidden xl:flex xl:flex-col xl:h-full">
                {Array.from({ length: Math.ceil(techCommunities.length / 6) }).map((_, i) => (
                  <div key={i} className="flex-1 border-b border-white/10 last:border-b-0" />
                ))}
              </div>
            </div>

            {/* Community Cards */}
            {techCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.5 + index * 0.05,
                  ease: "easeOut",
                }}
                className="aspect-square p-3 md:p-4 lg:p-6"
              >
                <button
                  onClick={() => handleCommunityClick(community)}
                  className="w-full h-full flex flex-col items-center justify-center hover:bg-white/10 transition-all duration-300 rounded-xl group cursor-pointer relative overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FACB11]/0 to-[#FACB11]/0 group-hover:from-[#FACB11]/10 group-hover:to-transparent transition-all duration-500 rounded-xl" />

                  <img
                    src={community.logo || "/placeholder.svg"}
                    alt={community.name}
                    className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 object-contain mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                  <span className="text-white text-xs md:text-sm lg:text-base font-semibold text-center leading-tight opacity-90 group-hover:opacity-100 transition-opacity relative z-10 text-balance">
                    {community.name}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <CommunityModal community={selectedCommunity} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  )
}
