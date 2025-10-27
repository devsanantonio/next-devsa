export interface Session {
  title: string
  speaker: string
  speakerImage: string
  time: string
  description: string
  category: string
  color: string
  location?: string
  track?: string
}

export const featuredSessions: Session[] = [
  {
    title: "Building Scalable APIs with FastAPI",
    speaker: "Sarah Chen",
    speakerImage: "/professional-woman-developer.png",
    time: "1:30 PM - 2:15 PM",
    description: "Learn how to build production-ready APIs using FastAPI's modern features and best practices.",
    category: "WEB DEVELOPMENT",
    color: "bg-blue-600",
    location: "Main Stage",
    track: "main",
  },
  {
    title: "Machine Learning with Python",
    speaker: "Marcus Rodriguez",
    speakerImage: "/professional-data-scientist.png",
    time: "2:30 PM - 3:15 PM",
    description: "Explore practical machine learning applications using scikit-learn and TensorFlow.",
    category: "MACHINE LEARNING",
    color: "bg-yellow-500",
    location: "Main Stage",
    track: "main",
  },
  {
    title: "Python for Data Analysis",
    speaker: "Emily Watson",
    speakerImage: "/professional-woman-analyst.jpg",
    time: "3:30 PM - 4:15 PM",
    description: "Master data analysis techniques with pandas, NumPy, and visualization libraries.",
    category: "DATA SCIENCE",
    color: "bg-blue-500",
    location: "Workshop Room",
    track: "workshops",
  },
  {
    title: "Async Python Patterns",
    speaker: "David Kim",
    speakerImage: "/professional-man-architect.jpg",
    time: "4:30 PM - 5:15 PM",
    description: "Deep dive into asynchronous programming patterns and asyncio best practices.",
    category: "ADVANCED PYTHON",
    color: "bg-yellow-600",
    location: "Main Stage",
    track: "main",
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
