"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { LinkedInIcon, InstagramIcon, TwitterIcon, DiscordIcon } from "./icons/social-icons"

const socialLinks = [
  {
    name: "Discord",
    icon: DiscordIcon,
    url: "https://discord.gg/cvHHzThrEw",
    color: "hover:text-indigo-400",
  },
  {
    name: "LinkedIn", 
    icon: LinkedInIcon,
    url: "https://linkedin.com/company/devsa",
    color: "hover:text-blue-400",
  },
  {
    name: "Instagram",
    icon: InstagramIcon,
    url: "https://instagram.com/devsatx",
    color: "hover:text-pink-400",
  },
  {
    name: "X",
    icon: TwitterIcon,
    url: "https://twitter.com/devsatx", 
    color: "hover:text-gray-300",
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800/50 py-2 md:py-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          {/* Left Side - Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-neutral-400 text-sm text-center md:text-left"
            >
              © {currentYear} DEVSA. All rights reserved.
            </motion.p>
          </div>

          {/* Right Side - Social Links */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.4 + index * 0.1,
                      type: "spring",
                      stiffness: 300 
                    }}
                    className={`p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700/50 hover:bg-neutral-800/50 transition-all duration-300 ${social.color} text-neutral-400`}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.a>
                )
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}