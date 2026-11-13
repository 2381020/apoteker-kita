import { useEffect, useRef } from "react";
import { Send, MessageCircle, Bot, User, Info, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/shared/page-header";

import { SUGGESTIONS, type ChatSource } from "@/lib/chatbot";
import type { ChatMessage } from "@/lib/chatbot";
import { useChat } from "@/features/chatbot/chat-provider";
import { ChatSuggestions } from "@/features/chatbot/chat-suggestions";

const SOURCE_LABEL: Record<ChatSource, string> = {
  emergency: "Panduan darurat",
  interactions: "Data interaksi",
  medications: "Data obat",
  guides: "Panduan",
  kb: "Edukasi umum",
  static: "Informasi umum",
  fallback: "Belum ditemukan",
};

function ChatAvatar({ isUser = false }: { isUser?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        isUser
          ? "bg-secondary/10 text-secondary"
          : "bg-primary-soft text-primary",
      )}
    >
      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </span>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const sourceLabel = message.source ? SOURCE_LABEL[message.source] : null;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        message.isUser ? "justify-end" : "justify-start",
      )}
    >
      {!message.isUser && <ChatAvatar />}

      <div
        className={cn(
          "flex max-w-[85%] flex-col sm:max-w-[80%]",
          message.isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            message.isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border bg-surface text-main-text",
          )}
        >
          {message.text}
        </div>

        {sourceLabel && (
          <span className="mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-secondary-text">
            {sourceLabel}
          </span>
        )}
      </div>

      {message.isUser && <ChatAvatar isUser />}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" role="status" aria-live="polite">
      <ChatAvatar />

      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-3"
        aria-label="Asisten sedang mengetik"
      >
        <span className="h-2 w-2 animate-bounce rounded-full bg-secondary-text/40" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-secondary-text/40 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-secondary-text/40 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function WelcomeMessage({
  onSuggestionClick,
}: {
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center px-3 pt-6 text-center sm:px-4 sm:pt-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <MessageCircle className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-main-text">
        Halo! Saya asisten ApotekerKita
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary-text">
        Tanyakan seputar penggunaan obat, interaksi, penyimpanan, atau efek
        samping. Saya akan membantu berdasarkan informasi yang tersedia.
      </p>

      <div className="mt-5 flex max-w-md flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:border-primary/40 hover:text-main-text"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TanyaPage() {
  const { messages, input, setInput, isTyping, isLoaded, error, send, clear } =
    useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const handleClear = () => {
    if (messages.length === 0) return;
    if (!window.confirm("Hapus seluruh riwayat percakapan?")) return;
    void clear();
  };

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Tanya Apoteker"
        description="Konsultasi seputar obat dengan asisten virtual ApotekerKita."
        icon={MessageCircle}
      />

      <div className="flex h-[68dvh] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card sm:min-h-[420px]">
        {/* Header chat */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-4 sm:px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Bot className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-main-text">
              Asisten Apoteker Virtual
            </h2>

            <p className="flex items-center gap-1.5 text-xs text-secondary-text">
              <span className="h-2 w-2 rounded-full bg-success" />
              Siap membantu
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={messages.length === 0}
            aria-label="Hapus riwayat percakapan"
            title="Hapus riwayat percakapan"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Area percakapan */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto bg-background/60 px-4 py-5 sm:px-6"
          aria-live="polite"
          aria-label="Riwayat percakapan"
        >
          {messages.length === 0 && <WelcomeMessage onSuggestionClick={send} />}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
        </div>

        {/* Form input */}
        <div className="border-t border-border bg-surface p-3 sm:p-4">
          {error && (
            <p className="mb-2 px-1 text-xs text-danger" role="alert">
              {error}
            </p>
          )}

          <ChatSuggestions
            messages={messages}
            onSelect={send}
            disabled={isTyping || !isLoaded}
            className="mb-2.5"
          />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ketik pertanyaan Anda..."
              className="h-10 flex-1"
              maxLength={500}
              disabled={isTyping || !isLoaded}
              aria-label="Pesan"
            />

            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={!input.trim() || isTyping || !isLoaded}
              aria-label="Kirim pesan"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-2 px-1 text-[11px] leading-relaxed text-secondary-text">
            Informasi yang diberikan bersifat umum dan bukan pengganti
            konsultasi langsung dengan dokter atau apoteker.
          </p>
        </div>
      </div>

      {/* Informasi penggunaan */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

        <p className="text-xs leading-relaxed text-secondary-text">
          Asisten virtual menjawab berdasarkan basis data obat, interaksi, dan
          panduan ApotekerKita. Untuk kondisi darurat atau gejala serius, segera
          hubungi fasilitas kesehatan terdekat.
        </p>
      </div>
    </div>
  );
}
