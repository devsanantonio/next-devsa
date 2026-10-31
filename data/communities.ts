export interface TechCommunity {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  discord?: string
  meetup?: string
  luma?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  twitch?: string
  facebook?: string
  github?: string
  /** The group's call for speakers (lib/speaker-calls.ts), from Firestore. */
  speakersOpen?: boolean
  speakersNote?: string | null
  speakersQuestion?: string | null
}
