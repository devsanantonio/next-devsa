export interface Partner {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  color?: string
  video?: string
  isEasterEgg?: boolean
}

export const partners: Partner[] = [
  {
    id: "tech-bloc",
    name: "Tech Bloc",
    logo: "https://ampd-asset.s3.us-east-2.amazonaws.com/techday/10Years_Red.svg",
    description: "Building San Antonio's technology and innovation ecosystem.",
    website: "https://www.sanantoniotechday.com/",
    color: "#EF4444",
    video: "https://ampd-asset.s3.us-east-2.amazonaws.com/techday/techbloc-anniversary.mov", // Replace with actual video URL
    isEasterEgg: true,
  },
  {
    id: "geekdom",
    name: "Geekdom",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/geekdom_logo_full.svg",
    description: "Founded by techies and entrepreneurs, we’ve got a thing for startups and know what it takes to grow them. Since our founding, we’ve helped grow the Tech scene in San Antonio into a hub credited with positioning the city as one of the top destinations for entrepreneurs",
    website: "https://geekdom.com/",
    color: "#3B82F6",
  },
  {
    id: "learn2ai",
    name: "Learn2AI",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/Learn2ai.svg",
    description:
      "Master Prompt Engineering, Automation, and AI Strategy With Our Hands-On, Outcome-Driven Programs",
    website: "https://www.learn2ai.co/",
    color: "#3B82F6",
    video: "https://ampd-asset.s3.us-east-2.amazonaws.com/Learn2AI+-+081825+G.mp4", // Replace with actual video URL
    isEasterEgg: true,
  },
  {
    id: "aicowboys",
    name: "The AI Cowboys",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/cowboys.svg",
    description:
      "Founded in 2024, The AI Cowboys have rapidly become one of Texas' hottest tech startups. Headquartered in San Antonio—the nation's 6th largest city and a thriving hub within Texas's vibrant tech corridor. We're uniquely positioned at the intersection of national security, professional sports, healthcare, and academic research.",
    website: "https://www.theaicowboys.com/",
    color: "#8B5CF6",
  },
  {
    id: "utsa",
    name: "UTSA UC",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/uc-utsa.svg",
    description: "The MDST programs not only allow UTSA to incubate new programs, like Artificial Intelligence, Hospitality and Event Management, Game Design, and others, but also orchestrate degree programs that provide interdisciplinary solutions to complex problems. That is, degree programs with classes and disciplines that span multiple colleges at UTSA.",
    website: "https://uc.utsa.edu/",
    color: "#F97316",
  },
  {
    id: "emergeandrise",
    name: "Emerge and Rise",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-emerge.png",
    description:
      "At Emerge and Rise™, we strengthen our San Antonio community by building up the businesses within it. We work with small and mid-sized companies (SMEs) that are ready to grow but may not know where to start, or even what's possible. From uncovering funding opportunities and improving digital skills to navigating hiring, mindset, and strategy, we meet business owners where they are.",
    website: "https://emergeandrise.org/",
    color: "#10B981",
  },
  {
    id: "launchsa",
    name: "LaunchSA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-launchsa.png",
    description:
      "Launch SA is San Antonio's Resource Center for connecting small business owners and entrepreneurs to essential resources for success! Connect with us!",
    website: "https://www.launchsa.org/",
    color: "#F59E0B",
  },
  {
    id: "project-quest",
    name: "Project Quest",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/project-quest-logo.svg",
    description: "Since 1992, Project QUEST has worked to meet the pace of innovation. Today, we connect San Antonians to emerging careers in healthcare, manufacturing and trades, and information technology. Our nationally-recognized workforce and skills training program has helped thousands find amazing in-demand careers.",
    website: "https://questsa.org/",
    color: "#F59E0B",
  },
]
