export interface Speaker {
  name: string
  title: string
  company: string
  image: string
  bio: string
}

export const speakers: Speaker[] = [
  {
    name: "Sarah Chen",
    title: "Senior Backend Engineer",
    company: "Tech Innovations",
    image: "/professional-woman-developer.png",
    bio: "10+ years building scalable systems with Python",
  },
  {
    name: "Marcus Rodriguez",
    title: "ML Research Scientist",
    company: "AI Labs",
    image: "/professional-data-scientist.png",
    bio: "Specializing in deep learning and neural networks",
  },
  {
    name: "Emily Watson",
    title: "Data Analytics Lead",
    company: "DataCorp",
    image: "/professional-woman-analyst.jpg",
    bio: "Transforming data into actionable insights",
  },
  {
    name: "David Kim",
    title: "Software Architect",
    company: "Cloud Systems",
    image: "/professional-man-architect.jpg",
    bio: "Expert in distributed systems and async patterns",
  },
]
