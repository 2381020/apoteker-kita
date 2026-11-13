import * as React from "react";
import { User, Send, X, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { FloatingButton } from "@/components/ui/floating-button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { SUGGESTIONS, type ChatSource } from "@/lib/chatbot";
import type { ChatMessage } from "@/lib/chatbot";
import { useChat } from "@/features/chatbot/chat-provider";
import { ChatSuggestions } from "@/features/chatbot/chat-suggestions";

interface FloatingChatPanelProps {
  onClose?: () => void;
  onMaximize?: () => void;
}

const SOURCE_LABEL: Record<ChatSource, string> = {
  emergency: "Panduan darurat",
  interactions: "Data interaksi",
  medications: "Data obat",
  guides: "Panduan",
  kb: "Edukasi umum",
  static: "Informasi umum",
  fallback: "Belum ditemukan",
};

function ChatAvatar({
  isUser = false,
  src,
}: {
  isUser?: boolean;
  src?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        isUser
          ? "bg-secondary/10 text-secondary"
          : "bg-primary-soft text-primary",
      )}
    >
      {isUser ? (
        <User className="h-4 w-4" />
      ) : (
        <Avatar>
          <AvatarImage
            src={src || "/images/chatbot-ava.jpg"}
            className="h-4 w-4 rounded-full"
          />
        </Avatar>
      )}
    </span>
  );
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
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
          "flex max-w-[82%] flex-col",
          message.isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
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

      {message.isUser && <ChatAvatar isUser src="/images/chatbot-ava.jpg" />}
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
  onSuggestionClick: (question: string) => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-3 py-8 text-center">
     

      <h3 className="text-base font-semibold text-main-text">
        Halo! Ada yang bisa dibantu?
      </h3>

      <p className="mt-2 max-w-[270px] text-sm leading-6 text-secondary-text">
        Tanyakan seputar penggunaan obat, interaksi, efek samping, atau
        penyimpanan obat.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSuggestionClick(question)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:border-primary/40 hover:text-main-text"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FloatingChatPanel({
  onClose,
  onMaximize,
}: FloatingChatPanelProps) {
  const { messages, input, setInput, isTyping, isLoaded, error, send, clear } =
    useChat();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const panelRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const updateScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    updateScreenSize();

    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!isOpen || !isMobile) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile]);

  const openChat = () => {
    setIsOpen(true);
    onMaximize?.();

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  const closeChat = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleClear = () => {
    if (messages.length === 0) return;
    if (!window.confirm("Hapus seluruh riwayat percakapan?")) return;
    void clear();
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40 flex flex-col items-end",
        isMobile
          ? "bottom-[calc(1rem+var(--safe-bottom))] left-4 right-4 sm:bottom-10 sm:left-auto sm:right-6"
          : "bottom-10 right-6",
      )}
    >
      {!isOpen && (
        <div className="pointer-events-auto">
          <FloatingButton onClick={openChat} tooltip="Butuh bantuan obat?" />
        </div>
      )}

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Asisten Apoteker Virtual"
          className={cn(
            "pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft",
            "animate-fade-in",
            isMobile
              ? "h-[min(560px,calc(100dvh-7rem))] w-full max-w-sm mx-auto"
              : "h-[560px] w-[380px] max-w-[calc(100vw-32px)]",
          )}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary">
                <Avatar>
                  <AvatarImage
                    src="/images/chatbot-ava.jpg"
                    alt="Asisten Apoteker"
                    className="h-full w-full object-cover"
                  />
                </Avatar>
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-main-text">
                  Asisten Apoteker Virtual
                </h3>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>

                  <span className="text-xs font-medium text-secondary-text">
                    Siap membantu
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                disabled={messages.length === 0}
                aria-label="Hapus riwayat percakapan"
                title="Hapus riwayat percakapan"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-accent hover:text-main-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={closeChat}
                aria-label="Tutup chat"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-accent hover:text-main-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Isi percakapan */}
          <div
            className="flex-1 space-y-4 overflow-y-auto bg-background/60 p-4 sm:p-5"
            aria-live="polite"
            aria-label="Riwayat percakapan"
          >
            {messages.length === 0 ? (
              <WelcomeMessage onSuggestionClick={send} />
            ) : (
              messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))
            )}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input pesan */}
          <div className="shrink-0 border-t border-border bg-surface p-3 sm:p-4">
            {error && (
              <p className="mb-2 text-xs text-danger" role="alert">
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
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ketik pertanyaan Anda..."
                disabled={isTyping || !isLoaded}
                maxLength={500}
                aria-label="Ketik pesan"
                className={cn(
                  "h-11 min-w-0 flex-1 rounded-xl border border-input bg-surface px-3.5 text-sm text-main-text",
                  "placeholder:text-secondary-text/60 outline-none transition",
                  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping || !isLoaded}
                aria-label="Kirim pesan"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingChatPanel;
