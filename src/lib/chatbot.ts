export type ChatIntent =
  | "darurat"
  | "interaksi"
  | "info-obat"
  | "dosis"
  | "penyimpanan"
  | "efek-samping"
  | "edukasi"
  | "sapaan"
  | "umum";

export type ChatSource =
  | "emergency"
  | "interactions"
  | "medications"
  | "guides"
  | "kb"
  | "static"
  | "fallback";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  createdAt?: string;
  intent?: ChatIntent;
  source?: ChatSource;
}

export interface ChatAnswer {
  text: string;
  intent: ChatIntent;
  source: ChatSource;
  suggestions?: string[];
}

export const CHAT_STORAGE_KEY = "apoteker:chat";

export const SUGGESTIONS = [
  "Dosis paracetamol",
  "Cara simpan obat",
  "Obat untuk maag",
  "Apa itu antibiotik?",
];

export const FOLLOW_UP_SUGGESTIONS = [
  "Efek samping paracetamol",
  "Interaksi paracetamol dan amoxicillin",
  "Cara menyimpan antibiotik",
  "Obat untuk demam",
  "Apa itu antibiotik?",
  "Kapan harus ke dokter?",
];

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
