export interface Partner {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  video?: string
  isEasterEgg?: boolean
}

export const partners: Partner[] = [
  {
    id: "tech-bloc",
    name: "Tech Bloc",
    logo: "https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/techday/10Years_Red.svg",
    description: "Building San Antonio's technology and innovation ecosystem.",
    website: "https://www.sanantoniotechday.com/",
    video: "https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/techday/techbloc-anniversary.mov", // Replace with actual video URL
    isEasterEgg: true,
  },
  {
    id: "geekdom",
    name: "Geekdom",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/geekdom_logo_full.svg",
    description: "Founded by techies and entrepreneurs, we’ve got a thing for startups and know what it takes to grow them. Since our founding, we’ve helped grow the Tech scene in San Antonio into a hub credited with positioning the city as one of the top destinations for entrepreneurs",
    website: "https://geekdom.com/",
  },
  {
    id: "pytexas",
    name: "PyTexas Foundation",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/pytexas.png",
    description: "The PyTexas Foundation is a 501(c)3 non-profit run by a Texas-based volunteer group. We are Python enthusiasts that want to share the programming language with the world, starting right here in Texas.",
    website: "https://www.pytexas.org/",
  },
  {
    id: "434media",
    name: "434 MEDIA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/434media-light.svg",
    description: "Connecting Enterprises by leveraging networks to connect people, places and things through creative media and smart marketing.",
    website: "https://www.434media.com/",
  },
  {
    id: "aicowboys",
    name: "The AI Cowboys",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/cowboys.svg",
    description:
      "We help businesses in healthcare, finance, energy, and more leverage artificial intelligence and quantum computing to drive innovation and operational efficiency.",
    website: "https://www.theaicowboys.com/",
  },
  {
    id: "youth-code-jam",
    name: "Youth Code Jam",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/youthcode-jam.webp",
    description: "We make computer science and coding fun, sociable, and equitable for all students and their grown-ups through inclusive programming, Teacher Professional Development, and free community outreach events.",
    website: "https://www.youthcodejam.org/",
  },
  {
    id: "digital-canvas",
    name: "Digital Canvas",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/digital-canvas-ymas.svg",
    description: "The creative layer of 434 Media - blending creativity with community impact through innovative storytelling and design.",
    website: "https://www.digitalcanvas.community/",
  },
  {
    id: "utsa",
    name: "UTSA University College",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/uc-logo-horz.svg",
    description: "The MDST programs not only allow UTSA to incubate new programs, like Artificial Intelligence, Hospitality and Event Management, Game Design, and others, but also orchestrate degree programs that provide interdisciplinary solutions to complex problems. That is, degree programs with classes and disciplines that span multiple colleges at UTSA.",
    website: "https://uc.utsa.edu/",
  },
  {
    id: "learn2ai",
    name: "Learn2AI",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/Learn2ai.svg",
    description:
      "Master Prompt Engineering, Automation, and AI Strategy With Our Hands-On, Outcome-Driven Programs",
    website: "https://www.learn2ai.co/",
    video: "https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/Learn2AI%20-%20081825%20G.mp4", // Replace with actual video URL
    isEasterEgg: true,
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
    id: "project-quest",
    name: "Project Quest",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/project-quest-logo.svg",
    description: "Since 1992, Project QUEST has worked to meet the pace of innovation. Today, we connect San Antonians to emerging careers in healthcare, manufacturing and trades, and information technology. Our nationally-recognized workforce and skills training program has helped thousands find amazing in-demand careers.",
    website: "https://questsa.org/",
  },
]
