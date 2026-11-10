import { CHAT_STORAGE_KEY, type ChatMessage } from "@/lib/chatbot";

const STORAGE_VERSION = 2;
const MAX_MESSAGES = 100;

function isValidMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.isUser === "boolean"
  );
}

export function loadLocalMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return [];

    const record = parsed as Record<string, unknown>;
    const list = Array.isArray(parsed) ? parsed : record.messages;

    if (!Array.isArray(list)) return [];

    return list.filter(isValidMessage).slice(-MAX_MESSAGES);
  } catch (error) {
    console.error("Gagal memuat riwayat chat lokal:", error);
    return [];
  }
}

export function saveLocalMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        messages: messages.slice(-MAX_MESSAGES),
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan riwayat chat lokal:", error);
  }
}

export function clearLocalMessages(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error("Gagal menghapus riwayat chat lokal:", error);
  }
}
