export interface Partner {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  color?: string
}

export const partners: Partner[] = [
  {
    id: "tech-bloc",
    name: "Tech Bloc",
    logo: "https://ampd-asset.s3.us-east-2.amazonaws.com/techday/10Years_Red.svg",
    description: "Building San Antonio's technology and innovation ecosystem.",
    website: "https://www.sanantoniotechday.com/",
    color: "#EF4444",
  },
  {
    id: "geekdom",
    name: "Geekdom",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/geekdom_logo_full.svg",
    description: "San Antonio's premier coworking and collaboration space for entrepreneurs and innovators.",
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
  },
  {
    id: "aicowboys",
    name: "The AI Cowboys",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/cowboys.svg",
    description:
      "Founded in 2024 by former Air Force leader Michael J. Pendleton, The AI Cowboys has rapidly become one of Texas' hottest tech startups, currently ranked #6 among AI companies in the state. Headquartered in San Antonio—the nation's 6th largest city and a thriving hub within Texas's vibrant tech corridor. We're uniquely positioned at the intersection of national security, professional sports, healthcare, and academic research.",
    website: "https://www.theaicowboys.com/",
    color: "#8B5CF6",
  },
  {
    id: "utsa",
    name: "UTSA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/uc-utsa.svg",
    description: "University of Texas at San Antonio - Driving innovation and research.",
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
    description: "The annual Python community conference for Texas.",
    website: "https://questsa.org/",
    color: "#F59E0B",
  },
]
