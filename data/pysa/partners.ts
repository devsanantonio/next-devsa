export interface Partner {
  name: string
  image: string
  description: string
  link: string
  linkText: string
}

export const partners: Partner[] = [
  {
    name: "Alamo Python",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-alamo.png",
    description:
      "Alamo Python is part of the PyTexas network of Python user groups. We are focused at providing in person training and social events to help grow the San Antonio Python community. We are proud to be a part of the DevSA community of San Antonio technology user groups.",
    link: "https://www.meetup.com/alamo-python/",
    linkText: "Follow on Meetup",
  },
  {
    name: "PyTexas",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-pytexas.png",
    description:
      "The PyTexas Foundation is a 501(c)3 non-profit run by a Texas-based volunteer group. We are Python enthusiasts that want to share the programming language with the world, starting right here in Texas. We host and support a variety of programs that benefit the Python community in Texas, including the largest Python conference in Texas, a virtual community for the Python developers in Texas and beyond, and various in-person meetups in cities throughout the state.",
    link: "https://www.pytexas.org/",
    linkText: "Visit PyTexas",
  },
  {
    name: "Geekdom",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-geekdom.png",
    description:
      "San Antonio's collaborative coworking space and tech community hub, fostering innovation and entrepreneurship in the heart of downtown.",
    link: "https://geekdom.com/",
    linkText: "Explore Geekdom",
  },
  {
    name: "DEVSA",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-devsa.png",
    description:
      "Activating the tech community in San Antonio through collaboration, strategic partnerships, and video content that connects developers.",
    link: "https://devsa.community/",
    linkText: "Visit DEVSA",
  },
]
