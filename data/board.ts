/**
 * DEVSA's board, in one place because two surfaces render it.
 *
 * `MeetTheTeam` on /buildingtogether shows the full treatment — large
 * portraits, roles, LinkedIn. `AboutDevsa` on the homepage shows a compact
 * strip beside the Support DEVSA button, because that page asks a stranger
 * for money without, until now, naming a single person accountable for it.
 *
 * A shared constant rather than a second literal. This repo has twice paid
 * for the other approach: a static partner list that drifted from Firestore,
 * and four copies of the site description that all went stale together.
 */
export interface BoardMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
}

export const boardMembers: BoardMember[] = [
  {
    name: "Jesse Hernandez",
    role: "Founder & Executive Director",
    image:
      "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-jesse.jpeg",
    linkedin: "https://www.linkedin.com/in/jessebubble/",
  },
  {
    name: "Zaquariah Holland",
    role: "Community Director",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/admin-holland.png",
    linkedin: "https://www.linkedin.com/in/zaquariah-holland/",
  },
  {
    name: "Ileana Gonzalez",
    role: "Board Member",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/ileana.webp",
    linkedin: "https://www.linkedin.com/in/ileanagonzxlez/",
  },
];
