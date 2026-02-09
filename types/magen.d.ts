// MAGEN Trust SDK types
// https://magentrust.ai

interface MagenVerifyResult {
  session_id: string;
  verdict: 'verified' | 'unverified' | 'review';
  score: number;
  risk_band: 'low' | 'medium' | 'high';
  is_human: boolean;
  sdk_version: string;
}

interface MagenConfig {
  siteId: string;
  apiKey: string;
}

interface MagenInstance {
  init: () => void;
  verify: () => Promise<MagenVerifyResult>;
}

// Vanilla JS SDK (loaded via CDN)
declare class MAGEN {
  constructor(config: MagenConfig);
  init(): void;
  verify(): Promise<MagenVerifyResult>;
}

declare global {
  interface Window {
    MAGEN: typeof MAGEN;
  }
}

export {};
