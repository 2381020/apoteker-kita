import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { createId, type ChatMessage } from "@/lib/chatbot";
import {
  clearLocalMessages,
  loadLocalMessages,
  saveLocalMessages,
} from "@/lib/chat-storage";
import { answerQuery } from "@/services/chat-engine";
import {
  appendChatMessage,
  clearChatMessages,
  listChatMessages,
} from "@/services/chat.service";

const MAX_MESSAGES = 100;
const MAX_INPUT = 500;

interface ChatContextValue {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  isLoaded: boolean;
  error: string | null;
  send: (text?: string) => void;
  clear: () => Promise<void>;
  retry: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const FALLBACK_ERROR =
  "Maaf, terjadi kendala saat memproses pertanyaan. Silakan coba lagi.";

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastQueryRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoaded(false);
    setError(null);

    const load = async () => {
      try {
        const stored = userId
          ? await listChatMessages(userId, MAX_MESSAGES)
          : loadLocalMessages();

        if (active) setMessages(stored.slice(-MAX_MESSAGES));
      } catch (loadError) {
        console.error("Gagal memuat riwayat chat:", loadError);
        if (active) setMessages(userId ? [] : loadLocalMessages());
      } finally {
        if (active) setIsLoaded(true);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!isLoaded || userId) return;
    saveLocalMessages(messages);
  }, [messages, isLoaded, userId]);

  const persist = useCallback(
    (message: ChatMessage) => {
      if (!userId) return;

      void appendChatMessage(userId, message).catch((persistError) => {
        console.error("Gagal menyimpan pesan chat:", persistError);
      });
    },
    [userId],
  );

  const send = useCallback(
    (text?: string) => {
      const question = (text ?? input).trim().slice(0, MAX_INPUT);

      if (!question || isTyping || !isLoaded) return;

      lastQueryRef.current = question;
      setError(null);
      setInput("");

      const userMessage: ChatMessage = {
        id: createId(),
        text: question,
        isUser: true,
        createdAt: new Date().toISOString(),
      };

      const history = messages;

      setMessages((previous) =>
        [...previous, userMessage].slice(-MAX_MESSAGES),
      );
      persist(userMessage);
      setIsTyping(true);

      void (async () => {
        try {
          const answer = await answerQuery(question, history);

          const botMessage: ChatMessage = {
            id: createId(),
            text: answer.text,
            isUser: false,
            createdAt: new Date().toISOString(),
            intent: answer.intent,
            source: answer.source,
          };

          setMessages((previous) =>
            [...previous, botMessage].slice(-MAX_MESSAGES),
          );
          persist(botMessage);
        } catch (answerError) {
          console.error("Gagal memproses pertanyaan chat:", answerError);
          setError(FALLBACK_ERROR);

          const botMessage: ChatMessage = {
            id: createId(),
            text: FALLBACK_ERROR,
            isUser: false,
            createdAt: new Date().toISOString(),
            source: "fallback",
          };

          setMessages((previous) =>
            [...previous, botMessage].slice(-MAX_MESSAGES),
          );
        } finally {
          setIsTyping(false);
        }
      })();
    },
    [input, isLoaded, isTyping, messages, persist],
  );

  const clear = useCallback(async () => {
    if (userId) {
      try {
        await clearChatMessages(userId);
      } catch (clearError) {
        console.error("Gagal menghapus riwayat chat:", clearError);
      }
    } else {
      clearLocalMessages();
    }

    setMessages([]);
    setError(null);
  }, [userId]);

  const retry = useCallback(() => {
    if (lastQueryRef.current) send(lastQueryRef.current);
  }, [send]);

  const value = useMemo<ChatContextValue>(
    () => ({
      messages,
      input,
      setInput,
      isTyping,
      isLoaded,
      error,
      send,
      clear,
      retry,
    }),
    [messages, input, isTyping, isLoaded, error, send, clear, retry],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }

  return context;
}
