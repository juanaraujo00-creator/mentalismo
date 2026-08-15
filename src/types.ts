export interface SearchEntry {
  id: string;
  query: string;
  timestamp: number;
  sessionId: string;
  device?: string;
  isLiveTyping?: boolean;
}

export interface LiveTypingData {
  sessionId: string;
  query: string;
  timestamp: number;
}

export interface MagicConfig {
  redirectDomain: string;
  theme: "system" | "light" | "dark";
  fakeLocation: string;
  predictionTarget?: "images" | "web" | "maps";
  predictionDelay?: number;
  predictionStyle?: "google_wait" | "stealth_black" | "google_images_wait";
}

export type MagicianViewMode = "giant" | "calculator" | "notes" | "minimal" | "history" | "config";

export type AppViewMode = "spectator" | "magician" | "prediction" | "wiki" | "desenho" | "acronimo";
