"use client"
import { useMotionValue } from "motion/react"
import { useState, useEffect } from "react"
import { useMotionTemplate, motion } from "motion/react"
import { cn } from "@/lib/utils"

const techCommunities = [
  "ALAMO PYTHON",
  "GREATER GAMING SOCIETY",
  "UXSA",
  "DOTNET USER GROUP",
  "GEEKS AND ...",
  "DATANAUTS",
  "VIBE-CODING",
  "BSIDES",
  "DEFCON",
  "ARDA",
  "NUCLEATE",
  "ACM-SA",
  "PYTEXAS",
  "BITCOIN CLUB",
  "ALAMO TECH COLLECTIVE",
  "LAUNCHSA",
  "GEEKDOM",
  "TECH BLOC",
  "EMERGE AND RISE",
  "AI COWBOYS",
  "GOOGLE DEVELOPER GROUPS",
  "DUNGO DIGITAL",
  "ALAMO CITY LOCKSPORT",
  "UTSA",
  "PROJECT QUEST",
  "AWS-SA",
  "LEARN2AI",
  "434 MEDIA",
  "NPOWER",
  "SAMSAT",
  "COSA",
  "SECURITY",
  "DATA SCIENCE",
  "BLOCKCHAIN",
  "DIGITAL CANVAS",
  "ATLASSIAN",
  "SAYP",
  "ACCESSIBILITY",
  "INCLUSION",
  "PROJECT COWORK",  
  "AITX",
]

export const HeroSATech = ({
  className,
}: {
  className?: string
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const [randomString, setRandomString] = useState("")

  useEffect(() => {
    const str = generateTechCommunityString(5000)
    setRandomString(str)
  }, [])

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)

    const str = generateTechCommunityString(5000)
    setRandomString(str)
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden",
        className,
      )}
    >
      <div
        onMouseMove={onMouseMove}
        className="group/card w-full h-full min-h-screen relative overflow-hidden bg-black flex items-center justify-center"
      >
        <TechPattern mouseX={mouseX} mouseY={mouseY} randomString={randomString} />
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative rounded-full flex items-center justify-center text-white font-geist-sans text-center px-8">
            <img
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-discord.svg"
              alt="San Antonio"
              className="w-full h-40 md:h-80 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TechPattern({ mouseX, mouseY, randomString }: any) {
  const maskImage = useMotionTemplate`radial-gradient(500px at ${mouseX}px ${mouseY}px, white, transparent)`
  const style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#ef426f] via-[#000] to-[#FACB11] opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
        style={style}
      />
      <motion.div className="absolute inset-0 opacity-0 mix-blend-overlay group-hover/card:opacity-100" style={style}>
        <p className="absolute inset-0 text-sm md:text-base h-full break-words whitespace-pre-wrap text-white/70 font-mono font-bold transition duration-500 p-2 leading-loose">
          {randomString}
        </p>
      </motion.div>
    </div>
  )
}

export const generateTechCommunityString = (length: number) => {
  let result = ""
  let currentLength = 0

  while (currentLength < length) {
    const randomCommunity = techCommunities[Math.floor(Math.random() * techCommunities.length)]
    const separator = Math.random() > 0.7 ? " • " : " "
    const addition = randomCommunity + separator

    if (currentLength + addition.length <= length) {
      result += addition
      currentLength += addition.length
    } else {
      break
    }
  }

  return result
}
