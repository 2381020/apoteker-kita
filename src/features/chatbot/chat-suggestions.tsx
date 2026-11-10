import { FOLLOW_UP_SUGGESTIONS, type ChatMessage } from "@/lib/chatbot";
import { cn } from "@/lib/utils";

interface ChatSuggestionsProps {
  messages: ChatMessage[];
  onSelect: (text: string) => void;
  disabled?: boolean;
  limit?: number;
  className?: string;
}

export function ChatSuggestions({
  messages,
  onSelect,
  disabled = false,
  limit = 4,
  className,
}: ChatSuggestionsProps) {
  if (messages.length === 0) return null;

  const asked = new Set(
    messages
      .filter((message) => message.isUser)
      .map((message) => message.text.trim().toLowerCase()),
  );

  const suggestions = FOLLOW_UP_SUGGESTIONS.filter(
    (suggestion) => !asked.has(suggestion.toLowerCase()),
  ).slice(0, limit);

  if (suggestions.length === 0) return null;

  return (
    <div
      className={cn("flex gap-2 overflow-x-auto pb-1", className)}
      aria-label="Pertanyaan lanjutan"
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="shrink-0 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
