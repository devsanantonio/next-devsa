interface MagenResult {
  humanScore: number;
  classification: 'human' | 'bot' | 'unknown';
  token: string;
}

interface MagenConfig {
  siteKey: string;
  onScore?: (result: MagenResult) => void;
}

interface Magen {
  init: (config: MagenConfig) => void;
  getScore: () => Promise<MagenResult>;
}

declare global {
  interface Window {
    Magen: Magen;
  }
}

export {};
