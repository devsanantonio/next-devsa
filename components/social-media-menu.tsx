"use client"

import type React from "react"

import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { GlowingEffect } from "./glowing-effect"
import { LinkedInIcon, InstagramIcon, TwitterIcon, FacebookIcon, TwitchIcon, YouTubeIcon, GitHubIcon, DiscordIcon } from "./icons/social-icons"

interface SocialMediaMenuProps {
  isOpen: boolean
  onClose: () => void
}

const socialMediaLinks = [
  {
    name: "Discord",
    icon: DiscordIcon,
    url: "https://discord.gg/cvHHzThrEw",
  },
  {
    name: "LinkedIn",
    icon: LinkedInIcon,
    url: "https://linkedin.com/company/devsa",
    color: "hover:text-blue-600",
    glowColor: "hover:shadow-blue-500/50",
  },
  {
    name: "Instagram",
    icon: InstagramIcon,
    url: "https://instagram.com/devsatx",
    color: "hover:text-pink-600",
    glowColor: "hover:shadow-pink-500/50",
  },
  {
    name: "Twitter",
    icon: TwitterIcon,
    url: "https://twitter.com/devsatx",
    color: "hover:text-blue-400",
    glowColor: "hover:shadow-blue-400/50",
  },
  {
    name: "Facebook",
    icon: FacebookIcon,
    url: "https://www.facebook.com/p/DEVSA-61558461121201/",
    color: "hover:text-blue-700",
    glowColor: "hover:shadow-blue-700/50",
  },
  {
    name: "GitHub",
    icon: GitHubIcon,
    url: "https://github.com/devsanantonio",
    color: "hover:text-gray-800",
    glowColor: "hover:shadow-gray-500/50",
  },
/*   {
    name: "Twitch",
    icon: TwitchIcon,
    url: "https://twitch.tv/devsatx",
    color: "hover:text-purple-600",
    glowColor: "hover:shadow-purple-500/50",
  },
  {
    name: "YouTube",
    icon: YouTubeIcon,
    url: "https://youtube.com/@devsatx",
    color: "hover:text-red-600",
    glowColor: "hover:shadow-red-500/50",
  }, */
]

export function SocialMediaMenu({ isOpen, onClose }: SocialMediaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-y-0 left-0 w-full bg-black z-50 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 xs:top-6 md:top-8 left-4 xs:left-6 md:left-8 w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
            </button>

            {/* Menu Content */}
            <div className="h-full flex flex-col items-center justify-start container-responsive overflow-y-auto pt-20 xs:pt-24 md:pt-16 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 xs:mb-10 md:mb-12 lg:mb-16 flex flex-col items-center gap-4 xs:gap-6 md:px-10 max-w-7xl w-full"
              >
                <div className="flex-shrink-0">
                  <img
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-community.svg"
                    alt="DEVSA Community"
                    className="w-52 h-auto xs:w-60 md:w-72 lg:w-80 xl:w-96"
                  />
                </div>

                <div className="text-center">
                  <h2 className="text-white tracking-tight text-balance text-base xs:text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-black leading-tight">
                    <span className="text-[#FACB11]">STAY CONNECTED</span>
                  </h2>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative max-w-6xl w-full"
              >
                <GlowingEffect
                  disabled={false}
                  proximity={50}
                  spread={30}
                  blur={2}
                  movementDuration={1.5}
                  borderWidth={2}
                  className="rounded-lg"
                />
                {/* Grid container with line separators */}
                <div className="grid grid-cols-3 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 relative">
                  {/* Vertical lines */}
                  <div className="absolute inset-0 grid grid-cols-3 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pointer-events-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="border-r border-white/10 last:border-r-0" />
                    ))}
                  </div>

                  {/* Horizontal lines */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {Array.from({ length: Math.ceil(socialMediaLinks.length / 6) }).map((_, i) => (
                      <div key={i} className="flex-1 border-b border-white/10 last:border-b-0" />
                    ))}
                  </div>

                  {socialMediaLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <motion.div
                        key={social.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="aspect-square p-2 xs:p-3 md:p-4 lg:p-6"
                      >
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-full flex flex-col items-center justify-center hover:bg-white/5 transition-all duration-300 rounded-lg group"
                        >
                          <IconComponent className="w-10 h-10 xs:w-12 xs:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 text-white mb-1 xs:mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-white text-xs xs:text-xs md:text-sm lg:text-sm font-medium text-center leading-tight">
                            {social.name}
                          </span>
                        </a>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
