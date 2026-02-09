// MAGEN Trust types
// https://magentrust.ai
//
// These types are for the client-side hook and window globals.
// The server-side types live in lib/magen.ts.

// Client-side verification result returned by useMagen().verify()
interface MagenClientResult {
  session_id: string;
  verdict: 'verified' | 'unverified' | 'review';
  score: number;
  is_human: boolean;
}

// Config for initializing the MAGEN SDK (when the CDN becomes available)
interface MagenConfig {
  siteId: string;
  apiKey: string;
  apiBaseUrl?: string;
}

interface MagenInstance {
  init: () => void;
  verify: () => Promise<MagenClientResult>;
}

// Vanilla JS SDK (loaded via CDN — not yet available)
declare class MAGEN {
  constructor(config: MagenConfig);
  init(): void;
  verify(): Promise<MagenClientResult>;
}

declare global {
  interface Window {
    MAGEN: typeof MAGEN;
  }
}

export {};
