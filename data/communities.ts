export interface TechCommunity {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  discord?: string
  instagram?: string
  twitter?: string
  meetup?: string
  color?: string
}

export const techCommunities: TechCommunity[] = [
  {
    id: "acm-sa",
    name: "ACM SA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-acm-sa.png",
    description:
      "ACM is short for the Association for Computing Machinery. ACM National is classified as a non-profit and that makes us one too! ACMs main goal is advancing computing as a science and a profession. Together, sharing and creating technology is the best way towards that goal!",
    website: "https://acmsa.org/",
    color: "#10B981",
  },
  {
    id: "alamo-python",
    name: "Alamo Python",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/alamo-python.svg",
    description:
      "Alamo Python is part of the PyTexas network of Python user groups. We are focused at providing in person training and social events to help grow the San Antonio Python community. We are proud to be a part of the DEVSA community of San Antonio technology user groups.",
    meetup: "https://www.meetup.com/alamo-python-learners/",
    color: "#3B82F6",
  },
  {
    id: "bsides",
    name: "BSides San Antonio",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-bsides+(1).png",
    description:
      "Each BSides event is a community-driven framework for building events for and by information security community members. The goal is to expand the spectrum of conversation beyond the traditional confines of space and time. It creates opportunities for individuals to both present and participate in an intimate atmosphere that encourages collaboration. It is an intense event with discussions, demos, and interaction from participants. It is where conversations for the next-big-thing are happening.",
    website: "https://www.bsidessatx.com/",
    color: "#7C3AED",
  },
  {
    id: "uxsa",
    name: "UXSA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-uxsa.png",
    description:
      "UXSA supports the UX community in San Antonio by creating ways for people to connect, explore, and grow. Our goal is to serve as an active, responsive community for people interested or working in user experience. Support learning and growth for all levels of expertise.",
    meetup: "https://www.meetup.com/uxsanantonio-public/",
    color: "#14B8A6",
  },
  {
    id: "arda",
    name: "Alamo Regional Data Alliance",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-arda.png",
    description:
      "The Alamo Regional Data Alliance (ARDA) is a vibrant network of data professionals, leaders, and change-makers who share the common belief that individuals and organizations throughout the community should be informed by timely quality data when making decisions that impact their lives or the lives of those they serve.",
    website: "https://alamodata.org/",
    color: "#059669",
  },
  {
    id: "defcongroup-sa",
    name: "DEFCON Group",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-dcg-satx.png",
    description:
      "Inspired by the global DEF CON conference, our mission is to build a vibrant, collaborative community in San Antonio where members can learn, innovate, and advance their skills. We aim to create an inclusive environment that encourages exploration, ethical hacking, and the exchange of ideas to enhance the collective understanding of cybersecurity and technology.",
    website: "https://dcgsatx.com/",
    color: "#EF4444",
  },
  {
    id: "greater-gaming-society",
    name: "Greater Gaming Society",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/ggs.svg",
    description:
      "We provide support, collaboration, and connection for game developers and gamers in San Antonio, hosting monthly meetings, networking, socials and anything to help grow the local game industry.",
    meetup: "https://www.meetup.com/greater-gaming-society-of-san-antonio/",
    color: "#F59E0B",
  },
  {
    id: "atc",
    name: "Alamo Tech Collective",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/atc-logo.png",
    description:
      "The Alamo Tech Collective is backed by Zelifcam, a local software company deeply committed to creating jobs, developing talent, and building resources right here in San Antonio.",
    website: "https://alamotechcollective.com/",
    color: "#8B5CF6",
  },
  {
    id: "gdg",
    name: "Google Developer Groups",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/gdg-sa.svg",
    description:
      "GDG San Antonio is a group of passionate developers and technologists excited to connect, learn, and grow together. Whether you're a seasoned programmer or just starting your coding journey, GDG San Antonio is a welcoming space for all.",
    website: "https://gdg.community.dev/gdg-san-antonio/",
    color: "#06B6D4",
  },
  {
    id: "geeks-and-drinks",
    name: "Geeks and Drinks",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-geeks.png",
    description:
      "At Geeks and Drinks, our mission is to create a safe and inclusive space for developers and geeks to share ideas, get inspired and build community. We do this by creating and hosting events that are both social and educational.",
    website: "https://geeksanddrinks.tech/",
    color: "#EC4899",
  },

  {
    id: "aitx",
    name: "AITX",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-aitx.png",
    description:
      "AITX is a community for AI Engineers, Entrepreneurs, and Explorers across Texas. At AITX, we're passionate about fostering a diverse and thriving AI community where like-minded individuals can connect with each other, share ideas, and inspire innovation. Each month, we bring together a dynamic mix of people to explore the latest advancements in AI technology, real-world applications, and the future of this rapidly growing field. Whether you're an AI veteran or a curious newcomer, AITX offers something for everyone.",
    twitter: "https://x.com/aitxcommunity",
    color: "#A855F7",
  },
  {
    id: "dotnet-user-group",
    name: ".NET User Group",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-net.png",
    description:
      "The San Antonio .NET User group is for anyone interested in a wide range of .NET topics around the San Antonio, Texas area. We welcome all skill levels and are open to discussion for a wide range of .NET-related topics, including development, cloud, testing, game dev, CI/CD, and more.",
    meetup: "https://www.meetup.com/sadnug/",
    color: "#6366F1",
  },
  {
    id: "aws",
    name: "AWS User Group",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-aws+(1).png",
    description:
      "The AWS User Group is a community of AWS enthusiasts and professionals who come together to share knowledge, best practices, and the latest developments in AWS technologies.",
    meetup: "https://www.meetup.com/san-antonio-aws-users-group/",
    color: "#F97316",
  },
  {
    id: "datanauts",
    name: "Datanauts",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-datanauts.png",
    description:
      "Welcome Datanauts — San Antonio's grassroots gang of data scientists, engineers, analysts, and curious humans who think turning chaos into insight is a good time. Whether you're shipping production models, debugging dashboards at midnight, or just figured out what MLOps actually means (no judgment), you belong here.",
    meetup: "https://www.meetup.com/datanauts/",
    color: "#0EA5E9",
  },
  {
    id: "bitcoin-club",
    name: "Bitcoin Club",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-bitcoin.png",
    description:
      "We are a local San Antonio Bitcoin Club for the plebs.   We want to build a space for Bitcoiners in the Count Down City, to make connections, stir up ideas, and to most importantly create a foundation to build a strong community one where we can all draw support from!",
    website: "https://www.sanantoniobitcoinclub.com/",
    color: "#F59E0B",
  },
  {
    id: "owasp",
    name: "OWASP San Antonio",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-owasp.png",
    description:
      "Welcome to OWASP San Antonio Chapter, a regional city chapter within OWASP. Our Chapter serves San Antonio region as a platform to discuss and share topics all around information and application security. Anyone with an interested and enthusiastic about application security is welcome. All meetings are free and open. You do not have to be an OWASP member.",
    meetup: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-owasp.png",
    color: "#EF4444",
  },
  {
    id: "redhat",
    name: "Red Hat User Group",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-redhat.png",
    description:
      "This group is focused on bringing together the San Antonio Red Hat User Community for technical presentations, conversations, good food and drinks in a very laid-back setting. Membership includes Red Hat Customers, Partners, Employees, and Enthusiasts.",
    meetup: "https://www.meetup.com/san-antonio-rhug/",
    color: "#DC2626",
  },
  {
    id: "atlassian",
    name: "Atlassian User Group",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/logo_atlassian_footer.svg",
    description:
      "The Atlassian User Group is a community of users and enthusiasts of Atlassian products who come together to share knowledge, best practices, and the latest developments in the Atlassian ecosystem.",
    website: "https://ace.atlassian.com/san-antonio/",
    color: "#2563EB",
  },

]

export const communityNames = techCommunities.map((c) => c.name.toUpperCase())
