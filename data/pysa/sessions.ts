export interface Session {
  title: string
  speaker: string
  speakerImage: string
  time: string
  description: string
  category: string
  color: string
  track?: string
}

export const featuredSessions: Session[] = [
  {
    title: "Building Your Own AI Coding Assistant with DSPy",
    speaker: "Joel Grus",
    speakerImage: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-joel-grus.png",
    time: "1:15 PM - 2:00 PM",
    description: "Introducing the Alamo Python community to building your own AI coding assistant using DSPy. Discover how to create intelligent development tools.",
    category: "MAIN TALK",
    color: "bg-yellow-500",
    track: "main",
  },
  {
    title: "Asynchronous Patterns for Django",
    speaker: "Paul Bailey",
    speakerImage: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-paul.png",
    time: "2:30 PM - 3:15 PM",
    description: "Presenting asynchronous patterns for Django in celebration of Django's 20th anniversary. Learn modern async techniques to improve your Django applications.",
    category: "MAIN TALK",
    color: "bg-blue-600",
    track: "main",
  },
  {
    title: "Advanced Alchemy: Your Companion to SQLAlchemy",
    speaker: "Cody Fincher",
    speakerImage: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-cody-fincher.jpeg",
    time: "3:30 PM - 4:15 PM",
    description: "Visiting from Dallas to share advanced SQLAlchemy techniques and patterns. Master database interactions in Python applications.",
    category: "MAIN TALK",
    color: "bg-blue-500",
    track: "main",
  },
  {
    title: "Lightning Talks Session",
    speaker: "Community Speakers",
    speakerImage: "/community-speakers.jpg",
    time: "1:15 PM - 1:45 PM",
    description: "Quick-fire presentations covering Python innovation at Alt-Bionics, Charlotte AI sidekick, Graph+Vector AI synergy, flexible AI workflow automation, Math and Python perspectives, and Python in Government/National Security.",
    category: "LIGHTNING TALKS",
    color: "bg-yellow-600",
    track: "lightning",
  },
]

export interface ScheduleItem {
  time: string
  event: string
  type: "general" | "talk" | "break" | "social"
  speaker?: string
  location?: string
}

export const schedule: ScheduleItem[] = [
  { time: "1:00 PM", event: "Registration & Networking", type: "general", location: "Lobby" },
  { time: "1:30 PM", event: "Opening Remarks", type: "general", location: "Main Stage" },
  {
    time: "1:45 PM",
    event: "Building Scalable APIs with FastAPI",
    type: "talk",
    speaker: "Sarah Chen",
    location: "Main Stage",
  },
  {
    time: "2:30 PM",
    event: "Machine Learning with Python",
    type: "talk",
    speaker: "Marcus Rodriguez",
    location: "Main Stage",
  },
  { time: "3:15 PM", event: "Coffee Break & Networking", type: "break", location: "Lounge" },
  {
    time: "3:30 PM",
    event: "Python for Data Analysis",
    type: "talk",
    speaker: "Emily Watson",
    location: "Workshop Room",
  },
  {
    time: "4:15 PM",
    event: "Async Python Patterns",
    type: "talk",
    speaker: "David Kim",
    location: "Main Stage",
  },
  { time: "5:00 PM", event: "Closing Remarks & Raffle", type: "general", location: "Main Stage" },
  { time: "5:30 PM", event: "After Party", type: "social", location: "Geekdom Lounge" },
]
