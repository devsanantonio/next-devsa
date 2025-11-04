export interface Speaker {
  name: string
  title: string
  company: string
  companyUrl: string
  image: string
  social?: {
    linkedin?: string
  }
}

// All Speakers in Grid Layout (Based on Vercel Ship 2025 Format)
export const allSpeakers: Speaker[] = [
  {
    name: "Joel Grus",
    title: "Principal Engineer",
    company: "",
    companyUrl: "",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-joel-grus.png",
    social: {
      linkedin: "https://www.linkedin.com/in/joelgrus/"
    }
  },
  {
    name: "Paul Bailey",
    title: "Principal Engineer",
    company: "Clarity",
    companyUrl: "https://www.clarityschools.com/",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-paul.png",
    social: {
      linkedin: "https://www.linkedin.com/in/paul-bailey-a313869/"
    }
  },
  {
    name: "Cody Fincher",
    title: "Staff Technical Solutions Consultant",
    company: "Google",
    companyUrl: "https://google.com",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-cody-fincher.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/cofin/"
    }
  },
  {
    name: "Mauricio Figueroa",
    title: "Electrical Engineer",
    company: "Alt-Bionics",
    companyUrl: "https://www.altbionics.com/",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-mauricio.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/mauricio-e-figueroa/"
    }
  },
  {
    name: "Corrina Alcoser",
    title: "Cybersecurity Specialist",
    company: "AI Cowboys",
    companyUrl: "https://theaicowboys.com",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-corrina.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/corrina-alcoser/"
    }
  },
  {
    name: "Gennaro Maida",
    title: "MedTech Excecutive",
    company: "Denovo Innovations",
    companyUrl: "https://www.denovobioinnovations.com/",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-gennaro.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/gennaro-maida/"
    }
  },
  {
    name: "Sean Roberson",
    title: "Operations Research Analyst",
    company: "AETC",
    companyUrl: "https://www.airuniversity.af.edu/AETC/",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-sean.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/szroberson/"
    }
  },
  {
    name: "Mayank Gohil",
    title: "AI Innovation",
    company: "Learn2AI",
    companyUrl: "https://learn2ai.co/",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/LTAISASW-13.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/mayank-gohil10/"
    }
  },
  {
    name: "Michael Pendleton",
    title: "Chief Executive Officer",
    company: "AI Cowboys",
    companyUrl: "https://theaicowboys.com",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-michael.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/michael-j-pendleton/"
    }
  },
]
